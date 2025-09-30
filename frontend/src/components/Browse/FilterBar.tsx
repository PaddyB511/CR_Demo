import { useMemo, useState } from "react";

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

export default function FilterBar({
  levels,
  speakers,
  state,
  onChange,
  onClearAllTags,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

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
      {/* Top row */}
      <div className="flex items-center gap-2 md:gap-3">
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-pill bg-surface-muted text-gray-700 text-sm">
          <span>⇅</span>
          <span>Sort by</span>
        </button>
        <MenuSelect
          label="Level"
          valueIds={state.selectedLevels}
          options={levels}
          onToggle={(id) => {
            const exists = state.selectedLevels.includes(id);
            onChange({
              ...state,
              selectedLevels: exists
                ? state.selectedLevels.filter((x) => x !== id)
                : [...state.selectedLevels, id],
            });
          }}
          kind="primary"
        />
        <MenuSelect
          label="Speaker"
          valueIds={state.selectedSpeakers}
          options={speakers}
          onToggle={(id) => {
            const exists = state.selectedSpeakers.includes(id);
            onChange({
              ...state,
              selectedSpeakers: exists
                ? state.selectedSpeakers.filter((x) => x !== id)
                : [...state.selectedSpeakers, id],
            });
          }}
          kind="primary"
        />
        <button
          className="ml-auto md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-pill bg-surface-muted text-gray-700 text-sm"
          onClick={() => setMobileOpen(true)}
        >
          More •••
        </button>
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-pill bg-surface-muted text-gray-700 text-sm">
            <span role="img" aria-label="hide">
              🙈
            </span>
            <input
              type="checkbox"
              className="accent-red-600"
              checked={state.hideWatched}
              onChange={(e) =>
                onChange({ ...state, hideWatched: e.target.checked })
              }
            />
            Hide watched
          </label>
          <div className="relative">
            <input
              className="pl-9 pr-8 py-2 rounded-pill bg-surface-muted text-sm outline-none w-64"
              placeholder="Search"
              value={state.query}
              onChange={(e) => onChange({ ...state, query: e.target.value })}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔎
            </span>
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
      </div>

      {/* Tags row */}
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
            icon="📶"
          />
        ))}
        {selectedSpeakerChips.map((s) => (
          <Chip
            key={s.id}
            label={s.label}
            onRemove={() => clearSpeaker(s.id)}
            icon="👤"
          />
        ))}
      </div>

      {/* Mobile drawer */}
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
                  onChange={(e) =>
                    onChange({ ...state, hideWatched: e.target.checked })
                  }
                />
              </label>
              <div className="relative">
                <div className="text-sm text-gray-500 mb-1">Search</div>
                <input
                  className="pl-9 pr-8 py-2 rounded-pill bg-surface-muted text-sm outline-none w-full"
                  placeholder="Search"
                  value={state.query}
                  onChange={(e) =>
                    onChange({ ...state, query: e.target.value })
                  }
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  🔎
                </span>
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

function Chip({
  label,
  onRemove,
  icon,
}: {
  label: string;
  onRemove: () => void;
  icon?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-pill bg-chip-selected border border-chip-selected text-brand text-sm">
      {icon && <span className="opacity-70">{icon}</span>}
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

function MenuSelect({
  label,
  options,
  valueIds,
  onToggle,
  kind = "muted",
}: {
  label: string;
  options: { id: string; label: string }[];
  valueIds: string[];
  onToggle: (id: string) => void;
  kind?: "primary" | "muted";
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-pill border text-sm ${
          valueIds.length
            ? "border-chip-selected text-brand bg-chip-selected"
            : kind === "primary"
            ? "border-brand text-brand bg-surface"
            : "border-border text-gray-700 bg-surface"
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        {label} ▾
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-56 bg-surface rounded-card-sm border border-border shadow-card p-2 max-h-64 overflow-auto">
          {options.map((o) => (
            <label
              key={o.id}
              className="flex items-center gap-2 px-2 py-1 rounded-card-sm hover:bg-surface-muted cursor-pointer"
            >
              <input
                type="checkbox"
                className="accent-red-600"
                checked={valueIds.includes(o.id)}
                onChange={() => onToggle(o.id)}
              />
              <span className="text-sm text-gray-800">{o.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
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
