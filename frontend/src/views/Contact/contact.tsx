import { useEffect } from "react";
import TopBar from "../Premium/topbar";
import SideNav from "../Premium/sidenav";
import ContactForm from "./form";
import { getUser } from "../../api/payments";

// import background image (Vite will resolve it)
import bgUrl from "../../assets/contact/background.svg?url";

export default function Contact() {
  // make sure user info loads safely
  useEffect(() => {
    getUser().catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF0F0] text-[#111]">
      {/* --- Top bar --- */}
  

      {/* --- Full-bleed wrapper for background --- */}
      <div className="relative flex-1 min-h-screen">
        {/* Background image fills entire screen */}
        <div
          aria-hidden
          className="
            absolute inset-0 z-0 pointer-events-none
            bg-no-repeat bg-cover
            bg-[length:100%_auto] sm:bg-[length:100%_auto]
          "
          style={{
            backgroundImage: `url(${bgUrl})`,
            backgroundPosition: "center top",
          }}
        />

        {/* --- Centered content container --- */}
        <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 py-8 flex gap-8">
          {/* Sidebar */}
          <SideNav />

          {/* Main content */}
          <main className="flex-1">
            <section className="rounded-card bg-white/80 backdrop-blur border border-border shadow-card p-4 md:p-6">
              <h1 className="text-[22px] font-semibold mb-4">Contact us</h1>

              <p className="text-sm text-gray-600 mb-6 max-w-prose">
                
              </p>

              <ContactForm />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
