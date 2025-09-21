const SemiCircle: React.FC<{ percent: number }> = ({ percent }) => {
  const angle = Math.max(0, Math.min(100, percent)) * 1.8;
  return (
    <div className="w-56 mx-auto">
      <div className="relative h-28 overflow-hidden">
        <div
          className="absolute inset-x-0 bottom-0 mx-auto w-56 h-56 rounded-full"
          style={{ background: `conic-gradient(#91d487 ${angle}deg, #e6f4e6 ${angle}deg)` }}
        />
        <div className="absolute inset-x-0 bottom-0 mx-auto w-44 h-44 rounded-full bg-white" />
      </div>
      <div className="-mt-10 text-center">
        <div className="text-2xl font-semibold text-gray-900">20/60</div>
        <div className="text-sm text-gray-500 -mt-1">min</div>
      </div>
    </div>
  );
};

export default SemiCircle;
