import Card from "./Card";
import LevelBadge from "./LevelBadge";
import LinearProgress from "./LinearProgress";

const LevelCard = () => {
  return (
    <Card title="My level" className="h-[253px] p-5">
      <div className="flex items-start justify-between">
        {/* Left Section: Badge and Level Info */}
        <div className="flex items-center gap-3">
          <LevelBadge value={1} />
          <div className="flex flex-col items-start">
            <div className="text-[18px] text-[#D9D9D9] font-inter font-bold">
              My level
            </div>
            <div className="text-lg font-bold text-black">Beginner 1</div>
          </div>
        </div>

        {/* Right Section: Hours to Next Level */}
        <div className="text-xs text-gray-400 text-right">
          <div className="text-[#C2C2C2] text-[13px] leading-[16px] text-right font-inter font-semibold">
            <span className="text-[#7AC431] font-bold">21 hours</span> to the
            next level
          </div>
          <button className="underline text-gray-400 hover:text-gray-500">
            Change level
          </button>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-8 border-t border-gray-200" />

      {/* Progress Bar */}
      <div className="mt-2">
        <LinearProgress percent={28} />
        <div className="mt-3 text-sm text-black text-left">
          Here is a short description of the level, in one or two sentences. We
          already know how to do this! Cool!
        </div>
      </div>
    </Card>
  );
};

export default LevelCard;
