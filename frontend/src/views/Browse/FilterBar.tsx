import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

/* --- icon imports (Vite) --- */
import sortByIcon from "@/assets/browse/SortBy.svg?url";
import levelIcon from "@/assets/browse/Level.svg?url";
import speakerIcon from "@/assets/browse/Speaker.svg?url";
import channelIcon from "@/assets/browse/Channel.svg?url";
import topicsIcon from "@/assets/browse/Topics.svg?url";
import durationIcon from "@/assets/browse/Duration.svg?url";
import hideWatchedIcon from "@/assets/browse/HideWatched.svg?url";

import levelSym from "@/assets/browse/LevelSym.svg?url";
import speakerSym from "@/assets/browse/SpeakerSym.svg?url";

/* ---------------- types ---------------- */
type FacetItem = { name: string; count: number };
type DurationBucket = { start: number; end: number; count: number };

type StatsResponse = {
  total: number;
  statistics: {
    levels: FacetItem[];
    channels: FacetItem[];
    speakers: FacetItem[];
    topics: FacetItem[];
    durations: DurationBucket[];
  };
};
 

type Props = {
  onQueryChange: (qs: URLSearchParams) => void; // parent will refetch videos
};

/* ---------- helpers ---------- */
const apiBase = "/api/platform/";
// Use platform stats (legacy, public) so the filter UI can fetch facets without auth.
const STATS_URL = `${apiBase}/videos/statistics/`;

const SORT_OPTIONS = [
  { key: "recent", label: "Most recent" },
  { key: "popular", label: "Most popular" },
  { key: "duration_asc", label: "Duration ↑" },
  { key: "duration_desc", label: "Duration ↓" },
];

function setOrToggle(param: string, value: string, qs: URLSearchParams) {
  const existing = qs.getAll(param);
  if (existing.includes(value)) {
    // remove
    const after = existing.filter((v) => v !== value);
    qs.delete(param);
    after.forEach((v) => qs.append(param, v));
  } else {
    qs.append(param, value);
  }
}

function asMulti(qs: URLSearchParams, key: string): string[] {
  return qs.getAll(key).filter(Boolean);
}

function asBool(qs: URLSearchParams, key: string): boolean {
  const v = qs.get(key);
  return v === "1" || v === "true";
}

