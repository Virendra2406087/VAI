// client/src/utils/history.js
// ✅ Central activity tracker — saves everything to localStorage per user per day

const getKey = () => {
  const uid = localStorage.getItem("userId") || "guest";
  return `vai_history_${uid}`;
};

const dateStr = (date = new Date()) => date.toDateString();

// ── Get all history ──
export const getHistory = () => {
  try { return JSON.parse(localStorage.getItem(getKey()) || "{}"); }
  catch { return {}; }
};

// ── Save history ──
const saveHistory = (data) => {
  localStorage.setItem(getKey(), JSON.stringify(data));
  window.dispatchEvent(new Event("historyUpdated"));
};

// ── Add one activity entry ──
export const trackActivity = (type, title, detail = "") => {
  const history = getHistory();
  const dk      = dateStr();
  if (!history[dk]) history[dk] = [];

  history[dk].unshift({
    id:     Date.now(),
    type,   // "doc" | "flashcard" | "quiz" | "topic" | "task" | "tutor"
    title,
    detail,
    time:   new Date().toISOString(),
  });

  // Keep max 100 entries per day
  history[dk] = history[dk].slice(0, 100);
  saveHistory(history);
};

// ── Convenience helpers ──
export const trackDoc        = (topic)    => trackActivity("doc",       `📄 Documentation: ${topic}`,        topic);
export const trackFlashcard  = (topic, n) => trackActivity("flashcard", `🃏 Flashcards: ${topic}`,            `${n} cards generated`);
export const trackQuiz       = (topic, n) => trackActivity("quiz",      `🧠 Quiz: ${topic}`,                  `${n} questions generated`);
export const trackTopic      = (title)    => trackActivity("topic",     `📚 New Topic: ${title}`,             title);
export const trackTutor      = (q, a)     => trackActivity("tutor",     `🤖 AI Chat: ${q.slice(0,60)}${q.length>60?"…":""}`, a.slice(0, 200));
export const trackTask       = (text)     => trackActivity("task",      `✅ Task: ${text}`,                   text);

// ── Get entries for a specific date ──
export const getDayHistory = (date) => {
  const history = getHistory();
  return history[dateStr(date)] || [];
};

// ── Get all active dates ──
export const getActiveDates = () => Object.keys(getHistory());

// ── Format time ──
export const fmtTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
};

// ── Type config ──
export const TYPE_CONFIG = {
  doc:       { icon:"📄", label:"Documentation", color:"#6366f1" },
  flashcard: { icon:"🃏", label:"Flashcards",    color:"#a855f7" },
  quiz:      { icon:"🧠", label:"Quiz",          color:"#3b82f6" },
  topic:     { icon:"📚", label:"Topic",         color:"#10b981" },
  tutor:     { icon:"🤖", label:"AI Tutor",      color:"#f59e0b" },
  task:      { icon:"✅", label:"Task",          color:"#ec4899" },
};