import { useEffect, useMemo, useState } from "react";
import InfoCard from "../components/Browse/InfoCard.tsx";
import FilterBar from "../components/Browse/FilterBar.tsx";
import type {
  FilterState,
  SpeakerOption,
  LevelOption,
  ChannelOption,
  TopicOption,
} from "../components/Browse/FilterBar.tsx";
import RecommendedRail from "../components/Browse/RecommendedRail.tsx";
import VideoCard from "../components/Browse/VideoCard.tsx";
import type { VideoItem } from "../components/Browse/VideoCard.tsx";
import { Link } from "react-router-dom";

/* ---------------- constants ---------------- */

const API_BASE = "/api/platform";
// Use legacy platform endpoints (public browse) so the frontend receives the
// legacy JSON shape ({ videos: [...], hasMore: ... }). The DRF viewset under
// /api/videos/ returns a different paginated shape which this page does not
// currently expect.
const LIST_URL = `${API_BASE}/videos/`;
const STATS_URL = `${API_BASE}/videos/statistics/`;

const LEVELS: LevelOption[] = [
  { id: "Beginner 0", label: "Beginner 0" },
  { id: "Beginner 1", label: "Beginner 1" },
  { id: "Beginner 2", label: "Beginner 2" },
  { id: "Intermediate 1", label: "Intermediate 1" },
  { id: "Intermediate 2", label: "Intermediate 2" },
  { id: "Advanced", label: "Advanced" },
  { id: "Native", label: "Native" },
];

/* ------------- API shapes (tolerant) ------------- */
type ApiVideo = {
  id: number | string;
  on_platform_id: string;
  title: string;
  description?: string;
  upload_date?: string;
  duration?: number;
  level?: string;
  premium?: boolean;
  channelName?: string;
  channel_name?: string;
  thumbnailUrl?: string;
  thumbnail_url?: string;
};

type StatsResponse = {
  total: number;
  statistics: {
    speakers: { name: string; count: number }[];
    channels: { name: string; count: number }[];
    topics: { name: string; count: number }[];
  };
};

/* ------------- helpers ------------- */

function coalesceTitle(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) {
        return trimmed;
      }
      continue;
    }
    if (value !== null && value !== undefined) {
      const text = String(value).trim();
      if (text) {
        return text;
      }
    }
  }
  return "Untitled video";
}

function mapVideo(v: any): VideoItem {
  // accept both snake_case and camelCase from the API
  const id = String(v.id ?? v.pk ?? v.video_id);

  const level = v.level ?? v.levelLabel ?? "";
  const channel = v.channel_name ?? v.channelName ?? v.channel ?? "";
  const date = v.upload_date ?? v.published ?? v.publish_date ?? v.PublishDate ?? "";
  const title = coalesceTitle(
    v.title,
    v.name,
    v.video_title,
    v.videoTitle,
    v.video_name_on_youtube,
    v.videoNameOnYoutube,
    v.metadata?.title,
    v.metadata?.video_name_on_youtube,
    v.video?.title
  );

  // thumbnail candidates
  const thumb =
    v.thumbnail_url ??
    v.thumbnailUrl ??
    (v.on_platform_id
      ? `https://img.youtube.com/vi/${v.on_platform_id}/hqdefault.jpg`
      : v.youtube_id
      ? `https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`
      : v.external_id
      ? `https://img.youtube.com/vi/${v.external_id}/hqdefault.jpg`
      : undefined);

  return {
    id,
    title,
    channel,
    levelLabel: level,
    levelId: level,
    published: date,
    premium: Boolean(v.premium),
    thumbnail: thumb || "/placeholder-thumb.png", // add a tiny local placeholder if you want
  };
}

function toQueryString(filters: FilterState, page: number): string {
  const qs = new URLSearchParams();
  qs.set("page", String(page)); // backend expects 1-based

  if (filters.query?.trim()) qs.set("text", filters.query.trim());
  if (filters.selectedLevels.length) {
    qs.set("levels", filters.selectedLevels.join(","));
    filters.selectedLevels.forEach((lvl) => qs.append("level", lvl));
  }
  if (filters.selectedSpeakers.length) {
    qs.set("speakers", filters.selectedSpeakers.join(","));
    filters.selectedSpeakers.forEach((sp) => qs.append("speaker", sp));
  }
  if (filters.selectedChannels.length) {
    qs.set("channels", filters.selectedChannels.join(","));
    filters.selectedChannels.forEach((ch) => qs.append("channel", ch));
  }
  if (filters.selectedTopics.length) {
    qs.set("topics", filters.selectedTopics.join(","));
    filters.selectedTopics.forEach((tp) => qs.append("topic", tp));
  }
  if (filters.hideWatched) {
    qs.set("hide_watched", "1");
    qs.set("hide-watched", "true");
  }
  if (filters.sort) qs.set("sort", filters.sort);
  if (filters.minDuration !== null || filters.maxDuration !== null) {
    const min = filters.minDuration !== null ? String(filters.minDuration) : "";
    const max = filters.maxDuration !== null ? String(filters.maxDuration) : "";
    qs.set("durations", `${min},${max}`);
    if (min) qs.set("min_duration", min);
    if (max) qs.set("max_duration", max);
  }

  // Uncomment if you add duration sliders to FilterBar later
  // if (filters.minSeconds != null) qs.set("min_duration", String(filters.minSeconds));
  // if (filters.maxSeconds != null) qs.set("max_duration", String(filters.maxSeconds));

  return qs.toString();
}

