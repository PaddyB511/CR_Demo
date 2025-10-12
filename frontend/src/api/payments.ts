export type Plan = "monthly" | "yearly" | "lifetime";

/** Bootstrap session + header counters. Safe to call on load. */
export async function getUser() {
  return fetch("/api/user", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  }).then(() => undefined);
}

/** Replace with your real checkout (Stripe/PayPal/Revolut/…): */
export async function startCheckout(plan: Plan) {
  console.info("[checkout] starting for plan:", plan);
  // e.g. POST /api/checkout { plan } and redirect to hosted page
}

/** Begin Patreon OAuth on backend (will redirect user): */
export function connectPatreon() {
  window.location.href = "/api/patreon/connect";
}

/** Legacy/manual email claim route (in your DRF user views): */
export async function claimPatreon(email: string) {
  const res = await fetch("/api/patreon/claim", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error("claim failed");
  return res.json();
}
