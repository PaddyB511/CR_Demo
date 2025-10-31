import calendarIcon from "@/assets/browse/Calendar.svg";

export type VideoItem = {
  id: string;
  title: string;
  channel: string;
  levelLabel: string;
  levelId: string;
  published: string; // YYYY-MM-DD
  premium?: boolean;
  thumbnail: string;
  durationSeconds?: number | null;
};

export default function VideoCard({ item }: { item: VideoItem }) {
  return (
    <article className="bg-surface rounded-card shadow-card overflow-hidden">
      <div className="relative aspect-[16/9] bg-surface-muted">
        <img
          src={item.thumbnail}
          alt="Thumbnail"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {item.premium && (
          <div className="absolute inset-0 bg-black/40 grid place-items-center">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/90 text-gray-800 text-2xl">
              🔒
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center gap-2 text-[12px] mb-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-chip-selected text-brand border border-chip-selected font-inter font-semibold">
            <span role="img" aria-label="channel">
              👤
            </span>
            {item.channel}
          </span>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-inter2 text-inter2-foreground font-inter font-semibold">
            {item.levelLabel}
          </span>
          <button className="ml-auto text-gray-400 hover:text-gray-600" aria-label="Video actions">
            ⋮
          </button>
        </div>
        <h3 className="text-[16px] font-semibold text-gray-900 leading-snug line-clamp-2 font-inter">
          {item.title}
        </h3>
        <div className="mt-3 text-[12px] text-[#D9D9D9] flex items-center gap-2 font-inter">
          <img src={calendarIcon} alt="Published date" className="h-3.5 w-3.5" loading="lazy" />
          Published on {item.published}
        </div>
      </div>
    </article>
  );
}
