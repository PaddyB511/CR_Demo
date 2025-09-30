export type VideoItem = {
  id: string;
  title: string;
  channel: string;
  levelLabel: string;
  levelId: string;
  published: string; // YYYY-MM-DD
  premium?: boolean;
  thumbnail: string;
};

export default function VideoCard({ item }: { item: VideoItem }) {
  return (
    <article className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
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
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-pill bg-chip-selected text-brand border border-chip-selected">
            <span role="img" aria-label="channel">
              👤
            </span>{" "}
            {item.channel}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-pill bg-inter2 text-inter2-foreground">
            {item.levelLabel}
          </span>
          <button className="ml-auto text-gray-400 hover:text-gray-600">
            ⋮
          </button>
        </div>
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2">
          {item.title}
        </h3>
        <div className="mt-2 text-[12px] text-gray-400 flex items-center gap-1">
          <span role="img" aria-label="published">
            📅
          </span>
          Published on {item.published}
        </div>
      </div>
    </article>
  );
}
