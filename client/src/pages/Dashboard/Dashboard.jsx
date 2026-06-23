import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar  from "../../components/Navbar";
import axios   from "axios";
import { getHistory, getQuizStats, getFlashStats } from "../../utils/history";
import { API_BASE_URL } from "../../config";

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, BarChart, Bar
} from "recharts";

/* ─── Local history helpers ─────────────────────────── */

const computeStreak = () => {
  const history = getHistory();
  const today   = new Date(); today.setHours(0,0,0,0);
  let streak = 0;
  const d = new Date(today);
  while (true) {
    const k = d.toDateString();
    if ((history[k] || []).length === 0) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
};

const computeWeeklyActivity = () => {
  const history = getHistory();
  const days    = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(new Date().getDate() - (6 - i));
    d.setHours(0,0,0,0);
    const k = d.toDateString();
    return { day: days[d.getDay()], count: (history[k] || []).length };
  });
};

const computeDailyProgress = () => {
  const history   = getHistory();
  const allEvents = Object.values(history).flat();
  const total     = allEvents.length;
  const days      = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  if (total === 0) {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(new Date().getDate() - (6 - i));
      return { day: days[d.getDay()], progress: 0 };
    });
  }
  let cumulative = 0;
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(new Date().getDate() - (6 - i));
    d.setHours(0,0,0,0);
    const k = d.toDateString();
    cumulative += (history[k] || []).length;
    return {
      day: days[d.getDay()],
      progress: Math.min(Math.round((cumulative / total) * 100), 100),
    };
  });
};

const getLastActiveTopic = () => {
  const history = getHistory();
  const all = Object.entries(history)
    .flatMap(([date, events]) => events.map(e => ({ ...e, date })))
    .sort((a, b) => new Date(b.time || b.date) - new Date(a.time || a.date));

  const found = all.find(e => e.type === "flashcard" || e.type === "quiz");
  if (!found) return null;

  if (found.topic) return found.topic;
  const match = found.title?.match(/(?:Flashcards|Quiz):\s*(.+)/);
  return match?.[1]?.trim() || null;
};

const getTopicsFromHistory = () => {
  const history = getHistory();
  const all     = Object.values(history).flat();
  const seen    = new Set();
  const topics  = [];

  const sorted = [...all].sort((a, b) =>
    new Date(b.time || 0) - new Date(a.time || 0)
  );

  sorted.forEach(e => {
    let topic = e.topic;

    if (!topic && e.title) {
      const match = e.title.match(/(?:Flashcards|Quiz|Documentation|Topic|Task):\s*(.+)/);
      if (match) topic = match[1].trim();
    }

    if (topic && !seen.has(topic)) {
      seen.add(topic);
      topics.push(topic);
    }
  });

  return topics;
};

const getFlashcardCountForTopic = (topic) => {
  const uid = localStorage.getItem("userId") || "guest";
  const key = `vai_flash_${uid}_${(topic||"").toLowerCase().replace(/\s+/g,"_")}`;
  try {
    const cached = JSON.parse(localStorage.getItem(key) || "null");
    return cached?.cards?.length || 0;
  } catch { return 0; }
};

const getQuizCountForTopic = (topic) => {
  const uid = localStorage.getItem("userId") || "guest";
  const key = `vai_quiz_${uid}_${(topic||"").toLowerCase().replace(/\s+/g,"_")}`;
  try {
    const cached = JSON.parse(localStorage.getItem(key) || "null");
    return cached?.questions?.length || 0;
  } catch { return 0; }
};

/* ═══════════════════════════════════════════════════════ */

