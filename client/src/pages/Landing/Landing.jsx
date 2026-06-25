import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    const handleScroll = () => setScrollY(window.scrollY);
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    handleResize();
    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
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
    <div style={S.root}>
      {/* Cursor glow — desktop only */}
      {!isMobile && (
        <div style={{
          ...S.cursorGlow,
          left: mousePos.x - 200,
          top: mousePos.y - 200,
        }} />
      )}

      <div style={S.grid} />

      {/* NAV */}
      <nav style={{
        ...S.nav,
        background: scrollY > 40 ? "rgba(8,8,16,0.9)" : "transparent",
        borderBottom: scrollY > 40 ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        padding: isMobile ? "0 20px" : "0 60px",
      }}>
        <div style={S.navLogo}>
          <img src="/VAI.jpeg" alt="VAI" style={{ width: 34, height: 34, borderRadius: 9, objectFit: "cover" }} />
          <span style={S.logoText}>VAI</span>
        </div>

        {/* Desktop nav actions */}
        {!isMobile && (
          <div style={S.navActions}>
            <button style={S.btnOutline} onClick={() => navigate("/login")}>Sign In</button>
            <button style={S.btnPrimary} onClick={() => navigate("/register")}>Get Started Free</button>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            style={S.hamburger}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && menuOpen && (
        <div style={S.mobileMenu}>
          <button style={{ ...S.btnOutline, width: "100%" }} onClick={() => { navigate("/login"); setMenuOpen(false); }}>
            Sign In
          </button>
          <button style={{ ...S.btnPrimary, width: "100%" }} onClick={() => { navigate("/register"); setMenuOpen(false); }}>
            Get Started Free
          </button>
        </div>
      )}

      {/* HERO */}
      <section ref={heroRef} style={{
        ...S.hero,
        padding: isMobile ? "100px 20px 60px" : "120px 24px 80px",
      }}>
        <div style={S.heroBadge}>
          <span style={S.badgeDot} />
          Powered by Gemini AI · VAI
        </div>

        <h1 style={{
          ...S.heroTitle,
          fontSize: isMobile ? "clamp(40px, 11vw, 56px)" : "clamp(48px, 7vw, 88px)",
        }}>
          Learn Anything.<br />
          <span style={S.heroGradient}>10× Faster.</span>
        </h1>

        <p style={{
          ...S.heroSub,
          fontSize: isMobile ? "15px" : "clamp(16px, 2vw, 19px)",
          padding: isMobile ? "0 4px" : "0",
        }}>
          Generate docs, flashcards, and quizzes with AI — then master them with your personal tutor.
          {!isMobile && <><br />The smartest way to study has arrived.</>}
        </p>

        <div style={{
          ...S.heroCtas,
          flexDirection: isMobile ? "column" : "row",
          width: isMobile ? "100%" : "auto",
          maxWidth: isMobile ? 320 : "none",
        }}>
          <button style={{
            ...S.btnHero,
            width: isMobile ? "100%" : "auto",
            justifyContent: "center",
          }} onClick={() => navigate("/register")}>
            Start Learning Free
            <span style={S.btnArrow}>→</span>
          </button>
          <button style={{
            ...S.btnHeroOutline,
            width: isMobile ? "100%" : "auto",
            textAlign: "center",
          }} onClick={() => navigate("/login")}>
            View Demo
          </button>
        </div>

        {/* Float cards — hide on very small screens */}
        <div style={{
          ...S.floatRow,
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "center" : "flex-start",
          gap: isMobile ? 10 : 14,
          width: isMobile ? "100%" : "auto",
          maxWidth: isMobile ? 320 : "none",
        }}>
          {[
            { icon: "📄", title: "VAI Documentation", sub: "Generated for Binary Trees", check: "✓", checkColor: "#a855f7" },
            { icon: "🃏", title: "12 Flashcards", sub: "Ready to study", check: "✓", checkColor: "#a855f7" },
            { icon: "🧠", title: "Quiz: 87%", sub: "Personal best!", check: "↑", checkColor: "#10b981" },
          ].map((card, i) => (
            <div key={i} style={{
              ...S.floatCard,
              animationDelay: `${i * 0.15}s`,
              width: isMobile ? "100%" : "auto",
            }}>
              <span style={S.floatIcon}>{card.icon}</span>
              <div>
                <div style={S.floatTitle}>{card.title}</div>
                <div style={S.floatSub}>{card.sub}</div>
              </div>
              <span style={{ ...S.floatCheck, color: card.checkColor }}>{card.check}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{
        ...S.section,
        padding: isMobile ? "60px 20px" : "100px 60px",
      }}>
        <div style={S.sectionTag}>Features</div>
        <h2 style={{
          ...S.sectionTitle,
          fontSize: isMobile ? "clamp(26px, 7vw, 36px)" : "clamp(32px, 4vw, 48px)",
        }}>
          Everything you need to <span style={S.heroGradient}>master any topic</span>
        </h2>
        <p style={{
          ...S.sectionSub,
          fontSize: isMobile ? "14px" : "17px",
        }}>
          Six AI-powered tools working in harmony to make you unstoppable.
        </p>

        <div style={{
          ...S.featuresGrid,
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: isMobile ? 14 : 20,
        }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                ...S.featureCard,
                animationDelay: `${i * 0.08}s`,
              }}
              onMouseEnter={e => {
                if (!isMobile) {
                  e.currentTarget.style.borderColor = `${f.color}55`;
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow = `0 20px 40px ${f.color}20`;
                }
              }}
              onMouseLeave={e => {
                if (!isMobile) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              <div style={{ ...S.featureIconWrap, background: `${f.color}20`, border: `1px solid ${f.color}40` }}>
                <span style={S.featureIcon}>{f.icon}</span>
              </div>
              <h3 style={S.featureTitle}>{f.title}</h3>
              <p style={S.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        ...S.ctaSection,
        padding: isMobile ? "60px 20px" : "100px 60px",
      }}>
        <div style={S.ctaGlow} />
        <div style={S.ctaContent}>
          <h2 style={{
            ...S.ctaTitle,
            fontSize: isMobile ? "clamp(28px, 8vw, 40px)" : "clamp(36px, 5vw, 56px)",
          }}>
            Ready to study smarter with VAI?
          </h2>
          <p style={{
            ...S.ctaSub,
            fontSize: isMobile ? "14px" : "17px",
          }}>
            Join thousands of students already learning with AI. Free forever — no credit card needed.
          </p>
          <button style={{
            ...S.btnHero,
            width: isMobile ? "100%" : "auto",
            maxWidth: isMobile ? 320 : "none",
            justifyContent: "center",
          }} onClick={() => navigate("/register")}>
            Create Free Account
            <span style={S.btnArrow}>→</span>
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        ...S.footer,
        padding: isMobile ? "24px 20px" : "32px 60px",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 14 : 16,
        textAlign: isMobile ? "center" : "left",
      }}>
        <div style={S.footerLogo}>
          <img src="/VAI.jpeg" alt="VAI" style={{ width: 28, height: 28, borderRadius: 7, objectFit: "cover" }} />
          <span style={S.logoText}>VAI</span>
        </div>
        <p style={S.footerText}>© 2026 VAI.</p>
        <div style={S.footerLinks}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <a key={l} href="#" style={S.footerLink}>{l}</a>
          ))}
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }

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

        @media (max-width: 480px) {
          .float-row { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}

const S = {
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
  nav: {
    position: "fixed", top: 0, left: 0, right: 0,
    zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    height: 70,
    backdropFilter: "blur(20px)",
    transition: "all 0.3s ease",
  },
  navLogo: { display: "flex", alignItems: "center", gap: 8 },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontSize: 22, fontWeight: 800,
    background: "linear-gradient(135deg,#a855f7,#7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  navActions: { display: "flex", gap: 12 },
  hamburger: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#f1f5f9",
    fontSize: 20,
    width: 40, height: 40,
    borderRadius: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mobileMenu: {
    position: "fixed",
    top: 70, left: 0, right: 0,
    zIndex: 999,
    background: "rgba(8,8,16,0.97)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
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
  hero: {
    position: "relative", zIndex: 1,
    minHeight: "100vh",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    textAlign: "center",
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
    fontWeight: 400,
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
  floatRow: {
    display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center",
    animation: "fadeUp 0.7s ease 0.45s both",
    width: "100%",
  },
  floatCard: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "14px 20px", borderRadius: 14,
    background: "rgba(255,255,255,0.04)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    animation: "floatBob 3s ease-in-out infinite",
    flexShrink: 0,
  },
  floatIcon: { fontSize: 22 },
  floatTitle: { fontSize: 13, fontWeight: 700, color: "#e2e8f0" },
  floatSub: { fontSize: 11, color: "#64748b", marginTop: 2 },
  floatCheck: { fontSize: 16, fontWeight: 800, marginLeft: 8 },
  section: {
    position: "relative", zIndex: 1,
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
    fontWeight: 800,
    lineHeight: 1.15, letterSpacing: "-0.02em",
    color: "#f8fafc", marginBottom: 16,
  },
  sectionSub: {
    color: "#64748b", maxWidth: 520,
    margin: "0 auto 56px", lineHeight: 1.7,
  },
  featuresGrid: {
    display: "grid",
    maxWidth: 960, margin: "0 auto",
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
  ctaSection: {
    position: "relative", zIndex: 1,
    textAlign: "center",
    background: `radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.15) 0%, transparent 70%)`,
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  ctaGlow: {
    position: "absolute", top: "50%", left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600, height: 300,
    background: "radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  ctaContent: { position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" },
  ctaTitle: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    color: "#f8fafc", letterSpacing: "-0.02em", marginBottom: 16,
  },
  ctaSub: {
    color: "#64748b", maxWidth: 480,
    margin: "0 auto 36px", lineHeight: 1.7,
  },
  footer: {
    position: "relative", zIndex: 1,
    borderTop: "1px solid rgba(255,255,255,0.06)",
    display: "flex", alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap",
  },
  footerLogo: { display: "flex", alignItems: "center", gap: 8 },
  footerText: { fontSize: 13, color: "#475569" },
  footerLinks: { display: "flex", gap: 24 },
  footerLink: { fontSize: 13, color: "#475569", textDecoration: "none" },
};