/* ---------------- component ---------------- */

export default function BrowsePage() {
  const [filters, setFilters] = useState<FilterState>({
    sort: "new",
    selectedLevels: [],
    selectedSpeakers: [],
    selectedChannels: [],
    selectedTopics: [],
    hideWatched: false,
    query: "",
    minDuration: null,
    maxDuration: null,
  });

  const [page, setPage] = useState(1);

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [speakerOptions, setSpeakerOptions] = useState<SpeakerOption[]>([]);
  const [channelOptions, setChannelOptions] = useState<ChannelOption[]>([]);
  const [topicOptions, setTopicOptions] = useState<TopicOption[]>([]);
  const [loadingSpeakers, setLoadingSpeakers] = useState(false);
  const [speakerError, setSpeakerError] = useState<string | null>(null);

  const listQS = useMemo(() => toQueryString(filters, page), [filters, page]);

  // Load speakers (public)
  useEffect(() => {
    let cancelled = false;
    async function loadSpeakers() {
      setLoadingSpeakers(true);
      setSpeakerError(null);
      try {
        const r = await fetch(STATS_URL);
        if (!r.ok) throw new Error(`Failed (${r.status})`);
        const data: StatsResponse = await r.json();
        if (cancelled) return;
        const speakerOpts: SpeakerOption[] = (data.statistics?.speakers ?? []).map((s) => ({
          id: s.name,
          label: s.name,
        }));
        setSpeakerOptions(speakerOpts);
        const channelOpts: ChannelOption[] = (data.statistics?.channels ?? []).map((c) => ({
          id: c.name,
          label: c.name,
        }));
        setChannelOptions(channelOpts);
        const topicOpts: TopicOption[] = (data.statistics?.topics ?? []).map((t) => ({
          id: t.name,
          label: t.name,
        }));
        setTopicOptions(topicOpts);
      } catch (e: any) {
        if (!cancelled) setSpeakerError(e?.message || "Failed to load speakers");
      } finally {
        if (!cancelled) setLoadingSpeakers(false);
      }
    }
    loadSpeakers();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load videos
  useEffect(() => {
    let cancelled = false;
    async function loadVideos() {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch(`${LIST_URL}?${listQS}`);
        if (!r.ok) throw new Error(`Failed (${r.status})`);
        const data = await r.json();
        if (cancelled) return;
        // Accept both legacy platform format { videos: [...] , hasMore } and DRF paginated { results: [...], next }
        const rawItems = (data.videos ?? data.results) || [];
        const items: VideoItem[] = rawItems.map(mapVideo);
        setVideos(items);
        setHasMore(Boolean(data.hasMore ?? data.next));
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load videos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadVideos();
    return () => {
      cancelled = true;
    };
  }, [listQS]);

  const onClearAllTags = () =>
    setFilters((f) => ({
      ...f,
      selectedLevels: [],
      selectedSpeakers: [],
      selectedChannels: [],
      selectedTopics: [],
      minDuration: null,
      maxDuration: null,
    }));

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-4">
        <InfoCard />

        <div className="mt-4">
          <FilterBar
            levels={LEVELS}
            speakers={speakerOptions}
            channels={channelOptions}
            topics={topicOptions}
            state={filters}
            onChange={(next) => {
              setPage(1); // reset paging when filters change
              setFilters(next);
            }}
            onClearAllTags={onClearAllTags}
          />
          {loadingSpeakers && (
            <div className="mt-2 text-xs text-gray-400">Loading speakers…</div>
          )}
          {speakerError && (
            <div className="mt-2 text-xs text-red-500">{speakerError}</div>
          )}
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
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {loading && <div className="text-sm text-gray-500">Loading…</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}
            {!loading &&
              !error &&
              videos.map((v) => (
                <Link key={v.id} to={`/watch/${v.id}`} className="block">
                  <VideoCard item={v} />
                </Link>
              ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full bg-surface-muted px-3 py-1 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={!hasMore || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full bg-surface-muted px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
