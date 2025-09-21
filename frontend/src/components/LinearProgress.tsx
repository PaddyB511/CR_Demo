const LinearProgress: React.FC<{ percent: number; minLabel?: string; maxLabel?: string }> = ({ percent, minLabel = "30 hrs", maxLabel = "80 hrs" }) => (
  <div>
    <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
      <div className="h-3 bg-green-400" style={{ width: `${percent}%` }} />
    </div>
    <div className="mt-2 text-xs text-gray-400 flex justify-between">
      <span>{minLabel}</span>
      <span>{maxLabel}</span>
    </div>
  </div>
);

export default LinearProgress;