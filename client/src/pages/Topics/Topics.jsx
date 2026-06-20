import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addNotification } from "../../utils/notifications";
import { trackTopic } from "../../utils/history";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { API_BASE_URL } from "../../config";

const COLORS = ["#7c3aed","#6366f1","#a855f7","#3b82f6","#8b5cf6","#9333ea"];
const getColor = (i) => COLORS[i % COLORS.length];

function Topics() {
  const navigate = useNavigate();
  const [topics,    setTopics]    = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newTitle,  setNewTitle]  = useState("");
  const [newDesc,   setNewDesc]   = useState("");
  const [creating,  setCreating]  = useState(false);
  const [search,    setSearch]    = useState("");
  const [deleting,  setDeleting]  = useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  };

  const fetchTopics = async () => {
    try {
      setLoading(true); setError("");
      const res = await fetch(`${API_BASE_URL}/api/topics`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setTopics((data.data || []).filter(t => t && typeof t.title === "string" && t.title.length > 0));
      } else { setError(data.message || "Failed to fetch"); }
    } catch { setError("Cannot connect to server."); }
    finally  { setLoading(false); }
  };

  useEffect(() => { fetchTopics(); }, []);

  const createTopic = async () => {
    if (!newTitle.trim()) return;
    try {
      setCreating(true);
      const res = await fetch(`${API_BASE_URL}/api/topics`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ title: newTitle.trim(), description: newDesc.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false); setNewTitle(""); setNewDesc(""); fetchTopics();
        addNotification("📚", `New topic created: "${newTitle.trim()}"`, "topic");
        trackTopic(newTitle.trim());
      }
      else { setError(data.message); }
    } catch { setError("Failed to create topic."); }
    finally  { setCreating(false); }
  };

  const deleteTopic = async (id) => {
    try {
      setDeleting(id);
      await fetch(`${API_BASE_URL}/api/topics/${id}`, { method: "DELETE" });
      setTopics(prev => prev.filter(t => t._id !== id));
    } catch { setError("Failed to delete."); }
    finally  { setDeleting(null); }
  };

  const filtered = topics.filter(t =>
    t && typeof t.title === "string" && t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-main">
        <Navbar />
        <div style={{ padding: 28 }}>

          {/* HEADER */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:16 }}>
            <div>
              <h1 style={S.pageTitle}>My Topics</h1>
              <p style={S.pageSub}>{topics.length} topic{topics.length !== 1 ? "s" : ""}</p>
            </div>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <input placeholder="🔍 Search..." value={search} onChange={e => setSearch(e.target.value)} style={S.searchInput} />
              <button style={S.createBtn} onClick={() => setShowModal(true)}>+ New Topic</button>
            </div>
          </div>

          {error && <div style={S.errorBanner}>❌ {error}</div>}

          {loading ? (
            <div style={S.centerBox}>
              <div style={S.spinner} />
              <p style={{ color:"#64748b", fontSize:14, marginTop:16 }}>Loading...</p>
            </div>

          ) : filtered.length === 0 ? (
            <div style={S.emptyBox}>
              <div style={S.emptyIcon}>📚</div>
              <h3 style={{ color:"#f1f5f9", fontSize:20, fontWeight:700, marginBottom:8 }}>
                {search ? "No topics found" : "No topics yet"}
              </h3>
              <p style={{ color:"#64748b", fontSize:14, marginBottom:24 }}>
                {search ? `No results for "${search}"` : "Create your first topic to get started."}
              </p>
              {!search && <button style={S.createBtn} onClick={() => setShowModal(true)}>+ Create First Topic</button>}
            </div>

          ) : (
            <div style={S.grid}>
              {filtered.map((topic, i) => {
                if (!topic || typeof topic.title !== "string") return null;
                const color   = getColor(i);
                const initial = topic.title.charAt(0).toUpperCase();
                const date    = topic.createdAt
                  ? new Date(topic.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })
                  : "Recently";

                return (
                  <div key={topic._id} style={S.card}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=`${color}55`; e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 20px 40px ${color}18`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
                  >
                    <div style={{ height:3, background:`linear-gradient(90deg,${color},${color}88)`, borderRadius:"14px 14px 0 0", margin:"-20px -20px 18px" }} />

                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:14 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ ...S.avatar, background:`${color}20`, border:`1px solid ${color}40`, color }}>{initial}</div>
                        <div>
                          <h3 style={S.topicTitle}>{topic.title}</h3>
                          <p style={S.topicDate}>Created {date}</p>
                        </div>
                      </div>
                      <button style={S.deleteBtn} onClick={() => deleteTopic(topic._id)} disabled={deleting === topic._id}>
                        {deleting === topic._id ? "..." : "🗑"}
                      </button>
                    </div>

                    {topic.description ? <p style={S.topicDesc}>{topic.description}</p> : null}

                    <div style={{ marginBottom:18 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#475569", marginBottom:6 }}>
                        <span>Progress</span><span style={{ color }}>0%</span>
                      </div>
                      <div style={S.progressBar}>
                        <div style={{ ...S.progressFill, background:`linear-gradient(90deg,${color},${color}88)`, width:"0%" }} />
                      </div>
                    </div>

                    <div style={{ display:"flex", gap:6, marginBottom:18 }}>
                      {["Docs","Flashcards","Quiz"].map(tag => (
                        <span key={tag} style={{ ...S.tag, background:`${color}12`, border:`1px solid ${color}30`, color }}>{tag}</span>
                      ))}
                    </div>

                    <div style={{ display:"flex", gap:8 }}>
                      <button style={{ ...S.actionBtn, background:`linear-gradient(135deg,${color},${color}cc)` }} onClick={() => navigate("/docs/view",       { state:{ topic: topic.title, autoGenerate: true } })}>📄 Docs</button>
                      <button style={S.ghostBtn}                                                                  onClick={() => navigate("/flashcards/view", { state:{ topic: topic.title, autoGenerate: true } })}>🃏 Cards</button>
                      <button style={S.ghostBtn}                                                                  onClick={() => navigate("/quiz/view",       { state:{ topic: topic.title, autoGenerate: true } })}>🧠 Quiz</button>
                    </div>
                  </div>
                );
              })}

              <div style={S.addCard}
                onClick={() => setShowModal(true)}
                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(124,58,237,0.4)"; e.currentTarget.style.background="rgba(124,58,237,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.background="rgba(255,255,255,0.02)"; }}
              >
                <div style={S.addIcon}>+</div>
                <p style={{ color:"#64748b", fontSize:14, fontWeight:600 }}>New Topic</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <h2 style={S.modalTitle}>Create New Topic</h2>
              <button style={S.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <label style={S.label}>Topic Name *</label>
            <input placeholder="e.g. Binary Search Trees" value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key==="Enter" && createTopic()} style={{ ...S.input, marginBottom:16 }} autoFocus />
            <label style={S.label}>Description (optional)</label>
            <textarea placeholder="What will you learn?" value={newDesc} onChange={e => setNewDesc(e.target.value)} style={{ ...S.input, height:80, resize:"vertical", marginBottom:24 }} />
            <div style={{ display:"flex", gap:10 }}>
              <button style={S.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={{ ...S.createBtn, flex:1, padding:"12px", opacity: creating||!newTitle.trim() ? 0.6 : 1 }} onClick={createTopic} disabled={creating||!newTitle.trim()}>
                {creating ? "Creating..." : "✨ Create Topic"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:scale(0.96)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

const S = {
  pageTitle:   { fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, background:"linear-gradient(135deg,#f1f5f9,#a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", marginBottom:6 },
  pageSub:     { color:"#64748b", fontSize:14 },
  searchInput: { padding:"10px 16px", borderRadius:8, width:200, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"#f1f5f9", fontSize:14, outline:"none", fontFamily:"sans-serif" },
  createBtn:   { padding:"10px 20px", borderRadius:8, background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none", color:"white", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 18px rgba(124,58,237,0.4)", whiteSpace:"nowrap" },
  errorBanner: { background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"12px 16px", color:"#fca5a5", fontSize:14, marginBottom:20 },
  centerBox:   { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"50vh" },
  spinner:     { width:38, height:38, borderRadius:"50%", border:"3px solid rgba(124,58,237,0.2)", borderTop:"3px solid #a855f7", animation:"spin 0.8s linear infinite" },
  emptyBox:    { display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 20px", textAlign:"center" },
  emptyIcon:   { fontSize:48, marginBottom:20, width:88, height:88, borderRadius:20, background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.2)", display:"flex", alignItems:"center", justifyContent:"center" },
  grid:        { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 },
  card:        { background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:16, padding:20, transition:"all 0.25s ease" },
  avatar:      { width:42, height:42, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:800, flexShrink:0 },
  topicTitle:  { fontSize:16, fontWeight:700, color:"#f1f5f9", marginBottom:3 },
  topicDate:   { fontSize:11, color:"#475569" },
  topicDesc:   { fontSize:13, color:"#64748b", lineHeight:1.6, marginBottom:14 },
  deleteBtn:   { background:"none", border:"none", cursor:"pointer", fontSize:16, opacity:0.5, padding:"4px 6px", borderRadius:6 },
  progressBar: { height:5, background:"rgba(255,255,255,0.07)", borderRadius:10, overflow:"hidden" },
  progressFill:{ height:"100%", borderRadius:10 },
  tag:         { fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100 },
  actionBtn:   { flex:1, padding:"9px 0", border:"none", borderRadius:8, color:"white", fontSize:13, fontWeight:700, cursor:"pointer" },
  ghostBtn:    { flex:1, padding:"9px 0", border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", borderRadius:8, color:"#94a3b8", fontSize:13, fontWeight:600, cursor:"pointer" },
  addCard:     { border:"1px dashed rgba(255,255,255,0.07)", borderRadius:16, padding:20, background:"rgba(255,255,255,0.02)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:200, cursor:"pointer", transition:"all 0.25s", gap:10 },
  addIcon:     { width:48, height:48, borderRadius:12, background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, color:"#a855f7" },
  overlay:     { position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 },
  modal:       { width:"100%", maxWidth:460, background:"rgba(13,13,26,0.98)", border:"1px solid rgba(124,58,237,0.25)", borderRadius:20, padding:28, animation:"fadeIn 0.2s ease", boxShadow:"0 24px 60px rgba(0,0,0,0.6)" },
  modalTitle:  { fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, background:"linear-gradient(135deg,#f1f5f9,#a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" },
  closeBtn:    { background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"#94a3b8", width:32, height:32, borderRadius:8, cursor:"pointer", fontSize:14 },
  label:       { display:"block", fontSize:12, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 },
  input:       { width:"100%", padding:"12px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.04)", color:"#f1f5f9", fontSize:14, outline:"none" },
  cancelBtn:   { padding:"12px 20px", borderRadius:8, border:"1px solid rgba(255,255,255,0.08)", background:"transparent", color:"#94a3b8", fontSize:14, fontWeight:600, cursor:"pointer" },
};

export default Topics;