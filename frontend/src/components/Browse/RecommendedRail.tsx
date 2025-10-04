import VideoCard from "./VideoCard";
import type { VideoItem } from "./VideoCard";
import { Link } from "react-router-dom";

export default function RecommendedRail({ items }: { items: VideoItem[] }) {
  return (
    <div className="mt-3">
      <UpsellCard />
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]
                      sm:[overflow:initial]">
        {items.map((it) => (
          <Link key={it.id} to={`/watch/${it.id}`} className="block">
            <VideoCard item={it} />
          </Link>
        ))}
      </div>
    </div>
  );
}

function UpsellCard() {
  return (
    <div className="rounded-card-sm border border-chip-selected bg-chip-selected text-brand px-4 py-3 flex items-center justify-between">
      <div className="text-sm">
        Unlock 1,221 premium videos, unlimited time tracking, and other exclusive features!
      </div>
      <button className="ml-4 shrink-0 inline-flex items-center px-4 py-2 rounded-pill bg-brand text-white text-sm">
        Go Premium
      </button>
    </div>
  );
}
