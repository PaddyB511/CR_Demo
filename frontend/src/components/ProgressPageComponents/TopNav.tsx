const TopNav: React.FC = () => (
  <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3">
    <button className="p-2 rounded-md hover:bg-gray-100">
      <div className="w-5 h-0.5 bg-gray-800 mb-1" />
      <div className="w-5 h-0.5 bg-gray-800 mb-1" />
      <div className="w-4 h-0.5 bg-gray-800" />
    </button>
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-red-600 grid place-items-center text-white font-bold">CR</div>
      <div className="text-lg font-semibold">Comprehensible <span className="text-red-600">RUSSIAN</span></div>
    </div>
    <div className="ml-auto flex items-center gap-6 text-sm text-gray-600">
      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500" /> Daily Goal</div>
      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-900" /> Total Input</div>
      <div className="w-8 h-8 rounded-full bg-gray-200" />
    </div>
  </div>
);

export default TopNav;