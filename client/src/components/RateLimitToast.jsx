import React, { useEffect } from "react";

function RateLimitToast({ message, onClose }) {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10, 6, 20, 0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "fadeInOverlay 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(20, 14, 34, 0.9)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(124, 58, 237, 0.35)",
          borderRadius: 18,
          padding: "28px 30px",
          maxWidth: 380,
          width: "90%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(124, 58, 237, 0.25)",
          position: "relative",
          overflow: "hidden",
          animation: "popIn 0.25s ease",
        }}
      >
        {/* Glow blob, same touch as Card.jsx */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "#7c3aed22",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            width: 52,
            height: 52,
            margin: "0 auto 16px",
            borderRadius: "50%",
            background: "#7c3aed18",
            border: "1px solid #7c3aed55",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}
        >
          ⏳
        </div>

        <div
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 18,
            fontWeight: 800,
            color: "#f1f5f9",
            marginBottom: 8,
          }}
        >
          Rate Limit Reached
        </div>

        <div
          style={{
            fontSize: 14,
            color: "#94a3b8",
            lineHeight: 1.5,
            marginBottom: 22,
          }}
        >
          {message}
        </div>

        <button
          onClick={onClose}
          style={{
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontWeight: 700,
            fontSize: 14,
            padding: "10px 28px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 10px 24px #7c3aed40";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export default RateLimitToast;