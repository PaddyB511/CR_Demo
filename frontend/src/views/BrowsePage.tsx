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

const LEVELS: LevelOption[] = [
  { id: "b0", label: "Beginner 0" },
  { id: "b1", label: "Beginner 1" },
  { id: "b2", label: "Beginner 2" },
  { id: "i1", label: "Intermediate 1" },
  { id: "i2", label: "Intermediate 2" },
  { id: "adv", label: "Advanced" },
];

const SPEAKERS: SpeakerOption[] = [
  { id: "elvira", label: "Эльвира" },
  { id: "baba-yaga", label: "Баба Яга" },
  { id: "vladimir", label: "Владимир" },
];

const SAMPLE_VIDEOS: VideoItem[] = [
  {
    id: "1",
    title: "Meet Elvira: 15 Weird Facts to Break the Ice",
    channel: "Comprehensible Russian",
    levelLabel: "Intermediate 2",
    levelId: "i2",
    published: "2025-07-29",
    premium: false,
    thumbnail:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "Meet Elvira: 15 Weird Facts to Break the Ice",
    channel: "Comprehensible Russian",
    levelLabel: "Intermediate 2",
    levelId: "i2",
    published: "2025-07-29",
    premium: true,
    thumbnail:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Meet Elvira: 15 Weird Facts to Break the Ice",
    channel: "Comprehensible Russian",
    levelLabel: "Intermediate 2",
    levelId: "i2",
    published: "2025-07-29",
    premium: false,
    thumbnail:
      "https://images.unsplash.com/photo-1528372444006-1bfc81acab02?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "4",
    title: "Meet Elvira: 15 Weird Facts to Break the Ice",
    channel: "Comprehensible Russian",
    levelLabel: "Intermediate 2",
    levelId: "i2",
    published: "2025-07-29",
    premium: true,
    thumbnail:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "5",
    title: "Meet Elvira: 15 Weird Facts to Break the Ice",
    channel: "Comprehensible Russian",
    levelLabel: "Intermediate 2",
    levelId: "i2",
    published: "2025-07-29",
    premium: false,
    thumbnail:
      "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "6",
    title: "Meet Elvira: 15 Weird Facts to Break the Ice",
    channel: "Comprehensible Russian",
    levelLabel: "Intermediate 2",
    levelId: "i2",
    published: "2025-07-29",
    premium: false,
    thumbnail:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1200&auto=format&fit=crop",
  },
];

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
              <VideoCard key={v.id} item={v} />)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
