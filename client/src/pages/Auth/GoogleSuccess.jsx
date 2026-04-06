// client/src/pages/Auth/GoogleSuccess.jsx
// ✅ Google redirects here after successful login
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const name   = params.get("name");
    const email  = params.get("email");
    const id     = params.get("id");

    if (token) {
      // ✅ Clear old data and save new session
      localStorage.clear();
      localStorage.setItem("token",     token);
      localStorage.setItem("name",      name  || "");
      localStorage.setItem("email",     email || "");
      localStorage.setItem("userId",    id    || "");
      localStorage.setItem("loginTime", new Date().toISOString());
      navigate("/dashboard");
    } else {
      navigate("/login?error=google_failed");
    }
  }, []);

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#080810" }}>
      <div style={{ textAlign:"center", color:"#f1f5f9" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⚡</div>
        <p style={{ fontSize:16, color:"#94a3b8" }}>Signing you in with Google…</p>
      </div>
    </div>
  );
}