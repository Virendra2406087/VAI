import { trackTask } from "../../utils/history";
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const COLORS = ["#7c3aed","#6366f1","#3b82f6","#10b981","#f59e0b","#ec4899"];

function StudyPlanner() {
  const todayObj     = new Date();
  todayObj.setHours(0,0,0,0);
  const todayKey     = todayObj.toDateString();

  const [viewYear,   setViewYear]   = useState(todayObj.getFullYear());
  const [viewMonth,  setViewMonth]  = useState(todayObj.getMonth());
  const [selected,   setSelected]   = useState(todayObj);
  const [tasks,      setTasks]      = useState(() => {
    try { return JSON.parse(localStorage.getItem("studyTasks_" + (localStorage.getItem("userId") || "guest")) || "{}"); }
    catch { return {}; }
  });
  const [taskInput,  setTaskInput]  = useState("");
  const [taskColor,  setTaskColor]  = useState(COLORS[0]);
  const [taskPriority, setTaskPriority] = useState("medium");
  const [filter,     setFilter]     = useState("all"); // all | pending | done
  const [streak,     setStreak]     = useState(0);

  const selectedKey  = selected.toDateString();
  const isPast       = selected < todayObj;
  const isToday      = selectedKey === todayKey;

  // ── persist to localStorage ──
  useEffect(() => {
    localStorage.setItem("studyTasks_" + (localStorage.getItem("userId") || "guest"), JSON.stringify(tasks));
  }, [tasks]);

  // ── compute streak ──
  useEffect(() => {
    let s = 0;
    const d = new Date(todayObj);
    while (true) {
      const k = d.toDateString();
      const dayTasks = tasks[k] || [];
      const hasCompleted = dayTasks.some(t => t.done);
      if (!hasCompleted) break;
      s++;
      d.setDate(d.getDate() - 1);
    }
    setStreak(s);
  }, [tasks]);

  // ── calendar helpers ──
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIdx  = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDay = (day) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0,0,0,0);
    
    setSelected(d);
  };

  // ── task helpers ──
  const addTask = () => {
    if (!taskInput.trim() || isPast) return;
    const updated = { ...tasks };
    if (!updated[selectedKey]) updated[selectedKey] = [];
    trackTask(taskInput.trim());
    updated[selectedKey].push({
      id: Date.now(),
      text: taskInput.trim(),
      done: false,
      color: taskColor,
      priority: taskPriority,
      createdAt: new Date().toISOString(),
    });
    setTasks(updated);
    setTaskInput("");
  };

  const toggleTask = (id) => {
    const updated = { ...tasks };
    updated[selectedKey] = updated[selectedKey].map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    setTasks(updated);
  };

  const deleteTask = (id) => {
    const updated = { ...tasks };
    updated[selectedKey] = updated[selectedKey].filter(t => t.id !== id);
    setTasks(updated);
  };

  const dayTasks    = tasks[selectedKey] || [];
  const filtered    = dayTasks.filter(t =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );
  const doneCount   = dayTasks.filter(t => t.done).length;
  const progress    = dayTasks.length ? Math.round((doneCount / dayTasks.length) * 100) : 0;

  // dots for calendar days
  const getDayDots = (day) => {
    const k = new Date(viewYear, viewMonth, day).toDateString();
    return tasks[k] || [];
  };

  // total tasks this month
  const monthTotal  = Array.from({ length: daysInMonth }, (_, i) => {
    const k = new Date(viewYear, viewMonth, i+1).toDateString();
    return (tasks[k] || []).length;
  }).reduce((a, b) => a + b, 0);

  const monthDone   = Array.from({ length: daysInMonth }, (_, i) => {
    const k = new Date(viewYear, viewMonth, i+1).toDateString();
    return (tasks[k] || []).filter(t => t.done).length;
  }).reduce((a, b) => a + b, 0);

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />

        <div style={S.wrap}>

          {/* ── TOP STATS ── */}
          <div style={S.statsRow}>
            <div style={S.statCard}>
              <span style={S.statIcon}>🔥</span>
              <div>
                <div style={S.statVal}>{streak}</div>
                <div style={S.statLbl}>Day Streak</div>
              </div>
            </div>
            <div style={S.statCard}>
              <span style={S.statIcon}>📅</span>
              <div>
                <div style={S.statVal}>{monthTotal}</div>
                <div style={S.statLbl}>Tasks This Month</div>
              </div>
            </div>
            <div style={S.statCard}>
              <span style={S.statIcon}>✅</span>
              <div>
                <div style={S.statVal}>{monthDone}</div>
                <div style={S.statLbl}>Completed</div>
              </div>
            </div>
            <div style={S.statCard}>
              <span style={S.statIcon}>🎯</span>
              <div>
                <div style={S.statVal}>{monthTotal ? Math.round((monthDone/monthTotal)*100) : 0}%</div>
                <div style={S.statLbl}>Accuracy</div>
              </div>
            </div>
          </div>

          <div style={S.main}>

            {/* ── CALENDAR ── */}
            <div style={S.calendarBox}>
              {/* Month nav */}
              <div style={S.calHeader}>
                <button style={S.navBtn} onClick={prevMonth}>‹</button>
                <h3 style={S.calTitle}>{MONTHS[viewMonth]} {viewYear}</h3>
                <button style={S.navBtn} onClick={nextMonth}>›</button>
              </div>

              {/* Day labels */}
              <div style={S.dayLabels}>
                {DAYS.map(d => <div key={d} style={S.dayLabel}>{d}</div>)}
              </div>

              {/* Grid */}
              <div style={S.calGrid}>
                {/* Empty cells */}
                {Array.from({ length: firstDayIdx }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day      = i + 1;
                  const dateObj  = new Date(viewYear, viewMonth, day);
                  dateObj.setHours(0,0,0,0);
                  const dKey     = dateObj.toDateString();
                  const past     = dateObj < todayObj;
                  const isSelDay = dKey === selectedKey;
                  const isTodDay = dKey === todayKey;
                  const dots     = getDayDots(day);
                  const allDone  = dots.length > 0 && dots.every(t => t.done);
                  const hasTasks = dots.length > 0;

                  return (
                    <div
                      key={day}
                      onClick={() => selectDay(day)}
                      style={{
                        ...S.dayCell,
                        ...(past       ? S.dayCellPast : {}),
                        ...(isTodDay   ? S.dayCellToday : {}),
                        ...(isSelDay   ? S.dayCellSelected : {}),
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize:13, fontWeight: isTodDay||isSelDay ? 700 : 400 }}>{day}</span>
                      {hasTasks && (
                        <div style={S.dotRow}>
                          {allDone
                            ? <div style={{ ...S.dot, background:"#10b981" }} />
                            : <div style={{ ...S.dot, background:"#a855f7" }} />
                          }
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={S.legend}>
                <div style={S.legendItem}><div style={{ ...S.dot, background:"#1e293b", border:"2px solid #a855f7" }} /> Today</div>
                <div style={S.legendItem}><div style={{ ...S.dot, background:"#a855f7" }} /> Has tasks</div>
                <div style={S.legendItem}><div style={{ ...S.dot, background:"#10b981" }} /> All done</div>
                <div style={S.legendItem}><div style={{ ...S.dot, background:"#1e293b", opacity:0.3 }} /> Past</div>
              </div>
            </div>

            {/* ── TASK PANEL ── */}
            <div style={S.taskPanel}>

              {/* Selected date header */}
              <div style={S.taskHeader}>
                <div>
                  <h2 style={S.taskTitle}>
                    {isToday ? "Today" : selected.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}
                  </h2>
                  <p style={S.taskSub}>
                    {dayTasks.length === 0
                      ? "No tasks yet"
                      : `${doneCount} of ${dayTasks.length} tasks done`}
                  </p>
                </div>
                {dayTasks.length > 0 && (
                  <div style={S.progressCircle}>
                    <svg width="52" height="52" viewBox="0 0 52 52">
                      <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4"/>
                      <circle cx="26" cy="26" r="22" fill="none"
                        stroke="#a855f7" strokeWidth="4"
                        strokeDasharray={`${2*Math.PI*22}`}
                        strokeDashoffset={`${2*Math.PI*22*(1-progress/100)}`}
                        strokeLinecap="round"
                        transform="rotate(-90 26 26)"
                        style={{ transition:"stroke-dashoffset 0.5s ease" }}
                      />
                      <text x="26" y="31" textAnchor="middle" fontSize="11" fontWeight="700" fill="#a855f7">{progress}%</text>
                    </svg>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {dayTasks.length > 0 && (
                <div style={S.progBar}>
                  <div style={{ ...S.progFill, width:`${progress}%` }} />
                </div>
              )}

              {/* ADD TASK — only for today/future */}
              {isPast ? (
                <div style={S.pastBanner}>
                  👁 Past date — view only. Tasks cannot be added or edited.
                </div>
              ) : (
                <div style={S.addBox}>
                  <input
                    placeholder="Add a study task..."
                    value={taskInput}
                    onChange={e => setTaskInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addTask()}
                    style={S.taskInput}
                  />
                  <div style={S.addRow}>
                    {/* Color picker */}
                    <div style={S.colorRow}>
                      {COLORS.map(c => (
                        <div key={c} onClick={() => setTaskColor(c)}
                          style={{ ...S.colorDot, background:c, border: taskColor===c ? "2px solid white" : "2px solid transparent" }}
                        />
                      ))}
                    </div>
                    {/* Priority */}
                    <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)} style={S.select}>
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🔴 High</option>
                    </select>
                    <button style={S.addBtn} onClick={addTask} disabled={!taskInput.trim()}>
                      + Add
                    </button>
                  </div>
                </div>
              )}

              {/* FILTER TABS */}
              {dayTasks.length > 0 && (
                <div style={S.filterRow}>
                  {["all","pending","done"].map(f => (
                    <button key={f} style={{ ...S.filterBtn, ...(filter===f ? S.filterBtnActive : {}) }}
                      onClick={() => setFilter(f)}
                    >
                      {f === "all" ? `All (${dayTasks.length})` : f === "done" ? `Done (${doneCount})` : `Pending (${dayTasks.length - doneCount})`}
                    </button>
                  ))}
                </div>
              )}

              {/* TASK LIST */}
              <div style={S.taskList}>
                {filtered.length === 0 ? (
                  <div style={S.emptyTasks}>
                    <div style={{ fontSize:36, marginBottom:12 }}>
                      {isPast ? "🔒" : dayTasks.length === 0 ? "📝" : "🎉"}
                    </div>
                    <p style={{ color:"#64748b", fontSize:14 }}>
                      {isPast ? "No tasks were scheduled for this date"
                        : dayTasks.length === 0 ? "No tasks yet. Add one above!"
                        : "All tasks match — great job!"}
                    </p>
                  </div>
                ) : (
                  filtered.map((task) => (
                    <div key={task.id} style={{ ...S.taskItem, borderLeft:`3px solid ${task.color || "#7c3aed"}`, opacity: task.done ? 0.6 : 1 }}>
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => !isPast && toggleTask(task.id)}
                        disabled={isPast}
                        style={S.checkbox}
                      />
                      <div style={{ flex:1 }}>
                        <span style={{ ...S.taskText, textDecoration: task.done ? "line-through" : "none", color: task.done ? "#475569" : "#e2e8f0" }}>
                          {task.text}
                        </span>
                        <div style={S.taskMeta}>
                          <span style={{ ...S.priorityBadge, background: task.priority==="high" ? "rgba(239,68,68,0.15)" : task.priority==="medium" ? "rgba(245,158,11,0.15)" : "rgba(16,185,129,0.15)", color: task.priority==="high" ? "#fca5a5" : task.priority==="medium" ? "#fcd34d" : "#6ee7b7", border: `1px solid ${task.priority==="high" ? "rgba(239,68,68,0.3)" : task.priority==="medium" ? "rgba(245,158,11,0.3)" : "rgba(16,185,129,0.3)"}` }}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      {!isPast && (
                        <button style={S.delBtn} onClick={() => deleteTask(task.id)}>🗑</button>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const S = {
  wrap:        { padding:24, display:"flex", flexDirection:"column", gap:20 },
  statsRow:    { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 },
  statCard:    { background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"16px 20px", display:"flex", alignItems:"center", gap:14 },
  statIcon:    { fontSize:26 },
  statVal:     { fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, background:"linear-gradient(135deg,#f1f5f9,#a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" },
  statLbl:     { fontSize:12, color:"#475569", fontWeight:600, marginTop:2 },
  main:        { display:"grid", gridTemplateColumns:"340px 1fr", gap:20, alignItems:"start" },

  // Calendar
  calendarBox: { background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:20 },
  calHeader:   { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 },
  calTitle:    { fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700, color:"#f1f5f9" },
  navBtn:      { background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#e2e8f0", width:32, height:32, borderRadius:8, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" },
  dayLabels:   { display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:8 },
  dayLabel:    { textAlign:"center", fontSize:11, fontWeight:700, color:"#475569", padding:"4px 0", textTransform:"uppercase" },
  calGrid:     { display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 },
  dayCell:     { aspectRatio:"1", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRadius:8, border:"1px solid transparent", transition:"all 0.2s", color:"#94a3b8", fontSize:13, position:"relative", gap:2 },
  dayCellPast: { opacity:0.5, color:"#64748b" },
  dayCellToday:{ border:"1px solid rgba(168,85,247,0.5)", background:"rgba(124,58,237,0.1)", color:"#a855f7" },
  dayCellSelected:{ background:"linear-gradient(135deg,#7c3aed,#a855f7)", color:"white", boxShadow:"0 4px 14px rgba(124,58,237,0.4)", border:"1px solid transparent" },
  dotRow:      { display:"flex", gap:2, justifyContent:"center" },
  dot:         { width:5, height:5, borderRadius:"50%" },
  legend:      { display:"flex", gap:12, marginTop:16, flexWrap:"wrap", justifyContent:"center" },
  legendItem:  { display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#475569" },

  // Task panel
  taskPanel:   { background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:24, display:"flex", flexDirection:"column", gap:16 },
  taskHeader:  { display:"flex", justifyContent:"space-between", alignItems:"flex-start" },
  taskTitle:   { fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, background:"linear-gradient(135deg,#f1f5f9,#a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" },
  taskSub:     { fontSize:13, color:"#64748b", marginTop:4 },
  progressCircle:{ flexShrink:0 },
  progBar:     { height:5, background:"rgba(255,255,255,0.07)", borderRadius:10, overflow:"hidden" },
  progFill:    { height:"100%", background:"linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius:10, transition:"width 0.5s ease", boxShadow:"0 0 10px rgba(124,58,237,0.5)" },

  // Add box
  pastBanner:  { padding:"12px 16px", background:"rgba(59,130,246,0.08)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:10, color:"#93c5fd", fontSize:13, fontWeight:600, textAlign:"center" },
  addBox:      { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:16, display:"flex", flexDirection:"column", gap:12 },
  taskInput:   { width:"100%", padding:"11px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"#f1f5f9", fontSize:14, outline:"none", fontFamily:"sans-serif" },
  addRow:      { display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" },
  colorRow:    { display:"flex", gap:6 },
  colorDot:    { width:20, height:20, borderRadius:"50%", cursor:"pointer", transition:"transform 0.2s", flexShrink:0 },
  select:      { padding:"7px 10px", borderRadius:7, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.06)", color:"#e2e8f0", fontSize:13, outline:"none", cursor:"pointer" },
  addBtn:      { padding:"8px 20px", borderRadius:8, background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none", color:"white", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(124,58,237,0.35)", marginLeft:"auto", fontFamily:"sans-serif" },

  // Filter
  filterRow:   { display:"flex", gap:6 },
  filterBtn:   { padding:"6px 14px", borderRadius:7, border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color:"#64748b", fontSize:12, fontWeight:600, cursor:"pointer" },
  filterBtnActive:{ background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)", color:"#a855f7" },

  // Task list
  taskList:    { display:"flex", flexDirection:"column", gap:10, minHeight:120 },
  emptyTasks:  { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 20px", textAlign:"center" },
  taskItem:    { display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, transition:"all 0.2s" },
  checkbox:    { width:16, height:16, marginTop:3, accentColor:"#a855f7", cursor:"pointer", flexShrink:0 },
  taskText:    { fontSize:14, lineHeight:1.5, transition:"all 0.2s" },
  taskMeta:    { display:"flex", gap:6, marginTop:5 },
  priorityBadge:{ fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:100, textTransform:"uppercase", letterSpacing:"0.05em" },
  delBtn:      { background:"none", border:"none", cursor:"pointer", fontSize:14, opacity:0.4, padding:"2px 4px", flexShrink:0, transition:"opacity 0.2s" },
};

export default StudyPlanner;