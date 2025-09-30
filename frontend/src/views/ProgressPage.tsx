import DailyGoalProgress from "../components/ProgressPageComponents/DailyGoalProgress";
import GoalSetter from "../components/ProgressPageComponents/GoalSetter";
import { JournalCard } from "../components/ProgressPageComponents/JournalCard";
import LevelCard from "../components/ProgressPageComponents/LevelCard";
import TotalInputCard from "../components/ProgressPageComponents/TotalInputCard";

const ProgressPage = () => {
  return (
    <div className="flex flex-col mx-10">
      <div className="grid grid-cols-2 grid-rows-[253px_200px] md:grid-cols-[44fr_56fr] gap-x-[35px] gap-y-[35px]">
        <div className="row-start-1 col-start-1">
          <LevelCard />
        </div>
        <div className="row-start-1 col-start-2">
          <DailyGoalProgress
            current={1.5}
            goal={2}
            recordDays={7}
            className="justify-self-start mx-0"
          />
        </div>
        <div className="row-start-2 col-start-1">
          <TotalInputCard />
        </div>
        <div className="row-start-2 col-start-2">
          <JournalCard />
        </div>
      </div>
      <hr className="my-8 border-t border-gray-200" />
      <GoalSetter />
    </div>
  );
};

export default ProgressPage