function Dashboard() {
  const navigate = useNavigate();

  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [theme,    setTheme]    = useState(() => localStorage.getItem("theme") || "dark");

  const [streak,         setStreak]         = useState(0);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [dailyProgress,  setDailyProgress]  = useState([]);
  const [localTopics,    setLocalTopics]    = useState([]);
  const [continueTopic,  setContinueTopic]  = useState(null);
  const [flashcardCount, setFlashcardCount] = useState(0);
  const [quizCount,      setQuizCount]      = useState(0);

  const [quizAccuracy,   setQuizAccuracy]   = useState(0);
  const [totalQuizzes,   setTotalQuizzes]   = useState(0);
  const [flashdeckCount, setFlashdeckCount] = useState(0);

  const isDark = theme === "dark";

  useEffect(() => {
    const handler = e => setTheme(e.detail.theme);
    window.addEventListener("themeChanged", handler);
    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme");
      setTheme(t === "light" ? "light" : "dark");
    });
    observer.observe(document.documentElement, { attributes:true, attributeFilter:["data-theme"] });
    return () => { window.removeEventListener("themeChanged", handler); observer.disconnect(); };
  }, []);

  const recomputeLocal = useCallback(() => {
    setStreak(computeStreak());
    setWeeklyActivity(computeWeeklyActivity());
    setDailyProgress(computeDailyProgress());

    const topics = getTopicsFromHistory();
    setLocalTopics(topics);

    const lastTopic = getLastActiveTopic();
    if (lastTopic) {
      setContinueTopic(lastTopic);
      setFlashcardCount(getFlashcardCountForTopic(lastTopic));
      setQuizCount(getQuizCountForTopic(lastTopic));
    } else {
      setContinueTopic(null);
      setFlashcardCount(0);
      setQuizCount(0);
    }

    const qStats = getQuizStats();
    setQuizAccuracy(qStats.accuracy    || 0);
    setTotalQuizzes(qStats.totalQuizzes || 0);

    const fStats = getFlashStats();
    setFlashdeckCount(fStats.totalDecks || 0);

  }, []);

  /* ── Events ── */
  useEffect(() => {
    recomputeLocal();
    const events = ["historyUpdated","storage","quizCompleted","flashcardGenerated"];
    events.forEach(ev => window.addEventListener(ev, recomputeLocal));
    return () => events.forEach(ev => window.removeEventListener(ev, recomputeLocal));
  }, [recomputeLocal]);

  /* ── Fetch server stats ── */
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/dashboard`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      setStats(res.data);
    } catch (err) {
  console.error("Dashboard fetch error:", err.response?.status, err.response?.data || err.message);

  if (!err.response) {
    setError("Cannot reach server. Is the backend running?");
  } else if (err.response.status === 401) {
    setError("Session expired. Please log in again.");
  } else if (err.response.status === 404) {
    setError("Dashboard endpoint not found.");
  } else {
    setError("Failed to load dashboard.");
  }
} finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const onFocus   = () => { recomputeLocal(); fetchDashboard(); };
    const onVisible = () => { if (document.visibilityState === "visible") { recomputeLocal(); fetchDashboard(); } };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchDashboard, recomputeLocal]);

  /* ─── Theme tokens ── */
  const T = {
    cardBg:        isDark ? "rgba(255,255,255,0.04)"             : "rgba(255,255,255,0.85)",
    cardBorder:    isDark ? "rgba(255,255,255,0.07)"             : "rgba(109,40,217,0.12)",
    cardShadow:    isDark ? "0 4px 24px rgba(0,0,0,0.3)"        : "0 4px 24px rgba(109,40,217,0.08)",
    headingGrad:   isDark ? "linear-gradient(135deg,#f1f5f9,#a855f7)" : "linear-gradient(135deg,#1e1b4b,#6d28d9)",
    subText:       isDark ? "#64748b"  : "#7c6fa0",
    titleText:     isDark ? "#f1f5f9" : "#1e1b4b",
    bodyText:      isDark ? "#e2e8f0" : "#1e1b4b",
    mutedText:     isDark ? "#94a3b8" : "#4c3a7a",
    dimText:       isDark ? "#475569" : "#7c6fa0",
    purple:        isDark ? "#a855f7" : "#6d28d9",
    chartGrid:     isDark ? "rgba(255,255,255,0.05)" : "rgba(109,40,217,0.07)",
    chartTick:     isDark ? "#475569" : "#7c6fa0",
    tooltipBg:     isDark ? "rgba(13,13,26,0.95)"   : "rgba(248,245,255,0.97)",
    tooltipBorder: isDark ? "rgba(124,58,237,0.3)"  : "rgba(109,40,217,0.2)",
    tooltipLabel:  isDark ? "#a855f7" : "#6d28d9",
    tooltipValue:  isDark ? "#f1f5f9" : "#1e1b4b",
    itemBg:        isDark ? "rgba(255,255,255,0.03)" : "rgba(237,233,254,0.45)",
    itemBorder:    isDark ? "rgba(255,255,255,0.06)" : "rgba(109,40,217,0.12)",
    continueBg:    isDark
      ? "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(99,102,241,0.08))"
      : "linear-gradient(135deg,rgba(109,40,217,0.08),rgba(168,85,247,0.04))",
    continueBorder:isDark ? "rgba(124,58,237,0.2)"  : "rgba(109,40,217,0.18)",
    progressTrack: isDark ? "rgba(255,255,255,0.07)" : "rgba(109,40,217,0.1)",
    badgeBg:       isDark ? "rgba(124,58,237,0.12)"  : "rgba(109,40,217,0.08)",
    badgeBorder:   isDark ? "rgba(124,58,237,0.25)"  : "rgba(109,40,217,0.18)",
    badgeText:     isDark ? "#a855f7" : "#6d28d9",
    loaderBorder:  isDark ? "rgba(124,58,237,0.2)"   : "rgba(109,40,217,0.15)",
    loaderTop:     isDark ? "#a855f7" : "#6d28d9",
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const val = payload[0].value; const name = payload[0].name;
    return (
      <div style={{ background:T.tooltipBg, border:`1px solid ${T.tooltipBorder}`, borderRadius:10, padding:"10px 14px", backdropFilter:"blur(20px)" }}>
        <p style={{ color:T.tooltipLabel, fontSize:12, fontWeight:700, marginBottom:4 }}>{label}</p>
        <p style={{ color:T.tooltipValue, fontSize:14, fontWeight:700 }}>
          {name === "progress" ? `${val}%` : `${val} activit${val===1?"y":"ies"}`}
        </p>
      </div>
    );
  };

  const card = (extra={}) => ({
    background:T.cardBg, backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
    border:`1px solid ${T.cardBorder}`, borderRadius:16, padding:20, boxShadow:T.cardShadow, ...extra,
  });

  const boxTitle  = { fontSize:14, fontWeight:700, color:T.purple, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:0 };
  const itemRow   = { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderRadius:8, background:T.itemBg, border:`1px solid ${T.itemBorder}`, cursor:"pointer", transition:"all 0.2s" };
  const actionBtn = (color="#7c3aed") => ({ padding:"10px 18px", borderRadius:9, background:`linear-gradient(135deg,${color},${color}cc)`, border:"none", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", width:"100%", fontFamily:"inherit", transition:"all 0.2s", boxShadow:`0 4px 14px ${color}44` });

  const goFlashcards = (topic) => {
    if (!topic) { navigate("/flashcards"); return; }
    navigate("/flashcards/view", { state: { topic, autoGenerate:true } });
  };
  const goQuiz = (topic) => {
    if (!topic) { navigate("/quiz"); return; }
    navigate("/quiz/view", { state: { topic, autoGenerate:true } });
  };

  if (loading) return (
    <div className="page-layout">
      <Sidebar /><div className="page-main"><Navbar />
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", flexDirection:"column", gap:16 }}>
          <div style={{ width:40, height:40, borderRadius:"50%", border:`3px solid ${T.loaderBorder}`, borderTop:`3px solid ${T.loaderTop}`, animation:"spin 0.8s linear infinite" }} />
          <p style={{ color:T.dimText, fontSize:14 }}>Loading dashboard...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    </div>
  );

  const name     = localStorage.getItem("name") || "User";
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const serverTopics   = stats?.recommendedTopics || [];
  const allTopics      = [...new Set([...serverTopics, ...localTopics])].slice(0, 5);
  const serverContinue = stats?.continueLearning;
  const activeTopic    = serverContinue?.topic || continueTopic;
  const activeFlashCount = serverContinue?.cardsLeft ?? flashcardCount;
  const activeQuizCount  = quizCount;
  const totalWeekActivity = weeklyActivity.reduce((a,b) => a + b.count, 0);

  const statCards = [
    {
      title: "Day Streak",
      value: `${streak} 🔥`,
      icon: "🔥", color: "#f59e0b",
      sub: streak > 0 ? "Keep it going!" : "Start today!",
    },
    {
      title: "Topics Created",
      value: stats?.topicsCompleted ?? localTopics.length,
      icon: "📚", color: "#7c3aed",
      sub: `${stats?.totalDocs ?? 0} docs generated`,
    },
    {
      title: "Flashcard Decks",
      value: flashdeckCount > 0 ? flashdeckCount : (stats?.flashcardsReviewed || 0),
      icon: "🃏", color: "#6366f1",
      sub: flashdeckCount > 0
        ? `${flashdeckCount} topic${flashdeckCount!==1?"s":""} with cards`
        : "Generate flashcards to start",
    },
    {
      title: "Quiz Accuracy",
      value: `${quizAccuracy > 0 ? quizAccuracy : (stats?.quizAccuracy || 0)}%`,
      icon: "🎯", color: "#10b981",
      sub: totalQuizzes > 0
        ? `${totalQuizzes} quiz${totalQuizzes!==1?"zes":""} taken`
        : stats?.totalQuizzes
          ? `${stats.totalQuizzes} quizzes taken`
          : "Take a quiz to see accuracy",
    },
  ];

  const quickActions = [
    { title:"Flashcards",    desc:"Review your cards",   icon:"🃏", color:"#6366f1", action:() => goFlashcards(activeTopic), btn:"Study Now"  },
    { title:"Take a Quiz",   desc:"Test your knowledge", icon:"🧠", color:"#7c3aed", action:() => goQuiz(activeTopic),       btn:"Start Quiz" },
    { title:"AI Tutor",      desc:"Ask me anything",     icon:"🤖", color:"#a855f7", action:() => navigate("/tutor"),        btn:"Chat Now"   },
    { title:"Study Planner", desc:"Plan your schedule",  icon:"📅", color:"#3b82f6", action:() => navigate("/planner"),      btn:"View Plan"  },
  ];

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />
        <div style={{ padding:28 }}>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

          {/* HEADER */}
          <div style={{ marginBottom:28 }}>
            <h1 style={{ fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, background:T.headingGrad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", marginBottom:6 }}>
              {greeting}, {name.split(" ")[0]} 👋
            </h1>
            <p style={{ color:T.subText, fontSize:14 }}>
              Here's your learning overview for today.
              {totalWeekActivity > 0 && <span style={{ color:T.purple, fontWeight:600 }}> {totalWeekActivity} activities this week!</span>}
            </p>
          </div>

          {error && (
            <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"12px 16px", color:"#fca5a5", fontSize:13, marginBottom:20 }}>
              ⚠️ {error} — showing cached data where available.
            </div>
          )}

          {/* STAT CARDS */}
          <div className="stats-grid" style={{ marginBottom:24 }}>
            {statCards.map((s, i) => (
              <div key={i}
                style={{ ...card(), position:"relative", overflow:"hidden", transition:"all 0.25s", cursor:"default" }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.borderColor=`${s.color}44`; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.borderColor=T.cardBorder; }}
              >
                <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${s.color},${s.color}88)`, borderRadius:"16px 16px 0 0" }} />
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:12 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:`${s.color}18`, border:`1px solid ${s.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>
                    {s.icon}
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:100, background:T.badgeBg, border:`1px solid ${T.badgeBorder}`, color:T.badgeText }}>Live</span>
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:T.dimText, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>{s.title}</div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:30, fontWeight:800, color:s.color, lineHeight:1, marginBottom:6 }}>{s.value}</div>
                <div style={{ fontSize:12, color:T.dimText }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* CHARTS */}
          <div className="charts-grid" style={{ marginBottom:24 }}>

            <div style={card()}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:T.titleText }}>📈 Learning Progress</h3>
                  <p style={{ fontSize:12, color:T.dimText, marginTop:3 }}>Cumulative activity this week</p>
                </div>
                <span style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:100, background:T.badgeBg, border:`1px solid ${T.badgeBorder}`, color:T.badgeText }}>This Week</span>
              </div>
              {dailyProgress.every(d => d.progress === 0) ? (
                <div style={{ height:220, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8 }}>
                  <span style={{ fontSize:36 }}>📊</span>
                  <p style={{ color:T.dimText, fontSize:13 }}>No activity yet this week</p>
                  <p style={{ color:T.dimText, fontSize:12, textAlign:"center" }}>Generate docs, flashcards or take a quiz to see progress</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={dailyProgress}>
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={isDark?"#7c3aed":"#6d28d9"} />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.chartGrid} />
                    <XAxis dataKey="day" tick={{ fill:T.chartTick, fontSize:12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:T.chartTick, fontSize:12 }} axisLine={false} tickLine={false} domain={[0,100]} tickFormatter={v=>`${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="progress" name="progress" stroke="url(#lineGrad)" strokeWidth={3}
                      dot={{ fill:T.purple, strokeWidth:2, r:4 }} activeDot={{ r:6, fill:T.purple }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            <div style={card()}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:T.titleText }}>⚡ Weekly Activity</h3>
                  <p style={{ fontSize:12, color:T.dimText, marginTop:3 }}>Docs, quizzes & flashcards</p>
                </div>
                <span style={{ fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:100, background:T.badgeBg, border:`1px solid ${T.badgeBorder}`, color:T.badgeText }}>
                  {totalWeekActivity} total
                </span>
              </div>
              {totalWeekActivity === 0 ? (
                <div style={{ height:220, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8 }}>
                  <span style={{ fontSize:36 }}>📅</span>
                  <p style={{ color:T.dimText, fontSize:13 }}>No activity recorded yet</p>
                  <p style={{ color:T.dimText, fontSize:12 }}>Start learning to see your activity here</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={weeklyActivity} barSize={28}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={isDark?"#a855f7":"#7c3aed"} />
                        <stop offset="100%" stopColor={isDark?"#6366f1":"#6d28d9"} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.chartGrid} vertical={false} />
                    <XAxis dataKey="day" tick={{ fill:T.chartTick, fontSize:12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill:T.chartTick, fontSize:12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="count" fill="url(#barGrad)" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* MIDDLE GRID */}
          <div className="middle-grid" style={{ marginBottom:24 }}>

            {/* Your Topics */}
            <div style={card()}>
              <h3 style={boxTitle}>📚 Your Topics</h3>
              {allTopics.length > 0 ? (
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:12 }}>
                  {allTopics.map((topic, i) => (
                    <div key={i} style={itemRow}
                      onClick={() => navigate("/topics")}
                      onMouseEnter={e => { e.currentTarget.style.background=isDark?"rgba(124,58,237,0.08)":"rgba(109,40,217,0.08)"; e.currentTarget.style.borderColor=isDark?"rgba(124,58,237,0.25)":"rgba(109,40,217,0.25)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background=T.itemBg; e.currentTarget.style.borderColor=T.itemBorder; }}
                    >
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:16 }}>📚</span>
                        <span style={{ fontSize:13, color:T.bodyText, fontWeight:500 }}>{topic}</span>
                      </div>
                      <span style={{ color:T.purple, fontSize:14 }}>→</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 0", gap:8 }}>
                  <span style={{ fontSize:36 }}>📚</span>
                  <p style={{ color:T.dimText, fontSize:13 }}>No topics yet</p>
                  <button onClick={() => navigate("/topics")}
                    style={{ padding:"8px 16px", borderRadius:8, background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none", color:"white", fontSize:13, fontWeight:600, cursor:"pointer", marginTop:4 }}>
                    Create First Topic →
                  </button>
                </div>
              )}
            </div>

            {/* Continue Learning */}
            <div style={card({ background:T.continueBg, border:`1px solid ${T.continueBorder}` })}>
              <h3 style={boxTitle}>▶️ Continue Learning</h3>
              {activeTopic ? (
                <div style={{ marginTop:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                    <div style={{ width:42, height:42, borderRadius:10, background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>📚</div>
                    <div>
                      <p style={{ fontSize:15, fontWeight:700, color:T.titleText, margin:0 }}>{activeTopic}</p>
                      <p style={{ fontSize:12, color:T.dimText, marginTop:2 }}>
                        {activeFlashCount > 0 && `${activeFlashCount} flashcard${activeFlashCount!==1?"s":""}`}
                        {activeFlashCount > 0 && activeQuizCount > 0 && " · "}
                        {activeQuizCount > 0 && `${activeQuizCount} quiz question${activeQuizCount!==1?"s":""}`}
                      </p>
                    </div>
                  </div>
                  <div style={{ height:5, background:T.progressTrack, borderRadius:10, marginBottom:16 }}>
                    <div style={{ height:"100%", width:`${Math.min(((activeFlashCount+activeQuizCount)/30)*100,100)}%`, background:"linear-gradient(90deg,#6d28d9,#a855f7)", borderRadius:10 }} />
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button
                      style={{ flex:1, padding:"11px 12px", borderRadius:9, background:activeFlashCount>0?"linear-gradient(135deg,#6366f1,#818cf8)":"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(99,102,241,0.4)", fontFamily:"inherit", transition:"all 0.2s" }}
                      onClick={() => goFlashcards(activeTopic)}
                      onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
                      onMouseLeave={e => e.currentTarget.style.opacity="1"}
                    >
                      🃏 {activeFlashCount > 0 ? `Review ${activeFlashCount} Cards` : "Generate Flashcards"}
                    </button>
                    <button
                      style={{ flex:1, padding:"11px 12px", borderRadius:9, background:activeQuizCount>0?"linear-gradient(135deg,#7c3aed,#a855f7)":"linear-gradient(135deg,#6d28d9,#8b5cf6)", border:"none", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(124,58,237,0.4)", fontFamily:"inherit", transition:"all 0.2s" }}
                      onClick={() => goQuiz(activeTopic)}
                      onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
                      onMouseLeave={e => e.currentTarget.style.opacity="1"}
                    >
                      🧠 {activeQuizCount > 0 ? `Take Quiz (${activeQuizCount}Q)` : "Generate Quiz"}
                    </button>
                  </div>
                  <p style={{ fontSize:11, color:T.dimText, marginTop:10, textAlign:"center" }}>
                    Clicking goes directly to {activeTopic} content
                  </p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 0", gap:8 }}>
                  <span style={{ fontSize:36 }}>🎯</span>
                  <p style={{ color:T.dimText, fontSize:13 }}>No active topic yet</p>
                  <p style={{ color:T.dimText, fontSize:12, textAlign:"center" }}>Create a topic and generate flashcards or a quiz</p>
                  <button onClick={() => navigate("/topics")}
                    style={{ padding:"8px 16px", borderRadius:8, background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none", color:"white", fontSize:13, fontWeight:600, cursor:"pointer", marginTop:4 }}>
                    Get Started →
                  </button>
                </div>
              )}
            </div>

            {/* Recent Docs */}
            <div style={card()}>
              <h3 style={boxTitle}>📄 Recent Docs</h3>
              {stats?.recentNotes?.length > 0 ? (
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:12 }}>
                  {stats.recentNotes.map((note, i) => (
                    <div key={i} style={itemRow}
                      onClick={() => navigate("/docs/view", { state:{ topic:note, autoGenerate:false } })}
                      onMouseEnter={e => { e.currentTarget.style.background=isDark?"rgba(99,102,241,0.08)":"rgba(99,102,241,0.07)"; e.currentTarget.style.borderColor="rgba(99,102,241,0.25)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background=T.itemBg; e.currentTarget.style.borderColor=T.itemBorder; }}
                    >
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:16 }}>📄</span>
                        <span style={{ fontSize:13, color:T.bodyText, fontWeight:500 }}>{note}</span>
                      </div>
                      <span style={{ color:"#6366f1", fontSize:14 }}>→</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 0", gap:8 }}>
                  <span style={{ fontSize:36 }}>📄</span>
                  <p style={{ color:T.dimText, fontSize:13 }}>No docs generated yet</p>
                  <button onClick={() => navigate("/docs")}
                    style={{ padding:"8px 16px", borderRadius:8, background:"linear-gradient(135deg,#6366f1,#818cf8)", border:"none", color:"white", fontSize:13, fontWeight:600, cursor:"pointer", marginTop:4 }}>
                    Generate Docs →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div>
            <h3 style={{ ...boxTitle, marginBottom:16 }}>⚡ Quick Actions</h3>
            <div className="bottom-grid">
              {quickActions.map((action, i) => (
                <div key={i}
                  style={{ ...card({ textAlign:"center" }), transition:"all 0.25s", cursor:"default" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=`${action.color}55`; e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=`0 8px 28px ${action.color}22`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=T.cardBorder; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=T.cardShadow; }}
                >
                  <div style={{ width:52, height:52, borderRadius:14, background:`${action.color}18`, border:`1px solid ${action.color}35`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px", fontSize:26 }}>
                    {action.icon}
                  </div>
                  <h4 style={{ fontSize:15, fontWeight:700, color:T.titleText, marginBottom:4 }}>{action.title}</h4>
                  <p style={{ fontSize:12, color:T.dimText, marginBottom:14 }}>{action.desc}</p>
                  <button style={actionBtn(action.color)} onClick={action.action}
                    onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
                    onMouseLeave={e => e.currentTarget.style.opacity="1"}
                  >
                    {action.btn}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;