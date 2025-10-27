import { useMemo, useState } from "react";

/* ---------- Types ---------- */
export type LevelOption = { id: string; label: string };
export type SpeakerOption = { id: string; label: string };

export type FilterState = {
  sort: "recent" | "popular" | "duration";
  selectedLevels: string[];
  selectedSpeakers: string[];
  hideWatched: boolean;
  query: string;
};

type Props = {
  levels: LevelOption[];
  speakers: SpeakerOption[];
  state: FilterState;
  onChange: (next: FilterState) => void;
  onClearAllTags: () => void;
};

/* ---------- SVG imports (Vite will fingerprint these) ---------- */
import sortBy from "@/assets/browse/SortBy.svg";
import level from "@/assets/browse/Level.svg";
import speaker from "@/assets/browse/Speaker.svg";
import channel from "@/assets/browse/Channel.svg";
import topics from "@/assets/browse/Topics.svg";
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
  state,
  onChange,
  onClearAllTags,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openLevel, setOpenLevel] = useState(false);
  const [openSpeaker, setOpenSpeaker] = useState(false);

  const selectedLevelChips = useMemo(
    () => levels.filter((l) => state.selectedLevels.includes(l.id)),
    [levels, state.selectedLevels]
  );
  const selectedSpeakerChips = useMemo(
    () => speakers.filter((s) => state.selectedSpeakers.includes(s.id)),
    [speakers, state.selectedSpeakers]
  );

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

  return (
    <div className="bg-surface rounded-card border border-border shadow-card px-3 md:px-4 py-3">
      {/* Top row – SVGs are the buttons themselves */}
      <div className="flex items-center gap-4">
        {/* SortBy (non-interactive placeholder for now) */}
        <img
          src={sortBy}
          alt="Sort by"
          className="h-8 cursor-default select-none"
          draggable={false}
        />

        {/* Level (opens small menu) */}
        <div className="relative">
          <img
            src={level}
            alt="Level"
            className="h-8 cursor-pointer select-none"
            onClick={() => {
              setOpenLevel((v) => !v);
              setOpenSpeaker(false);
            }}
            draggable={false}
          />
          {openLevel && (
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
              setOpenSpeaker((v) => !v);
              setOpenLevel(false);
            }}
            draggable={false}
          />
          {openSpeaker && (
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

        {/* Channel / Topics / Duration – static SVG buttons for now */}
        <img src={channel} alt="Channel" className="h-8 select-none" draggable={false} />
        <img src={topics} alt="Topics" className="h-8 select-none" draggable={false} />
        <img src={duration} alt="Duration" className="h-8 select-none" draggable={false} />

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
        {selectedLevelChips.length > 0 || selectedSpeakerChips.length > 0 ? (
          <button
            onClick={onClearAllTags}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        ) : (
          <span className="text-sm text-gray-400">No tags</span>
        )}

        {selectedLevelChips.map((l) => (
          <Chip
            key={l.id}
            label={l.label}
            onRemove={() => clearLevel(l.id)}
            iconSrc={levelSym}
            iconAlt="Level"
          />
        ))}
        {selectedSpeakerChips.map((s) => (
          <Chip
            key={s.id}
            label={s.label}
            onRemove={() => clearSpeaker(s.id)}
            iconSrc={speakerSym}
            iconAlt="Speaker"
          />
        ))}
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
