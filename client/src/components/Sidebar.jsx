import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const MENU = [
  { to:"/dashboard",  icon:"📊", label:"Dashboard"    },
  { to:"/topics",     icon:"📚", label:"My Topics"    },
  { to:"/docs",       icon:"📄", label:"Documentation" },
  { to:"/flashcards", icon:"🃏", label:"Flashcards"   },
  { to:"/quiz",       icon:"🧠", label:"Quizzes"      },
  { to:"/tutor",      icon:"🤖", label:"AI Tutor"     },
  { to:"/planner",    icon:"📅", label:"Study Planner" },
  { to:"/history",    icon:"🕘", label:"History"       },
];

const BOTTOM = [
  { to:"/profile",  icon:"👤", label:"Profile"  },
  { to:"/settings", icon:"⚙️", label:"Settings" },
];

function Sidebar() {
  const navigate = useNavigate();
  const name     = localStorage.getItem("name")  || "User";
  const email    = localStorage.getItem("email") || "";
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div style={S.sidebar}>

      {/* ── LOGO ── */}
      <div style={S.logo}>
        <img src="/VAI.jpeg" alt="VAI" style={S.logoImg} />
        <span style={S.logoText}>VAI</span>
      </div>

      {/* ── MAIN MENU ── */}
      <nav style={S.nav}>
        <p style={S.sectionLabel}>Main Menu</p>
        {MENU.map(item => (
          <NavLink key={item.to} to={item.to}
            style={({ isActive }) => ({ ...S.link, ...(isActive ? S.linkActive : {}) })}
          >
            <span style={S.linkIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ── BOTTOM ── */}
      <div style={S.bottom}>
        <p style={S.sectionLabel}>Account</p>
        {BOTTOM.map(item => (
          <NavLink key={item.to} to={item.to}
            style={({ isActive }) => ({ ...S.link, ...(isActive ? S.linkActive : {}) })}
          >
            <span style={S.linkIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        {/* USER CARD */}
        <div style={S.userCard} onClick={() => setShowLogout(v => !v)}>
          <div style={S.userAvatar}>{initials}</div>
          <div style={S.userInfo}>
            <div style={S.userName}>{name.split(" ")[0]}</div>
            <div style={S.userEmail}>{email.slice(0,18)}{email.length>18?"…":""}</div>
          </div>
          <span style={{ fontSize:12, color:"#475569" }}>⋮</span>
        </div>

        {showLogout && (
          <button style={S.logoutBtn} onClick={handleLogout}>🚪 Sign Out</button>
        )}
      </div>
    </div>
  );
}

const S = {
  sidebar:      { width:220, minHeight:"100vh", background:"rgba(8,8,16,0.95)", backdropFilter:"blur(20px)", borderRight:"1px solid rgba(255,255,255,0.06)", padding:"20px 12px", display:"flex", flexDirection:"column", position:"sticky", top:0, height:"100vh", zIndex:100, flexShrink:0 },
  logo:         { display:"flex", alignItems:"center", gap:10, padding:"4px 8px", marginBottom:28 },
  logoImg:      { width:32, height:32, borderRadius:8, objectFit:"cover", border:"1px solid rgba(124,58,237,0.3)", flexShrink:0 },
  logoText:     { fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, background:"linear-gradient(135deg,#f1f5f9,#a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", letterSpacing:"0.04em" },
  nav:          { display:"flex", flexDirection:"column", gap:2, flex:1 },
  sectionLabel: { fontSize:10, fontWeight:700, color:"#334155", textTransform:"uppercase", letterSpacing:"0.1em", padding:"0 10px", marginBottom:4, marginTop:0 },
  link:         { display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, fontSize:13, fontWeight:500, color:"#64748b", textDecoration:"none", transition:"all 0.2s" },
  linkActive:   { background:"rgba(124,58,237,0.15)", color:"#a855f7", borderLeft:"3px solid #7c3aed", paddingLeft:9 },
  linkIcon:     { fontSize:16, width:20, textAlign:"center", flexShrink:0 },
  bottom:       { display:"flex", flexDirection:"column", gap:2, marginTop:8, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.05)" },
  userCard:     { display:"flex", alignItems:"center", gap:10, padding:"10px", borderRadius:10, marginTop:8, cursor:"pointer", border:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.03)", transition:"all 0.2s" },
  userAvatar:   { width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"white", flexShrink:0 },
  userInfo:     { flex:1, minWidth:0 },
  userName:     { fontSize:13, fontWeight:700, color:"#e2e8f0", lineHeight:1.2 },
  userEmail:    { fontSize:10, color:"#475569", lineHeight:1.2 },
  logoutBtn:    { width:"100%", padding:"10px", borderRadius:8, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", color:"#fca5a5", fontSize:13, fontWeight:600, cursor:"pointer", marginTop:6, textAlign:"center", transition:"all 0.2s" },
};

export default Sidebar;