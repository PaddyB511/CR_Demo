import Card from "./Card";
import clock from "../assets/clock.svg";
import plant1 from "../assets/pinkplant1.svg";
import plant2 from "../assets/pinkplant2.svg";
import plant3 from "../assets/pinkplant3.svg";

const TotalInputCard = () => {
  return (
    <Card className="relative overflow-hidden pb-0 max-h-[219px]">
      {/* Self-contained layout */}
      <div className="grid gap-x-8 items-start md:grid-cols-[minmax(0,1fr)_clamp(300px,40vw,560px)]">
        {/* Left column */}
        <div className="max-w-xl space-y-[25px] text-left justify-self-start">
          <h2 className="font-inter font-bold text-[25px] leading-[25px] text-black">
            Total Input <span className="text-[#DB0000]">28 hrs 28 min</span>
          </h2>

          <p className="leading-relaxed text-gray-700">
            Tell us how much input you have received{" "}
            <span className="font-semibold">
              outside of Comprehensible Russian
            </span>{" "}
            to see your real progress!
          </p>

          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center rounded-full bg-gray-100 px-6 py-3 text-gray-400 cursor-not-allowed"
          >
            Add off-platform hrs
          </button>
        </div>

        {/* Right column (bottom-right anchored) */}
        <div className="relative mt-6 md:mt-0 w-[219px] h-[214px] self-end justify-self-end">
          <img
            src={clock}
            alt="Clock"
            className="w-full select-none pointer-events-none"
          />
          <img
            src={plant3}
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 -translate-x-full w-64"
          />
        </div>
      </div>

      {/* Decorative plants (anchored to card) */}
      <img
        src={plant1}
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-60 opacity-90"
      />
      <img
        src={plant2}
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 w-72 opacity-90"
      />
    </Card>
  );
};

export default TotalInputCard;
