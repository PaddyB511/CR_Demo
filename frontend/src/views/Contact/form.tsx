import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle"|"sending"|"ok"|"err">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setStatus("sending");
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!r.ok) throw new Error();
      setStatus("ok");
      setName(""); setEmail(""); setMessage("");
    } catch {
      setStatus("err");
    }
  }

  const inputBase =
    "w-full rounded-lg border border-border bg-white px-4 py-3 outline-none focus:border-[#DB0000]";

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Name <span className="text-[#DB0000]">*</span></label>
        <div className="relative">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={inputBase}
          />
          {!!name && (
            <button
              type="button"
              onClick={() => setName("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label="Clear name"
            >✕</button>
          )}
        </div>
      </div>

      {/* Message (spans right column) */}
      <div className="space-y-2 md:row-span-3">
        <label className="text-sm font-medium">Message <span className="text-[#DB0000]">*</span></label>
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message"
            rows={7}
            className={inputBase + " resize-y"}
          />
          {!!message && (
            <button
              type="button"
              onClick={() => setMessage("")}
              className="absolute right-2 top-3 text-neutral-400 hover:text-neutral-600"
              aria-label="Clear message"
            >✕</button>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Email <span className="text-[#DB0000]">*</span></label>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="iloveRussian@example.com"
            className={inputBase}
          />
          {!!email && (
            <button
              type="button"
              onClick={() => setEmail("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label="Clear email"
            >✕</button>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="md:col-span-1 flex items-end">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex items-center gap-2 rounded-pill border border-[#DB0000] px-4 py-2 text-[#DB0000] font-medium hover:bg-[#DB0000]/5 disabled:opacity-60"
        >
          Send Message <span aria-hidden>→</span>
        </button>
        {status === "ok" && <span className="ml-3 text-sm text-green-600">Sent!</span>}
        {status === "err" && <span className="ml-3 text-sm text-red-600">Something went wrong.</span>}
      </div>
    </form>
  );
}
