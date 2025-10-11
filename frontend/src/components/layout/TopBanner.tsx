import { useAuth0 } from "@auth0/auth0-react";
import { useMemo } from "react";

type TopBannerProps = {
  dailyCurrent?: number; // minutes
  dailyTarget?: number; // minutes
  totalHours?: number;
  totalMinutes?: number;
};

const TopBanner = ({
  dailyCurrent = 20,
  dailyTarget = 60,
  totalHours = 28,
  totalMinutes = 28,
}: TopBannerProps) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  const pct = useMemo(() => {
    if (!dailyTarget) return 0;
    return Math.min(
      100,
      Math.max(0, Math.round((dailyCurrent / dailyTarget) * 100))
    );
  }, [dailyCurrent, dailyTarget]);

  return (
    <div className="w-full bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-3 md:px-6 py-3 flex items-center justify-between gap-3">
        {/* Left: menu + logo */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Menu"
            className="p-2 rounded-md border border-gray-200 md:hidden"
          >
            <span className="block w-5 h-[2px] bg-gray-700 mb-[3px]" />
            <span className="block w-5 h-[2px] bg-gray-700 mb-[3px]" />
            <span className="block w-5 h-[2px] bg-gray-700" />
          </button>
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white grid place-items-center font-bold">
              CR
            </div>
            <span className="hidden sm:block font-inter font-semibold text-[18px]">
              Comprehensible RUSSIAN
            </span>
          </div>
        </div>

        {/* Center: auth callout (desktop) */}
        {!isAuthenticated ? (
          <div className="hidden md:flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
            <span className="text-sm">
              <span className="font-medium">Sign in now</span> to not lose your{" "}
              <span className="font-medium text-red-600">progress</span>!
            </span>
            <button
              className="px-3 py-1 rounded-md bg-red-600 text-white text-sm"
              onClick={() => loginWithRedirect()}
            >
              Log in
            </button>
            <button
              className="px-3 py-1 rounded-md border border-red-600 text-red-600 text-sm"
              onClick={() =>
                loginWithRedirect({
                  authorizationParams: { screen_hint: "signup" },
                })
              }
            >
              Sign up
            </button>
          </div>
        ) : (
          <div className="hidden md:block" />
        )}

        {/* Right: stats + account */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700">
            <div
              className="relative w-6 h-6 rounded-full"
              style={{
                background: `conic-gradient(#10b981 ${pct *
                  3.6}deg, #e5e7eb 0deg)`,
              }}
            >
              <div className="absolute inset-1 bg-white rounded-full" />
            </div>
            <span className="text-gray-900 font-medium">Daily Goal</span>
            <span className="text-gray-500">
              {dailyCurrent}/{dailyTarget} min
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-700">
            <div className="w-6 h-6 rounded-full border-2 border-gray-300 grid place-items-center text-gray-400">
              🕒
            </div>
            <span className="text-gray-900 font-medium">Total Input</span>
            <span className="text-gray-500">
              {totalHours} hrs {totalMinutes} min
            </span>
          </div>
          <button
            className="w-9 h-9 rounded-full bg-red-100 text-red-600 grid place-items-center"
            onClick={() => !isAuthenticated && loginWithRedirect()}
            aria-label="Account"
          >
            <span className="text-lg">👤</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
