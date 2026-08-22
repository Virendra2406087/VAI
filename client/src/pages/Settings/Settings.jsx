import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import axios from "axios";
import { API_BASE_URL } from "../../config";

function Settings() {
  const [activeTab, setActiveTab] = useState("account");
  const [success,   setSuccess]   = useState("");
  const [error,     setError]     = useState("");
  const [saving,    setSaving]    = useState(false);

  const [account, setAccount] = useState({
    username: localStorage.getItem("name")  || "",
    email:    localStorage.getItem("email") || "",
  });

  const [passwords, setPasswords] = useState({
    current:"", newPass:"", confirm:"",
  });

  const showMsg = (msg, isError=false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setSuccess(""); setError(""); }, 3000);
  };

  const saveAccount = () => {
    if (!account.username.trim()) { showMsg("Name cannot be empty.", true); return; }
    if (!account.email.trim())    { showMsg("Email cannot be empty.", true); return; }
    localStorage.setItem("name",  account.username.trim());
    localStorage.setItem("email", account.email.trim());
    showMsg("Account settings saved!");
  };

  const savePassword = async () => {
    if (!passwords.current || !passwords.newPass) { showMsg("Please fill all password fields.", true); return; }
    if (passwords.newPass !== passwords.confirm)   { showMsg("New passwords do not match.", true); return; }
    if (passwords.newPass.length < 6)              { showMsg("Password must be at least 6 characters.", true); return; }
    try {
      setSaving(true);
      await axios.put(`${API_BASE_URL}/api/user/change-password`, {
        email: account.email, newPassword: passwords.newPass,
      });
      setPasswords({ current:"", newPass:"", confirm:"" });
      showMsg("Password updated successfully!");
    } catch {
      showMsg("Failed to update password. Check current password.", true);
    } finally { setSaving(false); }
  };

  const pwStrength = (p) => {
    if (!p) return null;
    if (p.length < 6) return { label:"Weak",   color:"#ef4444", width:"25%" };
    if (p.match(/[A-Z]/) && p.match(/[0-9]/) && p.length >= 8) return { label:"Strong", color:"#10b981", width:"100%" };
    return { label:"Medium", color:"#f59e0b", width:"60%" };
  };
  const strength = pwStrength(passwords.newPass);

  //  Only 2 tabs: Account + Password
  const tabs = [
    { id:"account",  icon:"👤", label:"Account"  },
    { id:"password", icon:"🔒", label:"Password" },
  ];

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />
        <div style={S.page}>

          <div style={S.pageHeader}>
            <h1 style={S.pageTitle}>Settings</h1>
            <p style={S.pageSub}>Manage your account preferences</p>
          </div>

          {success && <div style={S.successBanner}>✅ {success}</div>}
          {error   && <div style={S.errorBanner}>❌ {error}</div>}

          <div style={S.layout}>

            {/* ── TAB LIST ── */}
            <div style={S.tabList}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  style={{...S.tabBtn,...(activeTab===t.id?S.tabBtnActive:{})}}
                  onClick={() => setActiveTab(t.id)}
                >
                  <span style={{marginRight:8}}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── CONTENT ── */}
            <div style={S.content}>

              {/* ACCOUNT TAB */}
              {activeTab === "account" && (
                <div style={S.card}>
                  <h3 style={S.cardTitle}>Account Settings</h3>
                  <p style={S.cardSub}>Update your display name and email address</p>

                  <div style={S.fields}>
                    <div style={S.field}>
                      <label style={S.label}>Display Name</label>
                      <input
                        value={account.username}
                        onChange={e => setAccount({...account, username:e.target.value})}
                        style={S.input}
                        placeholder="Your name"
                      />
                    </div>
                    <div style={S.field}>
                      <label style={S.label}>Email Address</label>
                      <input
                        type="email"
                        value={account.email}
                        onChange={e => setAccount({...account, email:e.target.value})}
                        style={S.input}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div style={S.field}>
                      <label style={S.label}>Account Type</label>
                      <input value="Free Plan" disabled style={{...S.input,...S.inputDisabled}} />
                    </div>
                    <div style={S.field}>
                      <label style={S.label}>Member Since</label>
                      <input
                        value={new Date().toLocaleDateString("en-IN",{month:"long",year:"numeric"})}
                        disabled style={{...S.input,...S.inputDisabled}}
                      />
                    </div>
                  </div>

                  <button style={S.saveBtn} onClick={saveAccount}>
                    💾 Save Changes
                  </button>
                </div>
              )}

              {/* PASSWORD TAB */}
              {activeTab === "password" && (
                <div style={S.card}>
                  <h3 style={S.cardTitle}>Change Password</h3>
                  <p style={S.cardSub}>Keep your account secure with a strong password</p>

                  <div style={S.passwordFields}>

                    <div style={S.field}>
                      <label style={S.label}>Current Password</label>
                      <input
                        type="password"
                        value={passwords.current}
                        onChange={e => setPasswords({...passwords, current:e.target.value})}
                        style={S.input}
                        placeholder="Enter current password"
                      />
                    </div>

                    <div style={S.field}>
                      <label style={S.label}>New Password</label>
                      <input
                        type="password"
                        value={passwords.newPass}
                        onChange={e => setPasswords({...passwords, newPass:e.target.value})}
                        style={S.input}
                        placeholder="Min. 6 characters"
                      />
                      {strength && (
                        <div style={{marginTop:8}}>
                          <div style={{height:5,background:"rgba(255,255,255,0.07)",borderRadius:10,overflow:"hidden"}}>
                            <div style={{height:"100%",width:strength.width,background:strength.color,borderRadius:10,transition:"width 0.3s"}}/>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                            <span style={{fontSize:11,color:strength.color,fontWeight:700}}>{strength.label} password</span>
                            <span style={{fontSize:11,color:"#475569"}}>
                              {strength.label==="Weak"?"Use 6+ chars"
                               :strength.label==="Medium"?"Add uppercase + numbers"
                               :"Great password! ✅"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={S.field}>
                      <label style={S.label}>Confirm New Password</label>
                      <input
                        type="password"
                        value={passwords.confirm}
                        onChange={e => setPasswords({...passwords, confirm:e.target.value})}
                        style={{
                          ...S.input,
                          borderColor: passwords.confirm && passwords.confirm !== passwords.newPass
                            ? "rgba(239,68,68,0.5)"
                            : passwords.confirm && passwords.confirm === passwords.newPass
                            ? "rgba(16,185,129,0.5)"
                            : "rgba(255,255,255,0.08)"
                        }}
                        placeholder="Repeat new password"
                      />
                      {passwords.confirm && passwords.confirm !== passwords.newPass && (
                        <p style={{fontSize:11,color:"#fca5a5",marginTop:4}}>❌ Passwords don't match</p>
                      )}
                      {passwords.confirm && passwords.confirm === passwords.newPass && (
                        <p style={{fontSize:11,color:"#6ee7b7",marginTop:4}}>✅ Passwords match</p>
                      )}
                    </div>

                    <button
                      style={{...S.saveBtn, opacity:saving?0.7:1, marginTop:4}}
                      onClick={savePassword}
                      disabled={saving}
                    >
                      {saving ? "Updating…" : "🔒 Update Password"}
                    </button>

                  </div>

                  {/* Password tips */}
                  <div style={S.tipBox}>
                    <p style={S.tipTitle}>💡 Password Tips</p>
                    {[
                      "At least 6 characters long",
                      "Include uppercase letters (A-Z)",
                      "Include numbers (0-9)",
                      "Avoid using your name or email",
                    ].map(tip => (
                      <p key={tip} style={S.tipItem}>• {tip}</p>
                    ))}
                  </div>
                </div>
              )}

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
  successBanner: { background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:8, padding:"10px 14px", color:"#6ee7b7", fontSize:13, marginBottom:16 },
  errorBanner:   { background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", color:"#fca5a5", fontSize:13, marginBottom:16 },
  layout:        { display:"grid", gridTemplateColumns:"180px 1fr", gap:20, alignItems:"start" },
  tabList:       { background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:8, display:"flex", flexDirection:"column", gap:4 },
  tabBtn:        { padding:"11px 14px", borderRadius:8, border:"1px solid transparent", background:"transparent", color:"#64748b", fontSize:13, fontWeight:600, cursor:"pointer", textAlign:"left", transition:"all 0.2s", fontFamily:"inherit" },
  tabBtnActive:  { background:"rgba(124,58,237,0.15)", color:"#a855f7", borderColor:"rgba(124,58,237,0.25)" },
  content:       {},
  card:          { background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:28 },
  cardTitle:     { fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#f1f5f9", marginBottom:4 },
  cardSub:       { fontSize:13, color:"#64748b", marginBottom:24 },
  fields:        { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 },
  passwordFields:{ display:"flex", flexDirection:"column", gap:18, maxWidth:440 },
  field:         { display:"flex", flexDirection:"column", gap:6 },
  label:         { fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" },
  input:         { padding:"12px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"#f1f5f9", fontSize:14, outline:"none", fontFamily:"sans-serif", transition:"all 0.2s" },
  inputDisabled: { background:"rgba(255,255,255,0.02)", color:"#475569", cursor:"default" },
  saveBtn:       { padding:"12px 28px", borderRadius:8, background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none", color:"white", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 18px rgba(124,58,237,0.35)", fontFamily:"sans-serif", alignSelf:"flex-start" },
  tipBox:        { marginTop:28, padding:"16px 18px", background:"rgba(59,130,246,0.06)", border:"1px solid rgba(59,130,246,0.15)", borderRadius:10 },
  tipTitle:      { fontSize:13, fontWeight:700, color:"#93c5fd", marginBottom:8 },
  tipItem:       { fontSize:12, color:"#64748b", lineHeight:1.8 },
};

export default Settings;