import React from "react";

type Size = "sm" | "md" | "midLg" | "lg";

type Props = {
  price: string;
  subtitle: string;
  cta: string;
  badgeText?: string;
  onSelect: () => void;
  size?: Size;
};

const sizeToMinWidth: Record<Size, string> = {
  sm: "min-w-[320px]",   // monthly
  md: "min-w-[380px]",   // yearly
  midLg: "min-w-[460px]", // lifetime (new balanced width)
  lg: "min-w-[520px]",   // reserved if ever needed wider
};

export default function PriceCard({
  price,
  subtitle,
  cta,
  badgeText,
  onSelect,
  size = "sm",
}: Props) {
  const isLifetime = subtitle.toLowerCase().includes("lifetime");
  const minWidthCls = sizeToMinWidth[size];

  return (
    <div
      className={[
        "inline-block w-fit",
        minWidthCls,
        "rounded-card-sm border px-8 py-6 transition-shadow hover:shadow-card",
        isLifetime ? "border-[#f7acac] bg-[#fff6f6]" : "border-[rgba(0,0,0,0.1)] bg-surface",
      ].join(" ")}
    >
      <div>
        <div className="text-[32px] font-bold leading-none text-black tracking-tight">{price}</div>
        <div className="mt-[6px] text-[15px] text-[#6B7280]">{subtitle}</div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={onSelect}
          className="
            inline-flex h-10 items-center justify-center
            rounded-full border border-brand text-brand
            px-5 text-[14px] font-semibold leading-[1]
            whitespace-nowrap hover:bg-[var(--color-chip-selected)]
            transition-colors
          "
        >
          {cta}&nbsp;→
        </button>

        {badgeText && (
          <span
            className="
              inline-flex h-8 items-center rounded-full
              bg-brand px-3 text-[13px] font-semibold leading-[1]
              text-white whitespace-nowrap select-none
            "
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
