// src/views/Account/Account.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import TopBar from "../Premium/topbar";
import SideNav from "../Premium/sidenav";
import { getUser } from "../../api/payments";
import AccountSettingsModal from "../../components/AccountSettingsModal";

// --- SVG assets (save your .txt as .svg in src/assets/account/) ---
import btnDelete from "../../assets/account/MyAccountDeleteProfile.svg?url";
import btnLogout from "../../assets/account/MyAccountLogOut.svg?url";
import btnPencil from "../../assets/account/MyAccountPencil.svg?url";

import journalBtn from "../../assets/account/ProgressJournalGoTo.svg?url";
import dashBtn from "../../assets/account/ProgressDashGoTo.svg?url";
import videosBtn from "../../assets/account/ToVideosGoTo.svg?url";

type SessionUser = {
  email?: string;
  name?: string;
};

export default function Account() {
  const nav = useNavigate();
  const [user, setUser] = useState<SessionUser>({});
  const [openSettings, setOpenSettings] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await getUser(); // POST /api/user (session bootstrap)
        setUser({ email: u?.user?.email ?? "", name: u?.user?.name ?? "" });
      } catch {
        // ok if backend is offline
      }
    })();
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/user/logout");
    } catch {}
    nav("/browse");
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6] text-[#111]">
   

      <div className="relative flex-1 py-8">
        <div className="mx-auto w-full max-w-[1200px] px-4 grid gap-6 md:grid-cols-[420px_minmax(0,1fr)]">
          {/* ---------- LEFT: My account card ---------- */}
          <section className="relative rounded-2xl border border-neutral-200 bg-white shadow-sm p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[20px] font-semibold">My account</h2>

              {/* Pencil (opens settings modal) */}
              <button
                type="button"
                onClick={() => setOpenSettings(true)}
                title="Edit profile"
              >
                <img src={btnPencil} alt="Edit" className="h-[32px] w-[32px]" />
              </button>
            </div>

            {/* Avatar + name/email */}
            <div className="mt-4 flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-200 shrink-0" />
              <div className="min-w-0">
                <div className="font-semibold leading-tight">
                  {user.name || "Name"}
                </div>
                <div className="text-sm text-neutral-500 truncate">
                  {user.email || "iloveRussian@example.com"}
                </div>
              </div>
            </div>

            {/* Chips */}
            <div className="mt-5 flex flex-wrap gap-2">
              <Chip>Birthday: 01/01/2000</Chip>
              <Chip>English: Native</Chip>
              <Chip>Russian: A1</Chip>
              <Chip>Ear for music</Chip>
            </div>

            <div className="my-6 h-px bg-neutral-200" />

            {/* Logout (SVG button asset) */}
            <button onClick={handleLogout} className="block w-full" title="Log out">
              <img src={btnLogout} alt="Log out" className="w-full" />
            </button>

            {/* Delete profile (stub) */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => alert("Delete profile: to be implemented")}
                title="Delete profile"
              >
                <img src={btnDelete} alt="Delete profile" className="h-5 w-auto" />
              </button>
            </div>
          </section>

          {/* ---------- RIGHT: Banner + 3 cards grid ---------- */}
          <div className="grid gap-6">
            {/* Go Premium banner (Tailwind build; no SVG text) */}
            <section className="rounded-2xl border border-neutral-200 bg-[#DB0000] text-white p-5 md:p-6 shadow-sm">
              <h3 className="text-[20px] font-extrabold mb-2">Go Premium</h3>
              <ul className="text-[14px] leading-[1.4] space-y-1 opacity-95">
                <li>Premium videos</li>
                <li>Download audios &amp; transcriptions</li>
                <li>Playlists</li>
                <li>Download video and audio for offline use</li>
                <li>Unlimited Time Tracking</li>
              </ul>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => nav("/premium")}
                  className="inline-flex items-center gap-2 rounded-full bg-white text-[#111] px-4 py-2 text-sm font-semibold hover:bg-white/90"
                >
                  Subscribe →
                </button>
              </div>
            </section>

            {/* Three small cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <SmallCard
                title="Progress Journal"
                body="Record important moments and add hours outside the platform!"
                buttonImg={journalBtn}
                onClick={() => nav("/journal")}
              />

              <SmallCard
                title="Progress Dashboard"
                body="Evaluate your progress and choose your own goals!"
                buttonImg={dashBtn}
                onClick={() => nav("/progress")}
                highlighted
              />

              <SmallCard
                title="To the videos"
                body="Forward to achieving new goals :)"
                buttonImg={videosBtn}
                onClick={() => nav("/browse")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* -------- Settings Modal -------- */}
      <AccountSettingsModal
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        onGoPremium={() => nav("/premium")}
        // seed with what we know; expand when backend has these fields
        initialName={user.name || ""}
        initialEmail={user.email || ""}
        initialNativeLanguage=""
        initialOtherLanguages={[{ language: "English", level: "C1" }]}
        initialEarForMusic={true}
      />
    </div>
  );
}

/* ---------- tiny helpers ---------- */

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-700">
      {children}
    </span>
  );
}

function SmallCard({
  title,
  body,
  buttonImg,
  onClick,
  highlighted = false,
}: {
  title: string;
  body: string;
  buttonImg: string;
  onClick: () => void;
  highlighted?: boolean;
}) {
  return (
    <section
      className={[
        "rounded-2xl border bg-white shadow-sm p-5 md:p-6",
        highlighted ? "border-[#DB0000]" : "border-neutral-200",
      ].join(" ")}
    >
      <h4
        className={[
          "text-[18px] font-extrabold leading-tight mb-2",
          highlighted ? "text-[#DB0000]" : "text-[#111]",
        ].join(" ")}
      >
        {title}
      </h4>

      <p className="text-[14px] text-neutral-700 leading-snug min-h-[56px]">{body}</p>

      <div className="pt-4">
        <button type="button" onClick={onClick} title="Go to page">
          <img src={buttonImg} alt="Go to page" className="h-[34px] w-auto" />
        </button>
      </div>
    </section>
  );
}
