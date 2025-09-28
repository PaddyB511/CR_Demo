import DailyGoalProgress from "../components/DailyGoalProgress";
import LevelCard from "../components/LevelCard";
import TotalInputCard from "../components/TotalInputCard";

const ProgressPage = () => {
  return (
    <div className="grid grid-cols-2 grid-rows-3 md:grid-cols-[44%_56%] gap-x-[35px]">
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
    </div>
  );
};

export default ProgressPage;
