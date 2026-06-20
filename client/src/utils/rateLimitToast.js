// client/src/utils/rateLimitToast.js
export const triggerRateLimitToast = (message) => {
  window.dispatchEvent(new CustomEvent("rateLimitHit", { detail: { message } }));
};