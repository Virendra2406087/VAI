import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { addNotification } from "../../utils/notifications";
import { trackFlashcard } from "../../utils/history";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { triggerRateLimitToast } from "../../utils/rateLimitToast";
import { API_BASE_URL } from "../../config";
import { CircleCheck, CircleX, FileText, Flame, Layers3, Zap } from "lucide-react";


// ── Cache helpers ──
const getFlashKey = (topic) => {
  const uid = localStorage.getItem("userId") || "guest";
  return `vai_flash_${uid}_${(topic || "").toLowerCase().replace(/\s+/g, "_")}`;
};
const loadFlashCache = (topic) => {
  try { return JSON.parse(localStorage.getItem(getFlashKey(topic)) || "null"); }
  catch { return null; }
};
const saveFlashCache = (topic, cards) => {
  try {
    localStorage.setItem(getFlashKey(topic), JSON.stringify({
      cards, savedAt: new Date().toISOString()
    }));
  } catch {}
};

function Flashcards() {
  const location     = useLocation();
  const topic        = location.state?.topic       || "";
  const autoGenerate = location.state?.autoGenerate || false;

  const [cards,    setCards]    = useState([]);
  const [index,    setIndex]    = useState(0);
  const [flipped,  setFlipped]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [easy,     setEasy]     = useState(0);
  const [medium,   setMedium]   = useState(0);
  const [hard,     setHard]     = useState(0);
  const [cachedAt, setCachedAt] = useState(null);


  useEffect(() => {
    if (!topic) return;
    const cached = loadFlashCache(topic);
    if (cached?.cards?.length > 0) {
      setCards(cached.cards);
      setCachedAt(cached.savedAt);
    } else if (autoGenerate) {
      generateAI();
    }
  }, []);

  const total   = cards.length;
  const studied = easy + medium + hard;
  const progress = total === 0 ? 0 : Math.round((studied / total) * 100);

  const nextCard = () => {
    if (!cards.length) return;
    setFlipped(false);
    setTimeout(() => setIndex(prev => (prev + 1) % cards.length), 150);
  };

  const prevCard = () => {
    if (!cards.length) return;
    setFlipped(false);
    setTimeout(() => setIndex(prev => (prev - 1 + cards.length) % cards.length), 150);
  };

  const shuffleCards = () => {
    setCards([...cards].sort(() => Math.random() - 0.5));
    setIndex(0); setFlipped(false);
  };


  const generateAI = async (isMore = false) => {
  try {
    setLoading(true); setError("");

    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/flashcards/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    if (res.status === 429) { triggerRateLimitToast(data.message); return; }
    if (!res.ok) {
      if (res.status === 429) { setError(data.message); return; }
      setError(data.message || "AI failed. Try again."); return;
    }
    if (!data.success) { setError(data.message || "AI failed. Try again."); return; }

    if (data.data && Array.isArray(data.data)) {
      setCards(prev => {
        const updated = [...prev, ...data.data];
        saveFlashCache(topic, updated);
        window.dispatchEvent(new Event("flashcardGenerated"));
        setCachedAt(new Date().toISOString());
        return updated;
      });
      addNotification("🃏", `${data.data.length} flashcards generated for "${topic}"`, "flashcard");

      if (!isMore) {
        trackFlashcard(topic, data.data.length);
      }
      setIndex(0);
    }
  } catch (err) {
    console.error("AI error:", err);
    setError("Could not connect to server.");
  } finally { setLoading(false); }
};

  const markDifficulty = (level) => {
    if (level === "easy")   setEasy(p => p + 1);
    if (level === "medium") setMedium(p => p + 1);
    if (level === "hard")   setHard(p => p + 1);
    nextCard();
  };

  const currentCard = cards[index];

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />
        <div className="flashcards-container">
          <div className="flashcards-main">

            {/* HEADER */}
            <div className="flashcards-header">
              <h2>Flashcards</h2>
              <div className="flashcard-actions">
                <button className="flash-btn" onClick={shuffleCards}>🔀 Shuffle</button>
                <button className="flash-btn" onClick={() => generateAI(false)} disabled={loading}>
                  {loading ? "Generating..." : "✨ AI Generate"}
                </button>
              </div>
            </div>

            {/* TOPIC + PROGRESS */}
            <div className="flash-topic">
              <h3 style={{ display:"flex", alignItems:"center", gap:10 }}>
                {topic}
                
              </h3>
              <p>{studied} / {total} Cards Studied</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width:`${progress}%` }} />
              </div>
              <div className="difficulty-stats">
                <span style={{ color:"green" }}><CircleCheck size={20}/> Easy: {easy}</span>
                <span style={{ color:"orange" }}><Zap size={20}/> Medium: {medium}</span>
                <span style={{ color:"red" }}><Flame  size={20}/> Hard: {hard}</span>
              </div>
            </div>

            {error && <div style={{ color:"red", padding:"8px" }}><CircleX size={20}/> {error}</div>}

            {cards.length > 0 && currentCard ? (
              <>
                <div
                  className={`flashcard-viewer ${flipped ? "flipped" : ""}`}
                  onClick={() => setFlipped(!flipped)}
                >
                  <div className="flashcard-inner">
                    <div className="flashcard-front">
                      <p className="card-label">Question</p>
                      <h2>{currentCard.question}</h2>
                    </div>
                    <div className="flashcard-back">
                      <p className="card-label">Answer</p>
                      <h2>{currentCard.answer}</h2>
                    </div>
                  </div>
                </div>

                <p className="flip-hint">Click card to flip</p>

                <div className="difficulty-buttons">
                  <button className="diff-btn easy"   onClick={() => markDifficulty("easy")}><CircleCheck/> Easy</button>
                  <button className="diff-btn medium" onClick={() => markDifficulty("medium")}><Zap/> Medium</button>
                  <button className="diff-btn hard"   onClick={() => markDifficulty("hard")}><Zap/> Hard</button>
                </div>

                <div className="flash-nav">
                  <button onClick={prevCard}>◀ Prev</button>
                  <span>Card {index + 1} of {cards.length}</span>
                  <button onClick={nextCard}>Next ▶</button>
                </div>

                {/* Generate More — only shown on last card */}
                {index === cards.length - 1 && (
                  <div style={{ marginTop:20, padding:"18px 22px", background:"linear-gradient(135deg,rgba(124,58,237,0.1),rgba(99,102,241,0.08))", border:"1px solid rgba(124,58,237,0.25)", borderRadius:14, display:"flex", justifyContent:"space-between", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <span style={{ fontSize:24 }}><Layers3/></span>
                      <div>
                        <p style={{ fontSize:14, fontWeight:700, color:"#f1f5f9", margin:0 }}>You reached the last card!</p>
                        <p style={{ fontSize:12, color:"#64748b", marginTop:3 }}>
                          Generate more flashcards on <strong style={{ color:"#a855f7" }}>{topic}</strong>
                        </p>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button
  onClick={() => generateAI(true)}
  disabled={loading}
  style={{
    padding: "10px 20px",
    borderRadius: 9,
    background: "linear-gradient(135deg,#7c3aed,#a855f7)",
    border: "none",
    color: "white",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(124,58,237,0.35)",
    fontFamily: "sans-serif",
    display: "flex",
    alignItems: "center",
    gap: 8
  }}
>
  {loading ? (
    "Generating…"
  ) : (
    <>
      <Sparkles size={17} />
      Generate More Cards
    </>
  )}
</button>

<button
  onClick={() => {
    setIndex(0);
    setFlipped(false);
  }}
  style={{
    padding: "10px 16px",
    borderRadius: 9,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "sans-serif",
    display: "flex",
    alignItems: "center",
    gap: 8
  }}
>
  <RotateCcw size={16} />
  Restart
</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="no-cards">
                <p>No flashcards yet. Click <strong>AI Generate</strong> to create some!</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Flashcards;