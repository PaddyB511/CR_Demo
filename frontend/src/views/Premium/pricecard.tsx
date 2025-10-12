// src/views/premium/pricecard.tsx
import React, { useState } from "react";
import {
  startPayPalSubscription,
  startPayPalOneTime,
} from "../../utils/paypal";

type Size = "sm" | "md" | "midLg" | "lg";
type Mode = "subscription" | "onetime";

type Props = {
  price: string;
  subtitle: string;
  cta: string;
  badgeText?: string;

  /** How this card charges via PayPal */
  mode?: Mode;                // "subscription" (default) or "onetime"
  planId?: string;            // required when mode="subscription"
  onetimeAmountUsd?: number;  // required when mode="onetime"

  size?: Size;
};

const sizeToMinWidth: Record<Size, string> = {
  sm: "min-w-[320px]",     // monthly
  md: "min-w-[380px]",     // yearly
  midLg: "min-w-[460px]",  // lifetime
  lg: "min-w-[520px]",     // reserved
};

export default function PriceCard({
  price,
  subtitle,
  cta,
  badgeText,
  mode = "subscription",
  planId,
  onetimeAmountUsd,
  size = "sm",
}: Props) {
  const [busy, setBusy] = useState(false);

  const isLifetime = subtitle.toLowerCase().includes("lifetime");
  const minWidthCls = sizeToMinWidth[size];

  const handleClick = async () => {
    try {
      setBusy(true);
      if (mode === "subscription") {
        if (!planId) throw new Error("Missing PayPal planId");
        await startPayPalSubscription(planId);
        return;
      }
      if (mode === "onetime") {
        if (!onetimeAmountUsd) throw new Error("Missing one-time USD amount");
        await startPayPalOneTime(onetimeAmountUsd);
        return;
      }
    } catch (e) {
      console.error("[PriceCard] checkout failed:", e);
      alert("Couldn’t start PayPal — check console and your .env Client ID.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={[
        "inline-block w-fit",
        minWidthCls,
        "rounded-card-sm border px-8 py-6 transition-shadow hover:shadow-card",
        isLifetime
          ? "border-[#f7acac] bg-[#fff6f6]"
          : "border-[rgba(0,0,0,0.1)] bg-surface",
      ].join(" ")}
    >
      <div>
        <div className="text-[32px] font-bold leading-none text-black tracking-tight">
          {price}
        </div>
        <div className="mt-[6px] text-[15px] text-[#6B7280]">{subtitle}</div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={busy}
          className={[
            "inline-flex h-10 items-center justify-center",
            "rounded-full border border-brand text-brand",
            "px-5 text-[14px] font-semibold leading-[1]",
            "whitespace-nowrap hover:bg-[var(--color-chip-selected)]",
            "transition-colors disabled:opacity-60 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          {cta} {busy ? "…" : "→"}
        </button>

        {badgeText && (
          <span className="inline-flex h-8 items-center rounded-full bg-brand px-3 text-[13px] font-semibold leading-[1] text-white whitespace-nowrap select-none">
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
