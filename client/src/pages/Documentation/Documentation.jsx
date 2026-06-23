import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ReactMarkdown  from "react-markdown";
import remarkMath   from "remark-math";
import rehypeKatex  from "rehype-katex";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { addNotification } from "../../utils/notifications";
import { trackDoc } from "../../utils/history";
import { triggerRateLimitToast } from "../../utils/rateLimitToast";
import { API_BASE_URL } from "../../config";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function CopyBtn({ code }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
      style={CS.copyBtn}
    >
      {copied ? "✅ Copied" : "📋 Copy"}
    </button>
  );
}

function DocMarkdown({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        h1: ({children}) => <h1 style={MS.h1}>{children}</h1>,
        h2: ({children}) => <h2 style={MS.h2}>{children}</h2>,
        h3: ({children}) => <h3 style={MS.h3}>{children}</h3>,
        h4: ({children}) => <h4 style={MS.h4}>{children}</h4>,
        p:  ({children}) => <p  style={MS.p}>{children}</p>,
        ul: ({children}) => <ul style={MS.ul}>{children}</ul>,
        ol: ({children}) => <ol style={MS.ol}>{children}</ol>,
        li: ({children}) => <li style={MS.li}>{children}</li>,
        strong: ({children}) => <strong style={MS.strong}>{children}</strong>,
        em:     ({children}) => <em style={MS.em}>{children}</em>,
        hr: () => <hr style={MS.hr} />,
        blockquote: ({children}) => <blockquote style={MS.blockquote}>{children}</blockquote>,
        table: ({children}) => (
          <div style={{overflowX:"auto",marginBottom:20}}>
            <table style={MS.table}>{children}</table>
          </div>
        ),
        thead: ({children}) => <thead style={{background:"rgba(124,58,237,0.15)"}}>{children}</thead>,
        th: ({children}) => <th style={MS.th}>{children}</th>,
        td: ({children}) => <td style={MS.td}>{children}</td>,
        tr: ({children}) => <tr style={MS.tr}>{children}</tr>,
        a:  ({href,children}) => <a href={href} target="_blank" rel="noreferrer" style={MS.link}>{children}</a>,
        code({node, inline, className, children, ...props}) {
          const match = /language-(\w+)/.exec(className || "");
          const codeStr = String(children).replace(/\n$/,"");
          if (!inline && (match || codeStr.includes("\n"))) {
            const lang = match ? match[1] : "text";
            return (
              <div style={CS.wrap}>
                <div style={CS.header}>
                  <span style={CS.lang}>{lang}</span>
                  <CopyBtn code={codeStr} />
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={lang}
                  PreTag="div"
                  showLineNumbers
                  wrapLongLines
                  customStyle={CS.block}
                >
                  {codeStr}
                </SyntaxHighlighter>
              </div>
            );
          }
          return <code style={MS.inlineCode} {...props}>{children}</code>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

const getCacheKey = (topic) => {
  const uid = localStorage.getItem("userId") || "guest";
  return `vai_doc_${uid}_${topic.toLowerCase().replace(/\s+/g,"_")}`;
};
const loadCached = (topic) => {
  try { return JSON.parse(localStorage.getItem(getCacheKey(topic)) || "null"); }
  catch { return null; }
};
const saveCache = (topic, data) => {
  try { localStorage.setItem(getCacheKey(topic), JSON.stringify(data)); } catch {}
};
const clearCache = (topic) => {
  try { localStorage.removeItem(getCacheKey(topic)); } catch {}
};

const PLACEHOLDER = (topic) => topic
  ? `# ${topic}\n\nClick **✨ Generate AI** to create full documentation for this topic.`
  : `# Documentation\n\nClick **✨ Generate AI** to get started.`;

function Documentation() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const fileRef    = useRef(null);

  const topic        = location.state?.topic        || "";
  const autoGenerate = location.state?.autoGenerate  || false;
  const fromHistory  = location.state?.fromHistory   || false;
  const stateContent = location.state?.content       || null;

  const [file,      setFile]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [exporting, setExporting] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [generated, setGenerated] = useState(false);
  const [genCount,  setGenCount]  = useState(0);
  const [cachedAt,  setCachedAt]  = useState(null);

  const [content, setContent] = useState(() => {
    if (stateContent) return stateContent;
    return PLACEHOLDER(topic);
  });

  useEffect(() => {
    if (stateContent) {
      setGenerated(true);
      setGenCount(1);
      const cached = loadCached(topic);
      if (cached?.savedAt) setCachedAt(cached.savedAt);
      return;
    }

    if (!topic) return;

    const cached = loadCached(topic);
    if (cached?.content) {
      setContent(cached.content);
      setGenerated(true);
      setGenCount(cached.genCount || 1);
      setCachedAt(cached.savedAt || null);
    } else if (autoGenerate) {
      generate();
    }
  }, []);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (!["application/pdf","text/plain"].includes(f.type)) { setError("Only PDF and TXT supported."); return; }
    setFile(f); setError("");
  };
  const removeFile = () => { setFile(null); if (fileRef.current) fileRef.current.value=""; };

  const generate = async () => {
    const topicName = topic || "General Topic";
    try {
      setLoading(true); setError("");
      const form = new FormData();
      form.append("topic", topicName);
      if (file) form.append("file", file);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/docs/generate`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: form,
      });
      const data = await res.json();
      if (res.status === 429) { triggerRateLimitToast(data.message); return; }
      if (!res.ok) {
        if (res.status === 429) { setError(data.message); return; }
        setError(data.message || "Generation failed."); return;
      }
      if (!data.success) { setError(data.message || "Generation failed."); return; }

      const newContent = genCount > 0 ? content + "\n\n---\n\n" + data.content : data.content;
      setContent(newContent);
      setGenerated(true);
      const newCount = genCount + 1;
      setGenCount(newCount);
      const savedAt = new Date().toISOString();
      setCachedAt(savedAt);
      saveCache(topicName, { content: newContent, genCount: newCount, savedAt });
      addNotification("📄", `Documentation generated for "${topicName}"`, "doc");
      trackDoc(topicName);
    } catch {
      setError("Cannot connect to server.");
    } finally { setLoading(false); }
  };

  // ── Export PDF ──
  const exportPDF = () => {
    setExporting(true);
    const win = window.open("","_blank");
    win.document.write(`<!DOCTYPE html><html><head>
<meta charset="UTF-8">
<title>${topic} — VAI Documentation</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Fira+Code:wght@400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Inter',sans-serif;font-size:15px;line-height:1.8;color:#1a1a2e;background:#fff;padding:48px 64px;max-width:860px;margin:0 auto;}
  .cover{border-bottom:3px solid #7c3aed;padding-bottom:28px;margin-bottom:36px;}
  .cover-logo{display:flex;align-items:center;gap:10px;margin-bottom:16px;}
  .cover-logo-name{font-size:20px;font-weight:800;color:#7c3aed;letter-spacing:0.05em;}
  .cover h1{font-size:32px;font-weight:800;color:#1a1a2e;margin-bottom:8px;}
  .cover-meta{font-size:13px;color:#64748b;}
  h1{font-size:28px;font-weight:800;color:#1a1a2e;margin-top:36px;margin-bottom:14px;border-bottom:2px solid #e2d9f3;padding-bottom:8px;}
  h2{font-size:21px;font-weight:700;color:#7c3aed;margin-top:30px;margin-bottom:10px;padding-left:12px;border-left:4px solid #7c3aed;}
  h3{font-size:17px;font-weight:700;color:#374151;margin-top:22px;margin-bottom:8px;}
  h4{font-size:15px;font-weight:700;color:#4b5563;margin-top:16px;margin-bottom:6px;}
  p{margin-bottom:14px;color:#374151;}
  ul,ol{padding-left:26px;margin-bottom:16px;}
  li{margin-bottom:6px;color:#374151;}
  strong{font-weight:700;color:#1a1a2e;}
  em{font-style:italic;color:#6b7280;}
  code{background:#f1f5f9;border:1px solid #e2e8f0;border-radius:4px;padding:2px 7px;font-family:'Fira Code',monospace;font-size:13px;color:#7c3aed;}
  pre{background:#1e293b;color:#e2e8f0;border-radius:10px;padding:20px 22px;overflow-x:auto;margin:18px 0;font-family:'Fira Code',monospace;font-size:13px;line-height:1.75;border-left:4px solid #7c3aed;}
  pre code{background:none;border:none;color:inherit;padding:0;font-size:inherit;}
  table{width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;}
  th{background:#7c3aed;color:white;padding:10px 14px;text-align:left;font-weight:700;}
  td{padding:9px 14px;border-bottom:1px solid #e2e8f0;color:#374151;}
  tr:nth-child(even) td{background:#f8f5ff;}
  blockquote{border-left:4px solid #7c3aed;padding:10px 18px;background:#f5f3ff;border-radius:0 8px 8px 0;margin:16px 0;color:#4b5563;font-style:italic;}
  hr{border:none;border-top:1px solid #e2e8f0;margin:24px 0;}
  .doc-footer{margin-top:48px;padding-top:18px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;color:#9ca3af;font-size:12px;}
  @media print{body{padding:24px 36px;}pre{white-space:pre-wrap;word-break:break-word;}}
</style>
</head><body>
<div class="cover">
  <div class="cover-logo"><span class="cover-logo-name">VAI</span></div>
  <h1>${topic || "Documentation"}</h1>
  <div class="cover-meta">Generated on ${new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})} &nbsp;·&nbsp; VAI AI Learning Platform</div>
</div>
${markdownToHtml(content)}
<div class="doc-footer">
  <span>VAI — AI Learning Platform</span>
  <span>${topic} · ${new Date().toLocaleDateString()}</span>
</div>
<script>window.onload=()=>{setTimeout(()=>{window.print();window.close();},600);}<\/script>
</body></html>`);
    win.document.close();
    setExporting(false);
  };

  const exportTxt = () => {
    const blob = new Blob([content],{type:"text/plain"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${topic||"documentation"}-VAI.txt`;
    a.click();
  };

  const addBookmark = () => {
    const sel = window.getSelection().toString().trim();
    if (!sel) return;
    setBookmarks(p => [...p, sel]);
  };

  function markdownToHtml(md) {
    return md
      .replace(/```(\w+)?\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
      .replace(/`([^`\n]+)`/g, "<code>$1</code>")
      .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
      .replace(/^### (.+)$/gm,  "<h3>$1</h3>")
      .replace(/^## (.+)$/gm,   "<h2>$1</h2>")
      .replace(/^# (.+)$/gm,    "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g,     "<em>$1</em>")
      .replace(/^---$/gm,        "<hr>")
      .replace(/^> (.+)$/gm,     "<blockquote>$1</blockquote>")
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
      .replace(/\n\n/g, "</p><p>");
  }

  const topicName = topic || "Documentation";

  return (
    <>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"/>
    <style>{`
      @keyframes spin { to { transform: rotate(360deg); } }
      .katex-display { background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:10px;padding:16px 20px;margin:16px 0;overflow-x:auto;text-align:center; }
      .katex-display > .katex { color:#e2d9f3 !important;font-size:1.2em !important; }
      .katex:not(.katex-display .katex) { background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.2);border-radius:4px;padding:1px 6px;color:#c4b5fd !important; }
    `}</style>
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />
        <div style={S.container}>

          {/* HEADER */}
          <div style={S.header}>
            <div>
              <h1 style={S.title}>📄 {topicName}</h1>
              <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                <p style={S.sub}>AI-Generated Documentation</p>
                {fromHistory && (
                  <span style={{fontSize:11,color:"#60a5fa",background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.25)",borderRadius:100,padding:"2px 10px",fontWeight:600}}>
                    📅 Opened from History
                  </span>
                )}
              </div>
            </div>

            <div style={S.actions}>
              <input ref={fileRef} type="file" accept=".pdf,.txt" style={{display:"none"}} onChange={handleFile} />
              {file ? (
                <div style={S.filePill}>
                  <span style={{fontSize:13}}>📄 {file.name.length>18?file.name.slice(0,18)+"…":file.name}</span>
                  <button style={S.removeFile} onClick={removeFile}>✕</button>
                </div>
              ) : (
                <button style={S.ghostBtn} onClick={()=>fileRef.current.click()}>📎 Upload File</button>
              )}
              <button style={{...S.primaryBtn,opacity:loading?0.7:1}} onClick={generate} disabled={loading}>
                {loading ? <><span style={S.spinner}/>Generating…</> : "✨ Generate AI"}
              </button>
              <div style={{display:"flex",gap:0}}>
                <button style={{...S.ghostBtn,borderRadius:"8px 0 0 8px",borderRight:"none"}} onClick={exportPDF} disabled={exporting}>📥 PDF</button>
                <button style={{...S.ghostBtn,borderRadius:"0 8px 8px 0"}} onClick={exportTxt}>TXT</button>
              </div>
              
            </div>
          </div>

          {file && (
            <div style={S.fileBanner}>📄 Using: <strong>{file.name}</strong> ({(file.size/1024).toFixed(1)} KB)</div>
          )}
          {error && <div style={S.errorBanner}>❌ {error}</div>}

          <div style={S.body}>

            {/* MAIN CONTENT */}
            <div style={S.editor}>
              {loading && (
                <div style={S.loadingOverlay}>
                  <div style={S.loadingSpinner}/>
                  <p style={{color:"#a855f7",fontWeight:700,marginTop:16}}>Generating documentation…</p>
                  <p style={{color:"#64748b",fontSize:13,marginTop:6}}>Building structured content with AI</p>
                </div>
              )}
              <div style={{opacity:loading?0.2:1,transition:"opacity 0.3s"}}>
                <DocMarkdown content={content} />
                {generated && !loading && (
                  <div style={S.generateMoreBox}>
                    <div style={S.generateMoreLeft}>
                      <span style={{fontSize:24}}>✨</span>
                      <div>
                        <p style={{fontSize:14,fontWeight:700,color:"#f1f5f9",margin:0}}>
                          Want more on <span style={{color:"#a855f7"}}>{topicName}</span>?
                        </p>
                        <p style={{fontSize:12,color:"#64748b",marginTop:3}}>Generate additional content, examples or deeper explanations</p>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button style={S.moreBtn} onClick={generate} disabled={loading}>
                        {loading?"Generating…":"🔄 Generate More"}
                      </button>
                      <button style={S.freshBtn} onClick={()=>{ clearCache(topicName); setContent(PLACEHOLDER(topicName)); setGenerated(false); setGenCount(0); setCachedAt(null); }}>
                        ↺ Fresh Start
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SIDEBAR */}
            <div style={S.sidebar}>
              <div style={S.sideCard}>
                <h3 style={S.sideTitle}>📌 Topic</h3>
                <div style={S.topicBadge}>{topicName}</div>
                {file && <p style={{fontSize:11,color:"#475569",marginTop:8}}>📎 {file.name}</p>}
              </div>

              <div style={S.sideCard}>
                <h3 style={S.sideTitle}>📋 Contents</h3>
                <div style={{display:"flex",flexDirection:"column",gap:3,marginTop:10}}>
                  {content.split("\n").filter(line=>line.startsWith("## ")).map(line=>line.replace(/^## /,"").trim()).map(item=>(
                    <div key={item} style={S.tocItem}
                      onClick={()=>{
                        const headings=document.querySelectorAll("h2");
                        const match=Array.from(headings).find(h=>h.textContent.replace(/[^a-zA-Z0-9 ]/g,"").trim().includes(item.replace(/[^a-zA-Z0-9 ]/g,"").trim()));
                        if(match) match.scrollIntoView({behavior:"smooth",block:"start"});
                      }}
                    >
                      <span style={{color:"rgba(168,85,247,0.5)",fontSize:10,marginRight:6}}>▸</span>
                      {item.replace(/^[^\w]*/,"").slice(0,28)}{item.length>28?"…":""}
                    </div>
                  ))}
                  {content.split("\n").filter(l=>l.startsWith("## ")).length===0&&(
                    <p style={{fontSize:12,color:"#334155",marginTop:4}}>Generate content to see sections</p>
                  )}
                </div>
              </div>

              <div style={S.sideCard}>
                <h3 style={S.sideTitle}>💾 Export</h3>
                <p style={{fontSize:12,color:"#64748b",marginBottom:12,marginTop:6}}>Save your documentation</p>
                <button style={S.exportCardBtn} onClick={exportPDF}>📥 Export as PDF</button>
                <button style={{...S.exportCardBtn,marginTop:8,background:"rgba(255,255,255,0.04)"}} onClick={exportTxt}>📄 Export as TXT</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

const S = {
  container:      { padding:24,display:"flex",flexDirection:"column",gap:16 },
  header:         { display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12,paddingBottom:18,borderBottom:"1px solid rgba(255,255,255,0.06)" },
  title:          { fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,background:"linear-gradient(135deg,#f1f5f9,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:4 },
  sub:            { fontSize:13,color:"#64748b" },
  actions:        { display:"flex",gap:8,flexWrap:"wrap",alignItems:"center" },
  primaryBtn:     { display:"inline-flex",alignItems:"center",gap:8,padding:"9px 18px",borderRadius:8,background:"linear-gradient(135deg,#7c3aed,#a855f7)",border:"none",color:"white",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 18px rgba(124,58,237,0.35)",fontFamily:"sans-serif" },
  ghostBtn:       { padding:"9px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"#e2e8f0",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"sans-serif" },
  filePill:       { display:"inline-flex",alignItems:"center",gap:8,padding:"7px 12px",borderRadius:8,background:"rgba(124,58,237,0.12)",border:"1px solid rgba(124,58,237,0.25)",fontSize:13,color:"#c4b5fd" },
  removeFile:     { background:"none",border:"none",color:"#a855f7",cursor:"pointer",fontSize:13,padding:"0 2px" },
  fileBanner:     { padding:"10px 16px",background:"rgba(124,58,237,0.08)",border:"1px solid rgba(124,58,237,0.2)",borderRadius:8,fontSize:13,color:"#c4b5fd" },
  errorBanner:    { padding:"10px 14px",background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,color:"#fca5a5",fontSize:13 },
  body:           { display:"grid",gridTemplateColumns:"1fr 240px",gap:20,alignItems:"start" },
  editor:         { background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"28px 32px",position:"relative",minHeight:500 },
  loadingOverlay: { position:"absolute",inset:0,background:"rgba(8,8,16,0.8)",borderRadius:16,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:10,backdropFilter:"blur(4px)" },
  loadingSpinner: { width:44,height:44,borderRadius:"50%",border:"3px solid rgba(124,58,237,0.2)",borderTop:"3px solid #a855f7",animation:"spin 0.8s linear infinite" },
  spinner:        { display:"inline-block",width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid white",animation:"spin 0.8s linear infinite" },
  sidebar:        { display:"flex",flexDirection:"column",gap:14 },
  sideCard:       { background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:16,backdropFilter:"blur(20px)" },
  sideTitle:      { fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:"#a855f7",marginBottom:2 },
  topicBadge:     { display:"inline-block",padding:"5px 12px",borderRadius:100,background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)",color:"#c4b5fd",fontSize:13,fontWeight:600,marginTop:8 },
  tocItem:        { fontSize:13,color:"#64748b",cursor:"pointer",padding:"4px 8px",borderRadius:6,transition:"all 0.2s",display:"flex",alignItems:"center" },
  bookmarkItem:   { display:"flex",gap:8,padding:"8px 10px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8 },
  removeBookmark: { background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:12,padding:0,flexShrink:0 },
  exportCardBtn:     { width:"100%",padding:"9px",borderRadius:8,background:"linear-gradient(135deg,#7c3aed,#a855f7)",border:"none",color:"white",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"sans-serif" },
  generateMoreBox:   { marginTop:32,padding:"18px 22px",background:"linear-gradient(135deg,rgba(124,58,237,0.1),rgba(99,102,241,0.08))",border:"1px solid rgba(124,58,237,0.25)",borderRadius:14,display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap" },
  generateMoreLeft:  { display:"flex",alignItems:"center",gap:14 },
  moreBtn:           { padding:"10px 20px",borderRadius:9,background:"linear-gradient(135deg,#7c3aed,#a855f7)",border:"none",color:"white",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 16px rgba(124,58,237,0.35)",fontFamily:"sans-serif" },
  freshBtn:          { padding:"10px 16px",borderRadius:9,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",color:"#94a3b8",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"sans-serif" },
};

const MS = {
  h1:         { fontFamily:"'Syne',sans-serif",fontSize:"1.9em",fontWeight:800,background:"linear-gradient(135deg,#f1f5f9,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginTop:32,marginBottom:14,lineHeight:1.2,paddingBottom:10,borderBottom:"2px solid rgba(124,58,237,0.2)" },
  h2:         { fontFamily:"'Syne',sans-serif",fontSize:"1.4em",fontWeight:700,color:"#c4b5fd",marginTop:28,marginBottom:10,paddingLeft:12,borderLeft:"4px solid #7c3aed",lineHeight:1.3 },
  h3:         { fontSize:"1.15em",fontWeight:700,color:"#a78bfa",marginTop:20,marginBottom:8 },
  h4:         { fontSize:"1em",fontWeight:700,color:"#8b5cf6",marginTop:14,marginBottom:6 },
  p:          { color:"#cbd5e1",lineHeight:1.85,marginBottom:14,fontSize:14.5 },
  ul:         { paddingLeft:22,marginBottom:14,display:"flex",flexDirection:"column",gap:6 },
  ol:         { paddingLeft:22,marginBottom:14,display:"flex",flexDirection:"column",gap:6 },
  li:         { color:"#94a3b8",fontSize:14,lineHeight:1.7 },
  strong:     { color:"#f1f5f9",fontWeight:700 },
  em:         { color:"#a78bfa",fontStyle:"italic" },
  hr:         { border:"none",borderTop:"1px solid rgba(255,255,255,0.08)",margin:"24px 0" },
  blockquote: { borderLeft:"4px solid #7c3aed",padding:"10px 18px",background:"rgba(124,58,237,0.08)",borderRadius:"0 10px 10px 0",margin:"16px 0",color:"#94a3b8",fontStyle:"italic" },
  inlineCode: { background:"rgba(124,58,237,0.18)",border:"1px solid rgba(124,58,237,0.25)",borderRadius:4,padding:"2px 7px",fontFamily:"'Courier New',monospace",fontSize:"0.88em",color:"#c4b5fd" },
  table:      { width:"100%",borderCollapse:"collapse",fontSize:13.5,borderRadius:10,overflow:"hidden" },
  th:         { padding:"10px 14px",background:"rgba(124,58,237,0.2)",color:"#c4b5fd",fontWeight:700,textAlign:"left",border:"1px solid rgba(124,58,237,0.2)" },
  td:         { padding:"9px 14px",color:"#94a3b8",border:"1px solid rgba(255,255,255,0.06)" },
  tr:         { transition:"background 0.15s" },
  link:       { color:"#60a5fa",textDecoration:"none",fontWeight:500 },
};

const CS = {
  wrap:   { borderRadius:10,overflow:"hidden",marginBottom:18,marginTop:6,border:"1px solid rgba(255,255,255,0.08)" },
  header: { display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 14px",background:"rgba(0,0,0,0.5)",borderBottom:"1px solid rgba(255,255,255,0.06)" },
  lang:   { fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.1em" },
  copyBtn:{ padding:"4px 12px",borderRadius:6,background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.25)",color:"#a855f7",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"sans-serif" },
  block:  { margin:0,borderRadius:0,fontSize:"13px",lineHeight:1.75,background:"rgba(0,0,0,0.55)" },
};

export default Documentation;