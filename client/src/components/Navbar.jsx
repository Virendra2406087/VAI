import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getNotifications, markAllRead,
  markOneRead, clearNotifications, timeAgo
} from "../utils/notifications";

const PAGE_TITLES = {
  "/dashboard":       { title:"Dashboard",     icon:"📊" },
  "/topics":          { title:"My Topics",     icon:"📚" },
  "/docs":            { title:"Documentation", icon:"📄" },
  "/docs/view":       { title:"Documentation", icon:"📄" },
  "/flashcards":      { title:"Flashcards",    icon:"🃏" },
  "/flashcards/view": { title:"Flashcards",    icon:"🃏" },
  "/quiz":            { title:"Quizzes",       icon:"🧠" },
  "/quiz/view":       { title:"Quizzes",       icon:"🧠" },
  "/tutor":           { title:"AI Tutor",      icon:"🤖" },
  "/planner":         { title:"Study Planner", icon:"📅" },
  "/profile":         { title:"Profile",       icon:"👤" },
  "/settings":        { title:"Settings",      icon:"⚙️" },
  "/history":         { title:"History",       icon:"🕘" },
};

function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const name     = localStorage.getItem("name")   || "User";
  const email    = localStorage.getItem("email")  || "";
  const avatar   = localStorage.getItem("avatar") || "";
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const [search,      setSearch]      = useState("");
  const [showNotifs,  setShowNotifs]  = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs,      setNotifs]      = useState([]);
  const [theme,       setTheme]       = useState("dark");

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  const page = PAGE_TITLES[location.pathname] || { title:"VAI", icon:"⚡" };

  // ✅ Load notifications and listen for updates
  useEffect(() => {
    const load = () => setNotifs(getNotifications());
    load();
    window.addEventListener("notificationsUpdated", load);
    return () => window.removeEventListener("notificationsUpdated", load);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifs.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    markAllRead(); // ✅ updates localStorage + fires event → re-renders
  };

  const handleMarkOne = (id) => {
    markOneRead(id);
  };

  const handleClearAll = () => {
    clearNotifications();
  };

  const toggleTheme = () => {
    setTheme(t => t === "dark" ? "light" : "dark");
    document.body.classList.toggle("light-mode");
  };

  const handleSearchKey = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate("/topics");
      setSearch("");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Notification type → color
  const notifColor = (type) => {
    if (type === "doc")       return "#6366f1";
    if (type === "flashcard") return "#a855f7";
    if (type === "quiz")      return "#3b82f6";
    if (type === "topic")     return "#10b981";
    if (type === "streak")    return "#f59e0b";
    return "#64748b";
  };

  return (
    <div style={S.navbar}>

      {/* ── LEFT: Page Title ── */}
      <div style={S.pageTitle}>
        <span style={S.pageIcon}>{page.icon}</span>
        <div>
          <h2 style={S.pageName}>{page.title}</h2>
          <p style={S.pageDate}>
            {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}
          </p>
        </div>
      </div>

      {/* ── CENTER: Search ── */}
      <div style={S.searchWrap}>
        <span style={S.searchIcon}>🔍</span>
        <input
          placeholder="Search topics, docs, flashcards..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearchKey}
          style={S.searchInput}
        />
        {search && (
          <button style={S.clearBtn} onClick={() => setSearch("")}>✕</button>
        )}
      </div>

      {/* ── RIGHT: Actions ── */}
      <div style={S.right}>

        {/* Theme */}
        <button style={S.iconBtn} onClick={toggleTheme} title="Toggle theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {/* ── NOTIFICATIONS ── */}
        <div style={{ position:"relative" }} ref={notifRef}>
          <button
            style={S.iconBtn}
            onClick={() => { setShowNotifs(v => !v); setShowProfile(false); }}
          >
            🔔
            {unreadCount > 0 && <span style={S.badge}>{unreadCount}</span>}
          </button>

          {showNotifs && (
            <div style={S.dropdown}>
              {/* Header */}
              <div style={S.dropHeader}>
                <span style={S.dropTitle}>
                  Notifications {unreadCount > 0 && <span style={S.unreadPill}>{unreadCount} new</span>}
                </span>
                <div style={{ display:"flex", gap:10 }}>
                  {unreadCount > 0 && (
                    <button style={S.headerAction} onClick={handleMarkAllRead}>
                      ✓ Mark all read
                    </button>
                  )}
                  {notifs.length > 0 && (
                    <button style={{ ...S.headerAction, color:"#ef4444" }} onClick={handleClearAll}>
                      🗑 Clear
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div style={S.notifList}>
                {notifs.length === 0 ? (
                  <div style={S.emptyNotif}>
                    <span style={{ fontSize:32 }}>🔔</span>
                    <p style={{ color:"#475569", fontSize:13, marginTop:8 }}>No notifications yet</p>
                    <p style={{ color:"#334155", fontSize:12 }}>Generate docs, flashcards or quizzes to see updates</p>
                  </div>
                ) : (
                  notifs.map(n => (
                    <div
                      key={n.id}
                      style={{
                        ...S.notifItem,
                        background: n.unread ? "rgba(124,58,237,0.06)" : "transparent",
                        borderLeft: `3px solid ${n.unread ? notifColor(n.type) : "transparent"}`,
                      }}
                      onClick={() => handleMarkOne(n.id)}
                    >
                      <span style={S.notifIcon}>{n.icon}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={S.notifText}>{n.text}</p>
                        <p style={S.notifTime}>{timeAgo(n.time)}</p>
                      </div>
                      {n.unread && <div style={S.unreadDot} />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── PROFILE ── */}
        <div style={{ position:"relative" }} ref={profileRef}>
          <button
            style={S.avatarBtn}
            onClick={() => { setShowProfile(v => !v); setShowNotifs(false); }}
          >
            {avatar
              ? <img src={avatar} alt="avatar" style={S.avatarImg} />
              : <div style={S.avatarInitials}>{initials}</div>
            }
          </button>

          {showProfile && (
            <div style={{ ...S.dropdown, width:220 }}>
              <div style={S.profileHeader}>
                <div style={S.profileAvatar}>
                  {avatar
                    ? <img src={avatar} alt="av" style={{ width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover" }} />
                    : initials
                  }
                </div>
                <div>
                  <div style={S.profileName}>{name}</div>
                  <div style={S.profileEmail}>{email.slice(0,22)}{email.length>22?"…":""}</div>
                </div>
              </div>

              <div style={S.divider} />

              {[
                { icon:"👤", label:"My Profile",  path:"/profile"   },
                { icon:"⚙️", label:"Settings",    path:"/settings"  },
                { icon:"📊", label:"Dashboard",   path:"/dashboard" },
              ].map(item => (
                <button
                  key={item.path}
                  style={S.dropItem}
                  onClick={() => { navigate(item.path); setShowProfile(false); }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}

              <div style={S.divider} />

              <button
                style={{ ...S.dropItem, color:"#fca5a5" }}
                onClick={handleLogout}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span>🚪</span> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const S = {
  navbar:        { height:68, background:"rgba(8,8,16,0.85)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 24px", gap:16, position:"sticky", top:0, zIndex:99, flexShrink:0 },
  pageTitle:     { display:"flex", alignItems:"center", gap:12, minWidth:180 },
  pageIcon:      { fontSize:22, flexShrink:0 },
  pageName:      { fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, color:"#f1f5f9", lineHeight:1.2 },
  pageDate:      { fontSize:11, color:"#475569", marginTop:2 },
  searchWrap:    { flex:1, maxWidth:400, position:"relative", display:"flex", alignItems:"center" },
  searchIcon:    { position:"absolute", left:12, fontSize:14, pointerEvents:"none", color:"#475569" },
  searchInput:   { width:"100%", padding:"9px 36px", borderRadius:10, border:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.04)", color:"#f1f5f9", fontSize:13, outline:"none", fontFamily:"sans-serif", boxSizing:"border-box" },
  clearBtn:      { position:"absolute", right:10, background:"none", border:"none", color:"#475569", cursor:"pointer", fontSize:13 },
  right:         { display:"flex", alignItems:"center", gap:8 },
  iconBtn:       { position:"relative", width:38, height:38, borderRadius:9, border:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.04)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:17 },
  badge:         { position:"absolute", top:-4, right:-4, minWidth:17, height:17, borderRadius:100, background:"#ef4444", fontSize:10, fontWeight:700, color:"white", display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #080810", padding:"0 3px" },
  avatarBtn:     { width:38, height:38, borderRadius:"50%", border:"2px solid rgba(124,58,237,0.5)", background:"none", cursor:"pointer", padding:0, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" },
  avatarImg:     { width:34, height:34, borderRadius:"50%", objectFit:"cover" },
  avatarInitials:{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"white" },
  dropdown:      { position:"absolute", top:"calc(100% + 10px)", right:0, width:320, background:"rgba(13,13,26,0.98)", backdropFilter:"blur(30px)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:14, boxShadow:"0 20px 50px rgba(0,0,0,0.6)", zIndex:1000, overflow:"hidden" },
  dropHeader:    { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)" },
  dropTitle:     { fontSize:13, fontWeight:700, color:"#f1f5f9", display:"flex", alignItems:"center", gap:8 },
  unreadPill:    { fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:100, background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.3)", color:"#a855f7" },
  headerAction:  { fontSize:11, fontWeight:700, color:"#a855f7", background:"none", border:"none", cursor:"pointer", padding:0 },
  notifList:     { maxHeight:320, overflowY:"auto" },
  emptyNotif:    { display:"flex", flexDirection:"column", alignItems:"center", padding:"28px 20px", textAlign:"center" },
  notifItem:     { display:"flex", alignItems:"flex-start", gap:10, padding:"11px 14px", borderBottom:"1px solid rgba(255,255,255,0.04)", cursor:"pointer", transition:"background 0.2s" },
  notifIcon:     { fontSize:18, flexShrink:0, marginTop:1 },
  notifText:     { fontSize:13, color:"#e2e8f0", lineHeight:1.4, marginBottom:3 },
  notifTime:     { fontSize:11, color:"#475569" },
  unreadDot:     { width:7, height:7, borderRadius:"50%", background:"#a855f7", flexShrink:0, marginTop:4 },
  profileHeader: { display:"flex", alignItems:"center", gap:10, padding:"14px 14px 12px" },
  profileAvatar: { width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"white", flexShrink:0, overflow:"hidden" },
  profileName:   { fontSize:13, fontWeight:700, color:"#f1f5f9" },
  profileEmail:  { fontSize:11, color:"#475569", marginTop:2 },
  divider:       { height:1, background:"rgba(255,255,255,0.06)", margin:"2px 0" },
  dropItem:      { width:"100%", padding:"10px 14px", background:"transparent", border:"none", color:"#94a3b8", fontSize:13, fontWeight:500, cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10, transition:"background 0.15s", fontFamily:"sans-serif" },
};

export default Navbar;