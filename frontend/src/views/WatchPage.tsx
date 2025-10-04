import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { videos } from "../data/videos.ts";

function levelClass(levelId?: string) {
  switch (levelId) {
    case "b0":
      return "bg-level-b0 text-white";
    case "b1":
      return "bg-level-b1 text-white";
    case "i1":
      return "bg-level-i1 text-white";
    case "i2":
      return "bg-inter2 text-inter2-foreground";
    case "adv":
      return "bg-level-adv text-white";
    case "native":
      return "bg-level-native text-white";
    default:
      return "bg-gray-300 text-gray-800";
  }
}

export default function WatchPage() {
  const { id } = useParams();
  const video = useMemo(() => videos.find((v) => v.id === id) ?? videos[0], [
    id,
  ]);
  const sidebar = useMemo(
    () => videos.filter((v) => v.id !== video.id).slice(0, 6),
    [video.id]
  );

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left column: video + content as a single continuous card */}
        <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
          <div className="bg-black aspect-video">
            {/* Simple YouTube embed for demo; replace with your player later */}
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${video.youtubeId ??
                "UFPKTPsHBKk"}`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Content area below video */}
          <div className="p-4 flex flex-col gap-4">
            {/* Mobile shows meta first; desktop shows upsell first */}
            <section className="order-1 md:order-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-pill bg-chip-selected border border-chip-selected text-brand text-[12px]">
                  👤 {video.channel}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-pill text-[12px] ${levelClass(
                    video.levelId
                  )}`}
                >
                  {video.levelLabel}
                </span>
                {video.tags?.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-1 rounded-pill bg-surface-muted text-gray-700 border border-border text-[12px]"
                  >
                    {t}
                  </span>
                ))}
                <button className="ml-auto text-gray-400">⋮</button>
              </div>

              <h1 className="mt-4 text-2xl font-bold text-gray-900">
                {video.title}
              </h1>
              <p className="mt-2 text-gray-700 max-w-prose">
                {video.description ?? ""}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <a className="underline cursor-pointer">
                  Download transcription
                </a>
                <a className="underline cursor-pointer">Download audio</a>
              </div>

              <div className="mt-4 text-[12px] text-gray-400">
                📅 Published on {video.published}
              </div>
            </section>

            <section className="order-2 md:order-1">
              <div className="rounded-card-sm border border-chip-selected bg-chip-selected px-4 py-3 flex items-center justify-between">
                <div className="text-sm text-brand">
                  Free users have access to only <strong>30 out of 300</strong>{" "}
                  videos from Comprehensible Russian channel. Want them all?
                </div>
                <button className="ml-3 shrink-0 inline-flex items-center px-4 py-2 rounded-pill bg-brand text-white text-sm">
                  Go Premium
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-4">
          {/* Autoplay / Hide watched */}
          <div className="bg-surface rounded-card border border-border shadow-card p-3 flex items-center gap-2">
            <button className="px-3 py-2 rounded-pill bg-surface-muted text-gray-700 text-sm">
              Autoplay
            </button>
            <button className="px-3 py-2 rounded-pill bg-surface-muted text-gray-700 text-sm">
              Hide watched
            </button>
          </div>

          {sidebar.map((v) => (
            <Link key={v.id} to={`/watch/${v.id}`} className="group block">
              <div className="bg-surface rounded-card border border-border shadow-card p-2">
                <div className="relative rounded-card-sm overflow-hidden aspect-[16/9] bg-surface-muted">
                  <img
                    src={v.thumbnail}
                    alt="thumb"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {v.premium && (
                    <div className="absolute inset-0 bg-black/35 grid place-items-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/90 text-gray-800 text-xl">
                        🔒
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <div className="text-[13px] font-semibold text-gray-900 line-clamp-2">
                    {v.title}
                  </div>
                  <div className="text-[12px] text-gray-500 line-clamp-1">
                    {v.channel}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-pill text-[11px] ${levelClass(
                        v.levelId
                      )}`}
                    >
                      {v.levelLabel}
                    </span>
                    <button className="ml-auto text-gray-400 hover:text-gray-600">
                      ⭐
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </aside>
      </div>
    </div>
  );
}
