import { useMemo, useState } from "react";

/* ---------- Types ---------- */
export type LevelOption = { id: string; label: string };
export type SpeakerOption = { id: string; label: string };
export type ChannelOption = { id: string; label: string };
export type TopicOption = { id: string; label: string };

export type FilterState = {
  sort: "new" | "old" | "short" | "long";
  selectedLevels: string[];
  selectedSpeakers: string[];
  selectedChannels: string[];
  selectedTopics: string[];
  hideWatched: boolean;
  query: string;
  minDuration: number | null;
  maxDuration: number | null;
};

type Props = {
  levels: LevelOption[];
  speakers: SpeakerOption[];
  channels: ChannelOption[];
  topics: TopicOption[];
  state: FilterState;
  onChange: (next: FilterState) => void;
  onClearAllTags: () => void;
  resultCount: number;
  totalDurationSeconds: number;
  loadingResults: boolean;
};

/* ---------- SVG imports (Vite will fingerprint these) ---------- */
import sortBy from "@/assets/browse/SortBy.svg";
import level from "@/assets/browse/Level.svg";
import speaker from "@/assets/browse/Speaker.svg";
import channel from "@/assets/browse/Channel.svg";
import topicsIcon from "@/assets/browse/Topics.svg";
import duration from "@/assets/browse/Duration.svg";
import hideWatched from "@/assets/browse/HideWatched.svg";
import searchSym from "@/assets/browse/SearchSym.svg";

/* Symbols shown inside selected chips */
import levelSym from "@/assets/browse/LevelSym.svg";
import speakerSym from "@/assets/browse/SpeakerSym.svg";

/* ====================================================================== */

