import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import {LayoutDashboard,Layers3, FileUp,MessageCircleQuestion,Target,RefreshCw, Zap, Sparkle, CircleX} from "lucide-react"
function FlashcardsHome() {
  const navigate   = useNavigate();
  const fileRef    = useRef(null);
  const [file,     setFile]     = useState(null);
  const [topic,    setTopic]    = useState("");
  const [dragging, setDragging] = useState(false);
  const [count,    setCount]    = useState(5);
  const [error,    setError]    = useState("");

  const QUICK = ["Arrays & Hashing","Binary Trees","Graph Algorithms","Recursion","SQL Basics","OOP Concepts"];

  const processFile = (f) => {
    if (!f) return;
    if (!["application/pdf","text/plain"].includes(f.type)) { setError("Only PDF and TXT files are supported."); return; }
    if (f.size > 10*1024*1024) { setError("File must be under 10MB."); return; }
    setError("");
    setFile(f);
    const raw = f.name.replace(/\.[^.]+$/,"").replace(/[-_]/g," ");
    setTopic(raw.charAt(0).toUpperCase()+raw.slice(1));
  };

  const onFileChange = (e) => processFile(e.target.files[0]);
  const onDrop       = (e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]); };
  const onDragOver   = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave  = () => setDragging(false);
  const removeFile   = () => { setFile(null); setTopic(""); if (fileRef.current) fileRef.current.value = ""; };

  const generate = () => {
    if (!topic.trim()) { setError("Please enter a topic or upload a file."); return; }
    navigate("/flashcards/view", { state: { topic: topic.trim() } });
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />
        <div style={S.page}>
          <div style={S.header}>
            <h1 style={S.title}><Layers3 size={20}/> Flashcards</h1>
            <p style={S.sub}>Upload a file or enter a topic to generate AI-powered flashcards</p>
          </div>

          <div style={S.layout}>
            <div style={S.mainCard}>

              {/* DROP ZONE */}
              <div
                style={{ ...S.dropZone, ...(dragging?S.drag:{}), ...(file?S.hasFile:{}) }}
                onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
                onClick={() => !file && fileRef.current.click()}
              >
                <input ref={fileRef} type="file" accept=".pdf,.txt" style={{display:"none"}} onChange={onFileChange}/>
                {file ? (
                  <div style={S.filePreview}>
                    <div style={S.fileIconBox}><span style={{fontSize:34}}>{file.type==="application/pdf"?"📕":"📝"}</span></div>
                    <div style={{flex:1}}>
                      <p style={S.fileName}>{file.name}</p>
                      <p style={S.fileMeta}>{(file.size/1024).toFixed(1)} KB · {file.type==="application/pdf"?"PDF":"TXT"}</p>
                      <div style={S.fileBar}><div style={{...S.fileBarFill,width:"100%"}}/></div>
                      <p style={S.fileOk}>✅ Ready to generate flashcards</p>
                    </div>
                    <button style={S.xBtn} onClick={e=>{e.stopPropagation();removeFile();}}>✕</button>
                  </div>
                ) : dragging ? (
                  <div style={S.dropContent}><span style={{fontSize:48}}>📂</span><p style={{color:"#a855f7",fontSize:16,fontWeight:700,marginTop:10}}>Drop it here!</p></div>
                ) : (
                  <div style={S.dropContent}>
                    <div style={S.uploadBox}><span style={{fontSize:38}}><FileUp size={50} /> </span></div>
                    <p style={S.dropTitle}>Drag & drop your file here</p>
                    <p style={S.dropSub}>or click to browse</p>
                    <div style={S.tags}>
                      <span style={S.tag}>PDF</span>
                      <span style={S.tag}>TXT</span>
                      <span style={{...S.tag,color:"#475569",border:"1px solid rgba(255,255,255,0.06)",background:"transparent"}}>Max 10MB</span>
                    </div>
                  </div>
                )}
              </div>

              {/* OR divider */}
              <div style={S.divRow}><div style={S.divLine}/><span style={S.divTxt}>OR enter topic manually</span><div style={S.divLine}/></div>

              {/* Topic input */}
              <div style={S.inputGroup}>
                <label style={S.label}>Topic Name</label>
                <input placeholder="e.g. Binary Trees, Sorting Algorithms..." value={topic}
                  onChange={e=>setTopic(e.target.value)} onKeyDown={e=>e.key==="Enter"&&generate()} style={S.input}/>
              </div>

              {/* Count selector */}
              <div style={S.inputGroup}>
                <label style={S.label}>Number of Flashcards</label>
                <div style={{display:"flex",gap:10}}>
                  {[5,10,15,20].map(n=>(
                    <button key={n} style={{...S.countBtn,...(count===n?S.countActive:{})}} onClick={()=>setCount(n)}>{n}</button>
                  ))}
                </div>
              </div>

              {error && <div style={S.err}><CircleX/> {error}</div>}

              <button style={{...S.genBtn,opacity:!topic.trim()?0.55:1}} onClick={generate} disabled={!topic.trim()}>
                <span><Sparkle/></span> Generate {count} Flashcards <span>→</span>
              </button>
            </div>

            {/* RIGHT */}
            <div style={S.rightPanel}>
              <div style={S.sideCard}>
                <h3 style={S.sideTitle}><Zap/> Quick Start</h3>
                <p style={S.sideSub}>Click any topic to fill it in</p>
                <div style={S.qGrid}>
                  {QUICK.map(t=>(
                    <button key={t} style={{...S.qBtn,...(topic===t?S.qBtnActive:{})}} onClick={()=>setTopic(t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div style={S.sideCard}>
                <h3 style={S.sideTitle}><Layers3 size={20}/> What you get</h3>
                {[
                  {i:<MessageCircleQuestion size = {20}/>,t:"Q&A Format",   d:"Question on front, answer on back"},
                  {i:<Target size= {20}/>,t:"Difficulty",    d:"Rated Easy / Medium / Hard"},
                  {i:<RefreshCw size={20} />,t:"Flip Animation",d:"Smooth 3D card flip"},
                  {i:<LayoutDashboard size={20} />,t:"Progress Track",d:"Track easy, medium, hard counts"},
                ].map(f=>(
                  <div key={f.t} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:12}}>
                    <span style={{fontSize:18,flexShrink:0}}>{f.i}</span>
                    <div><div style={{fontSize:13,fontWeight:600,color:"#e2e8f0"}}>{f.t}</div><div style={{fontSize:11,color:"#64748b",marginTop:2}}>{f.d}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page:{padding:28}, header:{marginBottom:28},
  title:{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,background:"linear-gradient(135deg,#f1f5f9,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:6},
  sub:{color:"#64748b",fontSize:14},
  layout:{display:"grid",gridTemplateColumns:"1fr 300px",gap:20,alignItems:"start"},
  mainCard:{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:18,padding:28,display:"flex",flexDirection:"column",gap:20},
  dropZone:{border:"2px dashed rgba(255,255,255,0.1)",borderRadius:14,padding:"48px 32px",textAlign:"center",cursor:"pointer",transition:"all 0.3s",background:"rgba(255,255,255,0.02)",minHeight:220,display:"flex",alignItems:"center",justifyContent:"center"},
  drag:{border:"2px dashed #a855f7",background:"rgba(124,58,237,0.08)"},
  hasFile:{border:"2px solid rgba(124,58,237,0.35)",background:"rgba(124,58,237,0.06)",cursor:"default",padding:"24px 28px"},
  dropContent:{display:"flex",flexDirection:"column",alignItems:"center",gap:10},
  uploadBox:{width:70,height:70,borderRadius:18,background:"rgba(124,58,237,0.1)",border:"1px solid rgba(124,58,237,0.2)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:4},
  dropTitle:{fontSize:17,fontWeight:700,color:"#e2e8f0"},
  dropSub:{fontSize:13,color:"#64748b"},
  tags:{display:"flex",gap:8,marginTop:8,justifyContent:"center"},
  tag:{fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:100,background:"rgba(124,58,237,0.12)",border:"1px solid rgba(124,58,237,0.25)",color:"#a855f7"},
  filePreview:{display:"flex",alignItems:"center",gap:14,width:"100%",textAlign:"left"},
  fileIconBox:{width:58,height:58,borderRadius:14,background:"rgba(124,58,237,0.12)",border:"1px solid rgba(124,58,237,0.25)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},
  fileName:{fontSize:14,fontWeight:700,color:"#f1f5f9",marginBottom:4,wordBreak:"break-all"},
  fileMeta:{fontSize:11,color:"#64748b",marginBottom:10},
  fileBar:{height:4,background:"rgba(255,255,255,0.07)",borderRadius:10,overflow:"hidden",marginBottom:8},
  fileBarFill:{height:"100%",background:"linear-gradient(90deg,#7c3aed,#a855f7)",borderRadius:10},
  fileOk:{fontSize:12,color:"#10b981",fontWeight:600},
  xBtn:{width:28,height:28,borderRadius:7,background:"rgba(239,68,68,0.12)",border:"1px solid rgba(239,68,68,0.25)",color:"#fca5a5",cursor:"pointer",fontSize:13,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"},
  divRow:{display:"flex",alignItems:"center",gap:12},
  divLine:{flex:1,height:1,background:"rgba(255,255,255,0.07)"},
  divTxt:{fontSize:12,color:"#475569",whiteSpace:"nowrap"},
  inputGroup:{display:"flex",flexDirection:"column",gap:8},
  label:{fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.06em"},
  input:{width:"100%",padding:"13px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.09)",background:"rgba(255,255,255,0.04)",color:"#f1f5f9",fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"sans-serif"},
  countBtn:{padding:"9px 20px",borderRadius:8,border:"1px solid rgba(255,255,255,0.08)",background:"rgba(255,255,255,0.04)",color:"#64748b",fontSize:14,fontWeight:700,cursor:"pointer",transition:"all 0.2s"},
  countActive:{background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.35)",color:"#a855f7"},
  err:{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:10,padding:"11px 14px",color:"#fca5a5",fontSize:13},
  genBtn:{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"15px",borderRadius:12,background:"linear-gradient(135deg,#7c3aed,#a855f7)",border:"none",color:"white",fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 8px 28px rgba(124,58,237,0.4)",fontFamily:"sans-serif"},
  rightPanel:{display:"flex",flexDirection:"column",gap:16},
  sideCard:{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:20},
  sideTitle:{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"#f1f5f9",marginBottom:4},
  sideSub:{fontSize:12,color:"#64748b",marginBottom:14},
  qGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8},
  qBtn:{padding:"9px 10px",borderRadius:8,border:"1px solid rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.03)",color:"#94a3b8",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left",transition:"all 0.2s"},
  qBtnActive:{borderColor:"rgba(124,58,237,0.4)",background:"rgba(124,58,237,0.1)",color:"#a855f7"},
};

export default FlashcardsHome;