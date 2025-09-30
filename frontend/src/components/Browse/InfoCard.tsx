import { useState } from "react";

export default function InfoCard() {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 md:px-6 py-4"
      >
        <h1 className="text-2xl md:text-[32px] leading-tight font-bold text-gray-900 text-left">
          The Best Input: Created by Us & Selected for You!❤
        </h1>
        <span className="ml-4 text-gray-500 shrink-0" aria-hidden>
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open && (
        <div className="px-5 md:px-6 pb-5 text-gray-700 text-[14px] leading-relaxed">
          <p className="mb-3">
            On our platform, you'll find two types of videos:
          </p>
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <strong>Our own Comprehensible Russian videos</strong> — created
              by ALG-trained speakers for maximum progress. Free members can
              access about 40% of the library.
              <a className="text-brand underline ml-1" href="#">
                Unlock the full Premium collection
              </a>
              — with new videos added every single day!
            </li>
            <li>
              <strong>Hand-picked third-party videos</strong> — from creators
              who allow embedding. We care about you getting the very best and
              most diverse comprehensible input, wherever it comes from. Our
              team carefully reviews and selects these videos to ensure they are
              both useful and fully consistent with
              <a className="text-brand underline ml-1" href="#">
                the ALG methodology
              </a>
              .
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