export default function FilterBar({
  levels,
  speakers,
  channels,
  topics,
  state,
  onChange,
  onClearAllTags,
  resultCount,
  totalDurationSeconds,
  loadingResults,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<
    | null
    | "sort"
    | "level"
    | "speaker"
    | "channel"
    | "topics"
    | "duration"
  >(null);

  const sortOptions = useMemo(
    () => [
      { id: "new" as const, label: "Most recent" },
      { id: "old" as const, label: "Oldest" },
      { id: "short" as const, label: "Shortest" },
      { id: "long" as const, label: "Longest" },
    ],
    []
  );

  const selectedLevelChips = useMemo(
    () => levels.filter((l) => state.selectedLevels.includes(l.id)),
    [levels, state.selectedLevels]
  );
  const selectedSpeakerChips = useMemo(
    () => speakers.filter((s) => state.selectedSpeakers.includes(s.id)),
    [speakers, state.selectedSpeakers]
  );
  const selectedChannelChips = useMemo(
    () => channels.filter((c) => state.selectedChannels.includes(c.id)),
    [channels, state.selectedChannels]
  );
  const selectedTopicChips = useMemo(
    () => topics.filter((t) => state.selectedTopics.includes(t.id)),
    [topics, state.selectedTopics]
  );

  const hasActiveFilters =
    selectedLevelChips.length > 0 ||
    selectedSpeakerChips.length > 0 ||
    selectedChannelChips.length > 0 ||
    selectedTopicChips.length > 0 ||
    state.minDuration !== null ||
    state.maxDuration !== null;

  const clearLevel = (id: string) =>
    onChange({
      ...state,
      selectedLevels: state.selectedLevels.filter((x) => x !== id),
    });

  const clearSpeaker = (id: string) =>
    onChange({
      ...state,
      selectedSpeakers: state.selectedSpeakers.filter((x) => x !== id),
    });

  const clearChannel = (id: string) =>
    onChange({
      ...state,
      selectedChannels: state.selectedChannels.filter((x) => x !== id),
    });

  const clearTopic = (id: string) =>
    onChange({
      ...state,
      selectedTopics: state.selectedTopics.filter((x) => x !== id),
    });

  const toggleMenu = (key: NonNullable<typeof openMenu>) =>
    setOpenMenu((current) => (current === key ? null : key));

  const summaryText = useMemo(() => {
    if (loadingResults) return "All results: loading…";
    const videosLabel = resultCount === 1 ? "video" : "videos";
    const durationLabel = formatDurationLabel(totalDurationSeconds);
    return `All results: ${resultCount} ${videosLabel} · ${durationLabel} total`;
  }, [loadingResults, resultCount, totalDurationSeconds]);

  return (
    <div className="bg-surface rounded-card border border-border shadow-card px-3 md:px-4 py-3">
      {/* Top row – SVGs are the buttons themselves */}
      <div className="flex items-center gap-4">
        {/* SortBy */}
        <div className="relative">
          <img
            src={sortBy}
            alt="Sort by"
            className="h-8 cursor-pointer select-none"
            onClick={() => toggleMenu("sort")}
            draggable={false}
          />
          {openMenu === "sort" && (
            <div className="absolute z-20 mt-2 w-56 bg-surface rounded-card-sm border border-border shadow-card p-2">
              {sortOptions.map((option) => (
                <button
                  key={option.id}
                  className={`w-full text-left px-3 py-2 rounded-card-sm hover:bg-surface-muted ${
                    state.sort === option.id
                      ? "bg-surface-muted text-brand font-semibold"
                      : "text-gray-800"
                  }`}
                  onClick={() => {
                    onChange({ ...state, sort: option.id });
                    setOpenMenu(null);
                  }}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Level (opens small menu) */}
        <div className="relative">
          <img
            src={level}
            alt="Level"
            className="h-8 cursor-pointer select-none"
            onClick={() => {
              toggleMenu("level");
            }}
            draggable={false}
          />
          {openMenu === "level" && (
            <div className="absolute z-20 mt-2 w-56 bg-surface rounded-card-sm border border-border shadow-card p-2 max-h-64 overflow-auto">
              {levels.map((l) => {
                const active = state.selectedLevels.includes(l.id);
                return (
                  <label
                    key={l.id}
                    className={`flex items-center gap-2 px-2 py-1 rounded-card-sm hover:bg-surface-muted cursor-pointer ${
                      active ? "text-brand" : "text-gray-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-red-600"
                      checked={active}
                      onChange={() => {
                        const exists = state.selectedLevels.includes(l.id);
                        onChange({
                          ...state,
                          selectedLevels: exists
                            ? state.selectedLevels.filter((x) => x !== l.id)
                            : [...state.selectedLevels, l.id],
                        });
                      }}
                    />
                    <span className="text-sm">{l.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Speaker (opens small menu) */}
        <div className="relative">
          <img
            src={speaker}
            alt="Speaker"
            className="h-8 cursor-pointer select-none"
            onClick={() => {
              toggleMenu("speaker");
            }}
            draggable={false}
          />
          {openMenu === "speaker" && (
            <div className="absolute z-20 mt-2 w-64 bg-surface rounded-card-sm border border-border shadow-card p-2 max-h-64 overflow-auto">
              {speakers.map((s) => {
                const active = state.selectedSpeakers.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className={`flex items-center gap-2 px-2 py-1 rounded-card-sm hover:bg-surface-muted cursor-pointer ${
                      active ? "text-brand" : "text-gray-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-red-600"
                      checked={active}
                      onChange={() => {
                        const exists = state.selectedSpeakers.includes(s.id);
                        onChange({
                          ...state,
                          selectedSpeakers: exists
                            ? state.selectedSpeakers.filter((x) => x !== s.id)
                            : [...state.selectedSpeakers, s.id],
                        });
                      }}
                    />
                    <span className="text-sm">{s.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Channel */}
        <div className="relative">
          <img
            src={channel}
            alt="Channel"
            className="h-8 cursor-pointer select-none"
            onClick={() => toggleMenu("channel")}
            draggable={false}
          />
          {openMenu === "channel" && (
            <div className="absolute z-20 mt-2 w-64 bg-surface rounded-card-sm border border-border shadow-card p-2 max-h-64 overflow-auto">
              {channels.map((c) => {
                const active = state.selectedChannels.includes(c.id);
                return (
                  <label
                    key={c.id}
                    className={`flex items-center gap-2 px-2 py-1 rounded-card-sm hover:bg-surface-muted cursor-pointer ${
                      active ? "text-brand" : "text-gray-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-red-600"
                      checked={active}
                      onChange={() => {
                        const exists = state.selectedChannels.includes(c.id);
                        onChange({
                          ...state,
                          selectedChannels: exists
                            ? state.selectedChannels.filter((x) => x !== c.id)
                            : [...state.selectedChannels, c.id],
                        });
                      }}
                    />
                    <span className="text-sm">{c.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Topics */}
        <div className="relative">
          <img
            src={topicsIcon}
            alt="Topics"
            className="h-8 cursor-pointer select-none"
            onClick={() => toggleMenu("topics")}
            draggable={false}
          />
          {openMenu === "topics" && (
            <div className="absolute z-20 mt-2 w-64 bg-surface rounded-card-sm border border-border shadow-card p-2 max-h-64 overflow-auto">
              {topics.map((t) => {
                const active = state.selectedTopics.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className={`flex items-center gap-2 px-2 py-1 rounded-card-sm hover:bg-surface-muted cursor-pointer ${
                      active ? "text-brand" : "text-gray-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-red-600"
                      checked={active}
                      onChange={() => {
                        const exists = state.selectedTopics.includes(t.id);
                        onChange({
                          ...state,
                          selectedTopics: exists
                            ? state.selectedTopics.filter((x) => x !== t.id)
                            : [...state.selectedTopics, t.id],
                        });
                      }}
                    />
                    <span className="text-sm">{t.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="relative">
          <img
            src={duration}
            alt="Duration"
            className="h-8 cursor-pointer select-none"
            onClick={() => toggleMenu("duration")}
            draggable={false}
          />
          {openMenu === "duration" && (
            <div className="absolute z-20 mt-2 w-64 bg-surface rounded-card-sm border border-border shadow-card p-3 space-y-3">
              <div>
                <label className="block text-xs text-gray-500">Min seconds</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-card-sm border border-border px-2 py-1 text-sm"
                  value={state.minDuration ?? ""}
                  min={0}
                  onChange={(e) => {
                    const value = e.target.value;
                    onChange({
                      ...state,
                      minDuration: value === "" ? null : Number(value),
                    });
                  }}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Max seconds</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-card-sm border border-border px-2 py-1 text-sm"
                  value={state.maxDuration ?? ""}
                  min={0}
                  onChange={(e) => {
                    const value = e.target.value;
                    onChange({
                      ...state,
                      maxDuration: value === "" ? null : Number(value),
                    });
                  }}
                />
              </div>
              <button
                type="button"
                className="w-full rounded-card-sm bg-surface-muted py-1.5 text-sm text-gray-600 hover:bg-surface"
                onClick={() => setOpenMenu(null)}
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Hide watched toggle */}
        <label className="ml-2 inline-flex items-center gap-2">
          <img src={hideWatched} alt="Hide watched" className="h-8 select-none" />
          <input
            type="checkbox"
            className="accent-red-600"
            checked={state.hideWatched}
            onChange={(e) => onChange({ ...state, hideWatched: e.target.checked })}
          />
        </label>

        {/* Search with SVG icon and black text */}
        <div className="ml-auto relative">
          <img
            src={searchSym}
            alt="Search"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-[14px] w-[14px] opacity-70 pointer-events-none select-none"
            draggable={false}
          />
          <input
            className="pl-8 pr-8 py-2 rounded-full bg-surface-muted text-sm text-black outline-none w-64"
            placeholder="Search"
            value={state.query}
            onChange={(e) => onChange({ ...state, query: e.target.value })}
          />
          {state.query && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => onChange({ ...state, query: "" })}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Selected tags row */}
      <div className="mt-3 flex flex-wrap items-center gap-2 md:gap-3">
        <span className="order-first basis-full text-left text-xs text-[#D9D9D9] font-inter md:order-none md:basis-auto md:mr-auto">
          {summaryText}
        </span>

        {hasActiveFilters && (
          <button
            onClick={onClearAllTags}
            className="text-sm text-gray-600 underline decoration-dotted underline-offset-4"
            type="button"
          >
            Clear all
          </button>
        )}

        {selectedLevelChips.map((chip) => (
          <Chip
            key={`level-${chip.id}`}
            label={chip.label}
            onRemove={() => clearLevel(chip.id)}
            iconSrc={levelSym}
            iconAlt="Level"
          />
        ))}
        {selectedSpeakerChips.map((chip) => (
          <Chip
            key={`speaker-${chip.id}`}
            label={chip.label}
            onRemove={() => clearSpeaker(chip.id)}
            iconSrc={speakerSym}
            iconAlt="Speaker"
          />
        ))}
        {selectedChannelChips.map((chip) => (
          <Chip
            key={`channel-${chip.id}`}
            label={chip.label}
            onRemove={() => clearChannel(chip.id)}
          />
        ))}
        {selectedTopicChips.map((chip) => (
          <Chip
            key={`topic-${chip.id}`}
            label={chip.label}
            onRemove={() => clearTopic(chip.id)}
          />
        ))}
        {state.minDuration !== null && (
          <Chip
            key="min-duration"
            label={`Min: ${state.minDuration}s`}
            onRemove={() => onChange({ ...state, minDuration: null })}
          />
        )}
        {state.maxDuration !== null && (
          <Chip
            key="max-duration"
            label={`Max: ${state.maxDuration}s`}
            onRemove={() => onChange({ ...state, maxDuration: null })}
          />
        )}
      </div>

      {/* Mobile drawer (same behavior as before) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="ml-auto h-full w-[88%] max-w-sm bg-white shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Filter</h3>
              <button
                className="text-2xl"
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <label className="flex items-center justify-between px-3 py-2 rounded-pill bg-surface-muted">
                <span className="text-gray-700">Sort</span>
                <select
                  className="rounded-pill bg-white px-3 py-1 text-sm"
                  value={state.sort}
                  onChange={(e) =>
                    onChange({ ...state, sort: e.target.value as FilterState["sort"] })
                  }
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center justify-between px-3 py-2 rounded-pill bg-surface-muted">
                <span className="text-gray-700">Hide watched</span>
                <input
                  type="checkbox"
                  className="accent-red-600"
                  checked={state.hideWatched}
                  onChange={(e) => onChange({ ...state, hideWatched: e.target.checked })}
                />
              </label>

              <div className="relative">
                <div className="text-sm text-gray-500 mb-1">Search</div>
                <input
                  className="pl-3 pr-8 py-2 rounded-pill bg-surface-muted text-sm text-black outline-none w-full"
                  placeholder="Search"
                  value={state.query}
                  onChange={(e) => onChange({ ...state, query: e.target.value })}
                />
                {state.query && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => onChange({ ...state, query: "" })}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <Accordion title="Level">
                <div className="flex flex-wrap gap-2">
                  {levels.map((l) => (
                    <label
                      key={l.id}
                      className={`px-3 py-2 rounded-pill text-sm border ${
                        state.selectedLevels.includes(l.id)
                          ? "border-chip-selected text-brand bg-chip-selected"
                          : "border-border text-gray-700 bg-surface"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={state.selectedLevels.includes(l.id)}
                        onChange={() => {
                          const exists = state.selectedLevels.includes(l.id);
                          onChange({
                            ...state,
                            selectedLevels: exists
                              ? state.selectedLevels.filter((x) => x !== l.id)
                              : [...state.selectedLevels, l.id],
                          });
                        }}
                      />
                      {l.label}
                    </label>
                  ))}
                </div>
              </Accordion>

              <Accordion title="Speaker">
                <div className="flex flex-wrap gap-2">
                  {speakers.map((s) => (
                    <label
                      key={s.id}
                      className={`px-3 py-2 rounded-pill text-sm border ${
                        state.selectedSpeakers.includes(s.id)
                          ? "border-chip-selected text-brand bg-chip-selected"
                          : "border-border text-gray-700 bg-surface"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={state.selectedSpeakers.includes(s.id)}
                        onChange={() => {
                          const exists = state.selectedSpeakers.includes(s.id);
                          onChange({
                            ...state,
                            selectedSpeakers: exists
                              ? state.selectedSpeakers.filter((x) => x !== s.id)
                              : [...state.selectedSpeakers, s.id],
                          });
                        }}
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
              </Accordion>

              <Accordion title="Channel">
                <div className="flex flex-wrap gap-2">
                  {channels.map((c) => (
                    <label
                      key={c.id}
                      className={`px-3 py-2 rounded-pill text-sm border ${
                        state.selectedChannels.includes(c.id)
                          ? "border-chip-selected text-brand bg-chip-selected"
                          : "border-border text-gray-700 bg-surface"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={state.selectedChannels.includes(c.id)}
                        onChange={() => {
                          const exists = state.selectedChannels.includes(c.id);
                          onChange({
                            ...state,
                            selectedChannels: exists
                              ? state.selectedChannels.filter((x) => x !== c.id)
                              : [...state.selectedChannels, c.id],
                          });
                        }}
                      />
                      {c.label}
                    </label>
                  ))}
                </div>
              </Accordion>

              <Accordion title="Topics">
                <div className="flex flex-wrap gap-2">
                  {topics.map((t) => (
                    <label
                      key={t.id}
                      className={`px-3 py-2 rounded-pill text-sm border ${
                        state.selectedTopics.includes(t.id)
                          ? "border-chip-selected text-brand bg-chip-selected"
                          : "border-border text-gray-700 bg-surface"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={state.selectedTopics.includes(t.id)}
                        onChange={() => {
                          const exists = state.selectedTopics.includes(t.id);
                          onChange({
                            ...state,
                            selectedTopics: exists
                              ? state.selectedTopics.filter((x) => x !== t.id)
                              : [...state.selectedTopics, t.id],
                          });
                        }}
                      />
                      {t.label}
                    </label>
                  ))}
                </div>
              </Accordion>

              <Accordion title="Duration">
                <div className="flex flex-col gap-3">
                  <label className="text-sm text-gray-600">
                    Min seconds
                    <input
                      type="number"
                      className="mt-1 w-full rounded-pill bg-surface-muted px-3 py-2"
                      value={state.minDuration ?? ""}
                      min={0}
                      onChange={(e) =>
                        onChange({
                          ...state,
                          minDuration: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="text-sm text-gray-600">
                    Max seconds
                    <input
                      type="number"
                      className="mt-1 w-full rounded-pill bg-surface-muted px-3 py-2"
                      value={state.maxDuration ?? ""}
                      min={0}
                      onChange={(e) =>
                        onChange({
                          ...state,
                          maxDuration: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                </div>
              </Accordion>
            </div>
          </div>
          <button
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close overlay"
          />
        </div>
      )}
    </div>
  );
}

/* ---------------- Small helpers ---------------- */

function formatDurationLabel(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "0s";
  }
  const rounded = Math.round(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0 && seconds > 0) parts.push(`${seconds}s`);
  if (parts.length === 0) return "0s";
  return parts.join(" ");
}

function Chip({
  label,
  onRemove,
  iconSrc,
  iconAlt,
}: {
  label: string;
  onRemove: () => void;
  iconSrc?: string;
  iconAlt?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-chip-selected border border-chip-selected text-brand text-sm">
      {iconSrc && (
        <img
          src={iconSrc}
          alt={iconAlt || ""}
          className="h-[14px] w-[14px] opacity-80"
          draggable={false}
        />
      )}
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="text-brand/80 hover:text-brand"
        aria-label={`Remove ${label}`}
      >
        ×
      </button>
    </span>
  );
}

function Accordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border border-gray-200 rounded-2xl">
      <button
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span className="text-red-600 font-semibold">{title}</span>
        <span className="text-gray-500">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
