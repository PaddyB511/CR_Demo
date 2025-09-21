import React from "react";

// Tailwind-only implementation of the dashboard in the screenshot.
// Drop this component into a Vite + React + TS project configured with Tailwind.

// Card component for rounded rectangle sections
const Card: React.FC<React.PropsWithChildren<{ title?: string; className?: string }>> = ({ title, className = "", children }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 ${className}`}>
    {/* {title && <div className="text-lg font-semibold mb-3">{title}</div>} */}
    {children}
  </div>
);

const Chip: React.FC<React.PropsWithChildren<{ color?: string }>> = ({ color = "bg-gray-100 text-gray-700", children }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{children}</span>
);

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

const RedBanner: React.FC = () => (
  <div className="mt-3 bg-red-600 text-white rounded-xl px-4 py-2 shadow-sm flex items-center justify-between">
    <div className="text-sm">Tell us how much input you have received outside of Comprehensible Russian to see your real progress!</div>
    <button className="bg-white text-red-600 text-sm font-medium rounded-full px-3 py-1">Set now</button>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="max-w-[1100px] mx-auto px-4 pb-16">
        <RedBanner />

        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <Card title="My level">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-green-500 grid place-items-center text-white">★</div>
                <div>
                  <div className="text-sm text-gray-500">My level</div>
                  <div className="text-lg font-semibold">Beginner 1</div>
                </div>
              </div>
              <div className="text-xs text-gray-400 text-right">
                <div><span className="text-green-600 font-medium">21 hours</span> to the next level</div>
                <button className="underline">Change level</button>
              </div>
            </div>
            <div className="mt-4">
              <LinearProgress percent={28} />
              <div className="mt-3 text-sm text-gray-600">Here is a short description of the level, in one or two sentences. We already know how to do this! Cool!</div>
            </div>
            <div className="absolute -mt-6 right-6 text-sm text-green-600 font-semibold">28%</div>
          </Card>

          <Card title="Daily Goal" className="bg-green-50">
            <SemiCircle percent={33} />
            <div className="mt-2 flex items-center justify-center gap-3">
              <Chip color="bg-white text-gray-700 border border-gray-200">New record: 7 days</Chip>
              <button className="w-8 h-8 rounded-full bg-white border border-gray-200 grid place-items-center">✎</button>
            </div>
          </Card>

          <Card title="Your activity">
            <div className="flex items-center justify-between mb-4">
              <button className="text-sm text-pink-600 underline">open the statistics page</button>
            </div>
            <div className="flex items-end justify-between">
              {[
                { d: "Mon", v: 15 },
                { d: "Tue", v: 25 },
                { d: "Wed", v: 35 },
                { d: "Thu", v: 45, active: true },
                { d: "Fri", v: 120, active: true, note: "2 hrs" },
                { d: "Sat", v: 20 },
                { d: "Sun", v: 10 },
              ].map((x, i) => <MiniBar key={i} value={x.v} label={x.d} active={!!x.active} note={x.note} />)}
            </div>
          </Card>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <Card title="Total Input">
            <div className="text-rose-600 font-bold">28 hrs 28 min</div>
            <div className="mt-2 text-sm text-gray-600">Tell us how much input you have received outside of Comprehensible Russian to see your real progress!</div>
            <div className="mt-4"><Gauge percent={55} /></div>
            <div className="mt-4"><button className="text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1">Add off-platform hrs</button></div>
          </Card>

          <Card title="My journal" className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div>
                <div className="text-sm text-gray-600 mt-2">Tell us how much input you have received outside of Comprehensible Russian to see your real progress!</div>
                <button className="mt-4 text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1">Go now</button>
              </div>
              <div className="p-5 bg-pink-50 border-l border-pink-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-rose-600">Quick note</div>
                  <div className="text-[11px] text-gray-400">19/8/2025</div>
                </div>
                <div className="mt-2 text-sm text-gray-700">Tell us how much input you have received outside of Comprehensible Russian to see your real progress!</div>
                <div className="mt-3 flex items-center gap-2 text-lg">
                  <span>😊</span><span>😐</span><span>😴</span><span>😎</span><span>😍</span>
                  <button className="ml-auto text-pink-600 text-sm underline">how do you feel?</button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Row 3 – goals */}
        <Card title="Set up your goals" className="mt-4">
          <div className="flex items-center gap-3 mb-3"><Chip color="bg-green-100 text-green-700">You're here</Chip></div>
          <SegBar segments={[
            { label: "Beginner 0", width: 10, color: "bg-sky-300" },
            { label: "Beginner 1", width: 15, color: "bg-green-500" },
            { label: "Beginner 2", width: 15, color: "bg-green-400" },
            { label: "Intermediate 1", width: 20, color: "bg-yellow-400" },
            { label: "Intermediate 2", width: 15, color: "bg-orange-500", flag: "Final Goal" },
            { label: "Advanced", width: 15, color: "bg-red-600" },
            { label: "Native Content", width: 10, color: "bg-indigo-500" },
          ]} />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 text-sm text-gray-700">
            <div><div className="text-xs text-gray-500">Final Goal</div><div className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">Intermediate 2 ▾</div></div>
            <div><div className="text-xs text-gray-500">Your daily Goal</div><div className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">60 min</div></div>
            <div><div className="text-xs text-gray-500">Time Frame</div><div className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">12 months</div></div>
            <div className="col-span-2 flex items-end"><div className="text-sm text-rose-600">You will reach the goal on 12/28/2026</div></div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
