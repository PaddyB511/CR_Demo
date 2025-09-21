const MiniBar: React.FC<{ value: number; max?: number; active?: boolean; label: string; note?: string }> = ({ value, max = 60, active = false, label, note }) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-7 h-24 bg-gray-100 rounded-full overflow-hidden">
        <div className={`absolute bottom-0 left-0 right-0 rounded-t-[10px] ${active ? "bg-red-500" : "bg-gray-300"}`} style={{ height: `${pct}%` }} />
        {note && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] leading-none bg-black text-white rounded px-1 py-0.5">{note}</div>
        )}
      </div>
      <div className="text-xs text-gray-500">{label}</div>
      {active ? <div className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] grid place-items-center">✓</div> : <div className="w-4 h-4 rounded-full bg-gray-200" />}
    </div>
  );
};

export default MiniBar;