import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar  from "../../components/Navbar";
import axios   from "axios";
import ReactMarkdown from "react-markdown";
import remarkMath    from "remark-math";
import rehypeKatex   from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { trackTutor } from "../../utils/history";
import { triggerRateLimitToast } from "../../utils/rateLimitToast";
import { API_BASE_URL } from "../../config";


// ── Copy button ──
function CopyBtn({ code }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false),2000); }} style={CS.copyBtn}>
      {copied ? "✅ Copied" : "📋 Copy"}
    </button>
  );
}

// ── SVG diagram renderer ──
function SvgDiagram({ code }) {
  const clean = code.trim();
  if (!clean.startsWith("<svg") && !clean.toLowerCase().startsWith("<svg"))
    return <div style={CS.svgError}>⚠️ Could not render diagram</div>;
  return (
    <div style={CS.svgWrap}>
      <div style={CS.svgHeader}><span style={CS.svgLabel}>📊 Diagram</span><CopyBtn code={code}/></div>
      <div style={CS.svgContainer} dangerouslySetInnerHTML={{ __html: clean }}/>
    </div>
  );
}

// ── Markdown renderer ──
function BubbleContent({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        h1:({children})=><h1 style={MS.h1}>{children}</h1>,
        h2:({children})=><h2 style={MS.h2}>{children}</h2>,
        h3:({children})=><h3 style={MS.h3}>{children}</h3>,
        h4:({children})=><h4 style={MS.h4}>{children}</h4>,
        p: ({children})=><p  style={MS.p}>{children}</p>,
        ul:({children})=><ul style={MS.ul}>{children}</ul>,
        ol:({children})=><ol style={MS.ol}>{children}</ol>,
        li:({children})=><li style={MS.li}>{children}</li>,
        strong:({children})=><strong style={MS.strong}>{children}</strong>,
        em:    ({children})=><em     style={MS.em}>{children}</em>,
        hr:()=><hr style={MS.hr}/>,
        blockquote:({children})=><blockquote style={MS.blockquote}>{children}</blockquote>,
        table:({children})=><div style={{overflowX:"auto",marginBottom:14}}><table style={MS.table}>{children}</table></div>,
        th:({children})=><th style={MS.th}>{children}</th>,
        td:({children})=><td style={MS.td}>{children}</td>,
        a:({href,children})=><a href={href} target="_blank" rel="noreferrer" style={MS.link}>{children}</a>,
        code({node,inline,className,children,...props}) {
          const match   = /language-(\w+)/.exec(className||"");
          const lang    = match ? match[1].toLowerCase() : "";
          const codeStr = String(children).replace(/\n$/,"");
          if (!inline && lang==="svg") return <SvgDiagram code={codeStr}/>;
          if (!inline && (match||codeStr.includes("\n"))) return (
            <div style={CS.wrap}>
              <div style={CS.header}><span style={CS.lang}>{lang||"code"}</span><CopyBtn code={codeStr}/></div>
              <SyntaxHighlighter style={oneDark} language={lang||"javascript"} PreTag="div" showLineNumbers wrapLongLines customStyle={CS.block}>{codeStr}</SyntaxHighlighter>
            </div>
          );
          return <code style={MS.inlineCode} {...props}>{children}</code>;
        },
      }}
    >{content}</ReactMarkdown>
  );
}

