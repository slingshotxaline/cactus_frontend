const VISITOR_ID_KEY = "visitor_id";

// A persistent anonymous id so repeat visits from the same browser count as
// one "visitor" over time. Not a fingerprint — just a random id stored in
// localStorage, the standard lightweight approach.
export const getVisitorId = () => {
  if (typeof window === "undefined") return null;
  try {
    let id = window.localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return null; // localStorage disabled/unavailable — tracking just no-ops
  }
};

// type: "page_view" | "click"
// label: only meaningful for "click" — a free-form identifier for what was
// clicked, e.g. "hero_banner:<id>", "homepage_section:Hot Sale",
// "product_card:<slug>", "category_tile:<id>".
export const trackEvent = (type, { path, label } = {}) => {
  const visitorId = getVisitorId();
  if (!visitorId) return;

  const body = JSON.stringify({
    visitorId,
    type,
    path: path ?? window.location.pathname,
    label,
    referrer: document.referrer || undefined,
  });

  // sendBeacon survives page navigation (critical for page_view events fired
  // right before the user clicks away) and doesn't block anything. Falls
  // back to a fire-and-forget fetch where sendBeacon isn't available.
  const url = `${process.env.NEXT_PUBLIC_API_URL}/track`;
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // never let a tracking failure surface anywhere
  }
};

export const trackPageView = (path) => trackEvent("page_view", { path });
export const trackClick = (label, path) => trackEvent("click", { path, label });
