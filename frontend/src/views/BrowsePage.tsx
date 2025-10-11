import { useEffect, useState } from "react";
import InfoCard from "../components/Browse/InfoCard.tsx";
import FilterBar from "../components/Browse/FilterBar.tsx";
import type {
  FilterState,
  SpeakerOption,
  LevelOption,
} from "../components/Browse/FilterBar.tsx";
import RecommendedRail from "../components/Browse/RecommendedRail.tsx";
import VideoCard from "../components/Browse/VideoCard.tsx";
import type { VideoItem } from "../components/Browse/VideoCard.tsx";
// import { videos as SHARED_VIDEOS } from "../data/videos.ts"; // legacy static
import { fetchVideos, fetchSpeakers } from "../api/videos";
import type { ApiVideo, ApiSpeaker } from "../api/videos";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

const LEVELS: LevelOption[] = [
  { id: "Beginner 0", label: "Beginner 0" },
  { id: "Beginner 1", label: "Beginner 1" },
  { id: "Beginner 2", label: "Beginner 2" },
  { id: "Intermediate 1", label: "Intermediate 1" },
  { id: "Intermediate 2", label: "Intermediate 2" },
  { id: "Advanced", label: "Advanced" },
  { id: "Native", label: "Native" },
];

// Speakers now loaded dynamically from API
// Placeholder kept commented for reference.
// const SPEAKERS: SpeakerOption[] = [];

// map API video to UI VideoItem shape
function mapVideo(v: ApiVideo): VideoItem {
  // derive a pseudo levelId mapping from canonical level
  const levelId = v.level; // now use the exact level string as id
  return {
    id: String(v.id),
    title: v.title,
    channel: v.channelName || "",
  levelLabel: v.level,
  levelId,
    published: v.upload_date || "",
    premium: v.premium,
    thumbnail: v.thumbnailUrl || `https://img.youtube.com/vi/${v.on_platform_id}/hqdefault.jpg`,
  };
}

export default function BrowsePage() {
  const [filters, setFilters] = useState<FilterState>({
    sort: "recent",
    selectedLevels: [],
    selectedSpeakers: [],
    hideWatched: false,
    query: "",
  });

  const onClearAllTags = () =>
    setFilters((f: FilterState) => ({
      ...f,
      selectedLevels: [],
      selectedSpeakers: [],
    }));

  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [apiVideos, setApiVideos] = useState<VideoItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [speakerOptions, setSpeakerOptions] = useState<SpeakerOption[]>([]);
  const [loadingSpeakers, setLoadingSpeakers] = useState(false);
  const [speakerError, setSpeakerError] = useState<string | null>(null);

  // load speakers once after auth
  useEffect(() => {
    let cancelled = false;
    async function loadSpeakers() {
      if (!isAuthenticated) return;
      setLoadingSpeakers(true); setSpeakerError(null);
      try {
        const token = await getAccessTokenSilently({ authorizationParams: { audience: "https://cr/api/" }});
        const data: ApiSpeaker[] = await fetchSpeakers(token);
        if (cancelled) return;
        setSpeakerOptions(data.map(s => ({ id: s.name, label: s.name })));
      } catch (e: any) {
        if (!cancelled) setSpeakerError(e?.message || 'Failed to load speakers');
      } finally {
        if (!cancelled) setLoadingSpeakers(false);
      }
    }
    loadSpeakers();
    return () => { cancelled = true; };
  }, [isAuthenticated, getAccessTokenSilently]);

  // load videos whenever filters/page change
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isAuthenticated) return; // wait for auth
      setLoading(true); setError(null);
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: "https://cr/api/" },
        });
        const data = await fetchVideos({
          query: filters.query,
          levels: filters.selectedLevels,
          speakers: filters.selectedSpeakers,
          hideWatched: filters.hideWatched,
          page,
        }, token);
        if (cancelled) return;
        const mapped = data.results.map(mapVideo);
        setApiVideos(mapped);
        setHasMore(Boolean(data.next));
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load videos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [filters, page, isAuthenticated, getAccessTokenSilently]);

  const videos = apiVideos; // naming consistency

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-4">
        <InfoCard />

        <div className="mt-4">
          <FilterBar
            levels={LEVELS}
            speakers={speakerOptions}
            state={filters}
            onChange={setFilters}
            onClearAllTags={onClearAllTags}
          />
          {loadingSpeakers && <div className="mt-2 text-xs text-gray-400">Loading speakers…</div>}
          {speakerError && <div className="mt-2 text-xs text-red-500">{speakerError}</div>}
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
              Recommended
            </h2>
          </div>
          <RecommendedRail items={videos.slice(0, 6)} />
        </section>

        <section className="mt-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            All
          </h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading && <div className="text-sm text-gray-500">Loading…</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
            {!loading && !error && videos.map((v) => (
              <Link key={v.id} to={`/watch/${v.id}`} className="block">
                <VideoCard item={v} />
              </Link>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded-pill bg-surface-muted disabled:opacity-50"
            >Prev</button>
            <button
              disabled={!hasMore || loading}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-pill bg-surface-muted disabled:opacity-50"
            >Next</button>
          </div>
        </section>
      </div>
    </div>
  );
}
