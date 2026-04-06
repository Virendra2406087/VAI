import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

function DocumentationHome() {
  const navigate   = useNavigate();
  const fileRef    = useRef(null);
  const [file,     setFile]     = useState(null);
  const [topic,    setTopic]    = useState("");
  const [dragging, setDragging] = useState(false);
  const [error,    setError]    = useState("");

  const ALLOWED = ["application/pdf","text/plain"];
  const QUICK   = ["Binary Search Trees","Dynamic Programming","React Hooks","System Design","Machine Learning","Sorting Algorithms"];

  const processFile = (f) => {
    if (!f) return;
    if (!ALLOWED.includes(f.type)) { setError("Only PDF and TXT files are supported."); return; }
    if (f.size > 10 * 1024 * 1024)  { setError("File size must be under 10MB."); return; }
    setError("");
    setFile(f);
    // Auto-detect topic from filename
    const raw   = f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
    const clean = raw.charAt(0).toUpperCase() + raw.slice(1);
    setTopic(clean);
  };

  const onFileChange = (e) => processFile(e.target.files[0]);
  const onDrop       = (e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]); };
  const onDragOver   = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave  = () => setDragging(false);
  const removeFile   = () => { setFile(null); setTopic(""); if (fileRef.current) fileRef.current.value = ""; };

  const generate = () => {
    if (!topic.trim()) { setError("Please enter a topic name or upload a file."); return; }
    navigate("/docs/view", { state: { topic: topic.trim(), file } });
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />
        <div style={S.page}>

          <div style={S.header}>
            <h1 style={S.title}>📄 Documentation</h1>
            <p style={S.sub}>Upload a file or enter a topic to generate AI-powered documentation</p>
          </div>

          <div style={S.layout}>

            {/* ── MAIN UPLOAD CARD ── */}
            <div style={S.mainCard}>

              {/* DROP ZONE */}
              <div
                style={{ ...S.dropZone, ...(dragging ? S.dropZoneDrag : {}), ...(file ? S.dropZoneFile : {}) }}
                onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
                onClick={() => !file && fileRef.current.click()}
              >
                <input ref={fileRef} type="file" accept=".pdf,.txt" style={{ display:"none" }} onChange={onFileChange} />

                {file ? (
                  /* File selected state */
                  <div style={S.filePreview}>
                    <div style={S.fileIconWrap}>
                      <span style={{ fontSize:36 }}>{file.type === "application/pdf" ? "📕" : "📝"}</span>
                    </div>
                    <div style={S.fileDetails}>
                      <p style={S.fileName}>{file.name}</p>
                      <p style={S.fileMeta}>{(file.size/1024).toFixed(1)} KB · {file.type === "application/pdf" ? "PDF Document" : "Text File"}</p>
                      <div style={S.fileBar}><div style={{ ...S.fileBarFill, width:"100%" }} /></div>
                      <p style={S.fileReady}>✅ File ready — topic auto-detected</p>
                    </div>
                    <button style={S.removeFile} onClick={(e) => { e.stopPropagation(); removeFile(); }}>✕</button>
                  </div>
                ) : dragging ? (
                  /* Dragging state */
                  <div style={S.dropContent}>
                    <div style={S.dropIconActive}>📂</div>
                    <p style={{ color:"#a855f7", fontSize:16, fontWeight:700 }}>Drop your file here!</p>
                  </div>
                ) : (
                  /* Default state */
                  <div style={S.dropContent}>
                    <div style={S.uploadIcon}>
                      <span style={{ fontSize:40 }}>☁️</span>
                    </div>
                    <p style={S.dropTitle}>Drag & drop your file here</p>
                    <p style={S.dropSub}>or click to browse files</p>
                    <div style={S.formatTags}>
                      <span style={S.tag}>PDF</span>
                      <span style={S.tag}>TXT</span>
                      <span style={{ ...S.tag, color:"#475569", border:"1px solid rgba(255,255,255,0.06)", background:"transparent" }}>Max 10MB</span>
                    </div>
                  </div>
                )}
              </div>

              {/* DIVIDER */}
              <div style={S.dividerRow}>
                <div style={S.dividerLine} />
                <span style={S.dividerText}>OR enter topic manually</span>
                <div style={S.dividerLine} />
              </div>

              {/* TOPIC INPUT */}
              <div style={S.inputGroup}>
                <label style={S.label}>Topic Name</label>
                <input
                  placeholder="e.g. Binary Search Trees, Machine Learning, React Hooks..."
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && generate()}
                  style={S.input}
                />
              </div>

              {error && <div style={S.errorBanner}>❌ {error}</div>}

              {/* GENERATE BUTTON */}
              <button
                style={{ ...S.generateBtn, opacity: !topic.trim() ? 0.55 : 1 }}
                onClick={generate}
                disabled={!topic.trim()}
              >
                <span>✨</span>
                Generate Documentation
                <span>→</span>
              </button>

            </div>

            {/* ── RIGHT PANEL ── */}
            <div style={S.rightPanel}>

              {/* Quick topics */}
              <div style={S.sideCard}>
                <h3 style={S.sideTitle}>⚡ Quick Start</h3>
                <p style={S.sideSub}>Pick a topic to start instantly</p>
                <div style={S.quickGrid}>
                  {QUICK.map(t => (
                    <button key={t} style={{ ...S.quickBtn, ...(topic===t ? S.quickBtnActive : {}) }}
                      onClick={() => setTopic(t)}
                    >{t}</button>
                  ))}
                </div>
              </div>

              {/* How it works */}
              <div style={S.sideCard}>
                <h3 style={S.sideTitle}>💡 How it works</h3>
                <div style={S.steps}>
                  {[
                    { n:"01", icon:"📂", t:"Upload file",     d:"PDF or TXT — AI reads the content" },
                    { n:"02", icon:"🧠", t:"AI generates",     d:"Structured docs with examples"     },
                    { n:"03", icon:"📖", t:"Study & export",   d:"Export as PDF or bookmark sections" },
                  ].map(s => (
                    <div key={s.n} style={S.step}>
                      <div style={S.stepNum}>{s.n}</div>
                      <div style={S.stepIcon}>{s.icon}</div>
                      <div>
                        <div style={S.stepTitle}>{s.t}</div>
                        <div style={S.stepDesc}>{s.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page:         { padding:28 },
  header:       { marginBottom:28 },
  title:        { fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, background:"linear-gradient(135deg,#f1f5f9,#a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", marginBottom:6 },
  sub:          { color:"#64748b", fontSize:14 },
  layout:       { display:"grid", gridTemplateColumns:"1fr 320px", gap:20, alignItems:"start" },
  mainCard:     { background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:28, display:"flex", flexDirection:"column", gap:20 },
  dropZone:     { border:"2px dashed rgba(255,255,255,0.1)", borderRadius:14, padding:"48px 32px", textAlign:"center", cursor:"pointer", transition:"all 0.3s ease", background:"rgba(255,255,255,0.02)", minHeight:220, display:"flex", alignItems:"center", justifyContent:"center" },
  dropZoneDrag: { border:"2px dashed #a855f7", background:"rgba(124,58,237,0.08)", transform:"scale(1.01)" },
  dropZoneFile: { border:"2px solid rgba(124,58,237,0.35)", background:"rgba(124,58,237,0.06)", cursor:"default", padding:"28px 32px" },
  dropContent:  { display:"flex", flexDirection:"column", alignItems:"center", gap:10 },
  uploadIcon:   { width:72, height:72, borderRadius:18, background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:4 },
  dropIconActive:{ fontSize:48, marginBottom:8 },
  dropTitle:    { fontSize:17, fontWeight:700, color:"#e2e8f0" },
  dropSub:      { fontSize:13, color:"#64748b" },
  formatTags:   { display:"flex", gap:8, marginTop:8, justifyContent:"center" },
  tag:          { fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.25)", color:"#a855f7" },
  filePreview:  { display:"flex", alignItems:"center", gap:16, width:"100%", textAlign:"left" },
  fileIconWrap: { width:60, height:60, borderRadius:14, background:"rgba(124,58,237,0.12)", border:"1px solid rgba(124,58,237,0.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  fileDetails:  { flex:1 },
  fileName:     { fontSize:15, fontWeight:700, color:"#f1f5f9", marginBottom:4, wordBreak:"break-all" },
  fileMeta:     { fontSize:12, color:"#64748b", marginBottom:10 },
  fileBar:      { height:4, background:"rgba(255,255,255,0.07)", borderRadius:10, overflow:"hidden", marginBottom:8 },
  fileBarFill:  { height:"100%", background:"linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius:10, transition:"width 0.5s" },
  fileReady:    { fontSize:12, color:"#10b981", fontWeight:600 },
  removeFile:   { width:30, height:30, borderRadius:8, background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", color:"#fca5a5", cursor:"pointer", fontSize:14, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" },
  dividerRow:   { display:"flex", alignItems:"center", gap:12 },
  dividerLine:  { flex:1, height:1, background:"rgba(255,255,255,0.07)" },
  dividerText:  { fontSize:12, color:"#475569", whiteSpace:"nowrap", fontWeight:500 },
  inputGroup:   { display:"flex", flexDirection:"column", gap:8 },
  label:        { fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em" },
  input:        { width:"100%", padding:"13px 16px", borderRadius:10, border:"1px solid rgba(255,255,255,0.09)", background:"rgba(255,255,255,0.04)", color:"#f1f5f9", fontSize:14, outline:"none", boxSizing:"border-box", fontFamily:"sans-serif", transition:"border-color 0.2s" },
  errorBanner:  { background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"11px 14px", color:"#fca5a5", fontSize:13 },
  generateBtn:  { display:"flex", alignItems:"center", justifyContent:"center", gap:10, padding:"15px", borderRadius:12, background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none", color:"white", fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:"0 8px 28px rgba(124,58,237,0.4)", fontFamily:"sans-serif", transition:"all 0.25s" },
  rightPanel:   { display:"flex", flexDirection:"column", gap:16 },
  sideCard:     { background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:20 },
  sideTitle:    { fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:"#f1f5f9", marginBottom:4 },
  sideSub:      { fontSize:12, color:"#64748b", marginBottom:14 },
  quickGrid:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 },
  quickBtn:     { padding:"10px 12px", borderRadius:8, border:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.03)", color:"#94a3b8", fontSize:12, fontWeight:600, cursor:"pointer", textAlign:"left", transition:"all 0.2s" },
  quickBtnActive:{ borderColor:"rgba(124,58,237,0.4)", background:"rgba(124,58,237,0.1)", color:"#a855f7" },
  steps:        { display:"flex", flexDirection:"column", gap:14 },
  step:         { display:"flex", alignItems:"center", gap:10 },
  stepNum:      { fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:"rgba(124,58,237,0.25)", width:24, flexShrink:0 },
  stepIcon:     { fontSize:20, width:28, flexShrink:0 },
  stepTitle:    { fontSize:13, fontWeight:700, color:"#e2e8f0" },
  stepDesc:     { fontSize:11, color:"#64748b", marginTop:2 },
};

export default DocumentationHome;