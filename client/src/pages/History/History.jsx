import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar  from "../../components/Navbar";
import { useNavigate } from "react-router-dom";
import { fmtTime } from "../../utils/history.js";

// ── Storage helpers ──
const getHistoryKey = () => "vai_history_" + (localStorage.getItem("userId") || "guest");
const getAllHistory  = () => { try { return JSON.parse(localStorage.getItem(getHistoryKey()) || "{}"); } catch { return {}; } };
const toDateKey     = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x.toDateString(); };
const toDateStr     = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`; };

// ── Extract clean topic from a history event ──
// trackDoc      → title="📄 Documentation: C++"   detail="C++"        ← detail IS topic
// trackFlashcard→ title="🃏 Flashcards: C++"       detail="20 cards generated"  ← title has topic
// trackQuiz     → title="🧠 Quiz: C++"             detail="10 questions generated" ← title has topic
// trackTopic    → title="📚 New Topic: C++"        detail="C++"
// trackTutor    → title="🤖 AI Chat: question…"    detail=answer
const extractTopic = (event) => {
  switch (event.type) {
    case "doc":
      return (event.detail || "").trim();
    case "flashcard":
      return (event.title || "").replace("🃏 Flashcards: ", "").trim();
    case "quiz":
      return (event.title || "").replace("🧠 Quiz: ", "").trim();
    case "topic":
      return (event.detail || (event.title || "").replace("📚 New Topic: ", "") || "").trim();
    case "tutor":
      return (event.title || "").replace(<span className="vai-ai-icon">
      ✨
    </span> , "").trim();
    case "task":
      return (event.title || "").replace("✅ Task: ", "").trim();
    default:
      return (event.detail || event.title || "").trim();
  }
};

// ── Cache key builders — must match exactly what each page uses ──
const UID           = () => localStorage.getItem("userId") || "guest";
const docCacheKey   = (t) => `vai_doc_${UID()}_${t.toLowerCase().replace(/\s+/g,"_")}`;
const flashCacheKey = (t) => `vai_flash_${UID()}_${t.toLowerCase().replace(/\s+/g,"_")}`;
const quizCacheKey  = (t) => `vai_quiz_${UID()}_${t.toLowerCase().replace(/\s+/g,"_")}`;

// ── Check if cached content exists ──
const hasDocCache   = (t) => { try { return !!(JSON.parse(localStorage.getItem(docCacheKey(t)))?.content); }         catch { return false; } };
const hasFlashCache = (t) => { try { return !!(JSON.parse(localStorage.getItem(flashCacheKey(t)))?.cards?.length); } catch { return false; } };
const hasQuizCache  = (t) => { try { return !!(JSON.parse(localStorage.getItem(quizCacheKey(t)))?.questions?.length); } catch { return false; } };

const TYPE_CFG = {
  doc:       { icon:"📄", label:"Documentation", color:"#6366f1", btn:"Open Docs"       },
  flashcard: { icon:"🃏", label:"Flashcards",    color:"#a855f7", btn:"Open Flashcards" },
  quiz:      { icon:"🧠", label:"Quiz",           color:"#3b82f6", btn:"Open Quiz"       },
  topic:     { icon:"📚", label:"Topic",          color:"#10b981", btn:"View Topics"     },
  tutor:     { icon:<span className="vai-ai-icon">
      ✨
    </span> , label:"VAI Tutor",       color:"#f59e0b", btn:"Open Tutor"      },
  task:      { icon:"📚", label:"Task",           color:"#ec4899", btn:null              },
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function History() {
  const navigate = useNavigate();
  const today    = new Date(); today.setHours(0,0,0,0);
  const todayStr = toDateStr(today);

  const [viewYear,   setViewYear]   = useState(today.getFullYear());
  const [viewMonth,  setViewMonth]  = useState(today.getMonth());
  const [selected,   setSelected]   = useState(today);
  const [historyMap, setHistoryMap] = useState({});
  const [filter,     setFilter]     = useState("all");

  const reload = () => setHistoryMap(getAllHistory());
  useEffect(() => {
    reload();
    window.addEventListener("storage",        reload);
    window.addEventListener("historyUpdated", reload);
    return () => {
      window.removeEventListener("storage",        reload);
      window.removeEventListener("historyUpdated", reload);
    };
  }, []);

  // ── Open handler ──
  const openItem = (event) => {
    const topic = extractTopic(event);
    if (!topic) return;

    if (event.type === "doc") {
      //  Read cached doc content and pass directly — no regeneration
      const cached = JSON.parse(localStorage.getItem(docCacheKey(topic)) || "null");
      navigate("/docs/view", {
        state: {
          topic,
          fromHistory:  true,
          autoGenerate: false,
          content:      cached?.content || null,
        }
      });

    } else if (event.type === "flashcard") {
      //  Flashcards.jsx loads cache on mount using topic key
      // Pass topic correctly — extracted from title not detail
      navigate("/flashcards/view", {
        state: { topic, autoGenerate: false }
      });

    } else if (event.type === "quiz") {
      //  Quiz.jsx loads cache on mount using topic key
      // Pass topic correctly — extracted from title not detail
      navigate("/quiz/view", {
        state: { topic, autoGenerate: false }
      });

    } else if (event.type === "topic") {
      navigate("/topics");

    } else if (event.type === "tutor") {
      navigate("/tutor");
    }
  };

  // ── Calendar helpers ──
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
  const nextMonth = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };
  const selectDay = (day) => { const d=new Date(viewYear,viewMonth,day); d.setHours(0,0,0,0); setSelected(d); setFilter("all"); };

  const selStr   = toDateStr(selected);
  const isToday  = (day) => toDateStr(new Date(viewYear,viewMonth,day)) === todayStr;
  const isSel    = (day) => toDateStr(new Date(viewYear,viewMonth,day)) === selStr;
  const isFuture = (day) => new Date(viewYear,viewMonth,day) > today;
  const hasAct   = (day) => (historyMap[toDateKey(new Date(viewYear,viewMonth,day))]||[]).length > 0;

  const selKey     = toDateKey(selected);
  const allEvents  = historyMap[selKey] || [];
  const typeCounts = allEvents.reduce((acc,e) => { acc[e.type]=(acc[e.type]||0)+1; return acc; }, {});
  const filtered   = filter==="all" ? allEvents : allEvents.filter(e=>e.type===filter);

  const selIsPast   = selStr < todayStr;
  const selIsFuture = selStr > todayStr;
  const selIsToday  = selStr === todayStr;

  const activeDates = Object.keys(historyMap).filter(k=>(historyMap[k]||[]).length>0);
  const totalEvents = Object.values(historyMap).reduce((a,b)=>a+b.length,0);
  let streak=0; const sd=new Date(today);
  while(true){ if((historyMap[toDateKey(sd)]||[]).length===0) break; streak++; sd.setDate(sd.getDate()-1); }

  const monthActive = Array.from({length:daysInMonth},(_,i)=>(historyMap[toDateKey(new Date(viewYear,viewMonth,i+1))]||[]).length>0?1:0).reduce((a,b)=>a+b,0);
  const monthTotal  = Array.from({length:daysInMonth},(_,i)=>(historyMap[toDateKey(new Date(viewYear,viewMonth,i+1))]||[]).length).reduce((a,b)=>a+b,0);

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />
        <div style={S.page}>

          {/* HEADER */}
          <div style={S.header}>
            <div>
              <h1 style={S.title}>🕘 Activity History</h1>
              <p style={S.sub}>View your learning activity by date</p>
            </div>
            <div style={S.stats}>
              {[
                { val:streak,             lbl:"Day Streak 🔥" },
                { val:activeDates.length, lbl:"Active Days"   },
                { val:totalEvents,        lbl:"Total Activity"},
                { val:allEvents.length,   lbl:"Selected Day"  },
              ].map(s=>(
                <div key={s.lbl} style={S.statBox}>
                  <span style={S.statVal}>{s.val}</span>
                  <span style={S.statLbl}>{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={S.body}>

            {/* CALENDAR */}
            <div style={S.calCard}>
              <div style={S.calHeader}>
                <button style={S.navBtn} onClick={prevMonth}>‹</button>
                <h3 style={S.calTitle}>{MONTHS[viewMonth]} {viewYear}</h3>
                <button style={S.navBtn} onClick={nextMonth}>›</button>
              </div>
              <div style={S.dayLabels}>{DAYS.map(d=><div key={d} style={S.dayLabel}>{d}</div>)}</div>
              <div style={S.calGrid}>
                {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
                {Array.from({length:daysInMonth}).map((_,i)=>{
                  const day=i+1, hasA=hasAct(day), future=isFuture(day);
                  return (
                    <div key={day} onClick={()=>!future&&selectDay(day)} style={{
                      ...S.dayCell,
                      ...(isToday(day)?S.cellToday:{}),
                      ...(isSel(day)?S.cellSel:{}),
                      ...(future?S.cellFuture:{}),
                      cursor:future?"default":"pointer",
                    }}>
                      <span style={{fontSize:12,fontWeight:isToday(day)||isSel(day)?700:400,lineHeight:1}}>{day}</span>
                      {hasA&&!isSel(day)&&<div style={S.dot}/>}
                      {hasA&& isSel(day)&&<div style={{...S.dot,background:"white",opacity:0.8}}/>}
                    </div>
                  );
                })}
              </div>
              <div style={S.legend}>
                <div style={S.legendItem}><div style={S.dot}/><span>Has activity</span></div>
                <div style={S.legendItem}><div style={{...S.legendDot,background:"rgba(124,58,237,0.5)",border:"1px solid #a855f7"}}/><span>Today</span></div>
                <div style={S.legendItem}><div style={{...S.legendDot,background:"linear-gradient(135deg,#7c3aed,#a855f7)"}}/><span>Selected</span></div>
              </div>
              <div style={S.monthSummary}>
                <div style={S.monthRow}><span style={{color:"#64748b",fontSize:13}}>📅 Active days</span><span style={{color:"#a855f7",fontWeight:700}}>{monthActive}</span></div>
                <div style={S.monthRow}><span style={{color:"#64748b",fontSize:13}}>📊 Total events</span><span style={{color:"#22c55e",fontWeight:700}}>{monthTotal}</span></div>
              </div>

              {/* Type breakdown */}
              {Object.keys(typeCounts).length > 0 && (
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  <p style={{fontSize:11,color:"#475569",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",margin:0}}>
                    {selected.toLocaleDateString("en-IN",{day:"numeric",month:"short"})} — Breakdown
                  </p>
                  {Object.entries(typeCounts).map(([type,count])=>{
                    const cfg=TYPE_CFG[type]||{icon:"📌",label:type,color:"#64748b"};
                    return (
                      <div key={type} onClick={()=>setFilter(f=>f===type?"all":type)}
                        style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 10px",
                          background:filter===type?`${cfg.color}15`:"rgba(255,255,255,0.03)",
                          borderRadius:8,border:`1px solid ${cfg.color}${filter===type?"55":"22"}`,
                          cursor:"pointer",transition:"all 0.2s"}}>
                        <span style={{fontSize:12,color:"#94a3b8"}}>{cfg.icon} {cfg.label}</span>
                        <span style={{fontSize:12,fontWeight:700,color:cfg.color}}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ACTIVITY DETAIL */}
            <div style={S.detailCard}>
              <div style={S.detailHead}>
                <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                  <h2 style={S.detailTitle}>
                    {selected.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                  </h2>
                  <span style={{
                    fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:100,
                    background:selIsToday?"rgba(34,197,94,0.12)":selIsFuture?"rgba(59,130,246,0.12)":"rgba(255,255,255,0.05)",
                    border:`1px solid ${selIsToday?"rgba(34,197,94,0.3)":selIsFuture?"rgba(59,130,246,0.3)":"rgba(255,255,255,0.1)"}`,
                    color:selIsToday?"#4ade80":selIsFuture?"#60a5fa":"#64748b",
                  }}>
                    {selIsToday?"Today":selIsFuture?"Upcoming":"Past"}
                  </span>
                </div>
                <p style={S.detailSub}>
                  {allEvents.length===0?"No activity on this day":`${allEvents.length} activit${allEvents.length>1?"ies":"y"} recorded`}
                </p>
              </div>

              {/* Filter tabs */}
              {allEvents.length > 0 && (
                <div style={S.filterRow}>
                  {[
                    {key:"all",icon:"🗂",label:`All (${allEvents.length})`},
                    ...Object.entries(typeCounts).map(([type,count])=>{
                      const cfg=TYPE_CFG[type]||{icon:"📌",label:type};
                      return {key:type,icon:cfg.icon,label:`${cfg.label} (${count})`};
                    })
                  ].map(f=>(
                    <button key={f.key}
                      style={{...S.fBtn,...(filter===f.key?S.fActive:{})}}
                      onClick={()=>setFilter(f.key)}
                    >
                      {f.icon} {f.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Event list */}
              <div style={S.eventList}>
                {allEvents.length===0?(
                  <div style={S.empty}>
                    <span style={{fontSize:48}}>📭</span>
                    <p style={{color:"#475569",fontSize:14,fontWeight:600,marginTop:14}}>No activity on this day</p>
                    <p style={{color:"#334155",fontSize:13,marginTop:6}}>Start learning — generate docs, flashcards, or take a quiz!</p>
                  </div>
                ):filtered.length===0?(
                  <div style={S.empty}>
                    <span style={{fontSize:36}}>🔍</span>
                    <p style={{color:"#475569",fontSize:13,marginTop:12}}>No {filter} activity for this day</p>
                  </div>
                ):(
                  filtered.map((event,i)=>{
                    const cfg   = TYPE_CFG[event.type]||{icon:"📌",label:event.type,color:"#64748b",btn:null};
                    const topic = extractTopic(event);

                    // Check cache for this exact topic string
                    const isCached =
                      event.type==="doc"       ? hasDocCache(topic)   :
                      event.type==="flashcard" ? hasFlashCache(topic) :
                      event.type==="quiz"      ? hasQuizCache(topic)  :
                      ["topic","tutor"].includes(event.type) ? true   : false;

                    const showBtn = cfg.btn && isCached;

                    return (
                      <div key={event.id||i} style={{
                        ...S.eventItem,
                        borderLeft:`3px solid ${cfg.color}`,
                        background:`${cfg.color}08`,
                      }}>

                        {/* Icon */}
                        <div style={{
                          width:44,height:44,borderRadius:11,flexShrink:0,
                          background:`${cfg.color}18`,border:`1px solid ${cfg.color}30`,
                          display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,
                        }}>
                          {cfg.icon}
                        </div>

                        {/* Content */}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}>
                            <span style={{fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:100,background:`${cfg.color}18`,color:cfg.color,border:`1px solid ${cfg.color}30`}}>
                              {cfg.label}
                            </span>
                            
                          </div>

                          {/* Topic — main title */}
                          <p style={{fontSize:15,fontWeight:700,color:"#f1f5f9",margin:0,lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {topic || event.title}
                          </p>

                          {/* Sub detail */}
                          {event.type==="flashcard"&&event.detail&&(
                            <p style={{fontSize:12,color:"#64748b",margin:"3px 0 0"}}>🃏 {event.detail}</p>
                          )}
                          {event.type==="quiz"&&event.detail&&(
                            <p style={{fontSize:12,color:"#64748b",margin:"3px 0 0"}}>🧠 {event.detail}</p>
                          )}
                          {event.type==="doc"&&event.detail&&event.detail!==topic&&(
                            <p style={{fontSize:12,color:"#64748b",margin:"3px 0 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                              📄 {event.detail}
                            </p>
                          )}
                          {event.type==="tutor"&&event.detail&&(
                            <p style={{fontSize:12,color:"#64748b",margin:"3px 0 0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                               {event.detail.slice(0,80)}{event.detail.length>80?"…":""}
                            </p>
                          )}
                        </div>

                        {/* Open button — only shown when cache exists */}
                        {showBtn && (
                          <button
                            onClick={()=>openItem(event)}
                            style={{
                              padding:"9px 16px",borderRadius:9,flexShrink:0,
                              background:`linear-gradient(135deg,${cfg.color}cc,${cfg.color})`,
                              border:"none",color:"white",fontSize:12,fontWeight:700,
                              cursor:"pointer",fontFamily:"sans-serif",
                              boxShadow:`0 4px 12px ${cfg.color}40`,
                              whiteSpace:"nowrap",transition:"opacity 0.2s",
                            }}
                            onMouseOver={e=>e.currentTarget.style.opacity="0.8"}
                            onMouseOut={e=>e.currentTarget.style.opacity="1"}
                          >
                            {cfg.btn} →
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page:        { padding:28 },
  header:      { display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:16 },
  title:       { fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,background:"linear-gradient(135deg,#f1f5f9,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:4 },
  sub:         { color:"#64748b",fontSize:14 },
  stats:       { display:"flex",gap:12 },
  statBox:     { background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"10px 16px",textAlign:"center",backdropFilter:"blur(10px)" },
  statVal:     { display:"block",fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,background:"linear-gradient(135deg,#a855f7,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" },
  statLbl:     { display:"block",fontSize:11,color:"#475569",fontWeight:600,marginTop:2 },
  body:        { display:"grid",gridTemplateColumns:"300px 1fr",gap:20,alignItems:"start" },
  calCard:     { background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:20,display:"flex",flexDirection:"column",gap:14 },
  calHeader:   { display:"flex",justifyContent:"space-between",alignItems:"center" },
  calTitle:    { fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:"#f1f5f9" },
  navBtn:      { background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",color:"#e2e8f0",width:30,height:30,borderRadius:7,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 },
  dayLabels:   { display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:4 },
  dayLabel:    { textAlign:"center",fontSize:10,fontWeight:700,color:"#334155",padding:"3px 0",textTransform:"uppercase" },
  calGrid:     { display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3 },
  dayCell:     { aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:8,border:"1px solid transparent",transition:"all 0.15s",color:"#64748b",fontSize:12,gap:2 },
  cellToday:   { border:"1px solid rgba(168,85,247,0.5)",background:"rgba(124,58,237,0.12)",color:"#a855f7" },
  cellSel:     { background:"linear-gradient(135deg,#7c3aed,#a855f7)",color:"white",boxShadow:"0 4px 14px rgba(124,58,237,0.4)",border:"none" },
  cellFuture:  { opacity:0.25 },
  dot:         { width:5,height:5,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 4px rgba(34,197,94,0.6)",flexShrink:0 },
  legendDot:   { width:10,height:10,borderRadius:"50%",flexShrink:0 },
  legend:      { display:"flex",gap:14,flexWrap:"wrap",justifyContent:"center" },
  legendItem:  { display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#475569" },
  monthSummary:{ background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:10,padding:"12px 14px",display:"flex",flexDirection:"column",gap:8 },
  monthRow:    { display:"flex",justifyContent:"space-between",alignItems:"center" },
  detailCard:  { background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:24,display:"flex",flexDirection:"column",gap:16 },
  detailHead:  { borderBottom:"1px solid rgba(255,255,255,0.06)",paddingBottom:16 },
  detailTitle: { fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:700,color:"#f1f5f9",margin:0 },
  detailSub:   { fontSize:13,color:"#64748b",marginTop:6 },
  filterRow:   { display:"flex",gap:6,flexWrap:"wrap" },
  fBtn:        { padding:"6px 14px",borderRadius:7,border:"1px solid rgba(255,255,255,0.07)",background:"transparent",color:"#64748b",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"sans-serif",transition:"all 0.2s" },
  fActive:     { background:"rgba(124,58,237,0.15)",border:"1px solid rgba(124,58,237,0.3)",color:"#a855f7" },
  eventList:   { display:"flex",flexDirection:"column",gap:10,minHeight:200 },
  empty:       { display:"flex",flexDirection:"column",alignItems:"center",padding:"48px 20px",textAlign:"center" },
  eventItem:   { display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:12,transition:"all 0.2s" },
};