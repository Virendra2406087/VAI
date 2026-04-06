import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { addNotification } from "../../utils/notifications";
import { trackFlashcard } from "../../utils/history";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

function Flashcards() {
  const location = useLocation();
  const topic = location.state?.topic || "Binary Search Tree";

  const initialCards = [
    {
      question: "What is a Binary Search Tree?",
      answer: "A binary search tree is a tree where left nodes contain smaller values and right nodes contain larger values.",
      difficulty: "easy",
    },
  ];

  const [cards, setCards] = useState(initialCards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [easy, setEasy] = useState(0);
  const [medium, setMedium] = useState(0);
  const [hard, setHard] = useState(0);

  const total = cards.length;
  const studied = easy + medium + hard;
  const progress = total === 0 ? 0 : Math.round((studied / total) * 100);

  // =========================
  // NAVIGATION
  // =========================
  const nextCard = () => {
    if (cards.length === 0) return;
    setFlipped(false);
    setTimeout(() => setIndex((prev) => (prev + 1) % cards.length), 150);
  };

  const prevCard = () => {
    if (cards.length === 0) return;
    setFlipped(false);
    setTimeout(() => setIndex((prev) => (prev - 1 + cards.length) % cards.length), 150);
  };

  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setIndex(0);
    setFlipped(false);
  };

  // =========================
  // AI GENERATE
  // =========================
  const generateAI = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "AI failed. Try again.");
        return;
      }

      if (data.data && Array.isArray(data.data)) {
        setCards((prev) => [...prev, ...data.data]); // ✅ append new cards
        addNotification("🃏", `${data.data.length} flashcards generated for "${topic}"`, "flashcard");
        trackFlashcard(topic, data.data.length);
        setIndex(0);
      }

    } catch (err) {
      console.error("AI error:", err);
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DIFFICULTY MARK
  // =========================
  const markDifficulty = (level) => {
    if (level === "easy") setEasy((prev) => prev + 1);
    if (level === "medium") setMedium((prev) => prev + 1);
    if (level === "hard") setHard((prev) => prev + 1);
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
                <button className="flash-btn" onClick={shuffleCards}>
                  🔀 Shuffle
                </button>
                <button
                  className="flash-btn"
                  onClick={generateAI}
                  disabled={loading}
                >
                  {loading ? "Generating..." : "✨ AI Generate"}
                </button>
              </div>
            </div>

            {/* TOPIC + PROGRESS */}
            <div className="flash-topic">
              <h3>{topic}</h3>
              <p>{studied} / {total} Cards Studied</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              {/* Difficulty breakdown */}
              <div className="difficulty-stats">
                <span style={{ color: "green" }}>✅ Easy: {easy}</span>
                <span style={{ color: "orange" }}>⚡ Medium: {medium}</span>
                <span style={{ color: "red" }}>🔥 Hard: {hard}</span>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div style={{ color: "red", padding: "8px" }}>❌ {error}</div>
            )}

            {/* FLASHCARD */}
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

                {/* DIFFICULTY BUTTONS */}
                <div className="difficulty-buttons">
                  <button
                    className="diff-btn easy"
                    onClick={() => markDifficulty("easy")}
                  >
                    ✅ Easy
                  </button>
                  <button
                    className="diff-btn medium"
                    onClick={() => markDifficulty("medium")}
                  >
                    ⚡ Medium
                  </button>
                  <button
                    className="diff-btn hard"
                    onClick={() => markDifficulty("hard")}
                  >
                    🔥 Hard
                  </button>
                </div>

                {/* NAV */}
                <div className="flash-nav">
                  <button onClick={prevCard}>◀ Prev</button>
                  <span>Card {index + 1} of {cards.length}</span>
                  <button onClick={nextCard}>Next ▶</button>
                </div>
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