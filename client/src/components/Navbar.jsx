import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RateLimitToast from "./RateLimitToast";
import {
  getNotifications,
  markAllRead,
  markOneRead,
  clearNotifications,
  timeAgo,
} from "../utils/notifications";



const PAGE_TITLES = {
  "/dashboard":       { title: "Dashboard",     icon: "📊" },
  "/topics":          { title: "My Topics",     icon: "📚" },
  "/docs":            { title: "Documentation", icon: "📄" },
  "/docs/view":       { title: "Documentation", icon: "📄" },
  "/flashcards":      { title: "Flashcards",    icon: "🃏" },
  "/flashcards/view": { title: "Flashcards",    icon: "🃏" },
  "/quiz":            { title: "Quizzes",       icon: "🧠" },
  "/quiz/view":       { title: "Quizzes",       icon: "🧠" },
  "/tutor":           { title: "AI Tutor",      icon: <span className="vai-ai-icon">
      ✨
    </span> },
    "/chat-document": { title: "Chat with Document", icon: <span className="vai-ai-icon">
      📄
    </span>  },
  "/planner":         { title: "Study Planner", icon: "📅" },
  "/profile":         { title: "Profile",       icon: "👤" },
  "/settings":        { title: "Settings",      icon: "⚙️" },
  "/history":         { title: "History",       icon: "🕘" },
};

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const name   = localStorage.getItem("name")   || "User";
  const email  = localStorage.getItem("email")  || "";
  const avatar = localStorage.getItem("avatar") || "";

  const initials = name
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [search,      setSearch]      = useState("");
  const [rateLimitMsg, setRateLimitMsg] = useState("");
  const [showNotifs,  setShowNotifs]  = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifs,      setNotifs]      = useState([]);
  const [theme,       setTheme]       = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  const page   = PAGE_TITLES[location.pathname] || { title: "VAI", icon: "⚡" };
  const isDark = theme === "dark";

