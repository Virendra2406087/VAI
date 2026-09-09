import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Brain,
  Layers3,
  CalendarCheck,
  FileText,
  History,
  MessageSquare,
  BookOpen,LayoutDashboard,User,
  Settings,
  LogOut,
  Sparkle,
  Sparkles,
} from "lucide-react";

const MENU = [
  { to: "/dashboard", icon: <LayoutDashboard size={20}/>, label: "Dashboard" },
  { to: "/topics", icon: <BookOpen size={20}/>, label: "My Topics" },
  { to: "/docs", icon:<FileText size={20}/>, label: "Documentation" },
  { to: "/flashcards", icon: <Layers3 size={20}/>, label: "Flashcards" },
  { to: "/quiz", icon: <Brain size={20}/>, label: "Quizzes" },
  { to: "/tutor", icon: <Sparkles/>, label: "AI Tutor" },

  // NEW
  { to: "/chat-document", icon: <MessageSquare size={20}/>, label: "Chat with Document" },

  { to: "/planner", icon: <CalendarCheck size={20}/>, label: "Study Planner" },
  { to: "/history", icon: <History size={20}/>, label: "History" },
];

const BOTTOM = [
  { to: "/profile", icon: <User />, label: "Profile" },
  { to: "/settings", icon: <Settings/>, label: "Settings" },
];