/* ---------------- component ---------------- */
export default function FilterBar({ onQueryChange }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState<null | "sort" | "level" | "speaker" | "channel" | "topics" | "duration">(null);

  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const qSort = searchParams.get("sort") || "recent";
  const qLevels = asMulti(searchParams, "level");
  const qSpeakers = asMulti(searchParams, "speaker");
  const qChannels = asMulti(searchParams, "channel");
  const qTopics = asMulti(searchParams, "topic");
  const qHideWatched = asBool(searchParams, "hide_watched");
  const qSearch = searchParams.get("text") || "";
  const qMin = searchParams.get("min_duration") || "";
  const qMax = searchParams.get("max_duration") || "";

  const activeChips = useMemo(() => {
    const chips: { type: "level" | "speaker"; name: string }[] = [];
    qLevels.forEach((name) => chips.push({ type: "level", name }));
    qSpeakers.forEach((name) => chips.push({ type: "speaker", name }));
    return chips;
  }, [qLevels, qSpeakers]);

  // fetch statistics whenever filters change (not page)
  useEffect(() => {
    const controller = new AbortController();
    const qs = new URLSearchParams(searchParams.toString());
    setLoading(true);
    fetch(`${STATS_URL}?${qs}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: StatsResponse) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  function apply(next: URLSearchParams) {
    // always reset to page 1 on filter changes
    next.set("page", "1");
    setSearchParams(next);
    onQueryChange(next);
  }

  function toggleHideWatched() {
    const next = new URLSearchParams(searchParams.toString());
    const val = next.get("hide_watched");
    if (val === "1" || val === "true") next.delete("hide_watched");
    else next.set("hide_watched", "1");
    apply(next);
  }

  function clearAll() {
    const next = new URLSearchParams();
    next.set("page", "1");
    apply(next);
  }

  return (
    <div className="w-full rounded-2xl border border-[#eee] bg-white px-3 py-2">
      {/* row 1: buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Sort by */}
        <Dropdown
          open={open === "sort"}
          onOpen={() => setOpen("sort")}
          onClose={() => setOpen(null)}
          button={<IconButton src={sortByIcon} label="Sort by" />}
        >
          <div className="flex flex-col p-2">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.key}
                className={`text-left px-3 py-2 rounded-lg hover:bg-[#f6f6f6] ${
                  o.key === qSort ? "bg-[#f6f6f6] font-medium" : ""
                }`}
                onClick={() => {
                  const next = new URLSearchParams(searchParams.toString());
                  next.set("sort", o.key);
                  apply(next);
                  setOpen(null);
                }}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Dropdown>

        {/* Level */}
        <Dropdown
          open={open === "level"}
          onOpen={() => setOpen("level")}
          onClose={() => setOpen(null)}
          button={<IconButton src={levelIcon} label="Level" />}
        >
          <FacetList
            items={stats?.statistics.levels || []}
            selected={new Set(qLevels)}
            onToggle={(name) => {
              const next = new URLSearchParams(searchParams.toString());
              setOrToggle("level", name, next);
              apply(next);
            }}
          />
        </Dropdown>

        {/* Speaker */}
        <Dropdown
          open={open === "speaker"}
          onOpen={() => setOpen("speaker")}
          onClose={() => setOpen(null)}
          button={<IconButton src={speakerIcon} label="Speaker" />}
        >
          <FacetList
            items={stats?.statistics.speakers || []}
            selected={new Set(qSpeakers)}
            onToggle={(name) => {
              const next = new URLSearchParams(searchParams.toString());
              setOrToggle("speaker", name, next);
              apply(next);
            }}
          />
        </Dropdown>

        {/* Channel */}
        <Dropdown
          open={open === "channel"}
          onOpen={() => setOpen("channel")}
          onClose={() => setOpen(null)}
          button={<IconButton src={channelIcon} label="Channel" />}
        >
          <FacetList
            items={stats?.statistics.channels || []}
            selected={new Set(qChannels)}
            onToggle={(name) => {
              const next = new URLSearchParams(searchParams.toString());
              setOrToggle("channel", name, next);
              apply(next);
            }}
          />
        </Dropdown>

        {/* Topics */}
        <Dropdown
          open={open === "topics"}
          onOpen={() => setOpen("topics")}
          onClose={() => setOpen(null)}
          button={<IconButton src={topicsIcon} label="Topics" />}
        >
          <FacetList
            items={stats?.statistics.topics || []}
            selected={new Set(qTopics)}
            onToggle={(name) => {
              const next = new URLSearchParams(searchParams.toString());
              setOrToggle("topic", name, next);
              apply(next);
            }}
          />
        </Dropdown>

        {/* Duration */}
        <Dropdown
          open={open === "duration"}
          onOpen={() => setOpen("duration")}
          onClose={() => setOpen(null)}
          button={<IconButton src={durationIcon} label="Duration" />}
        >
          <div className="w-[280px] p-3">
            <label className="block text-[12px] text-[#6b7280] mb-1">Min seconds</label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[14px]"
              defaultValue={qMin}
              onKeyDown={(e) => e.stopPropagation()}
              onBlur={(e) => {
                const next = new URLSearchParams(searchParams.toString());
                const v = (e.target as HTMLInputElement).value;
                if (v) next.set("min_duration", v);
                else next.delete("min_duration");
                apply(next);
              }}
            />
            <label className="block text-[12px] text-[#6b7280] mt-3 mb-1">Max seconds</label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[14px]"
              defaultValue={qMax}
              onKeyDown={(e) => e.stopPropagation()}
              onBlur={(e) => {
                const next = new URLSearchParams(searchParams.toString());
                const v = (e.target as HTMLInputElement).value;
                if (v) next.set("max_duration", v);
                else next.delete("max_duration");
                apply(next);
              }}
            />
          </div>
        </Dropdown>

        {/* Hide watched */}
        <button
          className={`flex items-center gap-2 rounded-full border px-3 py-[7px] text-[14px] 
            ${qHideWatched ? "border-[#DB0000] text-[#DB0000] bg-[#FDF0F0]" : "border-[#e5e7eb]"}`}
          onClick={toggleHideWatched}
          title="Hide watched"
        >
          <img src={hideWatchedIcon} className="h-5" />
          <span>Hide watched</span>
        </button>

        {/* Search box */}
        <div className="ml-auto flex items-center gap-2 rounded-full border border-[#e5e7eb] px-3 py-[6px]">
          <input
            className="w-[220px] outline-none text-[14px]"
            placeholder="Search"
            defaultValue={qSearch}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const next = new URLSearchParams(searchParams.toString());
                const v = (e.target as HTMLInputElement).value.trim();
                if (v) next.set("text", v);
                else next.delete("text");
                apply(next);
              }
            }}
          />
        </div>
      </div>

      {/* row 2: active chips and meta */}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {activeChips.map((c) => (
          <Chip
            key={`${c.type}:${c.name}`}
            icon={c.type === "level" ? levelSym : speakerSym}
            label={c.name}
            onRemove={() => {
              const next = new URLSearchParams(searchParams.toString());
              setOrToggle(c.type, c.name, next);
              apply(next);
            }}
          />
        ))}
        {/* Clear all */}
        {(qLevels.length || qSpeakers.length || qChannels.length || qTopics.length || qMin || qMax || qSearch || qHideWatched || qSort !== "recent") ? (
          <button className="ml-2 text-[13px] text-[#9C9C9C] hover:underline" onClick={clearAll}>
            Clear all
          </button>
        ) : null}
        {/* tiny stats */}
        <div className="ml-auto text-[12px] text-[#6b7280]">
          {loading ? "Loading…" : `${stats?.total ?? 0} results`}
        </div>
      </div>
    </div>
  );
}

/* ---------- tiny building blocks ---------- */
function IconButton({ src, label }: { src: string; label: string }) {
  return (
    <div className="flex cursor-pointer select-none items-center gap-2 rounded-full border border-[#e5e7eb] px-3 py-[7px] text-[14px] hover:bg-[#fafafa]">
      <img src={src} className="h-5" />
      <span>{label}</span>
      <span className="text-[#9C9C9C]">▾</span>
    </div>
  );
}

function Dropdown({
  open,
  onOpen,
  onClose,
  button,
  children,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  button: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && onClose()} tabIndex={0}>
      <div onClick={() => (open ? onClose() : onOpen())}>{button}</div>
      {open ? (
        <div className="absolute z-50 mt-2 min-w-[240px] rounded-xl border border-[#eee] bg-white shadow">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function FacetList({
  items,
  selected,
  onToggle,
}: {
  items: FacetItem[];
  selected: Set<string>;
  onToggle: (name: string) => void;
}) {
  return (
    <div className="max-h-[320px] w-[280px] overflow-auto p-2">
      {items.map((it) => {
        const active = selected.has(it.name);
        return (
          <button
            key={it.name}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-[#f6f6f6] ${
              active ? "bg-[#f6f6f6] font-medium" : ""
            }`}
            onClick={() => onToggle(it.name)}
          >
            <span className="truncate">{it.name}</span>
            <span className="ml-2 text-[#6b7280]">{it.count}</span>
          </button>
        );
      })}
      {!items.length && <div className="px-3 py-4 text-[13px] text-[#9C9C9C]">No options</div>}
    </div>
  );
}

function Chip({ icon, label, onRemove }: { icon: string; label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#f2bcbc] bg-[#fff5f5] px-3 py-[6px] text-[13px]">
      <img src={icon} className="h-4" />
      <span>{label}</span>
      <button onClick={onRemove} className="text-[#9C9C9C] hover:text-black">✕</button>
    </div>
  );
}
