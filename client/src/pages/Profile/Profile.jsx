import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState({
    name:  localStorage.getItem("name")  || "User",
    email: localStorage.getItem("email") || "",
    image: localStorage.getItem("avatar") || "",
  });
  const [stats,   setStats]   = useState({ streak:0, topics:0, flashcards:0, quizScore:0, docs:0 });
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");
  const fileRef = useRef(null);

  const initials = user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  // ✅ Fetch real stats from dashboard API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res   = await axios.get("http://localhost:5000/api/dashboard", {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
        });
        const d = res.data;
        setStats({
          streak:     d.streak            || 0,
          topics:     d.topicsCompleted   || 0,
          flashcards: d.flashcardsReviewed|| 0,
          quizScore:  d.quizAccuracy      || 0,
          docs:       d.totalDocs         || 0,
        });
      } catch { /* keep zeros */ }
    };
    fetchStats();
  }, []);

  const handleChange = e => setUser({ ...user, [e.target.name]: e.target.value });

  const handleImage = e => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUser({ ...user, image: url });
    localStorage.setItem("avatar", url);
  };

  const saveProfile = () => {
    localStorage.setItem("name",  user.name);
    localStorage.setItem("email", user.email);
    setEditing(false);
    setSuccess("Profile updated successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const statRows = [
    { label:"Study Streak",   value: stats.streak     > 0 ? `${stats.streak} 🔥` : "0",   color: stats.streak     > 0 ? "#f59e0b" : "#334155" },
    { label:"Topics Studied", value: stats.topics     > 0 ? stats.topics      : "0",       color: stats.topics     > 0 ? "#7c3aed" : "#334155" },
    { label:"Flashcards",     value: stats.flashcards > 0 ? stats.flashcards  : "0",       color: stats.flashcards > 0 ? "#6366f1" : "#334155" },
    { label:"Docs Generated", value: stats.docs       > 0 ? stats.docs        : "0",       color: stats.docs       > 0 ? "#3b82f6" : "#334155" },
    { label:"Quiz Accuracy",  value: stats.quizScore  > 0 ? `${stats.quizScore}%` : "0%", color: stats.quizScore  > 0 ? "#10b981" : "#334155" },
  ];

  const achievements = [
    { icon:"🔥", label:"7-Day Streak",  earned: stats.streak     >= 7  },
    { icon:"📚", label:"10 Topics",     earned: stats.topics     >= 10 },
    { icon:"🎯", label:"First Quiz",    earned: stats.quizScore  > 0   },
    { icon:"⚡", label:"Speed Learner", earned: stats.flashcards >= 50 },
  ];

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />
        <div style={S.page}>

          <div style={S.pageHeader}>
            <h1 style={S.pageTitle}>My Profile</h1>
            <p style={S.pageSub}>Manage your personal information</p>
          </div>

          <div style={S.grid}>

            {/* ── LEFT CARD ── */}
            <div style={S.leftCard}>
              {/* Avatar */}
              <div style={S.avatarWrap}>
                {user.image
                  ? <img src={user.image} alt="avatar" style={S.avatarImg} />
                  : <div style={S.avatarInitials}>{initials}</div>
                }
                {editing && (
                  <button style={S.avatarEditBtn} onClick={() => fileRef.current.click()}>📷</button>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImage} />
              </div>

              <h2 style={S.userName}>{user.name}</h2>
              <p  style={S.userEmail}>{user.email}</p>
              <div style={S.badge}>⚡ Active Learner</div>

              {/* Stats */}
              <div style={S.statsBox}>
                {statRows.map((s,i) => (
                  <div key={i} style={S.statRow}>
                    <span style={S.statLabel}>{s.label}</span>
                    <span style={{...S.statVal, color:s.color}}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT CARD ── */}
            <div style={S.rightCard}>
              <div style={S.cardHeader}>
                <h3 style={S.cardTitle}>Personal Information</h3>
                {!editing
                  ? <button style={S.editBtn}   onClick={() => setEditing(true)}>✏️ Edit</button>
                  : <div style={{display:"flex",gap:8}}>
                      <button style={S.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
                      <button style={S.saveBtn}   onClick={saveProfile}>💾 Save</button>
                    </div>
                }
              </div>

              {success && <div style={S.successBanner}>✅ {success}</div>}
              {error   && <div style={S.errorBanner}>❌ {error}</div>}

              <div style={S.fields}>
                <div style={S.field}>
                  <label style={S.label}>Full Name</label>
                  <input name="name" value={user.name} disabled={!editing} onChange={handleChange}
                    style={{...S.input,...(editing?S.inputActive:S.inputDisabled)}} />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Email Address</label>
                  <input name="email" value={user.email} type="email" disabled={!editing} onChange={handleChange}
                    style={{...S.input,...(editing?S.inputActive:S.inputDisabled)}} />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Member Since</label>
                  <input value={new Date().toLocaleDateString("en-IN",{month:"long",year:"numeric"})} disabled
                    style={{...S.input,...S.inputDisabled}} />
                </div>
                <div style={S.field}>
                  <label style={S.label}>Account Type</label>
                  <input value="Free Plan" disabled style={{...S.input,...S.inputDisabled}} />
                </div>
              </div>

              {/* Achievements */}
              <div style={{marginTop:24}}>
                <h4 style={S.sectionLabel}>🏆 Achievements</h4>

                {/* Only show earned achievements */}
                {achievements.filter(a => a.earned).length === 0 ? (
                  <div style={S.noAchieve}>
                    <span style={{fontSize:32}}>🎯</span>
                    <p style={{fontSize:13, color:"#475569", fontWeight:600, marginTop:8}}>No achievements yet</p>
                    <p style={{fontSize:12, color:"#334155", marginTop:4}}>
                      Create topics, take quizzes and study daily to earn badges
                    </p>
                  </div>
                ) : (
                  <div style={S.achieveGrid}>
                    {achievements.filter(a => a.earned).map((a,i) => (
                      <div key={i} style={{...S.achieveCard, background:"rgba(124,58,237,0.1)", borderColor:"rgba(124,58,237,0.3)"}}>
                        <span style={{fontSize:24}}>{a.icon}</span>
                        <span style={{fontSize:11, color:"#a855f7", marginTop:4, textAlign:"center", fontWeight:700}}>{a.label}</span>
                        <span style={{fontSize:9, color:"#10b981", fontWeight:700}}>✅ EARNED</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page:          { padding:28 },
  pageHeader:    { marginBottom:24 },
  pageTitle:     { fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, background:"linear-gradient(135deg,#f1f5f9,#a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", marginBottom:4 },
  pageSub:       { color:"#64748b", fontSize:14 },
  grid:          { display:"grid", gridTemplateColumns:"260px 1fr", gap:20, alignItems:"start" },
  leftCard:      { background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:24, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:10 },
  avatarWrap:    { position:"relative", marginBottom:6 },
  avatarImg:     { width:88, height:88, borderRadius:"50%", objectFit:"cover", border:"3px solid #7c3aed", boxShadow:"0 0 0 6px rgba(124,58,237,0.15)" },
  avatarInitials:{ width:88, height:88, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:800, color:"white", border:"3px solid #7c3aed", boxShadow:"0 0 0 6px rgba(124,58,237,0.15)" },
  avatarEditBtn: { position:"absolute", bottom:0, right:0, width:26, height:26, borderRadius:"50%", background:"#7c3aed", border:"2px solid #080810", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11 },
  userName:      { fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:700, color:"#f1f5f9", marginTop:4 },
  userEmail:     { fontSize:12, color:"#64748b" },
  badge:         { padding:"4px 14px", borderRadius:100, background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", color:"#a855f7", fontSize:12, fontWeight:700 },
  statsBox:      { width:"100%", display:"flex", flexDirection:"column", gap:10, marginTop:8, padding:"14px 0", borderTop:"1px solid rgba(255,255,255,0.06)" },
  statRow:       { display:"flex", justifyContent:"space-between", alignItems:"center" },
  statLabel:     { fontSize:13, color:"#64748b" },
  statVal:       { fontSize:14, fontWeight:700 },
  rightCard:     { background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:28 },
  cardHeader:    { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 },
  cardTitle:     { fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#f1f5f9" },
  editBtn:       { padding:"8px 18px", borderRadius:8, background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none", color:"white", fontSize:13, fontWeight:600, cursor:"pointer" },
  saveBtn:       { padding:"8px 18px", borderRadius:8, background:"linear-gradient(135deg,#059669,#10b981)", border:"none", color:"white", fontSize:13, fontWeight:600, cursor:"pointer" },
  cancelBtn:     { padding:"8px 16px", borderRadius:8, border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"#94a3b8", fontSize:13, fontWeight:600, cursor:"pointer" },
  successBanner: { background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:8, padding:"10px 14px", color:"#6ee7b7", fontSize:13, marginBottom:16 },
  errorBanner:   { background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", color:"#fca5a5", fontSize:13, marginBottom:16 },
  fields:        { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  field:         { display:"flex", flexDirection:"column", gap:6 },
  label:         { fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" },
  input:         { padding:"11px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.08)", fontSize:14, outline:"none", fontFamily:"sans-serif", transition:"all 0.2s" },
  inputActive:   { background:"rgba(255,255,255,0.06)", color:"#f1f5f9", borderColor:"rgba(124,58,237,0.4)" },
  inputDisabled: { background:"rgba(255,255,255,0.02)", color:"#64748b", cursor:"default" },
  sectionLabel:  { fontSize:13, fontWeight:700, color:"#a855f7", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:12 },
  achieveGrid:   { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 },
  achieveCard:   { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"14px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:4, transition:"all 0.2s" },
  noAchieve:     { padding:"24px 20px", background:"rgba(255,255,255,0.02)", border:"1px dashed rgba(255,255,255,0.06)", borderRadius:12, textAlign:"center", marginTop:10 },
};

export default Profile;