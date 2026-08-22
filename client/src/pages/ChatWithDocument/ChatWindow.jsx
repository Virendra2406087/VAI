import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import SourceCitation from "./SourceCitation";
import {
  getChatHistory,
  sendMessage,
} from "../../services/documentChatService";

const ChatWindow = ({ document }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (!document?._id) {
      setMessages([]);
      return;
    }

    const load = async () => {
      try {
        const history = await getChatHistory(document._id);
        setMessages(history || []);
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, [document]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (e) => {
    e.preventDefault();

    const question = input.trim();
    if (!question || loading) return;

    setInput("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: question },
    ]);

    setLoading(true);

    try {
      const response = await sendMessage(document._id, question);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.answer,
          sources: response.sources || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I couldn't process that question. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(e);
    }
  };

  if (!document) {
    return (
      <div className="chat-empty">
        <div className="empty-pdf">
          <div className="empty-pdf-page">
            <div className="pdf-label">PDF</div>
            <div className="pdf-lines">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="empty-sparkle">✦</div>
        </div>

        <h1>Chat with your documents</h1>
        <p>Upload a PDF and let AI understand, search and explain it for you.</p>

        <div className="empty-features">

          <span><span className="vai-ai-icon">
      ✨
    </span> Ask questions</span>
          <span><span className="vai-ai-icon">
      ✨
    </span> Summarize</span>
          <span><span className="vai-ai-icon">
      ✨
    </span> Find information</span>
        </div>

        <style>{`
          .chat-empty { height:100%; width:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:30px; box-sizing:border-box; }
          .empty-pdf { position:relative; margin-bottom:25px; }
          .empty-pdf-page { width:90px; height:115px; border-radius:10px; background:linear-gradient(145deg,#29293a,#161621); border:1px solid rgba(255,255,255,.12); box-shadow:0 25px 60px rgba(0,0,0,.4); padding:15px; }
          .pdf-label { display:inline-block; padding:4px 6px; border-radius:5px; background:#ef4444; font-size:8px; font-weight:800; }
          .pdf-lines { margin-top:15px; }
          .pdf-lines span { display:block; height:4px; border-radius:4px; background:#444456; margin-bottom:7px; }
          .pdf-lines span:nth-child(2) { width:70%; }
          .pdf-lines span:nth-child(3) { width:85%; }
          .pdf-lines span:nth-child(4) { width:50%; }
          .empty-sparkle { position:absolute; right:-20px; top:-15px; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#6366f1,#a855f7); box-shadow:0 10px 35px rgba(99,102,241,.4); }
          .chat-empty h1 { margin:0; font-size:26px; font-weight:750; letter-spacing:-.04em; }
          .chat-empty p { max-width:450px; margin:10px 0 20px; color:#717185; font-size:13px; line-height:1.7; }
          .empty-features { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; }
          .empty-features span { padding:7px 11px; border-radius:8px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); color:#858597; font-size:10px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="modern-chat">

      {/* Header */}
      <header className="chat-header">
        <div className="chat-document">
          <div className="header-pdf">PDF</div>
          <div>
            <div className="header-name">{document.fileName}</div>
            <div className="header-status">
              <span />
              Document ready
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button title="Document information">ⓘ</button>
          <button title="More">⋮</button>
        </div>
      </header>

      {/* Messages */}
      <div className="messages-area" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="conversation-start">
            <div className="ai-orb"><span className="vai-ai-icon">
      ✨
    </span></div>
            <h2>Ask anything about this PDF</h2>
            <p>I can answer questions using the information inside your document.</p>

            <div className="suggestions">
              <button onClick={() => setInput("Summarize this document")}>
               <span className="vai-ai-icon">
      ✨
    </span> Summarize this document
              </button>
              <button onClick={() => setInput("What are the main concepts?")}>
                <span className="vai-ai-icon">
      ✨
    </span>Main concepts
              </button>
              <button onClick={() => setInput("Explain this document simply")}>
                <span className="vai-ai-icon">
      ✨
    </span>Explain simply
              </button>
            </div>
          </div>
        ) : (
          <div className="message-container">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-row ${message.role === "user" ? "chat-row-user" : ""}`}
              >
                <div className="chat-avatar">
                  {message.role === "assistant" ? <span className="vai-ai-icon">
      ✨
    </span> : "👤"}
                </div>

                <div className="chat-col">
                  <div
                    className={`chat-bubble ${
                      message.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>

                  {message.role === "assistant" && message.sources?.length > 0 && (
                    <SourceCitation sources={message.sources} />
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-row">
                <div className="chat-avatar"><span className="vai-ai-icon">
      ✨
    </span></div>
                <div className="chat-bubble chat-bubble-ai chat-typing">
                  <span className="chat-dot" />
                  <span className="chat-dot" style={{ animationDelay: "0.2s" }} />
                  <span className="chat-dot" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="input-area">
        <form onSubmit={send}>
          <div className="input-box">
            <button type="button" className="attach-button">+</button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              placeholder="Ask a question about your document..."
            />

            <button className="send-button" disabled={!input.trim() || loading}>
              ↑
            </button>
          </div>

          <div className="input-hint">
            AI answers are generated from your document using RAG
          </div>
        </form>
      </div>

      <style>{`
        @keyframes bounce { 0%,80%,100% { transform:translateY(0); opacity:.4; } 40% { transform:translateY(-6px); opacity:1; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px);} to { opacity:1; transform:translateY(0);} }

        .modern-chat { height:100%; width:100%; display:flex; flex-direction:column; box-sizing:border-box; min-height:0; }

        .chat-header { height:70px; flex-shrink:0; display:flex; align-items:center; justify-content:space-between; padding:0 22px; border-bottom:1px solid rgba(255,255,255,.07); background:rgba(10,10,18,.75); backdrop-filter:blur(20px); }
        .chat-document { display:flex; align-items:center; gap:12px; min-width:0; }
        .header-pdf { width:38px; height:43px; display:flex; align-items:center; justify-content:center; border-radius:8px; background:linear-gradient(145deg,#ef4444,#991b1b); font-size:8px; font-weight:800; flex-shrink:0; }
        .header-name { max-width:400px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px; font-weight:650; color:#e8e8ef; }
        .header-status { display:flex; align-items:center; gap:5px; margin-top:4px; font-size:9px; color:#66667a; }
        .header-status span { width:5px; height:5px; border-radius:50%; background:#22c55e; box-shadow:0 0 8px #22c55e; }
        .header-actions { display:flex; gap:5px; }
        .header-actions button { width:32px; height:32px; border:1px solid rgba(255,255,255,.07); border-radius:9px; background:rgba(255,255,255,.035); color:#77778a; cursor:pointer; }
        .header-actions button:hover { background:rgba(255,255,255,.08); color:white; }

        .messages-area { flex:1; min-height:0; overflow-y:auto; position:relative; background:radial-gradient(circle at 50% 35%, rgba(99,102,241,.035), transparent 35%); }

        .conversation-start { height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px; box-sizing:border-box; }
        .ai-orb { width:55px; height:55px; display:flex; align-items:center; justify-content:center; border-radius:18px; margin-bottom:18px; background:linear-gradient(135deg,#6366f1,#a855f7); box-shadow:0 15px 50px rgba(99,102,241,.25); font-size:24px; }
        .conversation-start h2 { margin:0; font-size:20px; letter-spacing:-.025em; }
        .conversation-start p { margin:8px 0 18px; font-size:12px; color:#66667a; }
        .suggestions { display:flex; gap:7px; flex-wrap:wrap; justify-content:center; }
        .suggestions button { padding:8px 12px; border-radius:9px; background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.07); color:#858596; font-size:10px; cursor:pointer; transition:.2s; }
        .suggestions button:hover { color:#c4b5fd; border-color:rgba(139,92,246,.3); background:rgba(99,102,241,.08); }

        .message-container { max-width:900px; margin:auto; padding:35px 30px; display:flex; flex-direction:column; gap:20px; }

        .chat-row { display:flex; align-items:flex-start; gap:12px; animation:fadeIn .3s ease; }
        .chat-row-user { flex-direction:row-reverse; }

        .chat-avatar { width:34px; height:34px; border-radius:50%; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }

        .chat-col { display:flex; flex-direction:column; max-width:78%; }
        .chat-row-user .chat-col { align-items:flex-end; }

        .chat-bubble { padding:14px 18px; border-radius:14px; font-size:14px; line-height:1.7; border:1px solid rgba(255,255,255,.07); }
        .chat-bubble p { margin:0; }
        .chat-bubble-ai { background:rgba(255,255,255,.04); color:#f1f5f9; border-radius:4px 14px 14px 14px; backdrop-filter:blur(10px); }
        .chat-bubble-user { background:linear-gradient(135deg,rgba(99,102,241,.35),rgba(168,85,247,.25)); border-color:rgba(99,102,241,.35); border-radius:14px 4px 14px 14px; color:#f1f5f9; }

        .chat-typing { display:flex; align-items:center; gap:5px; padding:14px 18px; }
        .chat-dot { display:inline-block; width:8px; height:8px; border-radius:50%; background:#a855f7; animation:bounce 1.4s infinite; }

        .input-area { flex-shrink:0; padding:15px 22px 18px; border-top:1px solid rgba(255,255,255,.06); background:rgba(8,8,15,.82); backdrop-filter:blur(20px); }
        .input-area form { max-width:900px; margin:auto; }
        .input-box { display:flex; align-items:center; gap:8px; padding:6px; border-radius:15px; background:rgba(255,255,255,.045); border:1px solid rgba(255,255,255,.09); box-shadow:0 10px 40px rgba(0,0,0,.2); }
        .input-box:focus-within { border-color:rgba(99,102,241,.45); box-shadow:0 0 0 3px rgba(99,102,241,.08); }
        .input-box textarea { flex:1; min-width:0; padding:11px 5px; border:none; outline:none; background:transparent; color:#eeeef5; font-size:13px; resize:none; font-family:inherit; line-height:1.5; max-height:120px; }
        .input-box textarea::placeholder { color:#555568; }

        .attach-button, .send-button { width:36px; height:36px; flex-shrink:0; border:none; border-radius:10px; cursor:pointer; }
        .attach-button { background:rgba(255,255,255,.05); color:#858596; font-size:20px; }
        .send-button { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:white; font-size:19px; font-weight:700; }
        .send-button:disabled { opacity:.3; cursor:not-allowed; }

        .input-hint { text-align:center; margin-top:8px; color:#414152; font-size:9px; }

        @media(max-width:600px) {
          .chat-header { padding:0 12px; }
          .header-name { max-width:200px; }
          .message-container { padding:20px 12px; }
          .input-area { padding:10px; }
          .chat-col { max-width:88%; }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;