function Sidebar() {
  const navigate = useNavigate();

  const name = localStorage.getItem("name") || "User";
  const email = localStorage.getItem("email") || "";

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [showLogout, setShowLogout] = useState(false);

  // Mobile drawer state
  const [open, setOpen] = useState(false);

  // Theme
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  const isDark = theme === "dark";

  // Listen for theme changes
  useEffect(() => {
    const handler = (e) => setTheme(e.detail.theme);

    window.addEventListener("themeChanged", handler);

    return () => {
      window.removeEventListener("themeChanged", handler);
    };
  }, []);

  // Listen for mobile hamburger toggle
  useEffect(() => {
    const handler = () => setOpen((v) => !v);

    window.addEventListener("toggleSidebar", handler);

    return () => {
      window.removeEventListener("toggleSidebar", handler);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Close drawer after navigation
  const closeDrawer = () => setOpen(false);

  // Styles
  const S = {
    sidebar: {
      width: 220,
      minHeight: "100vh",

      background: isDark
        ? "rgba(8,8,16,0.95)"
        : "rgba(255,255,255,0.82)",

      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",

      borderRight: isDark
        ? "1px solid rgba(255,255,255,0.06)"
        : "1px solid rgba(109,40,217,0.18)",

      boxShadow: isDark
        ? "none"
        : "4px 0 32px rgba(109,40,217,0.12)",

      padding: "20px 12px",

      display: "flex",
      flexDirection: "column",

      position: "sticky",
      top: 0,

      height: "100vh",

      zIndex: 250,
      flexShrink: 0,

      transition:
        "background 0.3s, border-color 0.3s, box-shadow 0.3s",
    },

    logo: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "4px 8px",
      marginBottom: 28,
    },

    logoImg: {
      width: 32,
      height: 32,
      borderRadius: 8,
      objectFit: "cover",

      border: isDark
        ? "1px solid rgba(124,58,237,0.3)"
        : "1px solid rgba(109,40,217,0.3)",

      flexShrink: 0,
    },

    logoText: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 20,
      fontWeight: 800,

      background: isDark
        ? "linear-gradient(135deg,#a855f7,#6366f1)"
        : "linear-gradient(135deg,#4c1d95,#7c3aed)",

      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",

      letterSpacing: "0.04em",
    },

    nav: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      flex: 1,

      overflowY: "auto",
    },

    sectionLabel: {
      fontSize: 10,
      fontWeight: 700,

      color: isDark ? "#334155" : "#a78bfa",

      textTransform: "uppercase",
      letterSpacing: "0.12em",

      padding: "0 10px",
      marginBottom: 4,
      marginTop: 0,
    },

    link: {
      display: "flex",
      alignItems: "center",

      gap: 10,

      padding: "9px 12px",

      borderRadius: 8,

      fontSize: 13,
      fontWeight: 500,

      color: isDark ? "#64748b" : "#4c3a7a",

      textDecoration: "none",

      transition: "all 0.2s",
    },

    linkActive: {
      background: isDark
        ? "rgba(124,58,237,0.15)"
        : "linear-gradient(135deg,rgba(109,40,217,0.14),rgba(168,85,247,0.07))",

      color: isDark ? "#a855f7" : "#4c1d95",

      fontWeight: 700,

      borderLeft: isDark
        ? "3px solid #7c3aed"
        : "3px solid #6d28d9",

      paddingLeft: 9,
    },

    linkIcon: {
      fontSize: 16,
      width: 20,
      textAlign: "center",
      flexShrink: 0,
    },

    bottom: {
      display: "flex",
      flexDirection: "column",
      gap: 2,

      marginTop: 8,
      paddingTop: 12,

      borderTop: isDark
        ? "1px solid rgba(255,255,255,0.05)"
        : "1px solid rgba(109,40,217,0.12)",
    },

    userCard: {
      display: "flex",
      alignItems: "center",

      gap: 10,

      padding: "10px",

      borderRadius: 10,

      marginTop: 8,

      cursor: "pointer",

      border: isDark
        ? "1px solid rgba(255,255,255,0.06)"
        : "1px solid rgba(109,40,217,0.18)",

      background: isDark
        ? "rgba(255,255,255,0.03)"
        : "linear-gradient(135deg,rgba(109,40,217,0.08),rgba(168,85,247,0.04))",

      transition: "all 0.2s",
    },

    userAvatar: {
      width: 32,
      height: 32,

      borderRadius: "50%",

      background:
        "linear-gradient(135deg,#6d28d9,#a855f7)",

      display: "flex",
      alignItems: "center",
      justifyContent: "center",

      fontSize: 12,
      fontWeight: 700,

      color: "white",

      flexShrink: 0,
    },

    userInfo: {
      flex: 1,
      minWidth: 0,
    },

    userName: {
      fontSize: 13,
      fontWeight: 700,

      color: isDark ? "#e2e8f0" : "#2e1065",

      lineHeight: 1.2,
    },

    userEmail: {
      fontSize: 10,

      color: isDark ? "#475569" : "#7c6fa0",

      lineHeight: 1.2,
    },

    dotsIcon: {
      fontSize: 14,

      color: isDark ? "#475569" : "#7c6fa0",

      flexShrink: 0,
    },

    logoutBtn: {
      width: "100%",

      padding: "10px",

      borderRadius: 8,

      background: isDark
        ? "rgba(239,68,68,0.1)"
        : "rgba(220,38,38,0.07)",

      border: isDark
        ? "1px solid rgba(239,68,68,0.25)"
        : "1px solid rgba(220,38,38,0.2)",

      color: isDark ? "#fca5a5" : "#b91c1c",

      fontSize: 13,
      fontWeight: 600,

      cursor: "pointer",

      marginTop: 6,

      textAlign: "center",

      transition: "all 0.2s",

      fontFamily: "inherit",
    },
  };

  const hoverCard = (e) => {
    e.currentTarget.style.background = isDark
      ? "rgba(255,255,255,0.06)"
      : "rgba(109,40,217,0.13)";

    e.currentTarget.style.borderColor = isDark
      ? "rgba(124,58,237,0.25)"
      : "rgba(109,40,217,0.32)";
  };

  const unhoverCard = (e) => {
    e.currentTarget.style.background = isDark
      ? "rgba(255,255,255,0.03)"
      : "linear-gradient(135deg,rgba(109,40,217,0.08),rgba(168,85,247,0.04))";

    e.currentTarget.style.borderColor = isDark
      ? "rgba(255,255,255,0.06)"
      : "rgba(109,40,217,0.18)";
  };

  const hoverLogout = (e) => {
    e.currentTarget.style.background = isDark
      ? "rgba(239,68,68,0.18)"
      : "rgba(220,38,38,0.13)";
  };

  const unhoverLogout = (e) => {
    e.currentTarget.style.background = isDark
      ? "rgba(239,68,68,0.1)"
      : "rgba(220,38,38,0.07)";
  };

  const linkStyle = ({ isActive }) => ({
    ...S.link,
    ...(isActive ? S.linkActive : {}),
  });

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`sidebar-backdrop ${
          open ? "show" : ""
        }`}
        onClick={closeDrawer}
      />

      {/* Sidebar */}
      <div
        className={`sidebar ${open ? "open" : ""}`}
        style={S.sidebar}
      >
        {/* LOGO */}
        <div style={S.logo}>
          <img
            src="/VAI.jpeg"
            alt="VAI"
            style={S.logoImg}
          />

          <span style={S.logoText}>VAI</span>
        </div>

        {/* MAIN MENU */}
        <nav style={S.nav}>
          <p style={S.sectionLabel}>Menu</p>

          {MENU.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={linkStyle}
              onClick={closeDrawer}
            >
              <span style={S.linkIcon}>
                {item.icon}
              </span>

              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* BOTTOM */}
        <div style={S.bottom}>
          <p style={S.sectionLabel}>Account</p>

          {BOTTOM.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={linkStyle}
              onClick={closeDrawer}
            >
              <span style={S.linkIcon}>
                {item.icon}
              </span>

              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* USER CARD */}
          <div
            style={S.userCard}
            onClick={() =>
              setShowLogout((v) => !v)
            }
            onMouseEnter={hoverCard}
            onMouseLeave={unhoverCard}
          >
            <div style={S.userAvatar}>
              {initials}
            </div>

            <div style={S.userInfo}>
              <div style={S.userName}>
                {name.split(" ")[0]}
              </div>

              <div style={S.userEmail}>
                {email.slice(0, 18)}
                {email.length > 18 ? "…" : ""}
              </div>
            </div>

            <span style={S.dotsIcon}>⋮</span>
          </div>

          {/* LOGOUT */}
          {showLogout && (
            <button
              style={S.logoutBtn}
              onClick={handleLogout}
              onMouseEnter={hoverLogout}
              onMouseLeave={unhoverLogout}
            >
              <LogOut/> Sign Out
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;