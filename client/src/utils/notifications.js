const KEY = "app_notifications";

// Ensures every notification object has the fields Navbar expects,
// so a malformed/old localStorage entry can never crash the render.
const sanitize = (notifs) => {
  if (!Array.isArray(notifs)) return [];
  return notifs
    .filter(n => n && typeof n === "object")
    .map(n => ({
      id:     n.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      icon:   typeof n.icon === "string" ? n.icon : "🔔",
      text:   typeof n.text === "string" ? n.text : "Notification",
      type:   typeof n.type === "string" ? n.type : "info",
      time:   n.time && !isNaN(new Date(n.time).getTime())
                ? n.time
                : new Date().toISOString(),
      unread: !!n.unread,
    }));
};

export const getNotifications = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return sanitize(raw);
  } catch {
    return [];
  }
};

// Save notifications
export const saveNotifications = (notifs) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(sanitize(notifs)));
  } catch {
    // localStorage full or unavailable — fail silently rather than crash
  }
};

// Add a new notification
export const addNotification = (icon, text, type = "info") => {
  const notifs = getNotifications();
  const newNotif = {
    id:     `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    icon,
    text,
    type,
    time:   new Date().toISOString(),
    unread: true,
  };
  // Keep max 20 notifications
  const updated = [newNotif, ...notifs].slice(0, 20);
  saveNotifications(updated);
  // Dispatch event so Navbar re-renders
  window.dispatchEvent(new Event("notificationsUpdated"));
  return newNotif;
};

// Mark all as read
export const markAllRead = () => {
  const notifs = getNotifications().map(n => ({ ...n, unread: false }));
  saveNotifications(notifs);
  window.dispatchEvent(new Event("notificationsUpdated"));
};

// Mark one as read
export const markOneRead = (id) => {
  const notifs = getNotifications().map(n =>
    n.id === id ? { ...n, unread: false } : n
  );
  saveNotifications(notifs);
  window.dispatchEvent(new Event("notificationsUpdated"));
};

// Clear all
export const clearNotifications = () => {
  saveNotifications([]);
  window.dispatchEvent(new Event("notificationsUpdated"));
};

// Format time ago — guards against invalid/missing dates
export const timeAgo = (isoString) => {
  const time = new Date(isoString).getTime();
  if (isNaN(time)) return "just now";

  const diff = Date.now() - time;
  const s = Math.floor(diff / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return           `${Math.floor(s / 86400)}d ago`;
};