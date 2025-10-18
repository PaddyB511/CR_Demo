import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getUser } from "../../api/payments";

import logo from "../../assets/logo.svg?url";
import dailyGoalIcon from "../../assets/topbar/dailygoalsymbol.svg?url";
import totalInputIcon from "../../assets/topbar/totalinputsymbol.svg?url";
import profileIcon from "../../assets/topbar/profile.svg?url";
import symAccount from "../../assets/icons/myaccount-sym.svg?url";
import symDash from "../../assets/icons/progress-dash-sym.svg?url";
import symJournal from "../../assets/icons/progress-journal-sym.svg?url";
import symLogout from "../../assets/icons/logout-sym.svg?url";

type TopBarProps = {
  onLoginClick?: () => void;
  onSignUpClick?: () => void;
};

/* ------------------------- Profile Menu (inline) ------------------------- */

function ProfileMenu({
  open,
  onClose,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) onClose();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-neutral-200 bg-white shadow-xl"
      role="menu"
      aria-label="Profile menu"
    >
      <div className="absolute -top-1 left-0 right-0 h-1 rounded-t-2xl bg-[#DB0000]" />
      <ul className="p-3 space-y-1">
        <li>
          <Link
            to="/account"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-[#DB0000] font-semibold hover:bg-neutral-50"
            onClick={onClose}
            role="menuitem"
          >
            <img src={symAccount} className="h-5 w-5" alt="" />
            <span>My account</span>
          </Link>
        </li>

        <li>
          <Link
            to="/progress"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-black hover:bg-neutral-50"
            onClick={onClose}
            role="menuitem"
          >
            <img src={symDash} className="h-5 w-5" alt="" />
            <div className="leading-tight">
              <div className="font-semibold">Progress</div>
              <div className="-mt-0.5">Dashboard</div>
            </div>
          </Link>
        </li>

        <li>
          <Link
            to="/journal"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-black hover:bg-neutral-50"
            onClick={onClose}
            role="menuitem"
          >
            <img src={symJournal} className="h-5 w-5" alt="" />
            <div className="leading-tight">
              <div className="font-semibold">Progress</div>
              <div className="-mt-0.5">Journal</div>
            </div>
          </Link>
        </li>

        <li>
          <div className="my-2 h-px w-full bg-neutral-200" />
        </li>

        <li>
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[#9C9C9C] hover:bg-neutral-50"
            role="menuitem"
          >
            <img src={symLogout} className="h-5 w-5" alt="" />
            <span className="font-semibold">Log out</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

/* -------------------------------- TopBar ------------------------------- */

type SessionResp = {
  user?: { dailyGoalMinutes?: number };
  watchTimeSeconds?: number;
  watchTimeTodaySeconds?: number;
};

export default function TopBar({ onLoginClick, onSignUpClick }: TopBarProps) {
  const nav = useNavigate();
  const [data, setData] = useState<SessionResp>({});
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getUser().then((u) => setData(u as any)).catch(() => {});
  }, []);

  const dailyGoal = data?.user?.dailyGoalMinutes ?? 15;
  const todayMin = Math.floor((data?.watchTimeTodaySeconds ?? 0) / 60);
  const totalSec = data?.watchTimeSeconds ?? 0;
  const totalH = Math.floor(totalSec / 3600);
  const totalMin = Math.floor((totalSec % 3600) / 60);

  async function handleLogout() {
    try {
      await fetch("/api/user/logout", { method: "GET", credentials: "include" });
    } catch {}
    nav("/browse");
  }

  return (
    <div className="sticky top-0 z-50 bg-white border-b border-[#EFEFEF]">
      <div className="mx-auto w-full max-w-[1200px] px-3 sm:px-4">
        <div className="flex items-center justify-between gap-4 py-3 md:py-4">
          {/* Logo */}
          <a href="/" className="inline-flex items-center gap-2 shrink-0">
            <img src={logo} alt="Comprehensible Russian" className="h-11 md:h-12 w-auto" />
          </a>

          {/* Sign-in prompt */}
          <div className="hidden md:flex items-center justify-center grow">
            <div className="flex items-center gap-2 bg-[#F3F3F3] px-4 py-2 rounded-md">
              <span className="text-sm text-black">
                Sign in now to not lose{" "}
                <span className="font-semibold text-[#DB0000]">your progress!</span>
              </span>
              <button
                onClick={onLoginClick ?? (() => nav("/login"))}
                className="h-8 rounded-md bg-[#DB0000] px-3 text-white text-sm font-semibold hover:bg-[#c00000]"
              >
                Log in
              </button>
              <button
                onClick={onSignUpClick ?? (() => nav("/signup"))}
                className="h-8 rounded-md border border-[#DB0000] px-3 text-[#DB0000] text-sm font-semibold hover:bg-[#DB0000]/5"
              >
                Sign up
              </button>
            </div>
          </div>

          {/* Stats + Profile */}
          <div className="relative flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full">
              <img src={dailyGoalIcon} alt="Daily Goal" className="h-[42px] w-[42px]" />
              <div className="text-sm leading-tight text-black">
                <div className="font-semibold">Daily Goal</div>
                <div className="text-neutral-500 text-[12px]">
                  {todayMin}/{dailyGoal} min
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full">
              <img src={totalInputIcon} alt="Total Input" className="h-[42px] w-[42px]" />
              <div className="text-sm leading-tight text-black">
                <div className="font-semibold">Total Input</div>
                <div className="text-neutral-500 text-[12px]">
                  {totalH} hrs {totalMin} min
                </div>
              </div>
            </div>

            {/* Profile */}
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="relative inline-flex items-center justify-center h-[58px] w-[58px] rounded-full bg-[#FFF0F0]"
              title="My account"
            >
              <img src={profileIcon} alt="Profile" className="h-[60px] w-[60px] object-contain" />
            </button>

            <ProfileMenu
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>

        {/* Mobile sign-in block */}
        <div className="flex md:hidden items-center justify-center py-2">
          <div className="flex items-center gap-2 bg-[#F3F3F3] px-4 py-2 rounded-md">
             <span className="text-sm text-black">
              Sign in now to not lose{" "}
              <span className="font-semibold text-[#DB0000]">your progress!</span>
            </span>
            <button
              onClick={onLoginClick ?? (() => nav("/login"))}
              className="h-8 rounded-md bg-[#DB0000] px-3 text-white text-sm font-semibold"
            >
              Log in
            </button>
            <button
              onClick={onSignUpClick ?? (() => nav("/signup"))}
              className="h-8 rounded-md border border-[#DB0000] px-3 text-[#DB0000] text-sm font-semibold"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
