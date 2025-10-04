import TopNav from "./TopNav";
import RedBanner from "./RedBanner";
import Card from "./Card";
import LinearProgress from "./LinearProgress";
import SemiCircle from "./SemiCircle";
import Chip from "./Chip";
import SegBar from "./SegBar";
import MiniBar from "./MiniBar";
import Gauge from "./Gauge";
import LevelCard from "./LevelCard";
import TotalInputCard from "./TotalInputCard";
import DailyGoalProgress from "./DailyGoalProgress";

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="w-full max-w-none px-4 pb-16">
        <RedBanner />
        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <LevelCard />

          <DailyGoalProgress current={45} goal={60} />

          <Card title="Your activity">
            <div className="flex items-center justify-between mb-4">
              <button className="text-sm text-pink-600 underline">
                open the statistics page
              </button>
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
              ].map((x, i) => (
                <MiniBar
                  key={i}
                  value={x.v}
                  label={x.d}
                  active={!!x.active}
                  note={x.note}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <TotalInputCard />

          <Card title="My journal" className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div>
                <div className="text-sm text-gray-600 mt-2">
                  Tell us how much input you have received outside of
                  Comprehensible Russian to see your real progress!
                </div>
                <button className="mt-4 text-xs bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1">
                  Go now
                </button>
              </div>
              <div className="p-5 bg-pink-50 border-l border-pink-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-rose-600">
                    Quick note
                  </div>
                  <div className="text-[11px] text-gray-400">19/8/2025</div>
                </div>
                <div className="mt-2 text-sm text-gray-700">
                  Tell us how much input you have received outside of
                  Comprehensible Russian to see your real progress!
                </div>
                <div className="mt-3 flex items-center gap-2 text-lg">
                  <span>😊</span>
                  <span>😐</span>
                  <span>😴</span>
                  <span>😎</span>
                  <span>😍</span>
                  <button className="ml-auto text-pink-600 text-sm underline">
                    how do you feel?
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Row 3 – goals */}
        <Card title="Set up your goals" className="mt-4">
          <div className="flex items-center gap-3 mb-3">
            <Chip color="bg-green-100 text-green-700">You're here</Chip>
          </div>
          <SegBar
            segments={[
              { label: "Beginner 0", width: 10, color: "bg-sky-300" },
              { label: "Beginner 1", width: 15, color: "bg-green-500" },
              { label: "Beginner 2", width: 15, color: "bg-green-400" },
              { label: "Intermediate 1", width: 20, color: "bg-yellow-400" },
              {
                label: "Intermediate 2",
                width: 15,
                color: "bg-orange-500",
                flag: "Final Goal",
              },
              { label: "Advanced", width: 15, color: "bg-red-600" },
              { label: "Native Content", width: 10, color: "bg-indigo-500" },
            ]}
          />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 text-sm text-gray-700">
            <div>
              <div className="text-xs text-gray-500">Final Goal</div>
              <div className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
                Intermediate 2 ▾
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Your daily Goal</div>
              <div className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
                60 min
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Time Frame</div>
              <div className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
                12 months
              </div>
            </div>
            <div className="col-span-2 flex items-end">
              <div className="text-sm text-rose-600">
                You will reach the goal on 12/28/2026
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
