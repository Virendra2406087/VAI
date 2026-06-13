import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { addNotification } from "../../utils/notifications";
import { trackQuiz, saveQuizScore } from "../../utils/history";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

const getQuizKey = (topic) => {
  const uid = localStorage.getItem("userId") || "guest";
  return `vai_quiz_${uid}_${(topic || "").toLowerCase().replace(/\s+/g, "_")}`;
};
const loadQuizCache = (topic) => {
  try { return JSON.parse(localStorage.getItem(getQuizKey(topic)) || "null"); }
  catch { return null; }
};
const saveQuizCache = (topic, questions) => {
  try {
    localStorage.setItem(getQuizKey(topic), JSON.stringify({
      questions, savedAt: new Date().toISOString()
    }));
  } catch {}
};

function Quiz() {
  const location     = useLocation();
  const topic        = location.state?.topic       || "";
  const autoGenerate = location.state?.autoGenerate || false;

  const [questions,       setQuestions]       = useState([]);
  const [current,         setCurrent]         = useState(0);
  const [answers,         setAnswers]         = useState([]);
  const [timeLeft,        setTimeLeft]        = useState(600);
  const [submitted,       setSubmitted]       = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [showExplanation, setShowExplanation] = useState(false);
  const [cachedAt,        setCachedAt]        = useState(null);
  const [scoreSubmitted,  setScoreSubmitted]  = useState(false);

  const total = questions.length;

  useEffect(() => {
    if (!topic) return;
    const cached = loadQuizCache(topic);
    if (cached?.questions?.length > 0) {
      setQuestions(cached.questions);
      setAnswers(Array(cached.questions.length).fill(null));
      setCachedAt(cached.savedAt);
    } else if (autoGenerate) {
      generateQuiz();
    }
  }, []);

  // ── Timer ──
  useEffect(() => {
    if (submitted || total === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, total]);

  // ✅ Save score locally + submit to backend when quiz is submitted
 // Replace this useEffect in Quiz.jsx:
useEffect(() => {
  if (!submitted || total === 0 || scoreSubmitted) return;

  // ✅ Compute from current answers snapshot at submission time
  const finalScore = questions.reduce(
    (acc, q, i) => answers[i] === q.correctAnswer ? acc + 1 : acc, 0
  );

  saveQuizScore(topic, finalScore, total);
  setScoreSubmitted(true);

  const token = localStorage.getItem("token");
  fetch("http://localhost:5000/api/quiz/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ topic, score: finalScore, total }),
  })
  .then(r => r.json())
  .catch(err => console.error("Score submit error:", err));

}, [submitted, answers, questions, total, scoreSubmitted, topic]); // ✅ full deps

  const generateQuiz = async () => {
    try {
      setLoading(true); setError("");
      setSubmitted(false); setAnswers([]); setCurrent(0);
      setTimeLeft(600); setScoreSubmitted(false);

      const res  = await fetch("http://localhost:5000/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.message || "Failed to generate quiz."); return; }

      if (data.data && Array.isArray(data.data)) {
        setQuestions(data.data);
        setAnswers(Array(data.data.length).fill(null));
        saveQuizCache(topic, data.data);
        // ✅ Dispatch so dashboard updates cache count
        window.dispatchEvent(new Event("quizCompleted"));
        setCachedAt(new Date().toISOString());
        addNotification("🧠", `${data.data.length}-question quiz generated for "${topic}"`, "quiz");
        trackQuiz(topic, data.data.length);
      }
    } catch (err) {
      console.error("Quiz error:", err);
      setError("Could not connect to server.");
    } finally { setLoading(false); }
  };

  const generateMore = async () => {
    try {
      setLoading(true); setError("");
      const res  = await fetch("http://localhost:5000/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.message || "Failed."); return; }
      if (data.data && Array.isArray(data.data)) {
        const newQuestions = [...questions, ...data.data];
        setQuestions(newQuestions);
        setAnswers(prev => [...prev, ...Array(data.data.length).fill(null)]);
        saveQuizCache(topic, newQuestions);
        window.dispatchEvent(new Event("quizCompleted"));
        setSubmitted(false);
        setScoreSubmitted(false);
        setCurrent(questions.length);
        setTimeLeft(600);
        addNotification("🧠", `${data.data.length} more questions added for "${topic}"`, "quiz");
      }
    } catch {
      setError("Could not connect to server.");
    } finally { setLoading(false); }
  };

  const handleSubmit = () => setSubmitted(true);

  const selectOption = (optionText) => {
    if (submitted) return;
    const updated = [...answers];
    updated[current] = optionText;
    setAnswers(updated);
    setShowExplanation(false);
  };

  const next = () => { if (current < total - 1) { setCurrent(current + 1); setShowExplanation(false); } };
  const prev = () => { if (current > 0)          { setCurrent(current - 1); setShowExplanation(false); } };

  const score    = questions.reduce((acc, q, i) => answers[i] === q.correctAnswer ? acc + 1 : acc, 0);
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
  const progress = total === 0 ? 0 : Math.round((answers.filter(a => a !== null).length / total) * 100);
  const minutes  = Math.floor(timeLeft / 60);
  const seconds  = timeLeft % 60;
  const currentQ = questions[current];

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />
        <div className="quiz-container">

          {submitted && total > 0 ? (
            <div className="quiz-result">
              <h2>Quiz Completed 🎉</h2>
              <h3>Your Score: {score} / {total}</h3>
              <p>Accuracy: {accuracy}%</p>

              {scoreSubmitted && (
                <div style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:8, padding:"4px 14px", borderRadius:100, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.25)", color:"#10b981", fontSize:12, fontWeight:600 }}>
                  ✅ Score saved — Dashboard updated
                </div>
              )}

              <div className="quiz-review">
                <h3>Review Answers</h3>
                {questions.map((q, i) => (
                  <div key={i} className={`review-item ${answers[i] === q.correctAnswer ? "correct" : "wrong"}`}>
                    <p><strong>Q{i + 1}: {q.question}</strong></p>
                    <p>Your answer: <span>{answers[i] ?? "Not answered"}</span></p>
                    <p>Correct: <span style={{ color:"green" }}>{q.correctAnswer}</span></p>
                    {q.explanation && <p className="explanation">💡 {q.explanation}</p>}
                  </div>
                ))}
              </div>

              <div style={{ marginTop:24, padding:"20px 24px", background:"linear-gradient(135deg,rgba(124,58,237,0.1),rgba(99,102,241,0.08))", border:"1px solid rgba(124,58,237,0.25)", borderRadius:14, display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:26 }}>🧠</span>
                  <div>
                    <p style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", margin:0 }}>Quiz completed! What next?</p>
                    <p style={{ fontSize:12, color:"#64748b", marginTop:3 }}>
                      {accuracy >= 70 ? "Great job! Try more to push further 🚀" : "Practice makes perfect — generate more!"}
                    </p>
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <button onClick={generateMore} disabled={loading}
                    style={{ flex:1, padding:"11px 20px", borderRadius:9, background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none", color:"white", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px rgba(124,58,237,0.35)", fontFamily:"sans-serif" }}>
                    {loading ? "Generating…" : "✨ Add More Questions"}
                  </button>
                  <button onClick={generateQuiz} disabled={loading}
                    style={{ flex:1, padding:"11px 20px", borderRadius:9, border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.05)", color:"#e2e8f0", fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"sans-serif" }}>
                    🔄 Fresh Quiz
                  </button>
                </div>
              </div>
            </div>

          ) : (
            <>
              {total === 0 && (
                <div className="quiz-generate-screen">
                  <h2>Quiz — {topic}</h2>
                  {error && <p style={{ color:"red" }}>❌ {error}</p>}
                  <button className="flash-btn" onClick={generateQuiz} disabled={loading}>
                    {loading ? "Generating..." : "✨ Generate AI Quiz"}
                  </button>
                </div>
              )}

              {total > 0 && currentQ && (
                <>
                  <div className="quiz-main">
                    <div className="quiz-header">
                      <h2>Quiz</h2>
                      <h3 style={{ display:"flex", alignItems:"center", gap:10 }}>
                        {topic}
                      </h3>
                    </div>

                    <div className="quiz-timer">
                      <span>⏱ Time Left: {minutes}:{seconds.toString().padStart(2,"0")}</span>
                      <span>Question {current + 1} of {total}</span>
                    </div>

                    <div className="quiz-question-box">
                      <h3>{currentQ.question}</h3>
                      <div className="quiz-options">
                        {currentQ.options.map((opt, index) => {
                          const isSelected = answers[current] === opt;
                          const isCorrect  = opt === currentQ.correctAnswer;
                          const isWrong    = isSelected && !isCorrect;
                          return (
                            <div key={index}
                              className={`quiz-option ${isSelected?"selected":""} ${submitted&&isCorrect?"correct":""} ${submitted&&isWrong?"wrong":""}`}
                              onClick={() => selectOption(opt)}
                            >
                              {String.fromCharCode(65 + index)}) {opt}
                            </div>
                          );
                        })}
                      </div>

                      {answers[current] && currentQ.explanation && (
                        <div className="explanation-box">
                          <button className="explain-btn" onClick={() => setShowExplanation(!showExplanation)}>
                            {showExplanation ? "Hide" : "💡 Show"} Explanation
                          </button>
                          {showExplanation && <p className="explanation">{currentQ.explanation}</p>}
                        </div>
                      )}

                      <div className="quiz-nav-buttons">
                        <button onClick={prev} disabled={current === 0}>◀ Previous</button>
                        {current === total - 1
                          ? <button onClick={handleSubmit} className="submit-btn">Submit Quiz ✅</button>
                          : <button onClick={next}>Next ▶</button>
                        }
                      </div>
                    </div>
                  </div>

                  <div className="quiz-sidebar">
                    <div className="quiz-progress-card">
                      <h3>Progress</h3>
                      <div className="progress-circle"><span>{progress}%</span></div>
                      <p>Answered {answers.filter(a => a !== null).length} / {total}</p>
                    </div>
                    <div className="question-navigator">
                      <h4>Question Navigator</h4>
                      <div className="navigator-grid">
                        {questions.map((_, i) => (
                          <button key={i}
                            className={`nav-box ${i===current?"active":""} ${answers[i]!==null?"answered":""}`}
                            onClick={() => { setCurrent(i); setShowExplanation(false); }}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button className="submit-btn" onClick={handleSubmit} style={{ marginTop:"16px", width:"100%" }}>
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