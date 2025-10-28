import { Link } from "react-router-dom";
import Card from "./Card";
import letterBottom from "../../assets/bottomLetter.svg";
import topLetterPart from "../../assets/topLetterPart.svg";

export const JournalCard = () => {
  return (
    <Card title="My journal" className="relative">
      <div className="flex flex-col h-[200px] px-5 py-0 justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 items-stretch">
          <div className="flex flex-col col-start-1 row-start-1 text-start items-start gap-y-10">
            {/* <div className="flex flex-col items-start jusify-center gap-y-5"> */}
            <div className="font-inter font-bold text-[22px] leading-[22px] text-black">
              My journal
            </div>
            <div className="font-inter text-[13px] leading-[13px] text-black mt-2">
              Tell us how much input you have received{" "}
              <strong>outside of Comprehensible Russian</strong> to see your
              real progress!
            </div>
            <Link
              to="/journal"
              className="flex flex-row justify-center items-center px-9 py-2 gap-[9.05px] bg-[#F6F6F6] text-[#9C9C9C] font-semibold rounded-full text-[12px] leading-[12px] hover:bg-[#ebebeb]"
            >
              Go now
            </Link>
            {/* </div> */}
          </div>
          <div className="flex flex-col justify-between px-5 py-3 bg-[#FDF0F0] border-l border-pink-100 rounded-[14px]">
            <div className="flex items-center justify-between">
              <div className="text-[12px] font-semibold text-[#db0000]">
                Quick note
              </div>
              <div className="text-[12px] font-inter font-semibold text-[#F7ACAC]">
                19/8/2025
              </div>
            </div>
            <div className="mt-2 text-[12px] text-gray-700 text-start">
              Tell us how much input you have received outside of Comprehensible
              Russian to see your real progress!
            </div>
            <div className="mt-3 flex items-center gap-2 text-2xl">
              <span>😔</span>
              <span>😐</span>
              <span>🙂</span>
              <span>😎</span>
              <div className="ml-auto text-[12px] font-inter font-semibold text-[#F7ACAC]">
                how do you feel?
              </div>
            </div>
          </div>
        </div>
      </div>
      <img
        src={letterBottom}
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/4"
      />
      <img
        src={topLetterPart}
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-full"
      />
    </Card>
  );
};
