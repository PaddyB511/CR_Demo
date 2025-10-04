const Gauge: React.FC<{ percent: number }> = ({ percent }) => {
  const rot = -90 + Math.min(100, Math.max(0, percent)) * 1.8;
  return (
    <div className="relative w-40 h-40 mx-auto">
      <div className="absolute inset-0 rounded-full border-[10px] border-gray-200" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="origin-bottom w-0.5 h-16 bg-gray-800" style={{ transform: `rotate(${rot}deg)` }} />
      </div>
      <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 50% 50%, transparent 55%, #f3f4f6 56%)` }} />
    </div>
  );
};

export default Gauge;