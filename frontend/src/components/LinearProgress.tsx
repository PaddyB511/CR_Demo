const LinearProgress: React.FC<{
  percent: number;
  minLabel?: string;
  maxLabel?: string;
}> = ({ percent, minLabel = "30 hrs", maxLabel = "80 hrs" }) => {
  const value = Math.max(0, Math.min(100, percent));
  const barRadius = value >= 100 ? "rounded-full" : "rounded-l-full";

  return (
    <div className="w-full">
      <div className="flex items-center gap-3">
        {/* Bar + labels column (takes all remaining width) */}
        <div className="flex-1">
          {/* Track */}
          <div
            className="relative w-full h-[26px] bg-[#F6F6F6] rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(value)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {/* Fill */}
            <div
              className={`absolute top-0 left-0 h-full bg-[#7AC431] ${barRadius}`}
              style={{ width: `${value}%` }}
            />
          </div>

          {/* Min/Max aligned to the bar edges */}
          <div className="mt-3 flex w-full justify-between">
            <span className="text-[#D9D9D9] text-[15px] leading-[18px] font-inter font-bold">
              {minLabel}
            </span>
            <span className="text-[#D9D9D9] text-[15px] leading-[18px] font-inter font-bold">
              {maxLabel}
            </span>
          </div>
        </div>

        {/* Percentage (outside the bar) */}
        <span className="text-[#7AC431] text-[22px] leading-[22px] font-inter font-bold self-start">
          {Math.round(value)}%
        </span>
      </div>
    </div>
  );
};

export default LinearProgress;