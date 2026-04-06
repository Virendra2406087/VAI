const KEY = "app_notifications";

export const getNotifications = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch { return []; }
};

// Save notifications
export const saveNotifications = (notifs) => {
  localStorage.setItem(KEY, JSON.stringify(notifs));
};

// Add a new notification
export const addNotification = (icon, text, type = "info") => {
  const notifs = getNotifications();
  const newNotif = {
    id:     Date.now(),
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

// Format time ago
export const timeAgo = (isoString) => {
  const diff = Date.now() - new Date(isoString).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400)return `${Math.floor(s/3600)}h ago`;
  return         `${Math.floor(s/86400)}d ago`;
};