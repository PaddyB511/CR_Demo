import Card from "./Card";
import LinearProgress from "./LinearProgress";

const LevelCard = () => {
  return (
    <Card title="My level">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-green-500 grid place-items-center text-white">
            ★
          </div>
          <div>
            <div className="text-sm text-gray-500">My level</div>
            <div className="text-lg font-semibold">Beginner 1</div>
          </div>
        </div>
        <div className="text-xs text-gray-400 text-right">
          <div>
            <span className="text-green-600 font-medium">21 hours</span> to the
            next level
          </div>
          <button className="underline">Change level</button>
        </div>
      </div>
      <div className="mt-4">
        <LinearProgress percent={28} />
        <div className="mt-3 text-sm text-gray-600">
          Here is a short description of the level, in one or two sentences. We
          already know how to do this! Cool!
        </div>
      </div>
      <div className="absolute -mt-6 right-6 text-sm text-green-600 font-semibold">
        28%
      </div>
    </Card>
  );
};

export default LevelCard;
