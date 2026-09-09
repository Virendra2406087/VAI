import axios from "axios";

import { API_BASE_URL } from "../config";
import { CircleCheck, FileText, Layers3, Library, Sparkles, Brain } from "lucide-react";

const API = `${API_BASE_URL}/api/history`;

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

// ── Generic activity tracker (for doc, task, topic) ──
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
export const trackDoc = (t) =>
  trackActivity("doc", "Documentation", t, t);

export const trackTopic = (t) =>
  trackActivity("topic", "New Topic", t, t);

export const trackTask = (t) =>
  trackActivity("task", "Task", t, "");

// ════════════════════════════════════════════════
//  Tutor session tracking
//  One History entry per Tutor page visit. Every message you send
//  in that visit is appended to the SAME entry (with the full,
//  untruncated question + answer) instead of creating a new
//  "activity" row per message. Reopening from History replays the
//  entire conversation for that session, not just the last message.
// ════════════════════════════════════════════════

const MAX_EXCHANGES_PER_SESSION = 30;   // oldest ones drop off past this
const MAX_ANSWER_CHARS          = 4000; // per-exchange cap, still generous
const MAX_HISTORY_DAYS          = 60;   // prune day-keys older than this

let _fallbackSessionId = null;

export const startTutorSession = () => {
  _fallbackSessionId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return _fallbackSessionId;
};

const trimAnswer = (a) =>
  a.length > MAX_ANSWER_CHARS ? a.slice(0, MAX_ANSWER_CHARS) + "…" : a;

// Drop day-keys beyond MAX_HISTORY_DAYS so the whole blob can't grow
// unbounded across weeks/months of use.
const pruneOldDays = (history) => {
  const keys = Object.keys(history);
  if (keys.length <= MAX_HISTORY_DAYS) return history;
  const sorted = keys
    .map(k => ({ k, t: new Date(k).getTime() || 0 }))
    .sort((a, b) => b.t - a.t);
  const keep = new Set(sorted.slice(0, MAX_HISTORY_DAYS).map(x => x.k));
  const pruned = {};
  for (const k of keys) if (keep.has(k)) pruned[k] = history[k];
  return pruned;
};

export const trackTutor = (q, a, sessionId) => {
  let history = getHistory();
  const dk    = dateStr();
  if (!history[dk]) history[dk] = [];

  const sid          = sessionId || _fallbackSessionId || (_fallbackSessionId = startTutorSession());
  const trimmedAnswer = trimAnswer(a || "");
  const entry          = history[dk].find(e => e.type === "tutor" && e.sessionId === sid);
  const shortTitle     = (text) => `🤖 AI Chat: ${text.slice(0,60)}${text.length>60?"…":""}`;

  if (entry) {
    entry.exchanges = entry.exchanges || [];
    entry.exchanges.push({ q, a: trimmedAnswer, time: new Date().toISOString() });
    if (entry.exchanges.length > MAX_EXCHANGES_PER_SESSION) {
      entry.exchanges = entry.exchanges.slice(-MAX_EXCHANGES_PER_SESSION);
    }
    entry.detail = trimmedAnswer.slice(0, 200); // preview only, not full text
    entry.time   = new Date().toISOString();
  } else {
    history[dk].unshift({
      id:        Date.now(),
      type:      "tutor",
      sessionId: sid,
      title:     shortTitle(q),
      detail:    trimmedAnswer.slice(0, 200),
      topic:     q,
      exchanges: [{ q, a: trimmedAnswer, time: new Date().toISOString() }],
      time:      new Date().toISOString(),
    });
    history[dk] = history[dk].slice(0, 100);
  }

  history = pruneOldDays(history);
  saveHistory(history);
};

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
      topic,
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
  const title = `Quiz: ${topic}`;

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
      topic,
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

    //  Fire quizCompleted so Dashboard re-reads stats immediately
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
//  Icons stored as component references (not JSX) since this
//  is a plain .js file — render them as <Icon /> wherever consumed.
// ════════════════════════════════════════════════

export const TYPE_CONFIG = {
  doc: {
    icon: FileText,
    label: "Documentation",
    color: "#6366f1",
    path: "/docs/view"
  },

  flashcard: {
    icon: Layers3,
    label: "Flashcards",
    color: "#a855f7",
    path: "/flashcards/view"
  },

  quiz: {
    icon: Brain,
    label: "Quiz",
    color: "#3b82f6",
    path: "/quiz/view"
  },

  topic: {
    icon: Library,
    label: "Topic",
    color: "#10b981",
    path: "/topics"
  },

  tutor: {
    icon: Sparkles,
    label: "VAI Tutor",
    color: "#f59e0b",
    path: "/tutor"
  },

  task: {
    icon: CircleCheck,
    label: "Task",
    color: "#ec4899",
    path: "/planner"
  },
};

export const fmtTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
};