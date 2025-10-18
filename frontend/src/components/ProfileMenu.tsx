import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  onLogout?: () => void;
  // Optional: where to push users if you don’t use <Link />
  toAccount?: string;
  toDashboard?: string;
  toJournal?: string;
};

export default function ProfileMenu({
  open,
  onClose,
  onLogout,
  toAccount = "/account",
  toDashboard = "/progress",
  toJournal = "/journal",
}: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) onClose();
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
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
      {/* Red curved hint (optional) */}
      <div className="absolute -top-1 right-0 left-0 h-1 rounded-t-2xl bg-[#DB0000]" />

      <ul className="p-3 space-y-1">
        {/* My account */}
        <li>
          <Link
            to={toAccount}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-[#DB0000] font-semibold hover:bg-neutral-50"
            role="menuitem"
          >
            <img
              src="/src/assets/icons/myaccount-sym.svg"
              alt=""
              className="h-5 w-5"
            />
            <span>My account</span>
          </Link>
        </li>

        {/* Progress Dashboard */}
        <li>
          <Link
            to={toDashboard}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-black hover:bg-neutral-50"
            role="menuitem"
          >
            <img
              src="/src/assets/icons/progress-dash-sym.svg"
              alt=""
              className="h-5 w-5"
            />
            <div className="leading-tight">
              <div className="font-semibold">Progress</div>
              <div className="-mt-0.5">Dashboard</div>
            </div>
          </Link>
        </li>

        {/* Progress Journal */}
        <li>
          <Link
            to={toJournal}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-black hover:bg-neutral-50"
            role="menuitem"
          >
            <img
              src="/src/assets/icons/progress-journal-sym.svg"
              alt=""
              className="h-5 w-5"
            />
            <div className="leading-tight">
              <div className="font-semibold">Progress</div>
              <div className="-mt-0.5">Journal</div>
            </div>
          </Link>
        </li>

        {/* Divider */}
        <li>
          <div className="my-2 h-px w-full bg-neutral-200" />
        </li>

        {/* Log out (muted) */}
        <li>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[#9C9C9C] hover:bg-neutral-50"
            role="menuitem"
          >
            <img
              src="/src/assets/icons/logout-sym.svg"
              alt=""
              className="h-5 w-5"
            />
            <span className="font-semibold">Log out</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
