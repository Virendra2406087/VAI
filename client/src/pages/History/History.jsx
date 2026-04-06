import React, { useState, useEffect } from "react";
import Sidebar   from "../../components/Sidebar";
import Navbar    from "../../components/Navbar";
import { getHistory, getActiveDates, getDayHistory, fmtTime, TYPE_CONFIG } from "../../utils/history";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function History() {
  const today = new Date(); today.setHours(0,0,0,0);

  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected,  setSelected]  = useState(new Date(today));
  const [history,   setHistory]   = useState({});
  const [filter,    setFilter]    = useState("all");
  const [expanded,  setExpanded]  = useState(null);

  const reload = () => setHistory(getHistory());

  useEffect(() => {
    reload();
    window.addEventListener("historyUpdated", reload);
    return () => window.removeEventListener("historyUpdated", reload);
  }, []);

  // ── Calendar ──
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const prevMonth   = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
  const nextMonth   = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };

  const selectDay = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0,0,0,0);
    setSelected(d);
    setFilter("all");
    setExpanded(null);
  };

  const selKey   = selected.toDateString();
  const selItems = history[selKey] || [];
  const isToday  = (day) => new Date(viewYear,viewMonth,day).toDateString()===today.toDateString();
  const isSel    = (day) => new Date(viewYear,viewMonth,day).toDateString()===selKey;
  const isFuture = (day) => new Date(viewYear,viewMonth,day)>today;

  // activity count per day for dots
  const dayCount = (day) => (history[new Date(viewYear,viewMonth,day).toDateString()]||[]).length;

  // dot color based on count
  const dotColor = (n) => n>=5?"#10b981":n>=3?"#a855f7":"#6366f1";

  // filtered items
  const filtered = filter==="all" ? selItems : selItems.filter(i=>i.type===filter);

  // stats
  const activeDates = getActiveDates();
  const totalItems  = Object.values(history).reduce((a,b)=>a+b.length,0);

  // streak
  let streak=0;
  const sd = new Date(today);
  while(true){
    const k=(history[sd.toDateString()]||[]).length>0;
    if(!k) break;
    streak++;
    sd.setDate(sd.getDate()-1);
  }

  // type counts for selected day
  const typeCounts = Object.keys(TYPE_CONFIG).reduce((acc,t)=>{
    acc[t]=(selItems.filter(i=>i.type===t)||[]).length;
    return acc;
  },{});

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />
        <div style={S.page}>

          {/* ── HEADER ── */}
          <div style={S.header}>
            <div>
              <h1 style={S.title}>🕘 Activity History</h1>
              <p style={S.sub}>Your complete learning journey, day by day</p>
            </div>
            <div style={S.headerStats}>
              <div style={S.hStat}>
                <span style={S.hVal}>{streak}</span>
                <span style={S.hLbl}>Day Streak 🔥</span>
              </div>
              <div style={S.hStat}>
                <span style={S.hVal}>{activeDates.length}</span>
                <span style={S.hLbl}>Active Days</span>
              </div>
              <div style={S.hStat}>
                <span style={S.hVal}>{totalItems}</span>
                <span style={S.hLbl}>Total Activities</span>
              </div>
            </div>
          </div>

          <div style={S.body}>

            {/* ── CALENDAR ── */}
            <div style={S.calCard}>
              <div style={S.calHeader}>
                <button style={S.navBtn} onClick={prevMonth}>‹</button>
                <h3 style={S.calTitle}>{MONTHS[viewMonth]} {viewYear}</h3>
                <button style={S.navBtn} onClick={nextMonth}>›</button>
              </div>

              <div style={S.dayLabels}>
                {DAYS.map(d=><div key={d} style={S.dayLabel}>{d}</div>)}
              </div>

              <div style={S.calGrid}>
                {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
                {Array.from({length:daysInMonth}).map((_,i)=>{
                  const day=i+1, n=dayCount(day), future=isFuture(day);
                  return (
                    <div key={day} onClick={()=>!future&&selectDay(day)}
                      style={{
                        ...S.dayCell,
                        ...(isToday(day)?S.today:{}),
                        ...(isSel(day)?S.selected:{}),
                        ...(future?S.future:{}),
                        cursor:future?"default":"pointer",
                      }}
                    >
                      <span style={{fontSize:12,fontWeight:isToday(day)||isSel(day)?700:400}}>{day}</span>
                      {n>0&&!isSel(day)&&<div style={{width:5,height:5,borderRadius:"50%",background:dotColor(n)}}/>}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={S.legend}>
                {[["#10b981","5+"],["#a855f7","3-4"],["#6366f1","1-2"]].map(([c,l])=>(
                  <div key={c} style={S.legendItem}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:c}}/>
                    <span>{l} activities</span>
                  </div>
                ))}
              </div>

              {/* Activity type summary for month */}
              <div style={S.monthlySummary}>
                <p style={S.monthlyTitle}>This Month</p>
                {Object.entries(TYPE_CONFIG).map(([key,cfg])=>{
                  const cnt = Array.from({length:daysInMonth},(_,i)=>{
                    const dk=new Date(viewYear,viewMonth,i+1).toDateString();
                    return (history[dk]||[]).filter(x=>x.type===key).length;
                  }).reduce((a,b)=>a+b,0);
                  if(cnt===0) return null;
                  return (
                    <div key={key} style={S.monthlyRow}>
                      <span>{cfg.icon} {cfg.label}</span>
                      <span style={{color:cfg.color,fontWeight:700}}>{cnt}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── DETAIL PANEL ── */}
            <div style={S.detailCard}>

              {/* Date header */}
              <div style={S.detailHead}>
                <div>
                  <h2 style={S.detailTitle}>
                    {selected.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                    {selKey===today.toDateString()&&<span style={S.todayPill}>Today</span>}
                  </h2>
                  <p style={S.detailSub}>
                    {selItems.length===0
                      ? "No activities recorded on this day"
                      : `${selItems.length} activit${selItems.length===1?"y":"ies"} recorded`}
                  </p>
                </div>

                {/* Summary pills */}
                {selItems.length>0&&(
                  <div style={S.pills}>
                    {Object.entries(typeCounts).filter(([,n])=>n>0).map(([type,n])=>{
                      const cfg=TYPE_CONFIG[type];
                      return (
                        <span key={type} style={{...S.pill,background:`${cfg.color}18`,color:cfg.color,border:`1px solid ${cfg.color}35`}}>
                          {cfg.icon} {n}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Filter tabs */}
              {selItems.length>0&&(
                <div style={S.filterRow}>
                  <button style={{...S.fBtn,...(filter==="all"?S.fBtnActive:{})}} onClick={()=>setFilter("all")}>
                    All ({selItems.length})
                  </button>
                  {Object.entries(TYPE_CONFIG).map(([key,cfg])=>
                    typeCounts[key]>0&&(
                      <button key={key}
                        style={{...S.fBtn,...(filter===key?S.fBtnActive:{})}}
                        onClick={()=>setFilter(key)}
                      >
                        {cfg.icon} {cfg.label} ({typeCounts[key]})
                      </button>
                    )
                  )}
                </div>
              )}

              {/* Activity feed */}
              <div style={S.feed}>
                {filtered.length===0 ? (
                  <div style={S.empty}>
                    <span style={{fontSize:48}}>
                      {isFuture(selected.getDate())?"🔮":"📭"}
                    </span>
                    <p style={{color:"#475569",fontSize:14,fontWeight:600,marginTop:14}}>
                      {isFuture(selected.getDate())?"Future date":"No activities on this day"}
                    </p>
                    <p style={{color:"#334155",fontSize:13,marginTop:6}}>
                      {isFuture(selected.getDate())
                        ? "Come back and learn something!"
                        : "Use VAI to generate docs, flashcards, quizzes or chat with AI Tutor"}
                    </p>
                  </div>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {filtered.map((item,i)=>{
                      const cfg   = TYPE_CONFIG[item.type] || TYPE_CONFIG.topic;
                      const isExp = expanded===item.id;
                      return (
                        <div key={item.id||i}
                          style={{
                            ...S.actItem,
                            borderLeft:`3px solid ${cfg.color}`,
                            background: isExp?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.03)",
                          }}
                          onClick={()=>setExpanded(isExp?null:item.id)}
                        >
                          <div style={S.actRow}>
                            {/* Icon */}
                            <div style={{...S.actIconBox,background:`${cfg.color}18`,border:`1px solid ${cfg.color}30`}}>
                              <span style={{fontSize:16}}>{cfg.icon}</span>
                            </div>

                            {/* Content */}
                            <div style={{flex:1,minWidth:0}}>
                              <p style={S.actTitle}>{item.title}</p>
                              <div style={S.actMeta}>
                                <span style={{...S.actTypePill,background:`${cfg.color}12`,color:cfg.color}}>
                                  {cfg.label}
                                </span>
                                <span style={S.actTime}>{fmtTime(item.time)}</span>
                              </div>
                            </div>

                            {/* Expand arrow */}
                            {item.detail&&(
                              <span style={{color:"#475569",fontSize:12,transition:"transform 0.2s",transform:isExp?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                            )}
                          </div>

                          {/* Expanded detail */}
                          {isExp&&item.detail&&(
                            <div style={S.actDetail}>
                              <p style={{fontSize:13,color:"#94a3b8",lineHeight:1.7,margin:0}}>
                                {item.detail.length>300?item.detail.slice(0,300)+"…":item.detail}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
  page:         { padding:28 },
  header:       { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:16 },
  title:        { fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, background:"linear-gradient(135deg,#f1f5f9,#a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", marginBottom:4 },
  sub:          { color:"#64748b", fontSize:14 },
  headerStats:  { display:"flex", gap:14 },
  hStat:        { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"12px 18px", textAlign:"center", backdropFilter:"blur(10px)" },
  hVal:         { display:"block", fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, background:"linear-gradient(135deg,#a855f7,#6366f1)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" },
  hLbl:         { display:"block", fontSize:11, color:"#475569", fontWeight:600, marginTop:2 },
  body:         { display:"grid", gridTemplateColumns:"300px 1fr", gap:20, alignItems:"start" },
  calCard:      { background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:20, display:"flex", flexDirection:"column", gap:14 },
  calHeader:    { display:"flex", justifyContent:"space-between", alignItems:"center" },
  calTitle:     { fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:700, color:"#f1f5f9" },
  navBtn:       { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", color:"#e2e8f0", width:30, height:30, borderRadius:7, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" },
  dayLabels:    { display:"grid", gridTemplateColumns:"repeat(7,1fr)" },
  dayLabel:     { textAlign:"center", fontSize:10, fontWeight:700, color:"#334155", padding:"3px 0", textTransform:"uppercase" },
  calGrid:      { display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 },
  dayCell:      { aspectRatio:"1", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRadius:7, border:"1px solid transparent", transition:"all 0.2s", color:"#64748b", fontSize:12, gap:2 },
  today:        { border:"1px solid rgba(168,85,247,0.5)", background:"rgba(124,58,237,0.12)", color:"#a855f7" },
  selected:     { background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", boxShadow:"0 4px 14px rgba(124,58,237,0.4)", border:"none" },
  future:       { opacity:0.2 },
  legend:       { display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" },
  legendItem:   { display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#475569" },
  monthlySummary:{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)", borderRadius:10, padding:12 },
  monthlyTitle: { fontSize:11, fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 },
  monthlyRow:   { display:"flex", justifyContent:"space-between", fontSize:13, color:"#64748b", marginBottom:4 },
  detailCard:   { background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:24, display:"flex", flexDirection:"column", gap:16 },
  detailHead:   { borderBottom:"1px solid rgba(255,255,255,0.06)", paddingBottom:16 },
  detailTitle:  { fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700, color:"#f1f5f9", display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" },
  todayPill:    { fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:100, background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", color:"#a855f7" },
  detailSub:    { fontSize:13, color:"#64748b" },
  pills:        { display:"flex", gap:8, flexWrap:"wrap", marginTop:12 },
  pill:         { fontSize:12, fontWeight:700, padding:"3px 12px", borderRadius:100 },
  filterRow:    { display:"flex", gap:6, flexWrap:"wrap" },
  fBtn:         { padding:"6px 14px", borderRadius:7, border:"1px solid rgba(255,255,255,0.07)", background:"transparent", color:"#64748b", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"sans-serif", transition:"all 0.2s" },
  fBtnActive:   { background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", color:"#a855f7" },
  feed:         { display:"flex", flexDirection:"column", minHeight:200 },
  empty:        { display:"flex", flexDirection:"column", alignItems:"center", padding:"48px 20px", textAlign:"center" },
  actItem:      { padding:"12px 14px", borderRadius:10, transition:"all 0.2s", cursor:"pointer" },
  actRow:       { display:"flex", alignItems:"center", gap:12 },
  actIconBox:   { width:38, height:38, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  actTitle:     { fontSize:13, fontWeight:600, color:"#e2e8f0", marginBottom:4, lineHeight:1.4 },
  actMeta:      { display:"flex", alignItems:"center", gap:8 },
  actTypePill:  { fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:100 },
  actTime:      { fontSize:11, color:"#475569" },
  actDetail:    { marginTop:10, padding:"10px 14px", background:"rgba(0,0,0,0.2)", borderRadius:8, borderTop:"1px solid rgba(255,255,255,0.05)" },
};