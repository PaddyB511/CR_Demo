import React, { useEffect } from "react";
import TopBar from "./topbar";
import SideNav from "./sidenav";
import PriceCard from "./pricecard";
import MembershipComparison from "./membershipcomparison";
import { getUser, startCheckout } from "../../api/payments";

export default function Premium() {
  useEffect(() => {
    // populate header counters (safe if backend returns stubs)
    getUser().catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-page text-[15px] text-[#111]">
      <TopBar />

      <main className="mx-auto max-w-[1280px] px-4 py-8 flex gap-8">
        <SideNav />

        <div className="flex-1 space-y-10">
          {/* Pricing cards */}
          <section className="flex gap-6 flex-nowrap overflow-x-auto xl:overflow-visible">
            <PriceCard
              price="US$ 8"
              subtitle="per month"
              cta="Select this plan"
              onSelect={() => startCheckout("monthly")}
            />

            <PriceCard
              price="US$ 80"
              subtitle="per year"
              cta="Select this plan"
              badgeText="-17%"
              onSelect={() => startCheckout("yearly")}
            />

            <PriceCard
              price="US$ 300"
              subtitle="for lifetime access"
              cta="Select this plan"
              badgeText="Beneficial"
              onSelect={() => startCheckout("lifetime")}
            />
          </section>

          {/* Membership comparison section */}
          <MembershipComparison />
        </div>
      </main>
    </div>
  );
}
