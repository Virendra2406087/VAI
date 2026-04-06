import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../services/authService";
import { FcGoogle } from "react-icons/fc";

export default function Register() {
  const navigate = useNavigate();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);

  const strength = !password ? null
    : password.length < 6                                         ? { label:"Weak",   color:"#ef4444", w:"25%" }
    : password.match(/[A-Z]/) && password.match(/[0-9]/) && password.length >= 8 ? { label:"Strong", color:"#10b981", w:"100%" }
    :                                                               { label:"Medium", color:"#f59e0b", w:"60%" };

  const handleRegister = async () => {
    if (!name || !email || !password) { setError("Please fill all fields."); return; }
    if (password.length < 6)          { setError("Password must be at least 6 characters."); return; }
    try {
      setLoading(true); setError("");
      await registerUser({ name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={S.bg}>
      <div style={S.glow1} /><div style={S.glow2} />
      <div style={S.grid} />

      <div style={S.card}>
        <div style={S.logoWrap}>
          <img src="/VAI.jpeg" alt="VAI" style={{ width:36, height:36, borderRadius:10, objectFit:"cover" }} />
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#a855f7,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>VAI</span>
        </div>

        <h2 style={S.title}>Create your account</h2>
        <p style={S.sub}>Start your AI-powered learning journey with VAI</p>

        {error && <div style={S.errorBanner}>❌ {error}</div>}

        <div style={S.fields}>
          <div style={S.field}>
            <label style={S.label}>Full Name</label>
            <input placeholder="Virendra Kumar" value={name} onChange={e => setName(e.target.value)} style={S.input} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} style={S.input} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Password</label>
            <div style={{ position:"relative" }}>
              <input type={showPass ? "text" : "password"} placeholder="Min. 6 characters" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key==="Enter" && handleRegister()}
                style={{ ...S.input, paddingRight:44 }}
              />
              <button style={S.eyeBtn} onClick={() => setShowPass(!showPass)}>{showPass ? "🙈" : "👁"}</button>
            </div>
            {strength && (
              <div style={{ marginTop:6 }}>
                <div style={{ height:4, background:"rgba(255,255,255,0.07)", borderRadius:10, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:strength.w, background:strength.color, borderRadius:10, transition:"width 0.3s" }} />
                </div>
                <p style={{ fontSize:11, color:strength.color, marginTop:4, fontWeight:700 }}>{strength.label} password</p>
              </div>
            )}
          </div>
        </div>

        <button style={{ ...S.primaryBtn, opacity: loading ? 0.7 : 1 }} onClick={handleRegister} disabled={loading}>
          {loading ? "Creating account..." : "Create Account →"}
        </button>

        <div style={S.divider}><span style={S.dividerText}>OR</span></div>

        <button style={S.googleBtn} onClick={() => window.open("http://localhost:5000/api/auth/google","_self")}>
          <FcGoogle size={18} /> Continue with Google
        </button>

        <p style={S.switchText}>
          Already have an account? <Link to="/login" style={S.switchLink}>Sign in →</Link>
        </p>
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

const S = {
  bg:          { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#080810", position:"relative", overflow:"hidden", padding:20 },
  glow1:       { position:"fixed", top:"10%", right:"20%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.2) 0%,transparent 70%)", pointerEvents:"none" },
  glow2:       { position:"fixed", bottom:"10%", left:"20%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(59,130,246,0.12) 0%,transparent 70%)", pointerEvents:"none" },
  grid:        { position:"fixed", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" },
  card:        { width:"100%", maxWidth:420, background:"rgba(255,255,255,0.05)", backdropFilter:"blur(30px)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:20, padding:"36px 32px", display:"flex", flexDirection:"column", gap:16, position:"relative", zIndex:1, animation:"fadeUp 0.5s ease", boxShadow:"0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.08)" },
  logoWrap:    { display:"flex", alignItems:"center", gap:8, marginBottom:4 },
  logoImg:     { width:36, height:36, borderRadius:8, objectFit:'cover', border:'1px solid rgba(124,58,237,0.3)' },
  logoIcon:    { fontSize:22 },
  logoText:    { fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#f1f5f9" },
  title:       { fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:"#f8fafc" },
  sub:         { fontSize:14, color:"#64748b", marginTop:-8, marginBottom:4 },
  errorBanner: { background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", color:"#fca5a5", fontSize:13 },
  fields:      { display:"flex", flexDirection:"column", gap:14 },
  field:       { display:"flex", flexDirection:"column", gap:6 },
  label:       { fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" },
  input:       { padding:"12px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"#f1f5f9", fontSize:14, outline:"none", fontFamily:"sans-serif", transition:"border-color 0.2s", width:"100%", boxSizing:"border-box" },
  eyeBtn:      { position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16 },
  primaryBtn:  { padding:"13px", borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none", color:"white", fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:"0 6px 24px rgba(124,58,237,0.4)", fontFamily:"sans-serif" },
  divider:     { display:"flex", alignItems:"center", gap:12 },
  dividerText: { fontSize:12, color:"#475569", padding:"0 8px", whiteSpace:"nowrap" },
  googleBtn:   { padding:"12px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", color:"#e2e8f0", fontSize:14, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, fontFamily:"sans-serif" },
  switchText:  { textAlign:"center", fontSize:13, color:"#64748b" },
  switchLink:  { color:"#a855f7", fontWeight:700, textDecoration:"none" },
};