// ── File preview bubble in chat ──
function FileBubble({ file, previewUrl }) {
  const isImage = file.type.startsWith("image/");
  return (
    <div style={FB.wrap}>
      {isImage ? (
        <img src={previewUrl} alt={file.name} style={FB.img}/>
      ) : (
        <div style={FB.fileBox}>
          <span style={{fontSize:28}}>{file.type==="application/pdf"?"📕":"📄"}</span>
          <div>
            <div style={FB.fileName}>{file.name}</div>
            <div style={FB.fileMeta}>{(file.size/1024).toFixed(1)} KB</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Chat cache helpers ──
const getChatKey = () => {
  const uid = localStorage.getItem("userId") || "guest";
  return "vai_tutor_" + uid;
};
const loadChat = () => {
  try {
    const raw = localStorage.getItem(getChatKey());
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
const saveChat = (msgs) => {
  try { localStorage.setItem(getChatKey(), JSON.stringify(msgs.slice(-50))); }
  catch {}
};
const clearChat = () => {
  try { localStorage.removeItem(getChatKey()); }
  catch {}
};

// ── Main component ──
export default function AITutor() {
  const WELCOME = {
    role:"ai",
    content:"Hello 👋 I'm **VAI Tutor**."
  };
  const [messages, setMessages] = useState(() => {
    const cached = loadChat();
    return cached?.length > 0 ? cached : [WELCOME];
  });
  const [input,      setInput]      = useState("");
  const [typing,     setTyping]     = useState(false);
  const [error,      setError]      = useState("");
  const [files,      setFiles]      = useState([]);
  const [showAttach, setShowAttach] = useState(false);

  const chatEndRef  = useRef(null);
  const fileRef     = useRef(null);
  const imageRef    = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, typing]);

  const handleFiles = async (selectedFiles) => {
    const newFiles = [];
    for (const file of selectedFiles) {
      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
      const base64 = await toBase64(file);
      newFiles.push({ file, previewUrl, base64, type: file.type });
    }
    setFiles(prev => [...prev, ...newFiles]);
    setShowAttach(false);
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const removeFile = (i) => setFiles(prev => prev.filter((_,j)=>j!==i));

  const send = async () => {
    if ((!input.trim() && files.length===0) || typing) return;
    const q       = input.trim();
    const sentFiles = [...files];
    setInput(""); setFiles([]); setError(""); setTyping(true);

    setMessages(p => {
      const updated = [...p, { role:"user", content:q, files:sentFiles }];
      saveChat(updated);
      return updated;
    });

    try {
      let payload = { question: q };
      if (sentFiles.length > 0) {
        payload.attachments = sentFiles.map(f => ({
          name:     f.file.name,
          type:     f.type,
          base64:   f.base64,
          isImage:  f.type.startsWith("image/"),
        }));
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/tutor/ask`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const answer = res.data.answer;
      setMessages(p => {
        const updated = [...p, { role:"ai", content:answer }];
        saveChat(updated);
        return updated;
      });
      if (q) trackTutor(q, answer);

    } catch(err) {
      if (err.response?.status === 429) {
        triggerRateLimitToast(err.response.data.message);
        return;
      }
      const msg = "❌ Could not reach server.";
      setError(msg);
      setMessages(p => [...p, { role:"ai", content:msg }]);
    } finally { setTyping(false); }
  };

  const onKey = (e) => { if (e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();} };

  const clear = () => {
    const welcome = {role:"ai",content:"Hello 👋 Ask me anything, or upload an image/file!"};
    setMessages([welcome]);
    saveChat([welcome]);
    setError(""); setFiles([]);
  };

  const canSend = (input.trim()||files.length>0) && !typing;

  const suggestions = [
    "Explain Binary Search Tree with a diagram",
    "What is Coulomb's law? Show the formula",
    "Write a merge sort in JavaScript",
    "Draw a circuit with two resistors in series",
  ];

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"/>

        {/* ✅ FIX: removed fixed height, use flex-grow to fill remaining space */}
        <div style={S.container}>

          {/* Header */}
          <div style={S.header}>
            <div>
              <h2 style={S.title}>🤖 VAI Tutor</h2>
              <p style={S.sub}>Chat · Images · Files · Diagrams · Formulas</p>
            </div>
            <button style={S.clearBtn} onClick={clear}>🗑 Clear</button>
          </div>

          {/* Chat box */}
          <div style={S.chatBox}>
            {messages.map((msg,i) => (
              <div key={i} style={{...S.row,...(msg.role==="user"?S.rowUser:{})}}>
                <div style={S.avatar}>{msg.role==="ai"?"🤖":"👤"}</div>
                <div style={{...S.bubble,...(msg.role==="user"?S.bubbleUser:S.bubbleAI)}}>
                  {msg.files && msg.files.length>0 && (
                    <div style={S.filePreviews}>
                      {msg.files.map((f,j) => (
                        <FileBubble key={j} file={f.file} previewUrl={f.previewUrl}/>
                      ))}
                    </div>
                  )}
                  {msg.content && (
                    msg.role==="ai"
                      ? <BubbleContent content={msg.content}/>
                      : <p style={{margin:0,fontSize:14,lineHeight:1.6}}>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div style={S.row}>
                <div style={S.avatar}>🤖</div>
                <div style={{...S.bubble,...S.bubbleAI,...S.typingBubble}}>
                  <span style={S.dot}/><span style={{...S.dot,animationDelay:"0.2s"}}/><span style={{...S.dot,animationDelay:"0.4s"}}/>
                </div>
              </div>
            )}
            <div ref={chatEndRef}/>
          </div>

          {/* Suggestions */}
          {messages.length<=1 && (
            <div style={S.suggestions}>
              {suggestions.map(q=>(
                <button key={q} style={S.suggBtn} onClick={()=>setInput(q)}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(124,58,237,0.5)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"}
                >💡 {q}</button>
              ))}
            </div>
          )}

          {/* File preview bar */}
          {files.length>0 && (
            <div style={S.fileBar}>
              {files.map((f,i)=>(
                <div key={i} style={S.fileChip}>
                  {f.previewUrl
                    ? <img src={f.previewUrl} alt="" style={S.chipImg}/>
                    : <span style={{fontSize:18}}>{f.type==="application/pdf"?"📕":"📄"}</span>
                  }
                  <span style={S.chipName}>{f.file.name.length>16?f.file.name.slice(0,16)+"…":f.file.name}</span>
                  <button style={S.chipRemove} onClick={()=>removeFile(i)}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Input area */}
          <div style={S.inputArea}>
            <input ref={imageRef} type="file" accept="image/*" multiple style={{display:"none"}}
              onChange={e=>handleFiles(Array.from(e.target.files))}/>
            <input ref={fileRef}  type="file" accept=".pdf,.txt,.md,.js,.py,.java,.cpp,.c" multiple style={{display:"none"}}
              onChange={e=>handleFiles(Array.from(e.target.files))}/>

            <div style={{position:"relative"}}>
              <button style={{...S.attachBtn,background:showAttach?"rgba(124,58,237,0.2)":"rgba(255,255,255,0.06)"}}
                onClick={()=>setShowAttach(v=>!v)}
                title="Attach file or image"
              >
                📎
              </button>

              {showAttach && (
                <div style={S.attachMenu}>
                  <button style={S.attachOpt} onClick={()=>{imageRef.current.click();setShowAttach(false);}}>
                    <span style={S.attachOptIcon}>🖼️</span>
                    <div>
                      <div style={S.attachOptTitle}>Upload Image</div>
                      <div style={S.attachOptSub}>JPG, PNG, GIF, WebP</div>
                    </div>
                  </button>
                  <button style={S.attachOpt} onClick={()=>{fileRef.current.click();setShowAttach(false);}}>
                    <span style={S.attachOptIcon}>📄</span>
                    <div>
                      <div style={S.attachOptTitle}>Upload File</div>
                      <div style={S.attachOptSub}>PDF, TXT, code files</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <textarea
              placeholder={files.length>0
                ? "Ask about the uploaded file/image… (Enter to send)"
                : "Ask anything… (Enter to send, Shift+Enter for new line)"}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={onKey}
              rows={2}
              style={S.textarea}
            />

            <button onClick={send} disabled={!canSend}
              style={{...S.sendBtn, opacity:canSend?1:0.45}}
            >➤</button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:0.4}40%{transform:translateY(-6px);opacity:1}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .katex-display{background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:10px;padding:16px 20px;margin:14px 0;overflow-x:auto;text-align:center;}
        .katex-display>.katex{color:#e2d9f3!important;font-size:1.25em!important;}
        .katex .mord,.katex .mbin,.katex .mrel,.katex .mopen,.katex .mclose,.katex .mfrac,.katex .minner,.katex .mop{color:#e2d9f3!important;}
        .katex:not(.katex-display .katex){background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.2);border-radius:4px;padding:1px 6px;color:#c4b5fd!important;}

        /* ✅ Mobile fixes */
        @media (max-width: 768px) {
          .tutor-container {
            padding: 12px !important;
            gap: 8px !important;
          }
          .tutor-suggestions {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// ✅ FIXED styles — removed fixed height, use flex to fill space
const S = {
  container: {
    padding: 24,
    display: "flex",
    flexDirection: "column",
    // ✅ KEY FIX: instead of height:calc(100vh - 68px) which collapses on mobile,
    // use flex:1 + minHeight:0 so it grows to fill .page-main properly
    flex: 1,
    minHeight: 0,
    gap: 12,
    overflow: "hidden",   // ✅ prevent double scrollbars
  },
  header:      { display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexShrink:0 },
  title:       { fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#a855f7,#3b82f6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" },
  sub:         { fontSize:13, color:"#64748b", marginTop:3 },
  clearBtn:    { padding:"8px 16px", borderRadius:8, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"#94a3b8", fontSize:13, fontWeight:600, cursor:"pointer", flexShrink:0 },
  chatBox:     { flex:1, minHeight:0, overflowY:"auto", padding:20, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, backdropFilter:"blur(20px)", display:"flex", flexDirection:"column", gap:20, scrollbarWidth:"thin", scrollbarColor:"rgba(124,58,237,0.3) transparent" },
  row:         { display:"flex", alignItems:"flex-start", gap:12, animation:"fadeIn 0.3s ease" },
  rowUser:     { flexDirection:"row-reverse" },
  avatar:      { width:36, height:36, borderRadius:"50%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 },
  bubble:      { maxWidth:"80%", padding:"14px 18px", borderRadius:14, fontSize:14, lineHeight:1.75, border:"1px solid rgba(255,255,255,0.07)" },
  bubbleAI:    { background:"rgba(255,255,255,0.04)", color:"#f1f5f9", borderRadius:"4px 14px 14px 14px", backdropFilter:"blur(10px)" },
  bubbleUser:  { background:"linear-gradient(135deg,rgba(124,58,237,0.35),rgba(168,85,247,0.25))", borderColor:"rgba(124,58,237,0.35)", borderRadius:"14px 4px 14px 14px", color:"#f1f5f9" },
  typingBubble:{ display:"flex", alignItems:"center", gap:5, padding:"14px 18px" },
  dot:         { display:"inline-block", width:8, height:8, borderRadius:"50%", background:"#a855f7", animation:"bounce 1.4s infinite" },
  filePreviews:{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10 },
  suggestions: { display:"flex", gap:8, flexWrap:"wrap", flexShrink:0 },
  suggBtn:     { padding:"8px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.03)", color:"#94a3b8", fontSize:12, fontWeight:500, cursor:"pointer", transition:"border-color 0.2s", fontFamily:"sans-serif", textAlign:"left" },
  fileBar:     { display:"flex", gap:8, flexWrap:"wrap", padding:"10px 14px", background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.15)", borderRadius:10, flexShrink:0 },
  fileChip:    { display:"flex", alignItems:"center", gap:8, padding:"6px 10px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(124,58,237,0.25)", borderRadius:8 },
  chipImg:     { width:32, height:32, borderRadius:6, objectFit:"cover" },
  chipName:    { fontSize:12, color:"#c4b5fd", fontWeight:600 },
  chipRemove:  { background:"none", border:"none", color:"#a855f7", cursor:"pointer", fontSize:13, padding:"0 2px", lineHeight:1 },
  inputArea:   { display:"flex", gap:8, alignItems:"flex-end", flexShrink:0, position:"relative" },
  attachBtn:   { width:44, height:44, borderRadius:10, border:"1px solid rgba(255,255,255,0.1)", color:"#e2e8f0", cursor:"pointer", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" },
  attachMenu:  { position:"absolute", bottom:"calc(100% + 10px)", left:0, background:"rgba(13,13,26,0.98)", border:"1px solid rgba(124,58,237,0.25)", borderRadius:12, padding:8, display:"flex", flexDirection:"column", gap:4, zIndex:100, width:220, boxShadow:"0 12px 40px rgba(0,0,0,0.5)", backdropFilter:"blur(20px)" },
  attachOpt:   { display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:8, border:"none", background:"transparent", cursor:"pointer", transition:"background 0.15s", textAlign:"left", width:"100%" },
  attachOptIcon:{ fontSize:24, flexShrink:0 },
  attachOptTitle:{ fontSize:13, fontWeight:700, color:"#f1f5f9" },
  attachOptSub: { fontSize:11, color:"#64748b", marginTop:2 },
  textarea:    { flex:1, padding:"12px 16px", borderRadius:12, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"#f1f5f9", fontSize:14, resize:"none", fontFamily:"inherit", outline:"none", backdropFilter:"blur(10px)", transition:"border-color 0.2s", lineHeight:1.6 },
  sendBtn:     { width:48, height:48, borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", border:"none", cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 4px 15px rgba(124,58,237,0.4)", transition:"all 0.2s" },
};

const FB = {
  wrap:     { maxWidth:240 },
  img:      { maxWidth:240, maxHeight:200, borderRadius:10, display:"block", border:"1px solid rgba(255,255,255,0.1)" },
  fileBox:  { display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"rgba(255,255,255,0.08)", borderRadius:10, border:"1px solid rgba(255,255,255,0.1)" },
  fileName: { fontSize:13, fontWeight:700, color:"#f1f5f9" },
  fileMeta: { fontSize:11, color:"#64748b", marginTop:2 },
};

const MS = {
  h1:{ fontFamily:"'Syne',sans-serif", fontSize:"1.7em", fontWeight:800, background:"linear-gradient(135deg,#e2d9f3,#a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", marginTop:20, marginBottom:10 },
  h2:{ fontFamily:"'Syne',sans-serif", fontSize:"1.3em", fontWeight:700, color:"#c4b5fd", marginTop:18, marginBottom:8, paddingBottom:6, borderBottom:"1px solid rgba(124,58,237,0.2)" },
  h3:{ fontSize:"1.1em", fontWeight:700, color:"#a78bfa", marginTop:14, marginBottom:6 },
  h4:{ fontSize:"1em",  fontWeight:700, color:"#8b5cf6", marginTop:12, marginBottom:4 },
  p: { color:"#cbd5e1", lineHeight:1.85, marginBottom:12, fontSize:14 },
  ul:{ paddingLeft:22, marginBottom:12, display:"flex", flexDirection:"column", gap:5 },
  ol:{ paddingLeft:22, marginBottom:12, display:"flex", flexDirection:"column", gap:5 },
  li:{ color:"#94a3b8", fontSize:14, lineHeight:1.7 },
  inlineCode:{ background:"rgba(124,58,237,0.18)", border:"1px solid rgba(124,58,237,0.25)", borderRadius:4, padding:"2px 7px", fontFamily:"'Courier New',monospace", fontSize:"0.88em", color:"#c4b5fd" },
  blockquote:{ borderLeft:"3px solid #7c3aed", padding:"8px 14px", background:"rgba(124,58,237,0.08)", borderRadius:"0 8px 8px 0", margin:"12px 0", color:"#94a3b8", fontStyle:"italic" },
  strong:{ color:"#f1f5f9", fontWeight:700 },
  em:    { color:"#a78bfa", fontStyle:"italic" },
  hr:    { border:"none", borderTop:"1px solid rgba(255,255,255,0.08)", margin:"16px 0" },
  table: { width:"100%", borderCollapse:"collapse", fontSize:13 },
  th:    { padding:"8px 12px", background:"rgba(124,58,237,0.2)", color:"#c4b5fd", fontWeight:700, textAlign:"left", border:"1px solid rgba(124,58,237,0.2)" },
  td:    { padding:"8px 12px", color:"#94a3b8", border:"1px solid rgba(255,255,255,0.06)" },
  link:  { color:"#60a5fa", textDecoration:"none", fontWeight:500 },
};

const CS = {
  wrap:         { borderRadius:10, overflow:"hidden", marginBottom:14, marginTop:4, border:"1px solid rgba(255,255,255,0.08)" },
  header:       { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 14px", background:"rgba(0,0,0,0.5)", borderBottom:"1px solid rgba(255,255,255,0.06)" },
  lang:         { fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.08em" },
  copyBtn:      { padding:"4px 12px", borderRadius:6, background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.25)", color:"#a855f7", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"sans-serif" },
  block:        { margin:0, borderRadius:0, fontSize:"13px", lineHeight:1.75, background:"rgba(0,0,0,0.55)" },
  svgWrap:      { borderRadius:12, overflow:"hidden", marginBottom:16, marginTop:6, border:"1px solid rgba(124,58,237,0.25)", boxShadow:"0 4px 24px rgba(124,58,237,0.15)" },
  svgHeader:    { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 16px", background:"linear-gradient(135deg,rgba(124,58,237,0.2),rgba(99,102,241,0.15))", borderBottom:"1px solid rgba(124,58,237,0.2)" },
  svgLabel:     { fontSize:12, fontWeight:700, color:"#a855f7", letterSpacing:"0.05em" },
  svgContainer: { background:"#0f172a", padding:"24px", display:"flex", justifyContent:"center", alignItems:"center", overflow:"auto", minHeight:80 },
  svgError:     { padding:"12px 16px", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, color:"#fca5a5", fontSize:13 },
};