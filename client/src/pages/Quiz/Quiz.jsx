import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { addNotification } from "../../utils/notifications";
import { trackQuiz } from "../../utils/history";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

function Quiz() {
  const location = useLocation();
  const topic = location.state?.topic || "Data Structures";

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showExplanation, setShowExplanation] = useState(false);

  const total = questions.length;

  // =========================
  // TIMER
  // =========================
  useEffect(() => {
    if (submitted || total === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, total]);

  // =========================
  // AI GENERATE
  // =========================
  const generateQuiz = async () => {
    try {
      setLoading(true);
      setError("");
      setSubmitted(false);
      setAnswers([]);
      setCurrent(0);
      setTimeLeft(600);

      const res = await fetch("http://localhost:5000/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to generate quiz.");
        return;
      }

      if (data.data && Array.isArray(data.data)) {
        setQuestions(data.data);
        setAnswers(Array(data.data.length).fill(null));
        addNotification("🧠", `${data.data.length}-question quiz generated for "${topic}"`, "quiz");
        trackQuiz(topic, data.data.length);
      }

    } catch (err) {
      console.error("Quiz error:", err);
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // QUIZ ACTIONS
  // =========================
  const selectOption = (optionText) => {
    if (submitted) return;
    const updated = [...answers];
    updated[current] = optionText;
    setAnswers(updated);
    setShowExplanation(false);
  };

  const next = () => {
    if (current < total - 1) {
      setCurrent(current + 1);
      setShowExplanation(false);
    }
  };

  const prev = () => {
    if (current > 0) {
      setCurrent(current - 1);
      setShowExplanation(false);
    }
  };

  const submitQuiz = () => setSubmitted(true);

  // =========================
  // SCORE
  // =========================
  const score = questions.reduce((acc, q, i) => {
    if (answers[i] === q.correctAnswer) return acc + 1;
    return acc;
  }, 0);

  const progress = total === 0
    ? 0
    : Math.round((answers.filter((a) => a !== null).length / total) * 100);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const currentQ = questions[current];

  return (
    <div className="page-layout">
      <Sidebar />

      <div className="page-main">
        <Navbar />

        <div className="quiz-container">

          {/* =============== RESULT SCREEN =============== */}
          {submitted && total > 0 ? (
            <div className="quiz-result">
              <h2>Quiz Completed 🎉</h2>
              <h3>Your Score: {score} / {total}</h3>
              <p>Accuracy: {Math.round((score / total) * 100)}%</p>

              {/* Answer Review */}
              <div className="quiz-review">
                <h3>Review Answers</h3>
                {questions.map((q, i) => (
                  <div
                    key={i}
                    className={`review-item ${
                      answers[i] === q.correctAnswer ? "correct" : "wrong"
                    }`}
                  >
                    <p><strong>Q{i + 1}: {q.question}</strong></p>
                    <p>Your answer: <span>{answers[i] ?? "Not answered"}</span></p>
                    <p>Correct: <span style={{ color: "green" }}>{q.correctAnswer}</span></p>
                    {q.explanation && (
                      <p className="explanation">💡 {q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>

              <button className="flash-btn" onClick={generateQuiz}>
                🔄 Regenerate Quiz
              </button>
            </div>

          ) : (
            <>
              {/* =============== GENERATE BUTTON =============== */}
              {total === 0 && (
                <div className="quiz-generate-screen">
                  <h2>Quiz — {topic}</h2>
                  {error && <p style={{ color: "red" }}>❌ {error}</p>}
                  <button
                    className="flash-btn"
                    onClick={generateQuiz}
                    disabled={loading}
                  >
                    {loading ? "Generating..." : "✨ Generate AI Quiz"}
                  </button>
                </div>
              )}

              {/* =============== MAIN QUIZ =============== */}
              {total > 0 && currentQ && (
                <>
                  <div className="quiz-main">

                    <div className="quiz-header">
                      <h2>Quiz</h2>
                      <h3>{topic}</h3>
                    </div>

                    {/* TIMER */}
                    <div className="quiz-timer">
                      <span>⏱ Time Left: {minutes}:{seconds.toString().padStart(2, "0")}</span>
                      <span>Question {current + 1} of {total}</span>
                    </div>

                    {/* QUESTION */}
                    <div className="quiz-question-box">
                      <h3>{currentQ.question}</h3>

                      <div className="quiz-options">
                        {currentQ.options.map((opt, index) => {
                          const isSelected = answers[current] === opt;
                          const isCorrect = opt === currentQ.correctAnswer;
                          const isWrong = isSelected && !isCorrect;

                          return (
                            <div
                              key={index}
                              className={`quiz-option
                                ${isSelected ? "selected" : ""}
                                ${submitted && isCorrect ? "correct" : ""}
                                ${submitted && isWrong ? "wrong" : ""}
                              `}
                              onClick={() => selectOption(opt)}
                            >
                              {String.fromCharCode(65 + index)}) {opt}
                            </div>
                          );
                        })}
                      </div>

                      {/* EXPLANATION */}
                      {answers[current] && currentQ.explanation && (
                        <div className="explanation-box">
                          <button
                            className="explain-btn"
                            onClick={() => setShowExplanation(!showExplanation)}
                          >
                            {showExplanation ? "Hide" : "💡 Show"} Explanation
                          </button>
                          {showExplanation && (
                            <p className="explanation">{currentQ.explanation}</p>
                          )}
                        </div>
                      )}

                      {/* NAV BUTTONS */}
                      <div className="quiz-nav-buttons">
                        <button onClick={prev} disabled={current === 0}>
                          ◀ Previous
                        </button>

                        {current === total - 1 ? (
                          <button onClick={submitQuiz} className="submit-btn">
                            Submit Quiz ✅
                          </button>
                        ) : (
                          <button onClick={next}>
                            Next ▶
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* =============== RIGHT SIDEBAR =============== */}
                  <div className="quiz-sidebar">

                    <div className="quiz-progress-card">
                      <h3>Progress</h3>
                      <div className="progress-circle">
                        <span>{progress}%</span>
                      </div>
                      <p>Answered {answers.filter((a) => a !== null).length} / {total}</p>
                    </div>

                    {/* QUESTION NAVIGATOR */}
                    <div className="question-navigator">
                      <h4>Question Navigator</h4>
                      <div className="navigator-grid">
                        {questions.map((_, i) => (
                          <button
                            key={i}
                            className={`nav-box
                              ${i === current ? "active" : ""}
                              ${answers[i] !== null ? "answered" : ""}
                            `}
                            onClick={() => {
                              setCurrent(i);
                              setShowExplanation(false);
                            }}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      className="submit-btn"
                      onClick={submitQuiz}
                      style={{ marginTop: "16px", width: "100%" }}
                    >
                      Submit Quiz ✅
                    </button>

                  </div>
                </>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default Quiz;