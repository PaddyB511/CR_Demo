import TopBanner from "../components/layout/TopBanner";
import MobileBottomNav from "../components/layout/MobileBottomNav";
import { Link } from "react-router-dom";

const JournalPage = () => {
  // Placeholder data; wire to API later
  const rows = [
    {
      date: "10 Oct. 2025",
      activity: "Reading",
      duration: "1 hr. 15 mins.",
      total: "48 hrs",
      commented: false,
    },
    {
      date: "9 Oct. 2025",
      activity: "Listening/Watching",
      duration: "2 hrs.",
      total: "47 hrs",
      commented: true,
    },
    {
      date: "8 Oct. 2025",
      activity: "Writing",
      duration: "30 mins.",
      total: "45 hrs",
      commented: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex flex-col">
      {/* <TopBanner /> */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          {/* Header row */}
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/progress"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[#DB0000] bg-[#FDF0F0] text-[#DB0000]"
            >
              <span className="text-lg">←</span>
              <span className="font-medium">Back to My Progress</span>
            </Link>

            <div className="h-8" />
          </div>

          {/* Add note CTA */}
          <div className="mt-6 flex justify-center">
            <button className="inline-flex items-center gap-3 bg-[#DB0000] hover:bg-[#c10000] transition text-white font-inter font-semibold text-[20px] leading-none px-10 md:px-14 py-4 rounded-full">
              <span>Add a progress note</span>
              <img
                src="/src/assets/pencil-white.svg"
                alt=""
                className="w-[17px] h-4"
              />
            </button>
          </div>

          {/* Table */}
          <div className="mt-8 bg-white rounded-[14px] overflow-hidden border-2 border-[#F2B200]">
            {/* Header with explicit column widths (no left rail) */}
            <div className="grid [grid-template-columns:1.5fr_1.5fr_1fr_1fr_0.7fr_56px] bg-[#FFF5CC] text-[#F2B200] font-inter font-semibold">
              <div className="px-4 py-3 text-center border-b-2 border-[#F2B200]">
                Date
              </div>
              <div className="px-4 py-3 text-center border-l-2 border-b-2 border-[#F2B200]">
                Activity
              </div>
              <div className="px-4 py-3 text-center border-l-2 border-b-2 border-[#F2B200]">
                Duration
              </div>
              <div className="px-4 py-3 text-center border-l-2 border-b-2 border-[#F2B200]">
                Total Input
              </div>
              <div className="px-4 py-3 text-center border-l-2 border-b-2 border-[#F2B200]">
                Comment
              </div>
              <div className="px-4 py-3 text-center border-l-2 border-b-2 border-[#F2B200]"></div>
            </div>

            {/* Rows */}
            <div>
              {rows.map((r, i) => (
                <div
                  key={i}
                  className="grid [grid-template-columns:1.5fr_1.5fr_1fr_1fr_0.7fr_56px] items-center border-t border-gray-200"
                >
                  {/* Date */}
                  <div className="px-4 py-3">
                    <span className="underline">{r.date}</span>
                  </div>
                  {/* Activity */}
                  <div className="px-4 py-3 border-l border-gray-200">
                    {r.activity}
                  </div>
                  {/* Duration */}
                  <div className="px-4 py-3 border-l border-gray-200">
                    {r.duration}
                  </div>
                  {/* Total Input */}
                  <div className="px-4 py-3 border-l border-gray-200">
                    {r.total}
                  </div>
                  {/* Comment mark */}
                  <div className="px-4 py-3 border-l border-gray-200 text-center">
                    {r.commented ? (
                      <img
                        src="/src/assets/tick.svg"
                        alt=""
                        className="inline-block w-[19px] h-[15px]"
                      />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                  {/* Edit icon */}
                  <div className="px-4 py-3 border-l border-gray-200 flex items-center justify-center self-stretch">
                    <button className="p-0" aria-label="Edit note">
                      <img
                        src="/src/assets/pencil-yellow.svg"
                        alt=""
                        className="block w-[20px] h-6"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default JournalPage;
