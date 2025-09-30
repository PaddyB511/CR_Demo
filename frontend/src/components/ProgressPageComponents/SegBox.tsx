const SegBar: React.FC<{ segments: { label: string; width: number; color: string; flag?: string }[] }> = ({ segments }) => (
  <div className="w-full rounded-xl overflow-hidden border border-gray-200">
    <div className="flex w-full text-xs">
      {segments.map((s, i) => (
        <div key={i} className={`relative h-10 flex items-center justify-center ${s.color}`} style={{ width: `${s.width}%` }}>
          <span className="px-2 text-white drop-shadow-sm select-none">{s.label}</span>
          {s.flag && <span className="absolute -top-2 right-2 text-[10px] bg-orange-500 text-white rounded px-1 py-0.5">{s.flag}</span>}
        </div>
      ))}
    </div>
  </div>
);

export default SegBar;