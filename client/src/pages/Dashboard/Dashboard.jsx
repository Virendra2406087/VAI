// client/src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import Card from "../../components/Card";
import axios from "axios";

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, BarChart, Bar
} from "recharts";

// ✅ Custom chart tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(13,13,26,0.95)", border: "1px solid rgba(124,58,237,0.3)",
        borderRadius: 10, padding: "10px 14px", backdropFilter: "blur(20px)",
      }}>
        <p style={{ color: "#a855f7", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{label}</p>
        <p style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 700 }}>{payload[0].value}{payload[0].name === "progress" ? "%" : "h"}</p>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats]                     = useState(null);
  const [recommendedTopics, setRecommended]   = useState([]);
  const [recentNotes, setRecentNotes]         = useState([]);
  const [continueLearning, setContinue]       = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState("");

  const progressData = [
    { day: "Mon", progress: 20 },
    { day: "Tue", progress: 40 },
    { day: "Wed", progress: 35 },
    { day: "Thu", progress: 50 },
    { day: "Fri", progress: 65 },
    { day: "Sat", progress: 80 },
    { day: "Sun", progress: 90 },
  ];

  const weeklyActivity = [
    { day: "Mon", hours: 1 },
    { day: "Tue", hours: 2 },
    { day: "Wed", hours: 1.5 },
    { day: "Thu", hours: 3 },
    { day: "Fri", hours: 2 },
    { day: "Sat", hours: 4 },
    { day: "Sun", hours: 2.5 },
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/dashboard", {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
        });
        const d = res.data;
        setStats(d);
        setRecommended(d.recommendedTopics || []);
        setRecentNotes(d.recentNotes || []);
        setContinue(d.continueLearning || null);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard. Is the server running?");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // ─── LOADING ───
  if (loading) return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 16 }}>
          <div style={loaderStyle} />
          <p style={{ color: "#64748b", fontSize: 14 }}>Loading dashboard...</p>
        </div>
      </div>
    </div>
  );

  // ─── ERROR ───
  if (error) return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />
        <div style={{ padding: 32 }}>
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: "16px 20px", color: "#fca5a5", fontSize: 14 }}>
            ❌ {error}
          </div>
        </div>
      </div>
    </div>
  );

  const statCards = [
    { title: "Study Streak", value: `${stats?.streak ?? 0} 🔥`, icon: "🔥", color: "#f59e0b", sub: "Keep it going!" },
    { title: "Topics Completed", value: stats?.topicsCompleted ?? 0, icon: "📚", color: "#7c3aed", sub: `${stats?.totalDocs ?? 0} docs generated` },
    { title: "Flashcards Created", value: stats?.flashcardsReviewed ?? 0, icon: "🃏", color: "#6366f1", sub: "Ready to review" },
    { title: "Quiz Accuracy", value: `${stats?.quizAccuracy ?? 0}%`, icon: "🎯", color: "#10b981", sub: `${stats?.totalQuizzes ?? 0} quizzes taken` },
  ];

  const quickActions = [
    { title: "Flashcards", desc: "Review your cards", icon: "🃏", color: "#6366f1", path: "/flashcards", btn: "Study Now" },
    { title: "Take Quiz", desc: "Test your knowledge", icon: "🧠", color: "#7c3aed", path: "/quiz", btn: "Start Quiz" },
    { title: "AI Tutor", desc: "Ask anything", icon: "🤖", color: "#a855f7", path: "/tutor", btn: "Chat Now" },
    { title: "Study Planner", desc: "Manage your schedule", icon: "📅", color: "#3b82f6", path: "/planner", btn: "View Plan" },
  ];

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />

        <div className="page-content" style={{ padding: 28 }}>

          {/* ─── HEADER ─── */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 28, fontWeight: 800,
              background: "linear-gradient(135deg, #f1f5f9, #a855f7)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text", marginBottom: 6,
            }}>
              Good morning 👋
            </h1>
            <p style={{ color: "#64748b", fontSize: 14 }}>
              Here's your learning overview for today.
            </p>
          </div>

          {/* ─── STAT CARDS ─── */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {statCards.map((s, i) => (
              <Card key={i} title={s.title} value={s.value} icon={s.icon} color={s.color} sub={s.sub} />
            ))}
          </div>

          {/* ─── CHARTS ─── */}
          <div className="charts-grid" style={{ marginBottom: 24 }}>

            <div className="chart-box">
              <div style={chartHeaderStyle}>
                <h3 style={chartTitleStyle}>📈 Learning Progress</h3>
                <span style={chartBadgeStyle}>This Week</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={progressData}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone" dataKey="progress" name="progress"
                    stroke="url(#lineGrad)" strokeWidth={3}
                    dot={{ fill: "#a855f7", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#a855f7", boxShadow: "0 0 10px #a855f7" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <div style={chartHeaderStyle}>
                <h3 style={chartTitleStyle}>⚡ Weekly Activity</h3>
                <span style={chartBadgeStyle}>Hours / Day</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyActivity} barSize={28}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="hours" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* ─── MIDDLE GRID ─── */}
          <div className="middle-grid" style={{ marginBottom: 24 }}>

            {/* Recommended Topics */}
            <div className="box">
              <h3 style={boxTitleStyle}>📚 Recommended Topics</h3>
              {recommendedTopics.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  {recommendedTopics.map((topic, i) => (
                    <div key={i} style={topicItemStyle}
                      onClick={() => navigate("/topics")}
                    >
                      <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{topic}</span>
                      <span style={{ color: "#a855f7", fontSize: 14 }}>→</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={emptyStyle}>No topics yet. <span style={{ color: "#a855f7", cursor: "pointer" }} onClick={() => navigate("/topics")}>Create one →</span></p>
              )}
            </div>

            {/* Continue Learning */}
            <div className="box" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.08))", border: "1px solid rgba(124,58,237,0.2)" }}>
              <h3 style={boxTitleStyle}>▶️ Continue Learning</h3>
              {continueLearning ? (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>{continueLearning.topic}</p>
                  <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>{continueLearning.cardsLeft} cards available</p>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 10, marginBottom: 16 }}>
                    <div style={{ height: "100%", width: "45%", background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: 10 }} />
                  </div>
                  <button style={actionBtnStyle} onClick={() => navigate("/flashcards")}>
                    Start Reviewing →
                  </button>
                </div>
              ) : (
                <p style={emptyStyle}>No active topic. <span style={{ color: "#a855f7", cursor: "pointer" }} onClick={() => navigate("/topics")}>Pick one →</span></p>
              )}
            </div>

            {/* Recent Notes */}
            <div className="box">
              <h3 style={boxTitleStyle}>📝 Recent Notes</h3>
              {recentNotes.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
                  {recentNotes.map((note, i) => (
                    <div key={i} style={noteItemStyle}>
                      <span style={{ fontSize: 14, marginRight: 8 }}>📄</span>
                      <span style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>{note}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={emptyStyle}>No docs yet. <span style={{ color: "#a855f7", cursor: "pointer" }} onClick={() => navigate("/documentation")}>Generate one →</span></p>
              )}
            </div>

          </div>

          {/* ─── QUICK ACTIONS ─── */}
          <div>
            <h3 style={{ ...boxTitleStyle, marginBottom: 16 }}>⚡ Quick Actions</h3>
            <div className="bottom-grid">
              {quickActions.map((action, i) => (
                <div key={i} className="box"
                  style={{ textAlign: "center", transition: "all 0.25s", cursor: "default" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${action.color}55`; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{
                    fontSize: 28, marginBottom: 10,
                    width: 52, height: 52, borderRadius: 14,
                    background: `${action.color}18`,
                    border: `1px solid ${action.color}35`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 12px",
                  }}>{action.icon}</div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>{action.title}</h4>
                  <p style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>{action.desc}</p>
                  <button
                    style={{ ...actionBtnStyle, background: `linear-gradient(135deg, ${action.color}, ${action.color}cc)` }}
                    onClick={() => navigate(action.path)}
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

// ─── SHARED STYLES ───
const chartHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 };
const chartTitleStyle  = { fontSize: 15, fontWeight: 700, color: "#f1f5f9" };
const chartBadgeStyle  = { fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 100, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", color: "#a855f7", letterSpacing: "0.05em" };
const boxTitleStyle    = { fontSize: 14, fontWeight: 700, color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.06em" };
const topicItemStyle   = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", transition: "all 0.2s" };
const noteItemStyle    = { display: "flex", alignItems: "center", padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" };
const emptyStyle       = { fontSize: 13, color: "#475569", marginTop: 12, lineHeight: 1.6 };
const actionBtnStyle   = { padding: "9px 18px", borderRadius: 8, background: "linear-gradient(135deg, #7c3aed, #a855f7)", border: "none", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "'DM Sans', sans-serif" };
const loaderStyle      = { width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.2)", borderTop: "3px solid #a855f7", animation: "spin 0.8s linear infinite" };

export default Dashboard;