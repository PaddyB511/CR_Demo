import Card from "./Card";

type Props = {
  current: number;
  goal: number;
  recordDays?: number;
  onEdit?: () => void;
  className?: string;
};

const PROGRESS_COLOR = "#7AC431";
const TRACK_COLOR = "#FFFFFF";

export default function DailyGoalProgress({
  current,
  goal,
  recordDays = 0,
  onEdit,
  className = "",
}: Props) {
  const pct = Math.max(0, Math.min(100, (current / Math.max(goal, 1)) * 100));
  const showProgress = pct > 0.0001;

  // Arc geometry (margin keeps round caps inside the viewBox)
  const STROKE = 22;
  const MARGIN = STROKE / 2 + 2;
  const cx = 100;
  const cy = 110;
  const r = 100 - MARGIN;
  const x0 = cx - r;
  const x1 = cx + r;
  const arcD = `M ${x0} ${cy} A ${r} ${r} 0 0 1 ${x1} ${cy}`;

  return (
    <Card
      className={`border-0 shadow-none p-6 ${className} max-h-[253px] max-w-[286px]`}
      bgcolor="bg-[#D6F3A1]"
    >
      <h2 className="text-[22px] leading-[27px] font-inter font-bold text-black text-center">
        Daily Goal
      </h2>

      {/* Semicircle gauge */}
      <div className="relative mx-auto max-w-[200px]">
        <svg viewBox="0 0 200 120" className="w-full h-auto overflow-visible">
          {/* Track */}
          <path
            d={arcD}
            fill="none"
            stroke={TRACK_COLOR}
            strokeWidth={STROKE}
            strokeLinecap="round"
            pathLength={100}
          />
          {/* Progress (hidden when 0%) */}
          {showProgress && (
            <path
              d={arcD}
              fill="none"
              stroke={PROGRESS_COLOR}
              strokeWidth={STROKE}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 - pct}
            />
          )}
        </svg>

        {/* Text positioned nicely under the arc */}
        <div className="pointer-events-none absolute inset-x-0 top-[66%] -translate-y-1/2 flex flex-col items-center">
          <div className="text-[#7AC431] text-[22px] leading-[24px] font-inter font-bold text-center">
            {current}/{goal}
          </div>
          <div className="text-[#7AC431] text-[22px] leading-[24px] font-inter font-bold text-centers">
            min
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-6 flex items-center gap-4">
        <div className="flex items-center gap-1 bg-white rounded-full px-4 py-1">
          <img
            src="/src/assets/fire.svg"
            alt="Fire icon"
            className="w-[10px] h-[13px]"
          />
          <div className="text-[12px] leading-[22px] text-black">
            New record:{" "}
            <span className="font-extrabold">{recordDays} days</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="py-2 px-2 rounded-full bg-white"
          aria-label="Edit daily goal"
        >
          <img
            src="/src/assets/pencil.svg"
            alt="Pencil icon"
            className="w-[14px] h-[14px]"
          />
        </button>
      </div>
    </Card>
  );
}
