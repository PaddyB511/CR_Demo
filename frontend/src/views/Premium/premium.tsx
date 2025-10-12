// src/views/premium/premium.tsx
import React, { useEffect } from "react";
import TopBar from "./topbar";
import SideNav from "./sidenav";
import PriceCard from "./pricecard";
import MembershipComparison from "./membershipcomparison";

// Optional: hydrate header counters, but don't crash if api is absent
let getUser: (() => Promise<any>) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  getUser = require("../../api/payments").getUser as typeof getUser;
} catch {
  // noop
}

// Plan IDs (replace YEARLY with your real PayPal plan id)
const PLAN_MONTHLY = "P-2VC39471BE0365153NDSQ6RI"; // $8/mo
const PLAN_YEARLY = "P-YOUR_YEARLY_PLAN_ID";       // $80/yr

export default function Premium() {
  useEffect(() => {
    (async () => {
      try {
        if (getUser) await getUser();
      } catch (e) {
        console.warn("[premium] getUser failed", e);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-page text-[15px] text-[#111]">
      <TopBar />

      <main className="mx-auto max-w-[1280px] px-4 py-8 flex gap-8">
        <SideNav />

        <div className="flex-1 space-y-10">
          {/* Pricing cards */}
          <section className="flex gap-6 flex-wrap xl:flex-nowrap justify-start overflow-x-auto xl:overflow-visible">
            <PriceCard
              price="US$ 8"
              subtitle="per month"
              cta="Select a membership"
              mode="subscription"
              planId={PLAN_MONTHLY}
              size="sm"
            />

            <PriceCard
              price="US$ 80"
              subtitle="per year"
              cta="Select a membership"
              badgeText="-20%"
              mode="subscription"
              planId={PLAN_YEARLY}
              size="md"
            />

            <PriceCard
              price="US$ 300"
              subtitle="for lifetime access"
              cta="Select a membership"
              badgeText="Beneficial"
              mode="onetime"
              onetimeAmountUsd={300}
              size="midLg"
            />
          </section>

          <MembershipComparison />
        </div>
      </main>
    </div>
  );
}
