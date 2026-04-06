import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const features = [
    { icon: "📄", title: "AI Documentation", desc: "Generate rich, structured docs for any topic instantly with Gemini AI.", color: "#7c3aed" },
    { icon: "🃏", title: "Smart Flashcards", desc: "Auto-create flip cards with difficulty ratings to accelerate retention.", color: "#6366f1" },
    { icon: "🧠", title: "Adaptive Quiz", desc: "AI-crafted quizzes with explanations that adapt to your knowledge gaps.", color: "#8b5cf6" },
    { icon: "🤖", title: "AI Tutor Chat", desc: "Ask anything. Get instant expert answers with code-highlighted responses.", color: "#a855f7" },
    { icon: "📅", title: "Study Planner", desc: "Stay on track with intelligent scheduling and streak tracking.", color: "#9333ea" },
    { icon: "📊", title: "Progress Analytics", desc: "Visualise your learning journey with real-time charts and insights.", color: "#7e22ce" },
  ];

  return (
    <div style={styles.root}>

      {/* ─── CURSOR GLOW ─── */}
      <div style={{
        ...styles.cursorGlow,
        left: mousePos.x - 200,
        top: mousePos.y - 200,
      }} />

      {/* ─── GRID OVERLAY ─── */}
      <div style={styles.grid} />

      {/* ─── NAVBAR ─── */}
      <nav style={{
        ...styles.nav,
        background: scrollY > 40 ? "rgba(8,8,16,0.9)" : "transparent",
        borderBottom: scrollY > 40 ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}>
        <div style={styles.navLogo}>
          <img src="/VAI.jpeg" alt="VAI" style={{ width:34, height:34, borderRadius:9, objectFit:"cover" }} />
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#a855f7,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>VAI</span>
        </div>
        <div style={styles.navActions}>
          <button style={styles.btnOutline} onClick={() => navigate("/login")}>Sign In</button>
          <button style={styles.btnPrimary} onClick={() => navigate("/register")}>Get Started Free</button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section ref={heroRef} style={styles.hero}>

        <div style={styles.heroBadge}>
          <span style={styles.badgeDot} />
          Powered by Gemini AI · VAI
        </div>

        <h1 style={styles.heroTitle}>
          Learn Anything.<br />
          <span style={styles.heroGradient}>10× Faster.</span>
        </h1>

        <p style={styles.heroSub}>
          Generate docs, flashcards, and quizzes with AI — then master them with your personal tutor.
          <br />The smartest way to study has arrived.
        </p>

        <div style={styles.heroCtas}>
          <button style={styles.btnHero} onClick={() => navigate("/register")}>
            Start Learning Free
            <span style={styles.btnArrow}>→</span>
          </button>
          <button style={styles.btnHeroOutline} onClick={() => navigate("/login")}>
            View Demo
          </button>
        </div>

        {/* FLOATING CARDS */}
        <div style={styles.floatRow}>
          <div style={{ ...styles.floatCard, animationDelay: "0s" }}>
            <span style={styles.floatIcon}>📄</span>
            <div>
              <div style={styles.floatTitle}>VAI Documentation</div>
              <div style={styles.floatSub}>Generated for Binary Trees</div>
            </div>
            <span style={styles.floatCheck}>✓</span>
          </div>
          <div style={{ ...styles.floatCard, animationDelay: "0.15s" }}>
            <span style={styles.floatIcon}>🃏</span>
            <div>
              <div style={styles.floatTitle}>12 Flashcards</div>
              <div style={styles.floatSub}>Ready to study</div>
            </div>
            <span style={styles.floatCheck}>✓</span>
          </div>
          <div style={{ ...styles.floatCard, animationDelay: "0.3s" }}>
            <span style={styles.floatIcon}>🧠</span>
            <div>
              <div style={styles.floatTitle}>Quiz: 87%</div>
              <div style={styles.floatSub}>Personal best!</div>
            </div>
            <span style={{ ...styles.floatCheck, color: "#10b981" }}>↑</span>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionTag}>Features</div>
        <h2 style={styles.sectionTitle}>Everything you need to <span style={styles.heroGradient}>master any topic</span></h2>
        <p style={styles.sectionSub}>Six AI-powered tools working in harmony to make you unstoppable.</p>

        <div style={styles.featuresGrid}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                ...styles.featureCard,
                animationDelay: `${i * 0.08}s`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${f.color}55`;
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = `0 20px 40px ${f.color}20`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ ...styles.featureIconWrap, background: `${f.color}20`, border: `1px solid ${f.color}40` }}>
                <span style={styles.featureIcon}>{f.icon}</span>
              </div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaGlow} />
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to study smarter with VAI?</h2>
          <p style={styles.ctaSub}>Join thousands of students already learning with AI. Free forever — no credit card needed.</p>
          <button style={styles.btnHero} onClick={() => navigate("/register")}>
            Create Free Account
            <span style={styles.btnArrow}>→</span>
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>
          <img src="/VAI.jpeg" alt="VAI" style={{ width:28, height:28, borderRadius:7, objectFit:"cover" }} />
          <span style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, background:"linear-gradient(135deg,#a855f7,#7c3aed)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>VAI</span>
        </div>
        <p style={styles.footerText}>© 2026 VAI.</p>
        <div style={styles.footerLinks}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <a key={l} href="#" style={styles.footerLink}>{l}</a>
          ))}
        </div>
      </footer>

      {/* ─── KEYFRAMES ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatBob {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'DM Sans', sans-serif",
    background: "#080810",
    color: "#f1f5f9",
    minHeight: "100vh",
    overflowX: "hidden",
    position: "relative",
  },
  cursorGlow: {
    position: "fixed",
    width: 400, height: 400,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
    transition: "left 0.15s ease, top 0.15s ease",
  },
  grid: {
    position: "fixed", inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
    `,
    backgroundSize: "60px 60px",
    pointerEvents: "none",
    zIndex: 0,
  },

  /* NAV */
  nav: {
    position: "fixed", top: 0, left: 0, right: 0,
    zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 60px", height: 70,
    backdropFilter: "blur(20px)",
    transition: "all 0.3s ease",
  },
  navLogo: { display: "flex", alignItems: "center", gap: 8 },
  logoIcon: { fontSize: 22 },
  logoImg: { width:34, height:34, borderRadius:8, objectFit:'cover', border:'1px solid rgba(124,58,237,0.3)' },
  logoText: { fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#f1f5f9" },
  logoPurple: { color: "#a855f7" },
  navLinks: { display: "flex", gap: 36 },
  navLink: {
    color: "#94a3b8", fontSize: 14, fontWeight: 500,
    textDecoration: "none", transition: "color 0.2s",
  },
  navActions: { display: "flex", gap: 12 },
  btnOutline: {
    padding: "9px 20px", borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent", color: "#e2e8f0",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  },
  btnPrimary: {
    padding: "9px 20px", borderRadius: 8,
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    border: "none", color: "white",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
    boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
    transition: "all 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  },

  /* HERO */
  hero: {
    position: "relative", zIndex: 1,
    minHeight: "100vh",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    textAlign: "center",
    padding: "120px 24px 80px",
    background: `
      radial-gradient(ellipse at 30% 20%, rgba(124,58,237,0.18) 0%, transparent 55%),
      radial-gradient(ellipse at 70% 80%, rgba(59,130,246,0.1) 0%, transparent 55%)
    `,
  },
  heroBadge: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "6px 16px", borderRadius: 100,
    background: "rgba(124,58,237,0.12)",
    border: "1px solid rgba(124,58,237,0.3)",
    fontSize: 13, fontWeight: 600, color: "#c4b5fd",
    marginBottom: 28, letterSpacing: "0.02em",
    animation: "fadeUp 0.6s ease both",
  },
  badgeDot: {
    display: "inline-block", width: 7, height: 7, borderRadius: "50%",
    background: "#a855f7",
    boxShadow: "0 0 8px #a855f7",
    animation: "pulse 2s infinite",
  },
  heroTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(48px, 7vw, 88px)",
    fontWeight: 800, lineHeight: 1.05,
    color: "#f8fafc", letterSpacing: "-0.03em",
    marginBottom: 24,
    animation: "fadeUp 0.7s ease 0.1s both",
  },
  heroGradient: {
    background: "linear-gradient(135deg, #a855f7 0%, #6366f1 50%, #3b82f6 100%)",
    backgroundSize: "200% 200%",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    animation: "gradientShift 4s ease infinite",
  },
  heroSub: {
    fontSize: "clamp(16px, 2vw, 19px)", fontWeight: 400,
    color: "#94a3b8", lineHeight: 1.7, maxWidth: 560,
    marginBottom: 40,
    animation: "fadeUp 0.7s ease 0.2s both",
  },
  heroCtas: {
    display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap",
    marginBottom: 60,
    animation: "fadeUp 0.7s ease 0.3s both",
  },
  btnHero: {
    display: "inline-flex", alignItems: "center", gap: 10,
    padding: "15px 32px", borderRadius: 10,
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    border: "none", color: "white",
    fontSize: 16, fontWeight: 700, cursor: "pointer",
    boxShadow: "0 8px 30px rgba(124,58,237,0.45)",
    transition: "all 0.25s",
    fontFamily: "'DM Sans', sans-serif",
  },
  btnHeroOutline: {
    padding: "15px 32px", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(10px)",
    color: "#e2e8f0",
    fontSize: 16, fontWeight: 600, cursor: "pointer",
    transition: "all 0.25s",
    fontFamily: "'DM Sans', sans-serif",
  },
  btnArrow: { fontSize: 18, display: "inline-block" },

  /* FLOATING CARDS */
  floatRow: {
    display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center",
    animation: "fadeUp 0.7s ease 0.45s both",
  },
  floatCard: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "14px 20px", borderRadius: 14,
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    animation: "floatBob 3s ease-in-out infinite",
  },
  floatIcon: { fontSize: 22 },
  floatTitle: { fontSize: 13, fontWeight: 700, color: "#e2e8f0" },
  floatSub: { fontSize: 11, color: "#64748b", marginTop: 2 },
  floatCheck: { fontSize: 16, color: "#a855f7", fontWeight: 800, marginLeft: 8 },

  /* STATS */
  statsSection: {
    position: "relative", zIndex: 1,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    padding: "40px 60px",
    background: "rgba(255,255,255,0.02)",
  },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: 20, maxWidth: 900, margin: "0 auto", textAlign: "center",
  },
  statItem: { padding: "10px 0" },
  statValue: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 40, fontWeight: 800,
    background: "linear-gradient(135deg, #a855f7, #6366f1)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
  },
  statLabel: { fontSize: 14, color: "#64748b", marginTop: 6, fontWeight: 500 },

  /* SECTIONS */
  section: {
    position: "relative", zIndex: 1,
    padding: "100px 60px",
    textAlign: "center",
  },
  sectionTag: {
    display: "inline-block",
    fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
    color: "#a855f7", marginBottom: 16,
    padding: "4px 14px", borderRadius: 100,
    background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)",
  },
  sectionTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 800,
    lineHeight: 1.15, letterSpacing: "-0.02em",
    color: "#f8fafc", marginBottom: 16,
  },
  sectionSub: {
    fontSize: 17, color: "#64748b", maxWidth: 520,
    margin: "0 auto 56px", lineHeight: 1.7,
  },

  /* FEATURES */
  featuresGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20, maxWidth: 960, margin: "0 auto",
  },
  featureCard: {
    padding: "30px 26px", borderRadius: 16, textAlign: "left",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
    cursor: "default",
  },
  featureIconWrap: {
    width: 48, height: 48, borderRadius: 12,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 18,
  },
  featureIcon: { fontSize: 22 },
  featureTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 10,
  },
  featureDesc: { fontSize: 14, color: "#64748b", lineHeight: 1.7 },

  /* HOW IT WORKS */
  stepsGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24, maxWidth: 860, margin: "0 auto",
    position: "relative",
  },
  stepCard: {
    padding: "36px 28px", borderRadius: 16,
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    textAlign: "left", position: "relative",
  },
  stepNumber: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 48, fontWeight: 800,
    color: "rgba(124,58,237,0.15)", lineHeight: 1,
    marginBottom: 12,
  },
  stepIconWrap: { fontSize: 28, marginBottom: 16 },
  stepTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 10,
  },
  stepDesc: { fontSize: 14, color: "#64748b", lineHeight: 1.7 },
  stepArrow: {
    position: "absolute", right: -20, top: "50%",
    transform: "translateY(-50%)",
    fontSize: 24, color: "rgba(124,58,237,0.4)",
    zIndex: 2,
  },

  /* TESTIMONIALS */
  testimonialsGrid: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20, maxWidth: 960, margin: "0 auto",
  },
  testimonialCard: {
    padding: "28px", borderRadius: 16, textAlign: "left",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    backdropFilter: "blur(10px)",
    transition: "all 0.25s ease",
    cursor: "default",
  },
  quoteIcon: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 56, lineHeight: 0.8,
    color: "rgba(124,58,237,0.25)",
    fontWeight: 800, marginBottom: 16,
    display: "block",
  },
  testimonialText: { fontSize: 14, color: "#94a3b8", lineHeight: 1.75, marginBottom: 20 },
  testimonialAuthor: { display: "flex", alignItems: "center", gap: 12 },
  avatarCircle: {
    width: 40, height: 40, borderRadius: "50%",
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 13, fontWeight: 700, color: "white", flexShrink: 0,
  },
  authorName: { fontSize: 14, fontWeight: 700, color: "#e2e8f0" },
  authorRole: { fontSize: 12, color: "#475569", marginTop: 2 },

  /* CTA */
  ctaSection: {
    position: "relative", zIndex: 1,
    padding: "100px 60px",
    textAlign: "center",
    background: `
      radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.15) 0%, transparent 70%)
    `,
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  ctaGlow: {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600, height: 300,
    background: "radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  ctaContent: { position: "relative", zIndex: 1 },
  ctaTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800,
    color: "#f8fafc", letterSpacing: "-0.02em", marginBottom: 16,
  },
  ctaSub: {
    fontSize: 17, color: "#64748b", maxWidth: 480,
    margin: "0 auto 36px", lineHeight: 1.7,
  },

  /* FOOTER */
  footer: {
    position: "relative", zIndex: 1,
    padding: "32px 60px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: 16,
  },
  footerLogo: { display: "flex", alignItems: "center", gap: 8 },
  footerText: { fontSize: 13, color: "#475569" },
  footerLinks: { display: "flex", gap: 24 },
  footerLink: { fontSize: 13, color: "#475569", textDecoration: "none" },
};