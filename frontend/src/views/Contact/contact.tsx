// src/views/Contact/Contact.tsx
import { useEffect } from "react";
import TopBar from "../Premium/topbar";
import SideNav from "../Premium/sidenav";
import ContactForm from "./form";
import { getUser } from "../../api/payments";

import bgUrl from "../../assets/contact/background.svg?url";

<div className="relative mx-auto max-w-[1200px] px-4 py-8 flex gap-8 min-h-[480px]">
  <div
    aria-hidden
    className="absolute inset-0 -z-10 bg-no-repeat bg-cover"
    style={{ backgroundImage: `url(${bgUrl})` }}
  />
  {/* ... SideNav + card ... */}
</div>


export default function Contact() {
  useEffect(() => { getUser().catch(() => {}); }, []);

  return (
    <div className="min-h-screen bg-[#FDF0F0] text-[#111]">
      <TopBar />

      {/* Make THIS wrapper relative so the background can be absolutely positioned */}
      <div className="relative mx-auto max-w-[1200px] px-4 py-8 flex gap-8">
        {/* Background layer */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-no-repeat bg-cover"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />

        {/* Left nav */}
        <SideNav />

        {/* Main card */}
        <main className="flex-1">
          <section className="rounded-card bg-white/80 backdrop-blur border border-border shadow-card p-4 md:p-6">
            <h1 className="text-[20px] md:text-[22px] font-semibold mb-4">Contact us</h1>
            <ContactForm />
          </section>
        </main>
      </div>
    </div>
  );
}
