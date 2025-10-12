import React, { useState } from "react";
import { claimPatreon, connectPatreon } from "../../api/payments";

export default function PatreonCard() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  );

  async function handleClaim() {
    try {
      setStatus("loading");
      await claimPatreon(email);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Title + blurb */}
        <div className="lg:col-start-3 lg:row-span-2 lg:row-start-1" />

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 lg:col-span-3">
          <h3 className="mb-2 text-[22px] font-extrabold">
            Patreon <span className="text-red-600">⟡</span>
          </h3>
          <p className="mb-3 text-sm text-neutral-700">
            If you are a member of <b>$5+</b> tier on Patreon, you can join the
            Beta-version of Premium on this platform as well. You&apos;ll be
            able to watch premium videos and download audios &amp; transcripts
            here.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={connectPatreon}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              I am a patron →
            </button>

            <div className="flex items-center gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Patreon email"
                className="w-64 rounded-full border border-neutral-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-red-200"
              />
              <button
                onClick={handleClaim}
                className="rounded-full border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50"
              >
                Become a patron →
              </button>
            </div>

            {status === "loading" && (
              <span className="text-sm text-neutral-500">Submitting…</span>
            )}
            {status === "done" && (
              <span className="text-sm text-green-600">
                Request received. We&apos;ll review &amp; upgrade.
              </span>
            )}
            {status === "error" && (
              <span className="text-sm text-red-600">
                Couldn&apos;t submit claim. Try again.
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
