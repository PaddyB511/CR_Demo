import Card from "./Card";
import clock from "../../assets/clock.svg";
import plant1 from "../../assets/pinkplant1.svg";
import plant2 from "../../assets/pinkplant2.svg";
import plant3 from "../../assets/pinkplant3.svg";

const TotalInputCard = () => {
  return (
    <Card className="relative overflow-hidden pb-0 max-h-[200px] p-5">
      {/* Self-contained layout */}
      <div className="grid items-start grid-cols-2 grid-rows-1">
        {/* Left column */}
        <div className="max-w-xl space-y-[25px] text-left justify-self-start">
          <h2 className="font-inter font-bold text-[22px] leading-[22px] text-black">
            Total Input <span className="text-[#DB0000]">28 hrs 28 min</span>
          </h2>

          <p className="text-[13px] leading-[13px] text-black">
            Tell us how much input you have received{" "}
            <span className="font-semibold">
              outside of Comprehensible Russian
            </span>{" "}
            to see your real progress!
          </p>

          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center rounded-full bg-gray-100 px-6 py-2 text-[#9C9C9C] font-semibold cursor-not-allowed text-[12px] leading-[12px]"
          >
            Add off-platform hrs
          </button>
        </div>

        {/* Right column (bottom-right anchored) */}
        <div className="relative mb-1 max-w-[219px] max-h-[214px] justify-self-end">
          <img
            src={clock}
            alt="Clock"
            className="w-full select-none pointer-events-none -translate-x-1/12 z-10"
          />
          <img
            src={plant3}
            alt=""
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 -translate-x-9/12 w-64"
          />
        </div>
      </div>

      {/* Decorative plants (anchored to card) */}
      <img
        src={plant1}
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-[100px]"
      />
      <img
        src={plant2}
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-[-9px] right-0 w-28"
      />
    </Card>
  );
};

export default TotalInputCard;
