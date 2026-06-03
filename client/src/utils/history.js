// client/src/utils/history.js

import axios from "axios";

const API = "http://localhost:5000/api/history";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ════════════════════════════════════════════════
//  SECTION 1 — localStorage helpers
// ════════════════════════════════════════════════

const getKey = () => {
  const uid = localStorage.getItem("userId") || "guest";
  return `vai_history_${uid}`;
};

const getQuizStatsKey  = () => `vai_quiz_stats_${localStorage.getItem("userId") || "guest"}`;
const getFlashStatsKey = () => `vai_flash_stats_${localStorage.getItem("userId") || "guest"}`;

const dateStr = (date = new Date()) => date.toDateString();

export const getHistory = () => {
  try { return JSON.parse(localStorage.getItem(getKey()) || "{}"); }
  catch { return {}; }
};

const saveHistory = (data) => {
  localStorage.setItem(getKey(), JSON.stringify(data));
  window.dispatchEvent(new Event("historyUpdated"));
};

// ── Generic activity tracker (for doc, tutor, task, topic) ──
export const trackActivity = (type, title, detail = "", topic = "") => {
  const history = getHistory();
  const dk      = dateStr();
  if (!history[dk]) history[dk] = [];

  const now = Date.now();
  const isDuplicate = history[dk].some(e =>
    e.type  === type  &&
    e.title === title &&
    (now - new Date(e.time).getTime()) < 10000
  );
  if (isDuplicate) return;

  history[dk].unshift({
    id:     Date.now(),
    type,
    title,
    detail,
    topic,   // ✅ always store topic
    time:   new Date().toISOString(),
  });

  history[dk] = history[dk].slice(0, 100);
  saveHistory(history);
};

// ── Convenience trackers ──
export const trackDoc   = (t)    => trackActivity("doc",   `📄 Documentation: ${t}`,                        t,    t);
export const trackTopic = (t)    => trackActivity("topic", `📚 New Topic: ${t}`,                             t,    t);
export const trackTutor = (q, a) => trackActivity("tutor", `🤖 AI Chat: ${q.slice(0,60)}${q.length>60?"…":""}`, a.slice(0,200), "");
export const trackTask  = (t)    => trackActivity("task",  `✅ Task: ${t}`,                                  t,    "");

export const getDayHistory  = (date) => (getHistory()[dateStr(date)] || []);
export const getActiveDates = ()     => Object.keys(getHistory());

// ── Flashcard tracker ──
export const trackFlashcard = (topic, n) => {
  const history = getHistory();
  const dk      = dateStr();
  if (!history[dk]) history[dk] = [];

  const now   = Date.now();
  const title = `🃏 Flashcards: ${topic}`;

  const isDuplicate = history[dk].some(e =>
    e.type === "flashcard" && e.title === title &&
    (now - new Date(e.time).getTime()) < 10000
  );

  if (!isDuplicate) {
    history[dk].unshift({
      id:     Date.now(),
      type:   "flashcard",
      title,
      detail: `${n} cards generated`,
      topic,           // ✅ explicit topic field
      time:   new Date().toISOString(),
    });
    history[dk] = history[dk].slice(0, 100);
    saveHistory(history);
  }

  // Update deck stats
  try {
    const key   = getFlashStatsKey();
    const stats = JSON.parse(localStorage.getItem(key) || "{}");
    if (!stats.topics) stats.topics = {};
    stats.topics[topic] = (stats.topics[topic] || 0) + 1;
    stats.totalDecks    = Object.keys(stats.topics).length;
    stats.lastUpdated   = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(stats));
    window.dispatchEvent(new Event("flashcardGenerated"));
  } catch (e) {
    console.warn("Flash stats save failed:", e);
  }
};

// ── Quiz tracker ──
export const trackQuiz = (topic, n) => {
  const history = getHistory();
  const dk      = dateStr();
  if (!history[dk]) history[dk] = [];

  const now   = Date.now();
  const title = `🧠 Quiz: ${topic}`;

  const isDuplicate = history[dk].some(e =>
    e.type === "quiz" && e.title === title &&
    (now - new Date(e.time).getTime()) < 10000
  );

  if (!isDuplicate) {
    history[dk].unshift({
      id:     Date.now(),
      type:   "quiz",
      title,
      detail: `${n} questions generated`,
      topic,           // ✅ explicit topic field
      time:   new Date().toISOString(),
    });
    history[dk] = history[dk].slice(0, 100);
    saveHistory(history);
  }

  window.dispatchEvent(new Event("quizCompleted"));
};

// ── Save quiz score after submission ──
export const saveQuizScore = (topic, score, total) => {
  try {
    const key   = getQuizStatsKey();
    const stats = JSON.parse(localStorage.getItem(key) || "{}");

    if (!stats.scores) stats.scores = [];

    stats.scores.push({
      topic, score, total,
      accuracy: total > 0 ? Math.round((score / total) * 100) : 0,
      time: new Date().toISOString(),
    });

    if (stats.scores.length > 100) stats.scores = stats.scores.slice(-100);

    const totalCorrect = stats.scores.reduce((a, s) => a + s.score, 0);
    const totalQ       = stats.scores.reduce((a, s) => a + s.total, 0);
    stats.accuracy     = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;
    stats.totalQuizzes = stats.scores.length;
    stats.lastUpdated  = new Date().toISOString();

    localStorage.setItem(key, JSON.stringify(stats));

    // ✅ Fire quizCompleted so Dashboard re-reads stats immediately
    window.dispatchEvent(new Event("quizCompleted"));
  } catch (e) {
    console.warn("Quiz stats save failed:", e);
  }
};

export const getQuizStats = () => {
  try { return JSON.parse(localStorage.getItem(getQuizStatsKey()) || "{}"); }
  catch { return {}; }
};

export const getFlashStats = () => {
  try { return JSON.parse(localStorage.getItem(getFlashStatsKey()) || "{}"); }
  catch { return {}; }
};

// ════════════════════════════════════════════════
//  SECTION 2 — Backend API fetch
// ════════════════════════════════════════════════

export const fetchHistory = async () => {
  try {
    const res = await axios.get(API, { headers: authHeader() });
    return res.data;
  } catch (err) {
    console.warn("⚠️ Backend history unavailable, falling back to localStorage:", err.message);
    const local       = getHistory();
    const totalItems  = Object.values(local).reduce((a, b) => a + b.length, 0);
    const activeDates = Object.keys(local).length;

    let streak = 0;
    const today = new Date(); today.setHours(0,0,0,0);
    const sd    = new Date(today);
    while (true) {
      const k = (local[sd.toDateString()] || []).length > 0;
      if (!k) break;
      streak++;
      sd.setDate(sd.getDate() - 1);
    }
    return { data: local, activeDates, totalItems, streak };
  }
};

// ════════════════════════════════════════════════
//  SECTION 3 — Shared config
// ════════════════════════════════════════════════

export const TYPE_CONFIG = {
  doc:       { icon:"📄", label:"Documentation", color:"#6366f1", path:"/docs/view"       },
  flashcard: { icon:"🃏", label:"Flashcards",    color:"#a855f7", path:"/flashcards/view" },
  quiz:      { icon:"🧠", label:"Quiz",          color:"#3b82f6", path:"/quiz/view"       },
  topic:     { icon:"📚", label:"Topic",         color:"#10b981", path:"/topics"          },
  tutor:     { icon:"🤖", label:"AI Tutor",      color:"#f59e0b", path:"/tutor"           },
  task:      { icon:"✅", label:"Task",          color:"#ec4899", path:"/planner"         },
};

export const fmtTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
};