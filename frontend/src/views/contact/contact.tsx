import { useEffect } from "react";
import TopBar from "../Premium/topbar";
import SideNav from "../Premium/sidenav";
import ContactForm from "./form";
import { getUser } from "../../api/payments";

export default function Contact() {
  useEffect(() => { getUser(); }, []);

  return (
    <div className="min-h-screen bg-[#FDF0F0] text-neutral-900">
      <TopBar />
      <div className="mx-auto max-w-[1200px] px-3 md:px-6">
        <div className="flex gap-6">
          {/* left sidebar */}
          <aside className="hidden md:block w-[220px] shrink-0 pt-6">
            <SideNav active="contact" />
          </aside>

          {/* main */}
          <main className="flex-1 pt-6 relative">
            {/* background pattern */}
            <img
              src="/assets/contact/background.svg"
              alt=""
              className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover -z-10"
            />
            <section className="rounded-xl border border-neutral-200 bg-white/70 shadow-sm backdrop-blur p-4 md:p-6">
              <h1 className="text-xl md:text-2xl font-semibold mb-4">Contact us</h1>
              <ContactForm />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
