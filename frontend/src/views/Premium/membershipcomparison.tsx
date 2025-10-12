import React from "react";

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M4 4l8 8M12 4L4 12"
      stroke="#9C9C9C"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M3.2 8.5l2.6 2.6L12.8 4.6"
      stroke="#DB0000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const StarIcon = () => (
  <svg width="50" height="50" viewBox="0 0 24 24" className="ml-2 shrink-0">
    <path
      d="M12 3.6l2.2 4.3 4.8.7-3.5 3.4.8 4.7L12 14.8l-4.3 2.3.8-4.7-3.5-3.4 4.8-.7L12 3.6z"
      fill="#DB0000"
    />
  </svg>
);

const freeItems = [
  "Free videos only",
  "Track up to 10 hours as a demo",
  "Download 5 demo transcripts available",
  <>
    You <span className="font-semibold">can't comment</span> on the video
  </>,
  "No playlists function",
  "Online only",
];

const premiumItems = [
  "Free and Premium videos",
  "Unlimited Time Tracking",
  "Download audios & transcriptions",
  <>
    You <span className="font-semibold">can comment</span> on the video
  </>,
  "Add videos to Playlists",
  "Download video and audio for offline use",
];

export default function MembershipComparison() {
  return (
    <section className="mt-10 rounded-card bg-[#FFFFFF] p-8 shadow-card border border-[#E5E7EB]">
      <h2 className="text-[20px] font-semibold text-[#000] mb-6">
        Membership
      </h2>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Free Card */}
        <div className="rounded-card-sm border border-[#E5E7EB] bg-[#F6F6F6] p-8">
          <div className="mb-4 text-[32px] font-bold text-[#000]">Free</div>
          <ul className="space-y-3 text-[15px] leading-6 text-[#000]">
            {freeItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-[3px] shrink-0">
                  <XIcon />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Premium Card */}
        <div className="rounded-card-sm border-2 border-[#DB0000] bg-gradient-to-br from-[#FFF6F6] to-[#FFFDFD] p-8 relative overflow-hidden">
          <div className="mb-4 flex items-center text-[32px] font-bold text-[#DB0000]">
            Premium <StarIcon />
          </div>
          <ul className="space-y-3 text-[15px] leading-6 text-[#000]">
            {premiumItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-[3px] shrink-0">
                  <CheckIcon />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Faint pattern background (optional subtle mimic) */}
          <div className="absolute inset-0 pointer-events-none bg-[url('/assets/premium-pattern.svg')] bg-right-top bg-no-repeat opacity-10"></div>
        </div>
      </div>
    </section>
  );
}
