// src/utils/paypal.ts
// Single place that loads the PayPal SDK and starts a checkout flow.

declare global {
  interface Window {
    paypal?: any;
  }
}

let sdkPromise: Promise<any> | null = null;

function getClientId(): string {
  // Put your Client ID in a Vite env var
  const cid = import.meta.env.VITE_PAYPAL_CLIENT_ID as string | undefined;
  if (!cid) {
    throw new Error(
      "VITE_PAYPAL_CLIENT_ID is missing. Add it to your .env and restart dev server."
    );
  }
  return cid;
}

export async function loadPayPalSdk(): Promise<any> {
  if (window.paypal) return window.paypal;
  if (sdkPromise) return sdkPromise;

  const clientId = getClientId();
  // components=buttons (we keep your own CTA and show a small overlay with the official button only when needed)
  const src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
    clientId
  )}&components=buttons&intent=capture&vault=true`;

  sdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve(window.paypal);
    s.onerror = () => reject(new Error("Failed to load PayPal SDK"));
    document.head.appendChild(s);
  });

  return sdkPromise;
}

/** Simple overlay with a PayPal smart button inside */
function openOverlay(): HTMLDivElement {
  const overlay = document.createElement("div");
  overlay.id = "paypal-overlay";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0,0,0,0.35)";
  overlay.style.display = "grid";
  overlay.style.placeItems = "center";
  overlay.style.zIndex = "9999";

  const card = document.createElement("div");
  card.style.background = "#fff";
  card.style.borderRadius = "14px";
  card.style.padding = "24px";
  card.style.width = "min(420px, 92vw)";
  card.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";

  const title = document.createElement("div");
  title.textContent = "Complete payment with PayPal";
  title.style.font = "600 18px Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
  title.style.marginBottom = "14px";

  const container = document.createElement("div");
  container.id = "paypal-smart-button-container";
  container.style.marginTop = "8px";

  const close = document.createElement("button");
  close.textContent = "Cancel";
  close.style.marginTop = "16px";
  close.style.padding = "8px 12px";
  close.style.borderRadius = "999px";
  close.style.border = "1px solid #e5e7eb";
  close.style.background = "#fff";
  close.style.cursor = "pointer";
  close.onclick = () => document.body.removeChild(overlay);

  card.appendChild(title);
  card.appendChild(container);
  card.appendChild(close);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  return container as HTMLDivElement;
}

function closeOverlay() {
  const el = document.getElementById("paypal-overlay");
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

/**
 * Start a subscription checkout (e.g. monthly / yearly) by planId.
 * Shows a tiny overlay with the official PP button to comply with SDK.
 */
export async function startPayPalSubscription(planId: string): Promise<void> {
  const paypal = await loadPayPalSdk();
  const mount = openOverlay();

  return new Promise<void>((resolve, reject) => {
    paypal
      .Buttons({
        style: { layout: "vertical", color: "blue", shape: "pill", label: "subscribe" },
        createSubscription: (_data: any, actions: any) => {
          return actions.subscription.create({ plan_id: planId });
        },
        onApprove: (data: any) => {
          // data.subscriptionID
          closeOverlay();
          // TODO: POST to your backend /api/payments/confirm with data.subscriptionID
          alert("Subscribed! ID: " + data.subscriptionID);
          resolve();
        },
        onCancel: () => {
          closeOverlay();
          reject(new Error("Subscription cancelled by user"));
        },
        onError: (err: any) => {
          closeOverlay();
          reject(err);
        },
      })
      .render(mount);
  });
}

/**
 * Start a one-time capture (lifetime).
 * amountUsd like "300.00" or number (will be formatted).
 */
export async function startPayPalOneTime(amountUsd: number | string): Promise<void> {
  const paypal = await loadPayPalSdk();
  const mount = openOverlay();
  const value =
    typeof amountUsd === "number" ? amountUsd.toFixed(2) : amountUsd;

  return new Promise<void>((resolve, reject) => {
    paypal
      .Buttons({
        style: { layout: "vertical", color: "blue", shape: "pill", label: "pay" },
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: { value, currency_code: "USD" },
                description: "Comprehensible Russian — Lifetime",
              },
            ],
          });
        },
        onApprove: async (_data: any, actions: any) => {
          try {
            const details = await actions.order.capture();
            closeOverlay();
            // details.id is the capture/order id
            // TODO: POST to your backend /api/payments/confirm with details
            alert("Payment complete! Order: " + details.id);
            resolve();
          } catch (e: any) {
            closeOverlay();
            reject(e);
          }
        },
        onCancel: () => {
          closeOverlay();
          reject(new Error("Payment cancelled by user"));
        },
        onError: (err: any) => {
          closeOverlay();
          reject(err);
        },
      })
      .render(mount);
  });
}