useEffect(() => {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  localStorage.setItem("theme", theme);

  window.dispatchEvent(new CustomEvent("themeChanged", { detail: { theme } }));
}, [theme]);

  /*--- Rate Limit----*/
  useEffect(() => {
  const handler = (e) => setRateLimitMsg(e.detail.message);
  window.addEventListener("rateLimitHit", handler);
  return () => window.removeEventListener("rateLimitHit", handler);
}, []);

  /* ── Notifications ── */
  useEffect(() => {
    const load = () => setNotifs(getNotifications());
    load();
    window.addEventListener("notificationsUpdated", load);
    return () => window.removeEventListener("notificationsUpdated", load);
  }, []);

  /* ── Close dropdowns on outside click ── */
  useEffect(() => {
    const handler = e => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifs.filter(n => n.unread).length;

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  // Tells Sidebar to open/close the mobile drawer
  const toggleSidebar = () => {
    window.dispatchEvent(new CustomEvent("toggleSidebar"));
  };

  const handleSearchKey = e => {
    if (e.key === "Enter" && search.trim()) {
      navigate("/topics");
      setSearch("");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const notifColor = type => ({
    doc:       "#6366f1",
    flashcard: "#a855f7",
    quiz:      "#3b82f6",
    topic:     "#10b981",
    streak:    "#f59e0b",
  }[type] || "#64748b");

  /* ─────────────────────────────────────────
     THEME-AWARE STYLE TOKENS
  ───────────────────────────────────────── */
  const S = {
    navbar: {
      height: 68,
      background: isDark
        ? "rgba(8,8,16,0.85)"
        : "rgba(255,255,255,0.75)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: isDark
        ? "1px solid rgba(255,255,255,0.06)"
        : "1px solid rgba(109,40,217,0.14)",
      boxShadow: isDark
        ? "none"
        : "0 4px 24px rgba(109,40,217,0.09)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      gap: 16,
      position: "sticky",
      top: 0,
      zIndex: 99,
      flexShrink: 0,
    },

    mobileMenuBtn: {
      width: 38,
      height: 38,
      borderRadius: 9,
      border: isDark
        ? "1px solid rgba(255,255,255,0.07)"
        : "1.5px solid rgba(109,40,217,0.18)",
      background: isDark
        ? "rgba(255,255,255,0.04)"
        : "rgba(237,233,254,0.65)",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: 18,
      color: isDark ? "#e2e8f0" : "#3b0764",
      flexShrink: 0,
      transition: "background 0.2s, border-color 0.2s",
    },

    pageTitle: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      minWidth: 180,
    },

    pageIcon: { fontSize: 22, flexShrink: 0 },

    pageName: {
      fontFamily: "'Syne', sans-serif",
      fontSize: 17,
      fontWeight: 700,
      color: isDark ? "#f1f5f9" : "#2e1065",
      lineHeight: 1.2,
    },

    pageDate: {
      fontSize: 11,
      color: isDark ? "#475569" : "#7c6fa0",
      marginTop: 2,
    },

    searchWrap: {
      flex: 1,
      maxWidth: 400,
      position: "relative",
      display: "flex",
      alignItems: "center",
    },

    searchIcon: {
      position: "absolute",
      left: 12,
      fontSize: 14,
      pointerEvents: "none",
      color: isDark ? "#475569" : "#a78bfa",
    },

    searchInput: {
      width: "100%",
      padding: "9px 36px",
      borderRadius: 10,
      border: isDark
        ? "1px solid rgba(255,255,255,0.07)"
        : "1.5px solid rgba(109,40,217,0.18)",
      background: isDark
        ? "rgba(255,255,255,0.04)"
        : "rgba(237,233,254,0.65)",
      color: isDark ? "#f1f5f9" : "#3b0764",
      fontSize: 13,
      outline: "none",
      fontFamily: "inherit",
      boxSizing: "border-box",
      transition: "border-color 0.2s, background 0.2s",
    },

    clearBtn: {
      position: "absolute",
      right: 10,
      background: "none",
      border: "none",
      color: isDark ? "#475569" : "#a78bfa",
      cursor: "pointer",
      fontSize: 13,
    },

    right: {
      display: "flex",
      alignItems: "center",
      gap: 8,
    },

    iconBtn: {
      position: "relative",
      width: 38,
      height: 38,
      borderRadius: 9,
      border: isDark
        ? "1px solid rgba(255,255,255,0.07)"
        : "1.5px solid rgba(109,40,217,0.18)",
      background: isDark
        ? "rgba(255,255,255,0.04)"
        : "rgba(237,233,254,0.65)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: 17,
      transition: "background 0.2s, border-color 0.2s",
    },

    badge: {
      position: "absolute",
      top: -4,
      right: -4,
      minWidth: 17,
      height: 17,
      borderRadius: 100,
      background: "#ef4444",
      fontSize: 10,
      fontWeight: 700,
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: isDark
        ? "2px solid #080810"
        : "2px solid #e8e4f8",
      padding: "0 3px",
    },

    avatarBtn: {
      width: 38,
      height: 38,
      borderRadius: "50%",
      border: isDark
        ? "2px solid rgba(124,58,237,0.5)"
        : "2px solid rgba(109,40,217,0.4)",
      background: "none",
      cursor: "pointer",
      padding: 0,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    avatarImg: {
      width: 34,
      height: 34,
      borderRadius: "50%",
      objectFit: "cover",
    },

    avatarInitials: {
      width: 34,
      height: 34,
      borderRadius: "50%",
      background: "linear-gradient(135deg,#6d28d9,#a855f7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 700,
      color: "white",
    },

    /* ── Dropdowns ── */
    dropdown: {
      position: "absolute",
      top: "calc(100% + 10px)",
      right: 0,
      width: 320,
      background: isDark
        ? "rgba(13,13,26,0.98)"
        : "rgba(248,245,255,0.97)",
      backdropFilter: "blur(30px)",
      WebkitBackdropFilter: "blur(30px)",
      border: isDark
        ? "1px solid rgba(255,255,255,0.09)"
        : "1px solid rgba(109,40,217,0.15)",
      borderRadius: 14,
      boxShadow: isDark
        ? "0 20px 50px rgba(0,0,0,0.6)"
        : "0 8px 40px rgba(109,40,217,0.16)",
      zIndex: 1000,
      overflow: "hidden",
    },

    dropHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 14px",
      borderBottom: isDark
        ? "1px solid rgba(255,255,255,0.06)"
        : "1px solid rgba(109,40,217,0.08)",
    },

    dropTitle: {
      fontSize: 13,
      fontWeight: 700,
      color: isDark ? "#f1f5f9" : "#2e1065",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },

    unreadPill: {
      fontSize: 10,
      fontWeight: 700,
      padding: "2px 7px",
      borderRadius: 100,
      background: isDark
        ? "rgba(124,58,237,0.12)"
        : "rgba(109,40,217,0.1)",
      border: isDark
        ? "1px solid rgba(124,58,237,0.25)"
        : "1px solid rgba(109,40,217,0.2)",
      color: "#6d28d9",
    },

    headerAction: {
      fontSize: 11,
      fontWeight: 700,
      color: "#a855f7",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
    },

    notifList: {
      maxHeight: 320,
      overflowY: "auto",
    },

    emptyNotif: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "28px 20px",
      textAlign: "center",
    },

    notifItem: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      padding: "11px 14px",
      borderBottom: isDark
        ? "1px solid rgba(255,255,255,0.04)"
        : "1px solid rgba(109,40,217,0.06)",
      cursor: "pointer",
      transition: "background 0.2s",
    },

    notifIcon:  { fontSize: 18, flexShrink: 0, marginTop: 1 },

    notifText: {
      fontSize: 13,
      color: isDark ? "#e2e8f0" : "#2e1065",
      lineHeight: 1.4,
      marginBottom: 3,
    },

    notifTime: {
      fontSize: 11,
      color: isDark ? "#475569" : "#7c6fa0",
    },

    unreadDot: {
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: "#a855f7",
      flexShrink: 0,
      marginTop: 4,
    },

    /* ── Profile dropdown ── */
    profileHeader: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "14px 14px 12px",
    },

    profileAvatar: {
      width: 38,
      height: 38,
      borderRadius: "50%",
      background: "linear-gradient(135deg,#6d28d9,#a855f7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 700,
      color: "white",
      flexShrink: 0,
      overflow: "hidden",
    },

    profileName: {
      fontSize: 13,
      fontWeight: 700,
      color: isDark ? "#f1f5f9" : "#2e1065",
    },

    profileEmail: {
      fontSize: 11,
      color: isDark ? "#475569" : "#7c6fa0",
      marginTop: 2,
    },

    divider: {
      height: 1,
      background: isDark
        ? "rgba(255,255,255,0.06)"
        : "rgba(109,40,217,0.08)",
      margin: "2px 0",
    },

    dropItem: {
      width: "100%",
      padding: "10px 14px",
      background: "transparent",
      border: "none",
      color: isDark ? "#94a3b8" : "#5b21b6",
      fontSize: 13,
      fontWeight: 500,
      cursor: "pointer",
      textAlign: "left",
      display: "flex",
      alignItems: "center",
      gap: 10,
      transition: "background 0.15s",
      fontFamily: "inherit",
    },
  };

  /* ── Hover helpers ── */
  const hoverIconBtn = e =>
    (e.currentTarget.style.background = isDark
      ? "rgba(255,255,255,0.08)"
      : "rgba(221,214,254,0.9)");

  const unhoverIconBtn = e =>
    (e.currentTarget.style.background = isDark
      ? "rgba(255,255,255,0.04)"
      : "rgba(237,233,254,0.65)");

  const hoverItem = e =>
    (e.currentTarget.style.background = isDark
      ? "rgba(124,58,237,0.1)"
      : "rgba(109,40,217,0.08)");

  const unhoverItem = e =>
    (e.currentTarget.style.background = "transparent");

  const hoverDanger = e =>
    (e.currentTarget.style.background = isDark
      ? "rgba(239,68,68,0.1)"
      : "rgba(220,38,38,0.07)");

  const unhoverDanger = e =>
    (e.currentTarget.style.background = "transparent");

  const hoverNotif = e =>
    (e.currentTarget.style.background = isDark
      ? "rgba(255,255,255,0.03)"
      : "rgba(109,40,217,0.04)");

  const unhoverNotif = (e, isUnread) =>
    (e.currentTarget.style.background = isUnread
      ? isDark ? "rgba(124,58,237,0.06)" : "rgba(109,40,217,0.04)"
      : "transparent");

  /* ─────────────────────────────────────── */

  return (
    <div style={S.navbar}>

      {/* ✅ MOBILE HAMBURGER — hidden by default, shown only ≤768px via .mobile-menu-btn CSS */}
      <button
        className="mobile-menu-btn"
        style={S.mobileMenuBtn}
        onClick={toggleSidebar}
        onMouseEnter={hoverIconBtn}
        onMouseLeave={unhoverIconBtn}
        title="Toggle menu"
      >
        ☰
      </button>

      {/* LEFT — Page title */}
      <div style={S.pageTitle}>
        <span style={S.pageIcon}>{page.icon}</span>
        <div>
          <h2 style={S.pageName}>{page.title}</h2>
          <p style={S.pageDate}>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {/* CENTER — Search */}
      <div style={S.searchWrap}>
        <span style={S.searchIcon}>🔍</span>
        <input
          placeholder="Search topics, docs, flashcards..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={handleSearchKey}
          onFocus={e => {
            e.target.style.background = isDark
              ? "rgba(255,255,255,0.07)"
              : "rgba(255,255,255,0.95)";
            e.target.style.borderColor = isDark
              ? "rgba(124,58,237,0.5)"
              : "rgba(109,40,217,0.45)";
            e.target.style.boxShadow = isDark
              ? "0 0 0 3px rgba(124,58,237,0.12)"
              : "0 0 0 3px rgba(109,40,217,0.1)";
          }}
          onBlur={e => {
            e.target.style.background = isDark
              ? "rgba(255,255,255,0.04)"
              : "rgba(237,233,254,0.65)";
            e.target.style.borderColor = isDark
              ? "rgba(255,255,255,0.07)"
              : "rgba(109,40,217,0.18)";
            e.target.style.boxShadow = "none";
          }}
          style={S.searchInput}
        />
        {search && (
          <button style={S.clearBtn} onClick={() => setSearch("")}>✕</button>
        )}
      </div>

      {/* RIGHT — Actions */}
      <div style={S.right}>

        {/* Theme toggle */}
        {/* <button
          style={S.iconBtn}
          onClick={toggleTheme}
          onMouseEnter={hoverIconBtn}
          onMouseLeave={unhoverIconBtn}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? "☀️" : "🌙"}
        </button> */}

        {/* Notifications */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button
            style={S.iconBtn}
            onMouseEnter={hoverIconBtn}
            onMouseLeave={unhoverIconBtn}
            onClick={() => { setShowNotifs(v => !v); setShowProfile(false); }}
          >
            🔔
            {unreadCount > 0 && <span style={S.badge}>{unreadCount}</span>}
          </button>

          {showNotifs && (
            <div style={S.dropdown}>
              <div style={S.dropHeader}>
                <span style={S.dropTitle}>
                  Notifications
                  {unreadCount > 0 && (
                    <span style={S.unreadPill}>{unreadCount} new</span>
                  )}
                </span>
                <div style={{ display: "flex", gap: 10 }}>
                  {unreadCount > 0 && (
                    <button style={S.headerAction} onClick={() => markAllRead()}>
                      ✓ Mark all read
                    </button>
                  )}
                  {notifs.length > 0 && (
                    <button
                      style={{ ...S.headerAction, color: "#ef4444" }}
                      onClick={() => clearNotifications()}
                    >
                      🗑 Clear
                    </button>
                  )}
                </div>
              </div>

              <div style={S.notifList}>
                {notifs.length === 0 ? (
                  <div style={S.emptyNotif}>
                    <span style={{ fontSize: 32 }}>🔔</span>
                    <p style={{ color: isDark ? "#475569" : "#7c6fa0", fontSize: 13, marginTop: 8 }}>
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifs.map(n => (
                    <div
                      key={n.id}
                      style={{
                        ...S.notifItem,
                        background: n.unread
                          ? isDark
                            ? "rgba(124,58,237,0.06)"
                            : "rgba(109,40,217,0.05)"
                          : "transparent",
                        borderLeft: `3px solid ${n.unread ? notifColor(n.type) : "transparent"}`,
                      }}
                      onClick={() => markOneRead(n.id)}
                      onMouseEnter={hoverNotif}
                      onMouseLeave={e => unhoverNotif(e, n.unread)}
                    >
                      <span style={S.notifIcon}>{n.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
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

        {/* Profile */}
        <div style={{ position: "relative" }} ref={profileRef}>
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
            <div style={{ ...S.dropdown, width: 220 }}>
              <div style={S.profileHeader}>
                <div style={S.profileAvatar}>
                  {avatar
                    ? <img src={avatar} alt="av" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                    : initials
                  }
                </div>
                <div>
                  <div style={S.profileName}>{name}</div>
                  <div style={S.profileEmail}>
                    {email.slice(0, 22)}{email.length > 22 ? "…" : ""}
                  </div>
                </div>
              </div>

              <div style={S.divider} />

              {[
                { icon: "👤", label: "My Profile",  path: "/profile"   },
                { icon: "⚙️", label: "Settings",    path: "/settings"  },
                { icon: "📊", label: "Dashboard",   path: "/dashboard" },
              ].map(item => (
                <button
                  key={item.path}
                  style={S.dropItem}
                  onClick={() => { navigate(item.path); setShowProfile(false); }}
                  onMouseEnter={hoverItem}
                  onMouseLeave={unhoverItem}
                >
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}

              <div style={S.divider} />

              <button
                style={{ ...S.dropItem, color: isDark ? "#fca5a5" : "#b91c1c" }}
                onClick={handleLogout}
                onMouseEnter={hoverDanger}
                onMouseLeave={unhoverDanger}
              >
                <span>🚪</span> Sign Out
              </button>
            </div>
          )}
        </div>

      </div>

      <RateLimitToast
        message={rateLimitMsg}
        onClose={() => setRateLimitMsg("")}
      />
    </div>
  );
}

export default Navbar;