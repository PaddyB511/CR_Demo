import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchVideo,
  markAsWatched,
  sendWatchtime,
  downloadSubtitleDocx,
  downloadAudioMp3,
} from "../api/videos";
import { useAuth0 } from "@auth0/auth0-react";

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

type WatchVideo = {
  id: number;
  title: string;
  description: string;
  duration: number;
  level: string;
  premium: boolean;
  channelName?: string;
  platform: string;
  on_platform_id: string;
  tagNames: string[];
  related?: any[];
};

export default function WatchPage() {
  const { id } = useParams();
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [video, setVideo] = useState<WatchVideo | null>(null);
  const [related, setRelated] = useState<WatchVideo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id || !isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: "https://cr/api/" },
      });
      const v = await fetchVideo(id, token);
      setVideo({
        id: v.id,
        title: v.title,
        description: v.description,
        duration: v.duration,
        level: v.level,
        premium: v.premium,
        channelName: v.channelName,
        platform: v.platform,
        on_platform_id: v.on_platform_id,
        tagNames: v.tagNames || [],
        related: v.related || [],
      });
      setRelated(
        (v.related || [])
          .map((rv: any) => ({
            id: rv.id,
            title: rv.title,
            description: rv.description,
            duration: rv.duration,
            level: rv.level,
            premium: rv.premium,
            channelName: rv.channelName,
            platform: rv.platform,
            on_platform_id: rv.on_platform_id,
            tagNames: rv.tagNames || [],
          }))
          .slice(0, 6)
      );
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Failed to load video");
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated, getAccessTokenSilently]);

  useEffect(() => {
    load();
  }, [load]);

  // naive mark-as-watched on load
  useEffect(() => {
    async function mark() {
      if (!video || !isAuthenticated) return;
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: "https://cr/api/" },
        });
        await markAsWatched(video.id, token);
      } catch (_) {}
    }
    mark();
    return () => {};
  }, [video, isAuthenticated, getAccessTokenSilently]);

  // Periodic synthetic watchtime ping (every 30s) since we can't read YT iframe time without API
  useEffect(() => {
    if (!video || !isAuthenticated) return;
    let stopped = false;
    let elapsed = 0;
    const interval = setInterval(async () => {
      if (stopped) return;
      elapsed += 30;
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: "https://cr/api/" },
        });
        await sendWatchtime(video.id, 30, elapsed, token);
      } catch (_) {}
    }, 30000);
    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [video, isAuthenticated, getAccessTokenSilently]);

  // Final flush on unmount (simulate last 5 seconds extra)
  useEffect(() => {
    return () => {
      (async () => {
        if (video && isAuthenticated) {
          try {
            const token = await getAccessTokenSilently({
              authorizationParams: { audience: "https://cr/api/" },
            });
            await sendWatchtime(video.id, 5, 5, token);
          } catch (_) {}
        }
      })();
    };
  }, [video, isAuthenticated, getAccessTokenSilently]);

  const handleDownload = useCallback(
    async (which: "docx" | "audio") => {
      if (!video) return;
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: { audience: "https://cr/api/" },
        });
        let blob: Blob;
        if (which === "docx")
          blob = await downloadSubtitleDocx(video.id, token);
        else blob = await downloadAudioMp3(video.id, token);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const ext = which === "audio" ? "mp3" : "docx";
        a.download = `${video.title}.${ext}`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        alert(e?.response?.data?.error || "Download failed");
      }
    },
    [video, getAccessTokenSilently]
  );

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center text-sm text-gray-600">
        Login required.
      </div>
    );
  }
  if (loading)
    return (
      <div className="p-8 text-center text-sm text-gray-600">Loading…</div>
    );
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!video) return null;

  const sidebar = related;

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-4 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left column: video + content as a single continuous card */}
        <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
          <div className="bg-black aspect-video">
            {/* Simple YouTube embed for demo; replace with your player later */}
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${video.on_platform_id ||
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
                  👤 {video.channelName}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-pill text-[12px] ${levelClass(
                    video.level
                  )}`}
                >
                  {video.level}
                </span>
                {video.tagNames?.map((t) => (
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
                <button
                  onClick={() => handleDownload("docx")}
                  className="underline cursor-pointer"
                >
                  Download transcription
                </button>
                <button
                  onClick={() => handleDownload("audio")}
                  className="underline cursor-pointer"
                >
                  Download audio
                </button>
              </div>

              <div className="mt-4 text-[12px] text-gray-400">
                📅 Published on {video.on_platform_id}
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
                    src={`https://img.youtube.com/vi/${v.on_platform_id}/hqdefault.jpg`}
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
                    {v.channelName}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-pill text-[11px] ${levelClass(
                        v.level
                      )}`}
                    >
                      {v.level}
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
