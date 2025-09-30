import Card from "./Card";
import Chip from "./Chip";
import SegBar from "./SegBar";
import { useMemo, useState } from "react";

const GoalSetter = () => {
  // Segment configuration with widths (sum to 100) and hour ranges
  const segments = [
    {
      label: "Beginner 0",
      width: 8.85,
      color: "bg-[#59BECB]",
      hours: "0-30 hrs",
      minHours: 0,
      maxHours: 30,
    },
    {
      label: "Beginner 1",
      width: 9.73,
      color: "bg-[#7AC431]",
      hours: "30-80 hrs",
      minHours: 30,
      maxHours: 80,
    },
    {
      label: "Beginner 2",
      width: 10.62,
      color: "bg-[#38A72E]",
      hours: "80-150 hrs",
      minHours: 80,
      maxHours: 150,
    },
    {
      label: "Intermediate 1",
      width: 13.27,
      color: "bg-[#FFB200]",
      hours: "150-350 hrs",
      minHours: 150,
      maxHours: 350,
    },
    {
      label: "Intermediate 2",
      width: 17.7,
      color: "bg-[#FF7A21]",
      hours: "350-800 hrs",
      minHours: 350,
      maxHours: 800,
    },
    {
      label: "Advanced",
      width: 19.47,
      color: "bg-[#DB0000]",
      hours: "800-1500 hrs",
      minHours: 800,
      maxHours: 1500,
    },
    {
      label: "Native Content",
      width: 20.35,
      color: "bg-[#7D6ACB]",
      hours: "1500+ hrs",
      minHours: 1500,
      maxHours: Infinity,
    },
  ] as const;

  // State: current segment (derived), final goal, daily minutes, timeframe months
  const [currentIdx] = useState(1); // Beginner 1 as example
  const [finalIdx, setFinalIdx] = useState(4); // Intermediate 2 default
  const [dailyMinutes, setDailyMinutes] = useState<number>(60);
  const [timeframeMonths, setTimeframeMonths] = useState<number>(12);

  // Helpers to position chips centered over a segment
  const centerPercent = (idx: number) => {
    const left =
      segments.slice(0, idx).reduce((a, s) => a + s.width, 0) +
      segments[idx].width / 2;
    return `${left}%`;
  };

  // Determine chip colors based on target segment background
  const finalBgClass = segments[finalIdx].color;
  const isLightBg = (bg: string) =>
    bg.includes("-200") ||
    bg.includes("-300") ||
    bg.includes("yellow-400") ||
    bg.includes("sky-300");
  const finalTextClass = isLightBg(finalBgClass)
    ? "text-gray-900"
    : "text-white";

  // Compute remaining hours to the START of the final segment (minimum needed to enter it)
  const { hoursRemaining, daysToTarget, reachDate, onTrack } = useMemo(() => {
    const currentMin = segments[currentIdx].minHours;
    const targetMin = segments[finalIdx].minHours;
    const remaining = Math.max(0, targetMin - currentMin);
    const minsPerDay = Math.max(0, dailyMinutes);
    const days =
      minsPerDay > 0 ? Math.ceil((remaining * 60) / minsPerDay) : Infinity;
    const d = new Date();
    if (Number.isFinite(days)) d.setDate(d.getDate() + days);
    const tfDays = Math.round(timeframeMonths * 30.4375);
    const within = Number.isFinite(days) && days <= tfDays;
    return {
      hoursRemaining: remaining,
      daysToTarget: days,
      reachDate: d,
      onTrack: within,
    };
  }, [currentIdx, finalIdx, dailyMinutes, timeframeMonths, segments]);

  const formatDate = (d: Date) =>
    `${d
      .getDate()
      .toString()
      .padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;

  return (
    <Card className="p-6 md:p-8 xl:p-10 flex flex-col gap-y-5">
      <div>
        <h2 className="font-inter font-bold text-[22px] leading-[22px] text-black mb-6">
          Set up your goals
        </h2>
      </div>

      {/* Segmented bar with overlay chips */}
      <div className="relative">
        {/* Top chips positioned relative to the bar */}
        <div
          className="absolute -top-9 z-10 pointer-events-none"
          style={{
            left: centerPercent(currentIdx),
            transform: "translateX(-50%)",
          }}
        >
          <div className="relative">
            <Chip color="bg-[#7AC431] text-white font-inter font-semibold text-[11px]">
              You're here
            </Chip>
            <span className="absolute left-1/2 -bottom-1 w-2 h-2 bg-[#7AC431] rotate-45 -translate-x-1/2 rounded-[1px]" />
          </div>
        </div>
        <div
          className="absolute -top-9 z-10 pointer-events-none"
          style={{
            left: centerPercent(finalIdx),
            transform: "translateX(-50%)",
          }}
        >
          <div className="relative">
            <span
              className={`inline-flex items-center px-4 py-0.5 rounded-full text-[11px] font-semibold ${finalBgClass} ${finalTextClass}`}
            >
              Final Goal
            </span>
            <span
              className={`absolute left-1/2 -bottom-1 w-2 h-2 rotate-45 -translate-x-1/2 rounded-[1px] ${finalBgClass}`}
            />
          </div>
        </div>

        <SegBar
          segments={segments.map(({ label, width, color }) => ({
            label,
            width,
            color,
          }))}
        />

        {/* Hour ranges row under the bar, aligned with segments */}
        <div className="mt-4 flex w-full font-inter font-semibold text-[12px] text-[#9C9C9C]">
          {segments.map((s) => (
            <div
              key={s.label}
              style={{ width: `${s.width}%` }}
              className="flex justify-center"
            >
              <div className="px-3 py-1 bg-gray-100 rounded-full whitespace-nowrap select-none">
                {s.hours}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls row */}
      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-gray-800">
        {/* Final Goal */}
        <div className="inline-flex items-center gap-3">
          <span className="text-black text-xs md:text-sm font-medium">
            Final Goal
          </span>
          <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-rose-50 text-[#DB0000] font-inter font-medium text-[13px] border border-rose-100">
            <select
              className="bg-transparent outline-none appearance-none pr-3"
              value={finalIdx}
              onChange={(e) => setFinalIdx(Number(e.target.value))}
            >
              {segments.map((s, i) => (
                <option key={s.label} value={i} disabled={i <= currentIdx}>
                  {s.label}
                </option>
              ))}
            </select>
            <span className="text-rose-400">▾</span>
          </label>
        </div>

        {/* Daily Goal */}
        <div className="inline-flex items-center gap-3">
          <span className="text-black font-inter font-medium text-xs md:text-sm">
            Your daily Goal
          </span>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 text-black border border-gray-200 font-normal">
            <input
              type="number"
              min={0}
              className="w-16 bg-transparent outline-none text-center appearance-none"
              value={Number.isFinite(dailyMinutes) ? dailyMinutes : 0}
              onChange={(e) =>
                setDailyMinutes(Math.max(0, Number(e.target.value)))
              }
            />
            <span className="text-[#9C9C9C] font-inter font-medium text-[13px]">
              min
            </span>
          </div>
        </div>

        {/* Time Frame */}
        <div className="inline-flex items-center gap-3">
          <span className="text-black font-medium font-inter text-xs md:text-sm">
            Time Frame
          </span>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 text-black border border-gray-200 font-normal">
            <input
              type="number"
              min={1}
              className="w-16 bg-transparent outline-none text-center appearance-none"
              value={Number.isFinite(timeframeMonths) ? timeframeMonths : 1}
              onChange={(e) =>
                setTimeframeMonths(Math.max(1, Number(e.target.value)))
              }
            />
            <span className="text-[#9C9C9C] font-inter font-medium text-[13px]">
              months
            </span>
          </div>
        </div>

        {/* Result pill pinned to the right */}
        <div className="ml-auto">
          {Number.isFinite(daysToTarget) ? (
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full ${
                onTrack
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {onTrack
                ? "On track to reach by "
                : "You will reach the goal on "}
              {formatDate(reachDate)}
            </div>
          ) : (
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-rose-50 text-rose-600">
              Set a daily goal to calculate your date
            </div>
          )}
        </div>
      </div>

      {/* <div className="mt-3 text-xs text-gray-500">
        Remaining to target start:{" "}
        <span className="font-medium text-gray-700">{hoursRemaining}</span> hrs
      </div> */}
    </Card>
  );
};

export default GoalSetter;
