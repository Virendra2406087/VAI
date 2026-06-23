import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleSuccess() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Signing you in with Google…");

  useEffect(() => {
    const search = window.location.search || window.location.hash.replace("#","?");
    const params = new URLSearchParams(search);

    const token = params.get("token");
    const name  = params.get("name");
    const email = params.get("email");
    const id    = params.get("id");

    console.log("GoogleSuccess params:", { token: token?.slice(0,20), name, email, id });

    if (token) {
      const incomingId = id || "";

      const existingId = localStorage.getItem("userId");
      if (existingId && existingId !== incomingId) {
        localStorage.clear();
      }

      localStorage.setItem("token",     token);
      localStorage.setItem("name",      decodeURIComponent(name  || ""));
      localStorage.setItem("email",     decodeURIComponent(email || ""));
      localStorage.setItem("userId",    incomingId);
      localStorage.setItem("loginTime", new Date().toISOString());

      setStatus("Success! Redirecting…");
      setTimeout(() => navigate("/dashboard"), 300);
    } else {
      console.error("No token found in URL. Full URL:", window.location.href);
      setStatus("Login failed — no token received.");
      setTimeout(() => navigate("/login?error=google_failed"), 2000);
    }
  }, []);

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#080810" }}>
      <div style={{ textAlign:"center", color:"#f1f5f9" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>⚡</div>
        <p style={{ fontSize:16, color:"#94a3b8" }}>{status}</p>
      </div>
    </div>
  );
}