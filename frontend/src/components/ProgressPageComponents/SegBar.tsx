const SegBar: React.FC<{
  segments: { label: string; width: number; color: string; flag?: string }[];
}> = ({ segments }) => (
  <div className="w-full rounded-xl overflow-hidden">
    <div className="flex w-full text-xs">
      {segments.map((s, i) => (
        <div
          key={i}
          className={`relative h-9 flex items-center justify-center ${s.color}`}
          style={{
            width: `${s.width}%`,
            clipPath:
              i === segments.length - 1
                ? "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)"
                : undefined,
          }}
        >
          <span className="px-2 text-white font-inter font-semibold text-[14px] drop-shadow-sm select-none">
            {s.label}
          </span>
          {s.flag && (
            <span className="absolute -top-2 right-2 text-[10px] bg-orange-500 text-white rounded px-1 py-0.5">
              {s.flag}
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default SegBar;
