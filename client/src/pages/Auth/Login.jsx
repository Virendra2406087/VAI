import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { FcGoogle } from "react-icons/fc";
import { API_BASE_URL } from "../../config";

export default function Login() {
  const navigate = useNavigate();
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please fill all fields."); return; }
    try {
      setLoading(true); setError("");
      const data = await loginUser({ email, password });

      const incomingId = data.user?._id || "";

      // ✅ Only clear cache if a DIFFERENT user is logging in
      // This preserves docs/flashcards/quiz/history for returning users
      const existingId = localStorage.getItem("userId");
      if (existingId && existingId !== incomingId) {
        // Different user — clear everything
        localStorage.clear();
      }
      // Same user or first login — keep their cached content

      localStorage.setItem("token",     data.token);
      localStorage.setItem("name",      data.user?.name  || "");
      localStorage.setItem("email",     data.user?.email || email);
      localStorage.setItem("userId",    incomingId);
      localStorage.setItem("loginTime", new Date().toISOString());

      // ✅ Remember Me — store email for next login
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally { setLoading(false); }
  };

  // ✅ Pre-fill email if remembered
  useState(() => {
    const remembered = localStorage.getItem("rememberedEmail");
    if (remembered) setEmail(remembered);
  });

  return (
    <div style={S.bg}>
      <div style={S.glow1} /><div style={S.glow2} />
      <div style={S.grid} />
      <div style={S.card}>
        <div style={S.logoWrap}>
          <img src="/VAI.jpeg" alt="VAI" style={{ width:36, height:36, borderRadius:10, objectFit:"cover" }} />
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#a855f7,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>VAI</span>
        </div>
        <h2 style={S.title}>Welcome back</h2>
        <p style={S.sub}>Sign in to continue your learning journey with VAI</p>

        {error && <div style={S.errorBanner}>❌ {error}</div>}

        <div style={S.fields}>
          <div style={S.field}>
            <label style={S.label}>Email</label>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={S.input} />
          </div>
          <div style={S.field}>
            <label style={S.label}>Password</label>
            <div style={{ position:"relative" }}>
              <input type={showPass ? "text" : "password"} placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ ...S.input, paddingRight:44 }} />
              <button style={S.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Remember Me checkbox */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            style={{ accentColor:"#a855f7", width:15, height:15, cursor:"pointer" }}
          />
          <label htmlFor="rememberMe" style={{ fontSize:13, color:"#64748b", cursor:"pointer", userSelect:"none" }}>
            Remember me
          </label>
        </div>

        <button style={{ ...S.primaryBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign In →"}
        </button>

        <div style={S.divider}><span style={S.dividerText}>OR</span></div>

        <button style={S.googleBtn} onClick={() => window.open(`${API_BASE_URL}/api/auth/google`,"_self")}>
          <FcGoogle size={18} /> Continue with Google
        </button>

        <p style={S.switchText}>
          Don't have an account? <Link to="/register" style={S.switchLink}>Create one →</Link>
        </p>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

const S = {
  bg:         { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#080810", position:"relative", overflow:"hidden", padding:20 },
  glow1:      { position:"fixed", top:"10%", left:"20%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.2) 0%,transparent 70%)", pointerEvents:"none" },
  glow2:      { position:"fixed", bottom:"10%", right:"20%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle,rgba(59,130,246,0.12) 0%,transparent 70%)", pointerEvents:"none" },
  grid:       { position:"fixed", inset:0, backgroundImage:"linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" },
  card:       { width:"100%", maxWidth:420, background:"rgba(255,255,255,0.05)", backdropFilter:"blur(30px)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:20, padding:"36px 32px", display:"flex", flexDirection:"column", gap:16, position:"relative", zIndex:1, animation:"fadeUp 0.5s ease", boxShadow:"0 24px 60px rgba(0,0,0,0.5)" },
  logoWrap:   { display:"flex", alignItems:"center", gap:8, marginBottom:4 },
  title:      { fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:"#f8fafc" },
  sub:        { fontSize:14, color:"#64748b", marginTop:-8, marginBottom:4 },
  errorBanner:{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"10px 14px", color:"#fca5a5", fontSize:13 },
  fields:     { display:"flex", flexDirection:"column", gap:14 },
  field:      { display:"flex", flexDirection:"column", gap:6 },
  label:      { fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" },
  input:      { padding:"12px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"#f1f5f9", fontSize:14, outline:"none", fontFamily:"sans-serif", width:"100%", boxSizing:"border-box" },
  eyeBtn:     { position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontSize:16 },
  primaryBtn: { padding:"13px", borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none", color:"white", fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:"0 6px 24px rgba(124,58,237,0.4)", fontFamily:"sans-serif" },
  divider:    { display:"flex", alignItems:"center", gap:12 },
  dividerText:{ fontSize:12, color:"#475569", padding:"0 8px", whiteSpace:"nowrap" },
  googleBtn:  { padding:"12px", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.04)", color:"#e2e8f0", fontSize:14, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, fontFamily:"sans-serif" },
  switchText: { textAlign:"center", fontSize:13, color:"#64748b" },
  switchLink: { color:"#a855f7", fontWeight:700, textDecoration:"none" },
};