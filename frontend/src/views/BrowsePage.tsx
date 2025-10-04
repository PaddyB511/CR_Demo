import { useMemo, useState } from "react";
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
import { videos as SHARED_VIDEOS } from "../data/videos.ts";
import { Link } from "react-router-dom";

const LEVELS: LevelOption[] = [
  { id: "b0", label: "Beginner 0" },
  { id: "b1", label: "Beginner 1" },
  { id: "b2", label: "Beginner 2" },
  { id: "i1", label: "Intermediate 1" },
  { id: "i2", label: "Intermediate 2" },
  { id: "adv", label: "Advanced" },
];

const SPEAKERS: SpeakerOption[] = [
  { id: "speaker 1", label: "speaker 1" },
  { id: "speaker 2", label: "speaker 2" },
  { id: "speaker 3", label: "speaker 3" },
];

const SAMPLE_VIDEOS: VideoItem[] = SHARED_VIDEOS.map((v) => ({
  id: v.id,
  title: v.title,
  channel: v.channel,
  levelLabel: v.levelLabel,
  levelId: v.levelId,
  published: v.published,
  premium: v.premium,
  thumbnail: v.thumbnail,
}));

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

  const videos = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return SAMPLE_VIDEOS.filter((v) => {
      const matchesQuery = q
        ? v.title.toLowerCase().includes(q) ||
          v.channel.toLowerCase().includes(q)
        : true;
      const lvlOk =
        !filters.selectedLevels.length ||
        filters.selectedLevels.includes(v.levelId as any);
      return matchesQuery && lvlOk;
    });
  }, [filters]);

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-4">
        <InfoCard />

        <div className="mt-4">
          <FilterBar
            levels={LEVELS}
            speakers={SPEAKERS}
            state={filters}
            onChange={setFilters}
            onClearAllTags={onClearAllTags}
          />
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
            {videos.map((v) => (
              <Link key={v.id} to={`/watch/${v.id}`} className="block">
                <VideoCard item={v} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
