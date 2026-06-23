import React from "react";

function Card({ title, value, icon, color = "#7c3aed", sub }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "22px 24px",
        transition: "all 0.25s ease",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}55`;
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 16px 40px ${color}20`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: "absolute", top: -30, right: -30,
        width: 100, height: 100, borderRadius: "50%",
        background: `${color}15`, pointerEvents: "none",
      }} />

      {/* Icon + label row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.08em", color: "#475569",
        }}>{title}</span>
        {icon && (
          <span style={{
            fontSize: 20, width: 38, height: 38,
            background: `${color}18`,
            border: `1px solid ${color}35`,
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{icon}</span>
        )}
      </div>

      {/* Value */}
      <div style={{
        fontSize: 34, fontWeight: 800, lineHeight: 1,
        fontFamily: "'Syne', sans-serif",
        background: `linear-gradient(135deg, #f1f5f9, ${color === "#7c3aed" ? "#a855f7" : color})`,
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>{value}</div>

      {/* Sub */}
      {sub && (
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 8, fontWeight: 500 }}>{sub}</div>
      )}
    </div>
  );
}

export default Card;