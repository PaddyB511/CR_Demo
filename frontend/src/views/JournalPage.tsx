import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

import MobileBottomNav from "../components/layout/MobileBottomNav";
import { fetchJournalEntries, ApiJournalEntry, JournalActivity } from "../api/journal";
import ProgressNoteModal, { ProgressNoteFormData } from "../components/journal/ProgressNoteModal";

const activityLabels: Record<JournalActivity, string> = {
  listening_watching: "Listening/Watching",
  reading: "Reading",
  speaking: "Speaking",
  writing: "Writing",
  other: "Other",
};

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function formatDuration(seconds: number) {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.max(totalMinutes % 60, 0);
  const parts: string[] = [];
  if (hours) {
    parts.push(`${hours} hr${hours === 1 ? "" : "s"}`);
  }
  if (minutes) {
    parts.push(`${minutes} min${minutes === 1 ? "" : "s"}`);
  }
  if (!parts.length) {
    return "0 mins";
  }
  return parts.join(" ");
}

function formatTotalInput(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = Math.max(minutes % 60, 0);
  if (hrs && !mins) {
    return `${hrs} hr${hrs === 1 ? "" : "s"}`;
  }
  if (!hrs) {
    return `${mins} min${mins === 1 ? "" : "s"}`;
  }
  return `${hrs} hr${hrs === 1 ? "" : "s"} ${mins} min${mins === 1 ? "" : "s"}`;
}

const JournalPage = () => {
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();
  const [entries, setEntries] = useState<ApiJournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadEntries() {
      if (!isAuthenticated) {
        if (!cancelled) {
          setEntries([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const accessToken = await getAccessTokenSilently({
          authorizationParams: {
            audience: `https://cr/api/`,
          },
        });
        if (cancelled) return;
        const data = await fetchJournalEntries(accessToken);
        if (!cancelled) {
          setEntries(data.results ?? []);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("[JournalPage] failed to load entries", err);
          setError(err?.message || "Failed to load journal entries.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEntries();

    return () => {
      cancelled = true;
    };
  }, [getAccessTokenSilently, isAuthenticated]);

  const rows = entries.map((entry) => ({
    id: entry.id,
    date: formatDate(entry.date_start),
    activity: activityLabels[entry.activity] ?? entry.activity,
    duration: formatDuration(entry.time_duration),
    total: formatTotalInput(entry.totalInputMinutes ?? 0),
    commented: Boolean(entry.comment && entry.comment.trim().length > 0),
  }));

  const addNoteDisabled = authLoading;

  const handleOpenModal = () => {
    setShowProgressModal(true);
  };

  const handleCloseModal = () => {
    setShowProgressModal(false);
  };

  const handleSaveProgressNote = (data: ProgressNoteFormData) => {
    setShowProgressModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col">
      {/* <TopBanner /> */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          {/* Header row */}
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/progress"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#DB0000] bg-[#FDF0F0] text-[#DB0000]"
            >
              <span className="text-lg">←</span>
              <span className="font-medium">Back to My Progress</span>
            </Link>

            <div className="h-8" />
          </div>

          {/* Add note CTA */}
          <div className="mt-6 flex justify-center">
            <button
              className={`inline-flex items-center gap-3 bg-[#DB0000] hover:bg-[#c10000] transition text-white font-inter font-semibold text-[20px] leading-none px-10 md:px-14 py-4 rounded-full ${
                addNoteDisabled ? "opacity-60 cursor-not-allowed" : ""
              }`}
              type="button"
              disabled={addNoteDisabled}
              onClick={handleOpenModal}
            >
              <span>Add a progress note</span>
              <img
                src="/src/assets/pencil-white.svg"
                alt=""
                className="w-[17px] h-4"
              />
            </button>
          </div>
          {!authLoading && !isAuthenticated ? (
            <div className="mt-3 text-center text-sm text-gray-600">
              Log in to add new journal entries.
            </div>
          ) : null}

          {/* Table */}
          <div className="mt-8 bg-white rounded-[14px] overflow-hidden border-2 border-[#F2B200]">
            {/* Header with explicit column widths (no left rail) */}
            <div className="grid [grid-template-columns:1.5fr_1.5fr_1fr_1fr_0.7fr_56px] bg-[#FFF5CC] text-[#F2B200] font-inter font-semibold">
              <div className="px-4 py-3 text-center border-b-2 border-[#F2B200]">
                Date
              </div>
              <div className="px-4 py-3 text-center border-l-2 border-b-2 border-[#F2B200]">
                Activity
              </div>
              <div className="px-4 py-3 text-center border-l-2 border-b-2 border-[#F2B200]">
                Duration
              </div>
              <div className="px-4 py-3 text-center border-l-2 border-b-2 border-[#F2B200]">
                Total Input
              </div>
              <div className="px-4 py-3 text-center border-l-2 border-b-2 border-[#F2B200]">
                Comment
              </div>
              <div className="px-4 py-3 text-center border-l-2 border-b-2 border-[#F2B200]"></div>
            </div>

            {/* Rows */}
            <div>
              {loading ? (
                <div className="grid [grid-template-columns:1.5fr_1.5fr_1fr_1fr_0.7fr_56px] border-t border-gray-200">
                  <div className="px-4 py-6 text-center text-gray-500 col-span-full">
                    Loading journal entries...
                  </div>
                </div>
              ) : error ? (
                <div className="grid [grid-template-columns:1.5fr_1.5fr_1fr_1fr_0.7fr_56px] border-t border-gray-200">
                  <div className="px-4 py-6 text-center text-red-600 col-span-full">
                    {error}
                  </div>
                </div>
              ) : rows.length ? (
                rows.map((r) => (
                  <div
                    key={r.id}
                    className="grid [grid-template-columns:1.5fr_1.5fr_1fr_1fr_0.7fr_56px] items-center border-t border-gray-200"
                  >
                    {/* Date */}
                    <div className="px-4 py-3">
                      <span className="underline">{r.date}</span>
                    </div>
                    {/* Activity */}
                    <div className="px-4 py-3 border-l border-gray-200">
                      {r.activity}
                    </div>
                    {/* Duration */}
                    <div className="px-4 py-3 border-l border-gray-200">
                      {r.duration}
                    </div>
                    {/* Total Input */}
                    <div className="px-4 py-3 border-l border-gray-200">
                      {r.total}
                    </div>
                    {/* Comment mark */}
                    <div className="px-4 py-3 border-l border-gray-200 text-center">
                      {r.commented ? (
                        <img
                          src="/src/assets/tick.svg"
                          alt=""
                          className="inline-block w-[19px] h-[15px]"
                        />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                    {/* Edit icon */}
                    <div className="px-4 py-3 border-l border-gray-200 flex items-center justify-center self-stretch">
                      <button className="p-0" aria-label="Edit note">
                        <img
                          src="/src/assets/pencil-yellow.svg"
                          alt=""
                          className="block w-[20px] h-6"
                        />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="grid [grid-template-columns:1.5fr_1.5fr_1fr_1fr_0.7fr_56px] border-t border-gray-200">
                  <div className="px-4 py-6 text-center text-gray-500 col-span-full">
                    {isAuthenticated
                      ? "You haven’t added any journal entries yet."
                      : "Log in to view your journal entries."}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <MobileBottomNav />
      <ProgressNoteModal
        open={showProgressModal}
        onClose={handleCloseModal}
        onSave={handleSaveProgressNote}
      />
    </div>
  );
};

export default JournalPage;
