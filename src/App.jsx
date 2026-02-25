import { useState, useEffect } from "react";

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const SHIFTS = ["1", "2", "3", "Helper", "SL", "A"];
const AFTERNOON_SHIFTS = ["1", "2", "3", "Helper"];
const NIGHT_SHIFTS = ["SL", "A"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const COLORS = {
  teal: "#2BADA0", tealDark: "#1E8077", tealLight: "#D6F0EE",
  orange: "#E8841A", orangeLight: "#FDF0DC",
  burnt: "#C4421A", burntLight: "#F5DDD0",
  cream: "#FDFAF4", creamDark: "#F3EDE0",
  brown: "#2D1A0E", brownMid: "#7A5C3E",
  border: "#E0D5C4", white: "#FFFFFF",
  purple: "#7C3AED", purpleLight: "#EDE9FE",
  green: "#065F46", greenLight: "#D1FAE5",
};

const SEED_EMPLOYEES = [
  { id: "mgr", name: "You (Manager)", email: "manager@cornercafe.com", role: "manager", availability: {} },
  { id: "e1", name: "Jamie L.", email: "jamie@cornercafe.com", role: "employee", availability: {} },
  { id: "e2", name: "Sam R.", email: "sam@cornercafe.com", role: "employee", availability: {} },
  { id: "e3", name: "Alex K.", email: "alex@cornercafe.com", role: "employee", availability: {} },
  { id: "e4", name: "Taylor B.", email: "taylor@cornercafe.com", role: "employee", availability: {} },
  { id: "e5", name: "Jordan M.", email: "jordan@cornercafe.com", role: "employee", availability: {} },
  { id: "e6", name: "Morgan C.", email: "morgan@cornercafe.com", role: "employee", availability: {} },
  { id: "e7", name: "Casey W.", email: "casey@cornercafe.com", role: "employee", availability: {} },
  { id: "e8", name: "Riley T.", email: "riley@cornercafe.com", role: "employee", availability: {} },
];

// ── DATE HELPERS ───────────────────────────────────────────────────────────
function getWeekKey(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1 - day) + offset * 7;
  const mon = new Date(now); mon.setDate(now.getDate() + diff);
  mon.setHours(0,0,0,0);
  return mon.toISOString().slice(0, 10);
}

function getWeekDates(weekKey) {
  const mon = new Date(weekKey + "T00:00:00");
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon); d.setDate(mon.getDate() + i);
    return d;
  });
}

function formatWeekRange(weekKey) {
  const dates = getWeekDates(weekKey);
  const fmt = d => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(dates[0])} – ${fmt(dates[6])}, ${dates[0].getFullYear()}`;
}

function isToday(date) {
  const t = new Date();
  return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
}

function dateToKey(date) { return date.toISOString().slice(0, 10); }
function keyToDate(key) { return new Date(key + "T00:00:00"); }
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }

// ── EMAIL SIMULATION ───────────────────────────────────────────────────────
function sendEmail(to, subject, body, setEmailLog) {
  const entry = { id: Date.now() + Math.random(), to, subject, body, sentAt: new Date().toISOString() };
  console.log("📧 EMAIL\n  To:", to, "\n  Subject:", subject);
  setEmailLog(prev => [entry, ...prev]);
}

// ── STYLES ─────────────────────────────────────────────────────────────────
const S = {
  app: { fontFamily: "'Nunito', sans-serif", background: COLORS.cream, minHeight: "100vh", color: COLORS.brown },
  nav: { background: COLORS.brown, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 64, boxShadow: "0 2px 12px rgba(45,26,14,0.3)", position: "sticky", top: 0, zIndex: 100 },
  brand: { display: "flex", alignItems: "center", gap: 12 },
  brandName: { fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700, color: COLORS.teal },
  brandSub: { fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 2, fontWeight: 600 },
  navLinks: { display: "flex", gap: 2, flexWrap: "wrap" },
  navUser: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: "50%", background: COLORS.teal, color: "white", fontSize: "0.72rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(255,255,255,0.2)" },
  main: { maxWidth: 1200, margin: "0 auto", padding: "28px 20px" },
  pageTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", fontWeight: 700 },
  card: { background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 20px rgba(45,26,14,0.07)", marginBottom: 24 },
  cardHeader: { background: `linear-gradient(135deg, ${COLORS.brown} 0%, #4A2E18 100%)`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  cardHeaderTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1rem", color: "white", fontWeight: 700 },
  cardHeaderSub: { fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", marginTop: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 },
  cardBody: { padding: 20 },
  tableWrap: { overflowX: "auto" },
  chip: { display: "inline-block", padding: "4px 12px", borderRadius: 6, fontSize: "0.75rem", fontWeight: 800, minWidth: 38, textAlign: "center", cursor: "default" },
  btn: { padding: "8px 18px", borderRadius: 8, fontFamily: "'Nunito', sans-serif", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", border: "none", transition: "all 0.15s" },
  input: { width: "100%", padding: "9px 13px", border: `1.5px solid ${COLORS.border}`, borderRadius: 8, fontFamily: "'Nunito', sans-serif", fontSize: "0.82rem", color: COLORS.brown, background: COLORS.cream, outline: "none" },
  label: { display: "block", fontSize: "0.72rem", fontWeight: 700, color: COLORS.brownMid, marginBottom: 5, textTransform: "uppercase", letterSpacing: 1 },
  badge: { display: "inline-block", fontSize: "0.55rem", background: COLORS.teal, color: "white", borderRadius: 3, padding: "1px 5px", marginLeft: 5, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase", verticalAlign: "middle" },
};

function chipStyle(type) {
  const map = {
    afternoon: { background: COLORS.orangeLight, color: COLORS.orange, border: `1px solid #F0C888` },
    night:     { background: COLORS.tealLight, color: COLORS.tealDark, border: `1px solid #A8D8D4` },
    off:       { background: COLORS.creamDark, color: "#B0A090", fontStyle: "italic", border: `1px solid ${COLORS.border}`, fontWeight: 600 },
    request:   { background: "#FEF3C7", color: "#92400E", border: "1px dashed #D97706" },
    swap:      { background: COLORS.purpleLight, color: COLORS.purple, border: `1px dashed ${COLORS.purple}` },
    approved:  { background: COLORS.greenLight, color: COLORS.green, border: "1px solid #6EE7B7" },
    denied:    { background: COLORS.burntLight, color: COLORS.burnt, border: `1px solid #F0A080` },
  };
  return { ...S.chip, ...(map[type] || map.off) };
}

function btnStyle(variant, extra = {}) {
  const map = {
    primary: { background: COLORS.teal, color: "white" },
    orange:  { background: COLORS.orange, color: "white" },
    outline: { background: "white", border: `1.5px solid ${COLORS.border}`, color: COLORS.brownMid },
    danger:  { background: COLORS.burnt, color: "white" },
    ghost:   { background: "transparent", color: COLORS.brownMid, border: `1px solid ${COLORS.border}` },
    purple:  { background: COLORS.purple, color: "white" },
  };
  return { ...S.btn, ...(map[variant] || map.outline), ...extra };
}

// ── SMALL COMPONENTS ──────────────────────────────────────────────────────
function NavLink({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background: active ? COLORS.teal : "transparent", color: active ? "white" : "rgba(255,255,255,0.65)", border: "none", borderRadius: 6, padding: "7px 12px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(45,26,14,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
      <div style={{ background: "white", borderRadius: 14, width: "100%", maxWidth: wide ? 700 : 540, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", overflow: "hidden", margin: "auto" }}>
        <div style={{ background: `linear-gradient(135deg, ${COLORS.brown}, #4A2E18)`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={S.cardHeaderTitle}>{title}</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        <div style={{ padding: 24, maxHeight: "80vh", overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

function Banner({ text, onApprove, onDeny }) {
  return (
    <div style={{ background: COLORS.tealLight, border: `1px solid #A8D8D4`, borderRadius: 8, padding: "12px 18px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.78rem", fontWeight: 700, color: COLORS.tealDark, gap: 12, flexWrap: "wrap" }}>
      <span>⚠️ {text}</span>
      <div style={{ display: "flex", gap: 8 }}>
        {onApprove && <button onClick={onApprove} style={btnStyle("primary", { fontSize: "0.72rem", padding: "5px 14px" })}>Approve</button>}
        {onDeny && <button onClick={onDeny} style={btnStyle("danger", { fontSize: "0.72rem", padding: "5px 14px" })}>Deny</button>}
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const accounts = SEED_EMPLOYEES.map(e => ({ email: e.email, id: e.id }));

  function handleLogin() {
    const found = accounts.find(a => a.email.toLowerCase() === email.toLowerCase().trim());
    if (!found) { setErr("No account found with that email address."); return; }
    onLogin(found.id);
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${COLORS.brown} 0%, #4A2E18 60%, #6B3A20 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 400, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.35)" }}>
        <div style={{ background: `linear-gradient(135deg, ${COLORS.brown}, #4A2E18)`, padding: "32px 32px 24px", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "white", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>☀️</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: COLORS.teal, fontWeight: 700 }}>Corner Cafe</div>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 2, marginTop: 4, fontWeight: 600 }}>Staff Portal</div>
        </div>
        <div style={{ padding: 32 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, marginBottom: 6 }}>Welcome back</div>
          <div style={{ fontSize: "0.78rem", color: COLORS.brownMid, marginBottom: 24 }}>Sign in with your work email.</div>
          <label style={S.label}>Email Address</label>
          <input style={S.input} type="email" placeholder="you@cornercafe.com" value={email} onChange={e => { setEmail(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          {err && <div style={{ color: COLORS.burnt, fontSize: "0.73rem", marginTop: 6, fontWeight: 600 }}>{err}</div>}
          <button onClick={handleLogin} style={{ ...btnStyle("primary"), width: "100%", marginTop: 18, padding: "11px", fontSize: "0.85rem" }}>Sign In →</button>
          <div style={{ marginTop: 20, padding: 14, background: COLORS.creamDark, borderRadius: 8, fontSize: "0.68rem", color: COLORS.brownMid, lineHeight: 1.7 }}>
            <strong>Demo accounts:</strong><br />
            manager@cornercafe.com<br />
            jamie@cornercafe.com · casey@cornercafe.com · riley@cornercafe.com
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CALENDAR PICKER ────────────────────────────────────────────────────────
function CalendarPicker({ selected, onSelect, timeOffRequests, empId }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const [viewDate, setViewDate] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [rangeStart, setRangeStart] = useState(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startOffset = new Date(year, month, 1).getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  function handleDayClick(date) {
    if (date < today) return;
    const key = dateToKey(date);
    if (!rangeStart) {
      // if clicking sole selected date, clear
      if (selected.length === 1 && selected[0] === key) { onSelect([]); return; }
      setRangeStart(date);
      onSelect([key]);
    } else {
      const start = rangeStart <= date ? rangeStart : date;
      const end   = rangeStart <= date ? date : rangeStart;
      const keys = [];
      let cur = new Date(start);
      while (cur <= end) { keys.push(dateToKey(cur)); cur = addDays(cur, 1); }
      onSelect(keys);
      setRangeStart(null);
    }
  }

  function hasExistingRequest(date) {
    const key = dateToKey(date);
    return timeOffRequests.some(r => r.empId === empId && r.dates?.includes(key) && r.status !== "denied");
  }

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div style={{ userSelect: "none" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))} style={btnStyle("ghost", { padding: "4px 12px" })}>‹</button>
        <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1rem" }}>{MONTH_NAMES[month]} {year}</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))} style={btnStyle("ghost", { padding: "4px 12px" })}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3, marginBottom: 4 }}>
        {["M","T","W","T","F","S","S"].map((d,i) => <div key={i} style={{ textAlign:"center", fontSize:"0.62rem", fontWeight:800, color:COLORS.brownMid, padding:"3px 0", textTransform:"uppercase", letterSpacing:1 }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const key = dateToKey(date);
          const past = date < today;
          const sel = selected.includes(key);
          const hasReq = hasExistingRequest(date);
          const todayFlag = isToday(date);
          return (
            <div key={i} onClick={() => !past && handleDayClick(date)} style={{ textAlign:"center", borderRadius:6, padding:"7px 2px", fontSize:"0.78rem", fontWeight: sel ? 800 : 500, cursor: past ? "not-allowed" : "pointer", background: sel ? COLORS.teal : hasReq ? COLORS.orangeLight : todayFlag ? COLORS.tealLight : "transparent", color: sel ? "white" : past ? "#C8B8A8" : hasReq ? COLORS.orange : todayFlag ? COLORS.tealDark : COLORS.brown, border: todayFlag && !sel ? `1.5px solid ${COLORS.teal}` : "1.5px solid transparent", opacity: past ? 0.45 : 1 }}>
              {date.getDate()}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10, fontSize: "0.67rem", color: COLORS.brownMid, fontStyle: "italic" }}>
        {rangeStart ? "Now click an end date to select a range." : "Click one date, or click a start then end date for a range."}
      </div>
    </div>
  );
}

// ── TIME OFF REQUEST MODAL ─────────────────────────────────────────────────
function TimeOffRequestModal({ currentUser, timeOffRequests, onSubmit, onClose }) {
  const [selectedDates, setSelectedDates] = useState([]);
  const [period, setPeriod] = useState("both");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");

  function handleSubmit() {
    if (selectedDates.length === 0) { setErr("Please select at least one date."); return; }
    if (!reason.trim()) { setErr("Please provide a reason."); return; }
    onSubmit({ id: Date.now(), empId: currentUser.id, dates: selectedDates, period, reason: reason.trim(), status: "pending", createdAt: new Date().toISOString() });
  }

  return (
    <Modal title="Request Time Off" onClose={onClose} wide>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div>
          <label style={S.label}>Select Date(s)</label>
          <div style={{ background: COLORS.creamDark, borderRadius: 10, padding: 14, border: `1px solid ${COLORS.border}` }}>
            <CalendarPicker selected={selectedDates} onSelect={setSelectedDates} timeOffRequests={timeOffRequests} empId={currentUser.id} />
          </div>
          {selectedDates.length > 0 && (
            <div style={{ marginTop: 10, fontSize: "0.75rem", color: COLORS.tealDark, fontWeight: 700 }}>
              {selectedDates.length === 1
                ? `Selected: ${keyToDate(selectedDates[0]).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}`
                : `Selected: ${selectedDates.length} days (${keyToDate(selectedDates[0]).toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${keyToDate(selectedDates[selectedDates.length-1]).toLocaleDateString("en-US",{month:"short",day:"numeric"})})`}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={S.label}>Shift Period</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[["both","Full day (both shifts)"],["afternoon","Afternoon only (1, 2, 3, Helper)"],["night","Night only (SL, A)"]].map(([val,lbl]) => (
                <label key={val} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"10px 14px", borderRadius:8, border:`1.5px solid ${period===val ? COLORS.teal : COLORS.border}`, background: period===val ? COLORS.tealLight : "white", fontWeight:600, fontSize:"0.78rem", color: period===val ? COLORS.tealDark : COLORS.brown }}>
                  <input type="radio" name="period" value={val} checked={period===val} onChange={() => setPeriod(val)} style={{ accentColor: COLORS.teal }} />
                  {lbl}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={S.label}>Reason</label>
            <textarea value={reason} onChange={e => { setReason(e.target.value); setErr(""); }} rows={4} placeholder="e.g. Doctor appointment, family event, vacation..." style={{ ...S.input, resize:"vertical" }} />
          </div>
          {err && <div style={{ color: COLORS.burnt, fontSize:"0.75rem", fontWeight:600 }}>{err}</div>}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:"auto" }}>
            <button onClick={onClose} style={btnStyle("ghost")}>Cancel</button>
            <button onClick={handleSubmit} style={btnStyle("orange")}>Submit Request</button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ── SHIFT SWAP MODAL ──────────────────────────────────────────────────────
function ShiftSwapModal({ currentUser, employees, swapInfo, weekKey, schedule, onSubmit, onClose }) {
  const [toEmpId, setToEmpId] = useState("");
  const [err, setErr] = useState("");
  const myShift = schedule[weekKey]?.[swapInfo.empId]?.[swapInfo.dayIdx];
  const myType = AFTERNOON_SHIFTS.includes(myShift) ? "afternoon" : "night";

  const eligible = employees.filter(e => {
    if (e.id === currentUser.id || e.role === "manager") return false;
    const s = schedule[weekKey]?.[e.id]?.[swapInfo.dayIdx];
    return s && s !== "OFF-APPROVED";
  });

  function handleSubmit() {
    if (!toEmpId) { setErr("Please select someone to swap with."); return; }
    const toShift = schedule[weekKey]?.[toEmpId]?.[swapInfo.dayIdx];
    onSubmit({ id: Date.now(), fromEmpId: currentUser.id, toEmpId, weekKey, dayIdx: swapInfo.dayIdx, fromShift: myShift, toShift, status: "pending", createdAt: new Date().toISOString() });
  }

  return (
    <Modal title="Offer Shift Swap" onClose={onClose}>
      <div style={{ background: COLORS.creamDark, borderRadius: 8, padding: 14, marginBottom: 18 }}>
        <div style={{ fontSize:"0.75rem", fontWeight:700, color: COLORS.brownMid, marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>Your shift on {DAYS[swapInfo.dayIdx]}</div>
        <span style={chipStyle(myType)}>{myShift}</span>
        <span style={{ marginLeft:8, fontSize:"0.73rem", color:COLORS.brownMid }}>({myType === "afternoon" ? "Afternoon" : "Night"})</span>
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={S.label}>Swap with</label>
        {eligible.length === 0
          ? <div style={{ color:COLORS.brownMid, fontSize:"0.78rem", fontStyle:"italic", padding:"12px 0" }}>No coworkers scheduled on this day to swap with.</div>
          : <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {eligible.map(e => {
                const theirShift = schedule[weekKey]?.[e.id]?.[swapInfo.dayIdx];
                const theirType = AFTERNOON_SHIFTS.includes(theirShift) ? "afternoon" : "night";
                return (
                  <label key={e.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:8, border:`1.5px solid ${toEmpId===e.id ? COLORS.teal : COLORS.border}`, background: toEmpId===e.id ? COLORS.tealLight : "white", cursor:"pointer" }}>
                    <input type="radio" name="toEmp" value={e.id} checked={toEmpId===e.id} onChange={() => { setToEmpId(e.id); setErr(""); }} style={{ accentColor: COLORS.teal }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:"0.82rem" }}>{e.name}</div>
                      <div style={{ fontSize:"0.72rem", color:COLORS.brownMid, marginTop:4, display:"flex", alignItems:"center", gap:6 }}>
                        They're working: <span style={chipStyle(theirType)}>{theirShift}</span>
                        <span style={{ fontSize:"0.68rem" }}>({theirType === "afternoon" ? "Afternoon" : "Night"})</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
        }
      </div>
      <div style={{ fontSize:"0.72rem", color:COLORS.brownMid, marginBottom:16, padding:"10px 14px", background:COLORS.creamDark, borderRadius:8, fontStyle:"italic" }}>
        The other employee must accept, then management approves before the swap takes effect.
      </div>
      {err && <div style={{ color:COLORS.burnt, fontSize:"0.75rem", marginBottom:12, fontWeight:600 }}>{err}</div>}
      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <button onClick={onClose} style={btnStyle("ghost")}>Cancel</button>
        {eligible.length > 0 && <button onClick={handleSubmit} style={btnStyle("purple")}>Offer Swap</button>}
      </div>
    </Modal>
  );
}

// ── MY WEEK CARD ──────────────────────────────────────────────────────────
function MyWeekCard({ currentUser, schedule, weekKey, weekDates, timeOffRequests }) {
  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <div>
          <div style={S.cardHeaderTitle}>My Schedule This Week</div>
          <div style={S.cardHeaderSub}>{formatWeekRange(weekKey)}</div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
        {weekDates.map((date, i) => {
          const shift = schedule[weekKey]?.[currentUser.id]?.[i];
          const today = isToday(date);
          const dk = dateToKey(date);
          const req = timeOffRequests.find(r => r.empId === currentUser.id && r.dates?.includes(dk) && r.status !== "denied");
          const type = AFTERNOON_SHIFTS.includes(shift) ? "afternoon" : NIGHT_SHIFTS.includes(shift) ? "night" : null;
          return (
            <div key={i} style={{ padding:"16px 8px", textAlign:"center", borderRight: i < 6 ? `1px solid ${COLORS.border}` : "none", background: today ? COLORS.tealLight : "white" }}>
              <div style={{ fontSize:"0.63rem", fontWeight:800, textTransform:"uppercase", letterSpacing:1.5, color: today ? COLORS.tealDark : COLORS.brownMid, marginBottom:4 }}>{DAYS[i]}</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", fontWeight:700, color: today ? COLORS.tealDark : COLORS.brown, marginBottom:10 }}>{date.getDate()}</div>
              {req
                ? <span style={chipStyle(req.status === "approved" ? "approved" : "request")}>{req.status === "approved" ? "Off ✓" : "Req. Off"}</span>
                : type
                  ? <><span style={chipStyle(type)}>{shift}</span><div style={{ fontSize:"0.6rem", color:COLORS.brownMid, marginTop:5, fontWeight:600 }}>{type === "afternoon" ? "Afternoon" : "Night"}</div></>
                  : <span style={chipStyle("off")}>—</span>
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SCHEDULE VIEW ─────────────────────────────────────────────────────────
function ScheduleView({ currentUser, employees, schedule, setSchedule, timeOffRequests, setTimeOffRequests, swapRequests, setSwapRequests, weekOffset, setWeekOffset, setEmailLog }) {
  const isManager = currentUser.role === "manager";
  const weekKey = getWeekKey(weekOffset);
  const weekDates = getWeekDates(weekKey);
  const [scheduleView, setScheduleView] = useState("full");
  const [editCell, setEditCell] = useState(null);
  const [showTimeOffModal, setShowTimeOffModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(null);

  const getShift = (empId, dayIdx) => schedule[weekKey]?.[empId]?.[dayIdx] ?? null;

  function setShift(empId, dayIdx, val) {
    setSchedule(prev => ({ ...prev, [weekKey]: { ...prev[weekKey], [empId]: { ...(prev[weekKey]?.[empId]||{}), [dayIdx]: val || null } } }));
    setEditCell(null);
  }

  // Returns approved time-off period for a given employee/day, or null
  function getApprovedOffPeriod(empId, dayIdx) {
    const dk = dateToKey(weekDates[dayIdx]);
    const req = timeOffRequests.find(r => r.empId === empId && r.dates?.includes(dk) && r.status === "approved");
    return req ? req.period : null;
  }

  function isShiftBlocked(empId, dayIdx, shiftVal) {
    const period = getApprovedOffPeriod(empId, dayIdx);
    if (!period) return false;
    if (period === "both") return true;
    if (period === "afternoon" && AFTERNOON_SHIFTS.includes(shiftVal)) return true;
    if (period === "night" && NIGHT_SHIFTS.includes(shiftVal)) return true;
    return false;
  }

  function getPendingReq(empId, dayIdx) {
    const dk = dateToKey(weekDates[dayIdx]);
    return timeOffRequests.find(r => r.empId === empId && r.dates?.includes(dk) && r.status === "pending");
  }

  function getApprovedReq(empId, dayIdx) {
    const dk = dateToKey(weekDates[dayIdx]);
    return timeOffRequests.find(r => r.empId === empId && r.dates?.includes(dk) && r.status === "approved");
  }

  function getPendingSwap(empId, dayIdx) {
    return swapRequests.find(r => r.fromEmpId === empId && r.weekKey === weekKey && r.dayIdx === dayIdx && (r.status === "pending" || r.status === "accepted"));
  }

  function renderCell(empId, dayIdx) {
    const shift = getShift(empId, dayIdx);
    const pending = getPendingReq(empId, dayIdx);
    const approved = getApprovedReq(empId, dayIdx);
    const swap = getPendingSwap(empId, dayIdx);

    if (approved) {
      if (approved.period === "both") return <span style={chipStyle("approved")}>Off ✓</span>;
      const offLabel = approved.period === "afternoon" ? "AM Off ✓" : "PM Off ✓";
      const remainingShift = shift && (approved.period === "afternoon" ? NIGHT_SHIFTS.includes(shift) : AFTERNOON_SHIFTS.includes(shift)) ? shift : null;
      const remainType = remainingShift ? (AFTERNOON_SHIFTS.includes(remainingShift) ? "afternoon" : "night") : null;
      return (
        <div style={{ display:"flex", flexDirection:"column", gap:3, alignItems:"center" }}>
          <span style={chipStyle("approved")}>{offLabel}</span>
          {remainingShift && <span style={chipStyle(remainType)}>{remainingShift}</span>}
        </div>
      );
    }
    if (pending) {
      const label = pending.period === "both" ? "Req. Off" : pending.period === "afternoon" ? "AM Req." : "PM Req.";
      return <span style={chipStyle("request")} title={`Reason: ${pending.reason}`}>{label}</span>;
    }
    if (swap) return <span style={chipStyle("swap")}>{shift || "?"} ↔</span>;
    if (!shift) return <span style={chipStyle("off")}>—</span>;
    const type = AFTERNOON_SHIFTS.includes(shift) ? "afternoon" : "night";
    return <span style={chipStyle(type)}>{shift}</span>;
  }

  function handleApproveTimeOff(req) {
    setTimeOffRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "approved" } : r));
    if (req.period === "both") {
      req.dates?.forEach(dk => {
        const d = keyToDate(dk);
        const dayOfWeek = (d.getDay() + 6) % 7;
        const mon = new Date(d); mon.setDate(d.getDate() - dayOfWeek);
        const wk = mon.toISOString().slice(0, 10);
        setSchedule(prev => ({ ...prev, [wk]: { ...prev[wk], [req.empId]: { ...(prev[wk]?.[req.empId]||{}), [dayOfWeek]: null } } }));
      });
    }
    const emp = employees.find(e => e.id === req.empId);
    const dStr = req.dates?.length === 1
      ? keyToDate(req.dates[0]).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})
      : `${req.dates?.length} days (${keyToDate(req.dates[0]).toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${keyToDate(req.dates[req.dates.length-1]).toLocaleDateString("en-US",{month:"short",day:"numeric"})})`;
    const pLabel = { both:"full day", afternoon:"afternoon shifts only", night:"night shifts only" }[req.period];
    sendEmail(emp?.email, "✅ Time-Off Approved — Corner Cafe", `Hi ${emp?.name},\n\nYour time-off request has been approved!\n\nDates: ${dStr}\nPeriod: ${pLabel}\nReason on file: "${req.reason}"\n\nIf you have questions, please speak with the manager.\n\n— Corner Cafe Management`, setEmailLog);
  }

  function handleDenyTimeOff(req) {
    setTimeOffRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "denied" } : r));
    const emp = employees.find(e => e.id === req.empId);
    const dStr = req.dates?.length === 1 ? keyToDate(req.dates[0]).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}) : `${req.dates?.length} days`;
    sendEmail(emp?.email, "❌ Time-Off Denied — Corner Cafe", `Hi ${emp?.name},\n\nUnfortunately your time-off request has been denied.\n\nDates: ${dStr}\nPeriod: ${req.period}\n\nPlease speak with the manager if you have any questions.\n\n— Corner Cafe Management`, setEmailLog);
  }

  function handleApproveSwap(swap) {
    setSwapRequests(prev => prev.map(r => r.id === swap.id ? { ...r, status: "manager-approved" } : r));
    const fromShift = getShift(swap.fromEmpId, swap.dayIdx);
    const toShift = getShift(swap.toEmpId, swap.dayIdx);
    setShift(swap.fromEmpId, swap.dayIdx, toShift);
    setShift(swap.toEmpId, swap.dayIdx, fromShift);
    const from = employees.find(e => e.id === swap.fromEmpId);
    const to = employees.find(e => e.id === swap.toEmpId);
    sendEmail(from?.email, "✅ Shift Swap Approved — Corner Cafe", `Hi ${from?.name},\n\nYour shift swap with ${to?.name} on ${DAYS[swap.dayIdx]} (${formatWeekRange(swap.weekKey)}) has been approved!\n\nYour updated shift: ${toShift}\n\n— Corner Cafe Management`, setEmailLog);
    sendEmail(to?.email, "✅ Shift Swap Approved — Corner Cafe", `Hi ${to?.name},\n\nYour shift swap with ${from?.name} on ${DAYS[swap.dayIdx]} (${formatWeekRange(swap.weekKey)}) has been approved!\n\nYour updated shift: ${fromShift}\n\n— Corner Cafe Management`, setEmailLog);
  }

  function handleDenySwap(swap) {
    setSwapRequests(prev => prev.map(r => r.id === swap.id ? { ...r, status: "denied" } : r));
    const from = employees.find(e => e.id === swap.fromEmpId);
    const to = employees.find(e => e.id === swap.toEmpId);
    sendEmail(from?.email, "❌ Shift Swap Denied — Corner Cafe", `Hi ${from?.name},\n\nYour shift swap request with ${to?.name} on ${DAYS[swap.dayIdx]} was denied by management.\n\n— Corner Cafe Management`, setEmailLog);
    sendEmail(to?.email, "❌ Shift Swap Denied — Corner Cafe", `Hi ${to?.name},\n\nThe shift swap with ${from?.name} on ${DAYS[swap.dayIdx]} was denied by management.\n\n— Corner Cafe Management`, setEmailLog);
  }

  function publishSchedule() {
    employees.filter(e => e.role !== "manager").forEach(emp => {
      const lines = weekDates.map((d,i) => {
        const s = getShift(emp.id, i);
        return `  ${DAYS[i]} ${d.getDate()}: ${s || "Off"}`;
      }).join("\n");
      sendEmail(emp.email, `📅 Schedule Posted: ${formatWeekRange(weekKey)} — Corner Cafe`, `Hi ${emp.name},\n\nYour schedule for the week of ${formatWeekRange(weekKey)} has been posted:\n\n${lines}\n\nLog in to the Corner Cafe Staff Portal to view the full team schedule, request time off, or arrange shift swaps.\n\n— Corner Cafe Management`, setEmailLog);
    });
    alert(`✅ Schedule published! Emails sent to ${employees.filter(e=>e.role!=="manager").length} employees.`);
  }

  const pendingTimeOff = timeOffRequests.filter(r => r.status === "pending");
  const pendingSwaps = swapRequests.filter(r => r.status === "accepted");

  function canOfferSwap(empId, dayIdx) {
    const shift = getShift(empId, dayIdx);
    if (!shift) return false;
    if (getPendingReq(empId, dayIdx) || getApprovedReq(empId, dayIdx)) return false;
    if (getPendingSwap(empId, dayIdx)) return false;
    return true;
  }

  return (
    <div>
      {isManager && pendingTimeOff.filter(r => r.empId !== currentUser.id).map(req => {
        const emp = employees.find(e => e.id === req.empId);
        const dStr = req.dates?.length === 1 ? keyToDate(req.dates[0]).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}) : `${req.dates?.length} days`;
        const pLabel = { both:"full day", afternoon:"afternoon only", night:"night only" }[req.period];
        return <Banner key={req.id} text={`${emp?.name} — time-off request: ${dStr}, ${pLabel}: "${req.reason}"`} onApprove={() => handleApproveTimeOff(req)} onDeny={() => handleDenyTimeOff(req)} />;
      })}
      {isManager && pendingSwaps.map(swap => {
        const from = employees.find(e => e.id === swap.fromEmpId);
        const to = employees.find(e => e.id === swap.toEmpId);
        return <Banner key={swap.id} text={`Shift swap awaiting approval: ${from?.name} (${swap.fromShift}) ↔ ${to?.name} (${swap.toShift}) on ${DAYS[swap.dayIdx]}`} onApprove={() => handleApproveSwap(swap)} onDeny={() => handleDenySwap(swap)} />;
      })}

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div style={S.pageTitle}>Weekly <span style={{ color: COLORS.teal }}>Schedule</span></div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          {/* Full / My toggle */}
          <div style={{ display:"flex", borderRadius:8, overflow:"hidden", border:`1.5px solid ${COLORS.border}` }}>
            <button onClick={() => setScheduleView("full")} style={{ padding:"7px 16px", fontFamily:"'Nunito',sans-serif", fontSize:"0.75rem", fontWeight:700, border:"none", cursor:"pointer", background: scheduleView==="full" ? COLORS.teal : "white", color: scheduleView==="full" ? "white" : COLORS.brownMid }}>Full Schedule</button>
            <button onClick={() => setScheduleView("mine")} style={{ padding:"7px 16px", fontFamily:"'Nunito',sans-serif", fontSize:"0.75rem", fontWeight:700, border:"none", borderLeft:`1.5px solid ${COLORS.border}`, cursor:"pointer", background: scheduleView==="mine" ? COLORS.teal : "white", color: scheduleView==="mine" ? "white" : COLORS.brownMid }}>My Schedule</button>
          </div>
          <button onClick={() => setShowTimeOffModal(true)} style={btnStyle("orange", { fontSize:"0.75rem" })}>Request Time Off</button>
          <button onClick={() => setWeekOffset(w => w-1)} style={btnStyle("outline")}>← Prev</button>
          <span style={{ background:COLORS.orangeLight, border:`1px solid #E8C48A`, color:COLORS.brownMid, fontSize:"0.78rem", fontWeight:700, padding:"8px 14px", borderRadius:20, whiteSpace:"nowrap" }}>{formatWeekRange(weekKey)}</span>
          <button onClick={() => setWeekOffset(w => w+1)} style={btnStyle("outline")}>Next →</button>
          {weekOffset !== 0 && <button onClick={() => setWeekOffset(0)} style={btnStyle("ghost", { fontSize:"0.72rem" })}>Today</button>}
        </div>
      </div>

      {/* Personal view */}
      {scheduleView === "mine" && (
        <MyWeekCard currentUser={currentUser} schedule={schedule} weekKey={weekKey} weekDates={weekDates} timeOffRequests={timeOffRequests} />
      )}

      {/* Full grid */}
      {scheduleView === "full" && (
        <div style={S.card}>
          <div style={S.cardHeader}>
            <div>
              <div style={S.cardHeaderTitle}>Staff Schedule</div>
              <div style={S.cardHeaderSub}>{formatWeekRange(weekKey)} · {employees.length} employees</div>
            </div>
            {isManager && <button onClick={publishSchedule} style={{ background:COLORS.orange, color:"white", border:"none", borderRadius:7, padding:"8px 18px", fontFamily:"'Nunito',sans-serif", fontSize:"0.78rem", fontWeight:800, cursor:"pointer" }}>Publish & Email Staff</button>}
          </div>
          <div style={S.tableWrap}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.8rem" }}>
              <thead>
                <tr>
                  <th style={{ padding:"14px 10px 12px 20px", textAlign:"left", fontSize:"0.68rem", fontWeight:800, textTransform:"uppercase", letterSpacing:1.5, color:COLORS.brownMid, borderBottom:`2px solid ${COLORS.border}`, borderRight:`2px solid ${COLORS.border}`, background:COLORS.creamDark, width:150, whiteSpace:"nowrap" }}>Employee</th>
                  {weekDates.map((d,i) => {
                    const today = isToday(d);
                    return (
                      <th key={i} style={{ padding:"14px 10px 12px", textAlign:"center", fontSize:"0.68rem", fontWeight:800, textTransform:"uppercase", letterSpacing:1.5, color: today ? COLORS.tealDark : COLORS.brownMid, borderBottom:`2px solid ${COLORS.border}`, borderRight:`1px solid ${COLORS.border}`, background: today ? COLORS.tealLight : COLORS.creamDark, whiteSpace:"nowrap" }}>
                        {DAYS[i]}
                        <span style={{ display:"block", fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", fontWeight:700, color: today ? COLORS.tealDark : COLORS.brown, marginTop:2, letterSpacing:0 }}>{d.getDate()}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, rowIdx) => {
                  const isSelf = emp.id === currentUser.id;
                  return (
                    <tr key={emp.id} style={{ background: rowIdx%2===0 ? "white" : "#FDFAF8" }}>
                      <td style={{ padding:"11px 20px", background:COLORS.creamDark, fontWeight: isSelf ? 800 : 700, fontSize:"0.78rem", borderRight:`2px solid ${COLORS.border}`, borderBottom:`1px solid #F0EBE0`, whiteSpace:"nowrap", color: emp.role==="manager" ? COLORS.tealDark : COLORS.brown }}>
                        {emp.name}
                        {emp.role === "manager" && <span style={S.badge}>MGR</span>}
                        {isSelf && emp.role !== "manager" && <span style={{ ...S.badge, background:COLORS.orange }}>YOU</span>}
                      </td>
                      {weekDates.map((d, dayIdx) => {
                        const today = isToday(d);
                        const isEditing = editCell?.empId === emp.id && editCell?.dayIdx === dayIdx;
                        const approvedPeriod = getApprovedOffPeriod(emp.id, dayIdx);
                        const canSwap = !isManager && isSelf && canOfferSwap(emp.id, dayIdx);
                        return (
                          <td key={dayIdx} style={{ padding:"10px 8px", textAlign:"center", background: today ? "#F0FAF9" : "transparent", borderBottom:`1px solid #F0EBE0`, borderRight:`1px solid ${COLORS.border}`, verticalAlign:"middle" }}>
                            {isEditing ? (
                              <select autoFocus onChange={e => setShift(emp.id, dayIdx, e.target.value)} onBlur={() => setEditCell(null)} defaultValue={getShift(emp.id, dayIdx) || ""} style={{ fontSize:"0.75rem", padding:"4px", borderRadius:6, border:`1.5px solid ${COLORS.teal}`, fontFamily:"'Nunito',sans-serif", cursor:"pointer" }}>
                                <option value="">— Off —</option>
                                {SHIFTS.map(s => {
                                  const blocked = isShiftBlocked(emp.id, dayIdx, s);
                                  return <option key={s} value={s} disabled={blocked}>{s}{blocked ? " (blocked)" : ""}</option>;
                                })}
                              </select>
                            ) : (
                              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:4, flexWrap:"wrap" }}>
                                <span
                                  onClick={() => isManager && setEditCell({ empId: emp.id, dayIdx })}
                                  style={{ cursor: isManager ? "pointer" : "default" }}
                                  title={isManager && approvedPeriod ? `⚠ ${approvedPeriod} blocked by approved time-off` : isManager ? "Click to edit" : ""}
                                >
                                  {renderCell(emp.id, dayIdx)}
                                </span>
                                {canSwap && (
                                  <button onClick={() => setShowSwapModal({ empId: emp.id, dayIdx })} style={{ fontSize:"0.58rem", padding:"2px 5px", border:`1px solid ${COLORS.purple}`, borderRadius:4, background:"transparent", color:COLORS.purple, cursor:"pointer", fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>swap</button>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap", padding:"13px 20px", borderTop:`1px solid ${COLORS.border}`, background:COLORS.creamDark, fontSize:"0.68rem", color:COLORS.brownMid, alignItems:"center" }}>
            {[["afternoon",COLORS.orange,"Afternoon (1, 2, 3, Helper)"],["night",COLORS.teal,"Night (SL, A)"],["off","#C8B8A8","Off"],["request","#D97706","Time-off request"],["swap",COLORS.purple,"Swap offered"],["approved",COLORS.green,"Approved off"]].map(([,color,label]) => (
              <span key={label} style={{ display:"flex", alignItems:"center", gap:6, fontWeight:600 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:color, flexShrink:0 }} />{label}
              </span>
            ))}
            {isManager && <span style={{ marginLeft:"auto", fontSize:"0.67rem", fontStyle:"italic" }}>Click cell to edit · Blocked shifts shown when time-off approved</span>}
          </div>
        </div>
      )}

      {showTimeOffModal && <TimeOffRequestModal currentUser={currentUser} timeOffRequests={timeOffRequests} onSubmit={req => {
        if (isManager) {
          // Manager's own requests auto-approve — no approval queue needed
          const approved = { ...req, status: "approved" };
          setTimeOffRequests(prev => [...prev, approved]);
          // Clear any scheduled shifts for "both" period
          if (req.period === "both") {
            req.dates?.forEach(dk => {
              const d = keyToDate(dk); const dow = (d.getDay()+6)%7;
              const mon = new Date(d); mon.setDate(d.getDate()-dow);
              const wk = mon.toISOString().slice(0,10);
              setSchedule(prev => ({ ...prev, [wk]: { ...prev[wk], [req.empId]: { ...(prev[wk]?.[req.empId]||{}), [dow]: null } } }));
            });
          }
        } else {
          setTimeOffRequests(prev => [...prev, req]);
        }
        setShowTimeOffModal(false);
      }} onClose={() => setShowTimeOffModal(false)} />}
      {showSwapModal && <ShiftSwapModal currentUser={currentUser} employees={employees} swapInfo={showSwapModal} weekKey={weekKey} schedule={schedule} onSubmit={req => { setSwapRequests(prev => [...prev, req]); setShowSwapModal(null); }} onClose={() => setShowSwapModal(null)} />}
    </div>
  );
}

// ── TIME OFF MANAGEMENT (Manager) ─────────────────────────────────────────
function TimeOffView({ employees, timeOffRequests, setTimeOffRequests, schedule, setSchedule, setEmailLog, isManagerView }) {
  const displayReqs = isManagerView ? timeOffRequests : timeOffRequests;
  const pending = displayReqs.filter(r => r.status === "pending");
  const resolved = displayReqs.filter(r => r.status !== "pending");
  const pLabel = { both:"Full day", afternoon:"Afternoon only", night:"Night only" };

  function approve(req) {
    setTimeOffRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "approved" } : r));
    if (req.period === "both") {
      req.dates?.forEach(dk => {
        const d = keyToDate(dk); const dow = (d.getDay()+6)%7;
        const mon = new Date(d); mon.setDate(d.getDate()-dow);
        const wk = mon.toISOString().slice(0,10);
        setSchedule(prev => ({ ...prev, [wk]: { ...prev[wk], [req.empId]: { ...(prev[wk]?.[req.empId]||{}), [dow]: null } } }));
      });
    }
    const emp = employees.find(e => e.id === req.empId);
    const dStr = req.dates?.length === 1 ? keyToDate(req.dates[0]).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}) : `${req.dates?.length} days`;
    sendEmail(emp?.email, "✅ Time-Off Approved — Corner Cafe", `Hi ${emp?.name},\n\nYour time-off request has been approved!\n\nDates: ${dStr}\nPeriod: ${pLabel[req.period]}\n\n— Corner Cafe Management`, setEmailLog);
  }

  function deny(req) {
    setTimeOffRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "denied" } : r));
    const emp = employees.find(e => e.id === req.empId);
    const dStr = req.dates?.length === 1 ? keyToDate(req.dates[0]).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"}) : `${req.dates?.length} days`;
    sendEmail(emp?.email, "❌ Time-Off Denied — Corner Cafe", `Hi ${emp?.name},\n\nYour time-off request was denied.\n\nDates: ${dStr}\nPeriod: ${pLabel[req.period]}\n\nPlease speak with the manager if you have questions.\n\n— Corner Cafe Management`, setEmailLog);
  }

  return (
    <div>
      <div style={{ ...S.pageTitle, marginBottom:20 }}>Time Off <span style={{ color:COLORS.teal }}>Requests</span></div>

      {isManagerView && (
        <div style={S.card}>
          <div style={S.cardHeader}><div><div style={S.cardHeaderTitle}>Pending Requests</div><div style={S.cardHeaderSub}>{pending.length} awaiting review</div></div></div>
          <div style={S.cardBody}>
            {pending.length === 0
              ? <div style={{ textAlign:"center", padding:"32px 0", color:COLORS.brownMid, fontStyle:"italic" }}>No pending requests — you're all caught up! ☀️</div>
              : pending.map(req => {
                const emp = employees.find(e => e.id === req.empId);
                const dStr = req.dates?.length === 1 ? keyToDate(req.dates[0]).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}) : `${req.dates?.length} days (${keyToDate(req.dates[0]).toLocaleDateString("en-US",{month:"short",day:"numeric"})} – ${keyToDate(req.dates[req.dates.length-1]).toLocaleDateString("en-US",{month:"short",day:"numeric"})})`;
                return (
                  <div key={req.id} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", padding:"14px 0", borderBottom:`1px solid ${COLORS.border}`, gap:12, flexWrap:"wrap" }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:"0.85rem" }}>{emp?.name}</div>
                      <div style={{ fontSize:"0.75rem", color:COLORS.brownMid, marginTop:3 }}>{dStr} · <strong>{pLabel[req.period]}</strong></div>
                      <div style={{ fontSize:"0.73rem", color:COLORS.brownMid, marginTop:3, fontStyle:"italic" }}>"{req.reason}"</div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => approve(req)} style={btnStyle("primary",{fontSize:"0.75rem",padding:"6px 16px"})}>Approve</button>
                      <button onClick={() => deny(req)} style={btnStyle("danger",{fontSize:"0.75rem",padding:"6px 16px"})}>Deny</button>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      )}

      <div style={S.card}>
        <div style={S.cardHeader}><div style={S.cardHeaderTitle}>{isManagerView ? "Request History" : "My Time-Off Requests"}</div></div>
        <div style={S.cardBody}>
          {resolved.length === 0
            ? <div style={{ textAlign:"center", padding:"24px 0", color:COLORS.brownMid, fontStyle:"italic" }}>{isManagerView ? "No resolved requests yet." : "No past requests."}</div>
            : resolved.map(req => {
              const emp = employees.find(e => e.id === req.empId);
              const dStr = req.dates?.length === 1 ? keyToDate(req.dates[0]).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}) : `${req.dates?.length} days`;
              return (
                <div key={req.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 0", borderBottom:`1px solid ${COLORS.border}`, gap:8, flexWrap:"wrap" }}>
                  <div>
                    {isManagerView && <div style={{ fontWeight:700, fontSize:"0.82rem" }}>{emp?.name}</div>}
                    <div style={{ fontSize:"0.78rem", color:COLORS.brownMid, marginTop: isManagerView ? 2 : 0 }}>{dStr} · {pLabel[req.period]}</div>
                    <div style={{ fontSize:"0.72rem", color:COLORS.brownMid, marginTop:2, fontStyle:"italic" }}>"{req.reason}"</div>
                  </div>
                  <span style={chipStyle(req.status==="approved" ? "approved" : "denied")}>{req.status==="approved" ? "Approved ✓" : "Denied"}</span>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

// ── SWAPS VIEW ────────────────────────────────────────────────────────────
function SwapsView({ currentUser, employees, swapRequests, setSwapRequests, schedule, setSchedule, setEmailLog }) {
  const isManager = currentUser.role === "manager";
  const mySwaps = isManager ? swapRequests : swapRequests.filter(r => r.fromEmpId === currentUser.id || r.toEmpId === currentUser.id);
  const incoming = !isManager ? swapRequests.filter(r => r.toEmpId === currentUser.id && r.status === "pending") : [];
  const awaitingMgr = isManager ? swapRequests.filter(r => r.status === "accepted") : [];

  function getShift(empId, weekKey, dayIdx) { return schedule[weekKey]?.[empId]?.[dayIdx]; }

  function acceptSwap(swap) {
    setSwapRequests(prev => prev.map(r => r.id === swap.id ? { ...r, status: "accepted" } : r));
    const from = employees.find(e => e.id === swap.fromEmpId);
    const to = employees.find(e => e.id === swap.toEmpId);
    sendEmail(from?.email, "🔄 Swap Accepted — Awaiting Manager Approval", `Hi ${from?.name},\n\n${to?.name} accepted your shift swap for ${DAYS[swap.dayIdx]} (${formatWeekRange(swap.weekKey)})!\n\nSwap details: Your ${swap.fromShift} ↔ Their ${swap.toShift}\n\nThe swap is now pending manager approval.\n\n— Corner Cafe Staff Portal`, setEmailLog);
  }

  function declineSwap(swap) {
    setSwapRequests(prev => prev.map(r => r.id === swap.id ? { ...r, status: "declined" } : r));
    const from = employees.find(e => e.id === swap.fromEmpId);
    const to = employees.find(e => e.id === swap.toEmpId);
    sendEmail(from?.email, "❌ Swap Declined — Corner Cafe", `Hi ${from?.name},\n\n${to?.name} has declined your shift swap request for ${DAYS[swap.dayIdx]}.\n\n— Corner Cafe Staff Portal`, setEmailLog);
  }

  function managerApprove(swap) {
    setSwapRequests(prev => prev.map(r => r.id === swap.id ? { ...r, status: "manager-approved" } : r));
    const fromShift = getShift(swap.fromEmpId, swap.weekKey, swap.dayIdx);
    const toShift = getShift(swap.toEmpId, swap.weekKey, swap.dayIdx);
    setSchedule(prev => ({ ...prev, [swap.weekKey]: { ...prev[swap.weekKey], [swap.fromEmpId]: { ...(prev[swap.weekKey]?.[swap.fromEmpId]||{}), [swap.dayIdx]: toShift }, [swap.toEmpId]: { ...(prev[swap.weekKey]?.[swap.toEmpId]||{}), [swap.dayIdx]: fromShift } } }));
    const from = employees.find(e => e.id === swap.fromEmpId);
    const to = employees.find(e => e.id === swap.toEmpId);
    sendEmail(from?.email, "✅ Shift Swap Approved — Corner Cafe", `Hi ${from?.name},\n\nYour shift swap with ${to?.name} on ${DAYS[swap.dayIdx]} (${formatWeekRange(swap.weekKey)}) has been approved!\n\nYour new shift: ${toShift}\n\n— Corner Cafe Management`, setEmailLog);
    sendEmail(to?.email, "✅ Shift Swap Approved — Corner Cafe", `Hi ${to?.name},\n\nYour shift swap with ${from?.name} on ${DAYS[swap.dayIdx]} (${formatWeekRange(swap.weekKey)}) has been approved!\n\nYour new shift: ${fromShift}\n\n— Corner Cafe Management`, setEmailLog);
  }

  function managerDeny(swap) {
    setSwapRequests(prev => prev.map(r => r.id === swap.id ? { ...r, status: "denied" } : r));
    const from = employees.find(e => e.id === swap.fromEmpId);
    const to = employees.find(e => e.id === swap.toEmpId);
    sendEmail(from?.email, "❌ Shift Swap Denied — Corner Cafe", `Hi ${from?.name},\n\nYour shift swap with ${to?.name} on ${DAYS[swap.dayIdx]} was denied by management.\n\n— Corner Cafe Management`, setEmailLog);
    sendEmail(to?.email, "❌ Shift Swap Denied — Corner Cafe", `Hi ${to?.name},\n\nThe shift swap with ${from?.name} on ${DAYS[swap.dayIdx]} was denied by management.\n\n— Corner Cafe Management`, setEmailLog);
  }

  const statusChip = s => {
    const map = { pending:"request", accepted:"swap", "manager-approved":"approved", declined:"denied", denied:"denied" };
    const lbl = { pending:"Pending Response", accepted:"Awaiting Mgr Approval", "manager-approved":"Approved ✓", declined:"Declined", denied:"Denied" };
    return <span style={chipStyle(map[s]||"off")}>{lbl[s]||s}</span>;
  };

  return (
    <div>
      <div style={{ ...S.pageTitle, marginBottom:20 }}>Shift <span style={{ color:COLORS.teal }}>Swaps</span></div>

      {incoming.length > 0 && (
        <div style={S.card}>
          <div style={S.cardHeader}><div style={S.cardHeaderTitle}>Incoming Swap Requests</div></div>
          <div style={S.cardBody}>
            {incoming.map(swap => {
              const from = employees.find(e => e.id === swap.fromEmpId);
              return (
                <div key={swap.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:`1px solid ${COLORS.border}`, flexWrap:"wrap", gap:12 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:"0.85rem" }}>{from?.name} — {DAYS[swap.dayIdx]}, {formatWeekRange(swap.weekKey)}</div>
                    <div style={{ fontSize:"0.75rem", color:COLORS.brownMid, marginTop:6, display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                      Their shift: <span style={chipStyle(AFTERNOON_SHIFTS.includes(swap.fromShift)?"afternoon":"night")}>{swap.fromShift}</span>
                      <span>↔ Your shift:</span>
                      <span style={chipStyle(AFTERNOON_SHIFTS.includes(swap.toShift)?"afternoon":"night")}>{swap.toShift}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => acceptSwap(swap)} style={btnStyle("primary",{fontSize:"0.75rem",padding:"6px 16px"})}>Accept</button>
                    <button onClick={() => declineSwap(swap)} style={btnStyle("danger",{fontSize:"0.75rem",padding:"6px 16px"})}>Decline</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isManager && awaitingMgr.length > 0 && (
        <div style={S.card}>
          <div style={S.cardHeader}><div style={S.cardHeaderTitle}>Awaiting Your Approval</div></div>
          <div style={S.cardBody}>
            {awaitingMgr.map(swap => {
              const from = employees.find(e => e.id === swap.fromEmpId);
              const to = employees.find(e => e.id === swap.toEmpId);
              return (
                <div key={swap.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:`1px solid ${COLORS.border}`, flexWrap:"wrap", gap:12 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:"0.85rem" }}>{from?.name} ↔ {to?.name} — {DAYS[swap.dayIdx]}, {formatWeekRange(swap.weekKey)}</div>
                    <div style={{ fontSize:"0.75rem", color:COLORS.brownMid, marginTop:6, display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                      <span style={chipStyle(AFTERNOON_SHIFTS.includes(swap.fromShift)?"afternoon":"night")}>{swap.fromShift}</span> ↔ <span style={chipStyle(AFTERNOON_SHIFTS.includes(swap.toShift)?"afternoon":"night")}>{swap.toShift}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => managerApprove(swap)} style={btnStyle("primary",{fontSize:"0.75rem",padding:"6px 16px"})}>Approve</button>
                    <button onClick={() => managerDeny(swap)} style={btnStyle("danger",{fontSize:"0.75rem",padding:"6px 16px"})}>Deny</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={S.card}>
        <div style={S.cardHeader}><div style={S.cardHeaderTitle}>{isManager ? "All Swap Requests" : "My Swap History"}</div></div>
        <div style={S.cardBody}>
          {mySwaps.length === 0
            ? <div style={{ textAlign:"center", padding:"32px 0", color:COLORS.brownMid, fontStyle:"italic" }}>No swap requests yet.</div>
            : mySwaps.map(swap => {
              const from = employees.find(e => e.id === swap.fromEmpId);
              const to = employees.find(e => e.id === swap.toEmpId);
              return (
                <div key={swap.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 0", borderBottom:`1px solid ${COLORS.border}`, flexWrap:"wrap", gap:8 }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:"0.82rem" }}>{from?.name} ↔ {to?.name} — {DAYS[swap.dayIdx]}, {formatWeekRange(swap.weekKey)}</div>
                    <div style={{ fontSize:"0.72rem", color:COLORS.brownMid, marginTop:4, display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                      <span style={chipStyle(AFTERNOON_SHIFTS.includes(swap.fromShift)?"afternoon":"night")}>{swap.fromShift}</span> ↔ <span style={chipStyle(AFTERNOON_SHIFTS.includes(swap.toShift)?"afternoon":"night")}>{swap.toShift}</span>
                    </div>
                  </div>
                  {statusChip(swap.status)}
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

// ── AVAILABILITY VIEW ─────────────────────────────────────────────────────
function AvailabilityView({ currentUser, employees, setEmployees }) {
  const isManager = currentUser.role === "manager";
  const [selectedId, setSelectedId] = useState(isManager ? employees.find(e=>e.role!=="manager")?.id : currentUser.id);
  const emp = employees.find(e => e.id === selectedId);
  const [avail, setAvail] = useState(emp?.availability || {});
  useEffect(() => { setAvail(employees.find(e=>e.id===selectedId)?.availability || {}); }, [selectedId, employees]);

  function toggle(i, key) { setAvail(prev => { const cur = prev[i] || { afternoon:true, night:true }; return { ...prev, [i]: { ...cur, [key]: !cur[key] } }; }); }
  function save() { setEmployees(prev => prev.map(e => e.id===selectedId ? { ...e, availability:avail } : e)); alert("Availability saved!"); }

  return (
    <div>
      <div style={{ ...S.pageTitle, marginBottom:20 }}>Availability <span style={{ color:COLORS.teal }}>Settings</span></div>
      {isManager && (
        <div style={{ marginBottom:20 }}>
          <label style={S.label}>Viewing Employee</label>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ ...S.input, maxWidth:260 }}>
            {employees.filter(e=>e.role!=="manager").map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      )}
      <div style={S.card}>
        <div style={S.cardHeader}><div><div style={S.cardHeaderTitle}>{isManager ? `${emp?.name}'s Availability` : "My Weekly Availability"}</div><div style={S.cardHeaderSub}>Check periods you're available to work</div></div></div>
        <div style={S.cardBody}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:12 }}>
            {DAYS.map((day,i) => {
              const da = avail[i] || { afternoon:true, night:true };
              return (
                <div key={i} style={{ background:COLORS.creamDark, borderRadius:10, padding:14, border:`1px solid ${COLORS.border}` }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:"0.95rem", marginBottom:10 }}>{day}</div>
                  {[["afternoon","Afternoon"],["night","Night"]].map(([key,lbl]) => (
                    <label key={key} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, cursor: isManager?"default":"pointer", fontSize:"0.75rem", fontWeight:600, color:COLORS.brownMid }}>
                      <input type="checkbox" checked={da[key]!==false} onChange={() => !isManager && toggle(i,key)} disabled={isManager} style={{ accentColor:COLORS.teal, width:14, height:14 }} />
                      {lbl}
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
          {!isManager && <div style={{ marginTop:20, display:"flex", justifyContent:"flex-end" }}><button onClick={save} style={btnStyle("primary")}>Save Availability</button></div>}
        </div>
      </div>
    </div>
  );
}

// ── STAFF VIEW ────────────────────────────────────────────────────────────
function StaffView({ employees, setEmployees }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState(""); const [newEmail, setNewEmail] = useState(""); const [err, setErr] = useState("");

  function addEmployee() {
    if (!newName.trim()) { setErr("Name required."); return; }
    if (!newEmail.includes("@")) { setErr("Valid email required."); return; }
    if (employees.find(e => e.email.toLowerCase()===newEmail.toLowerCase())) { setErr("Email already exists."); return; }
    setEmployees(prev => [...prev, { id:`e${Date.now()}`, name:newName.trim(), email:newEmail.trim().toLowerCase(), role:"employee", availability:{} }]);
    setNewName(""); setNewEmail(""); setShowAdd(false); setErr("");
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div style={S.pageTitle}>Staff <span style={{ color:COLORS.teal }}>Directory</span></div>
        <button onClick={() => setShowAdd(true)} style={btnStyle("orange")}>+ Add Employee</button>
      </div>
      <div style={S.card}>
        <div style={S.cardHeader}><div><div style={S.cardHeaderTitle}>All Employees</div><div style={S.cardHeaderSub}>{employees.length} total</div></div></div>
        <div style={S.cardBody}>
          {employees.map(emp => (
            <div key={emp.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"13px 0", borderBottom:`1px solid ${COLORS.border}`, flexWrap:"wrap", gap:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:38, height:38, borderRadius:"50%", background: emp.role==="manager" ? COLORS.teal : COLORS.orangeLight, color: emp.role==="manager" ? "white" : COLORS.orange, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:"0.85rem" }}>
                  {emp.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:"0.85rem" }}>{emp.name}{emp.role==="manager"&&<span style={S.badge}>MGR</span>}</div>
                  <div style={{ fontSize:"0.72rem", color:COLORS.brownMid, marginTop:2 }}>{emp.email}</div>
                </div>
              </div>
              {emp.role!=="manager" && <button onClick={() => { if(window.confirm(`Remove ${emp.name}?`)) setEmployees(prev=>prev.filter(e=>e.id!==emp.id)); }} style={btnStyle("ghost",{fontSize:"0.7rem",padding:"4px 12px",color:COLORS.burnt,borderColor:COLORS.burnt})}>Remove</button>}
            </div>
          ))}
        </div>
      </div>
      {showAdd && (
        <Modal title="Add New Employee" onClose={() => { setShowAdd(false); setErr(""); }}>
          <div style={{ marginBottom:16 }}><label style={S.label}>Full Name</label><input style={S.input} value={newName} onChange={e=>{setNewName(e.target.value);setErr("");}} placeholder="e.g. Jordan Smith" /></div>
          <div style={{ marginBottom:16 }}><label style={S.label}>Work Email</label><input style={S.input} type="email" value={newEmail} onChange={e=>{setNewEmail(e.target.value);setErr("");}} placeholder="jordan@cornercafe.com" /></div>
          {err && <div style={{ color:COLORS.burnt, fontSize:"0.75rem", marginBottom:12, fontWeight:600 }}>{err}</div>}
          <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
            <button onClick={() => { setShowAdd(false); setErr(""); }} style={btnStyle("ghost")}>Cancel</button>
            <button onClick={addEmployee} style={btnStyle("orange")}>Add Employee</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── EMAIL LOG VIEW ────────────────────────────────────────────────────────
function EmailLogView({ emailLog, isManager }) {
  const [expanded, setExpanded] = useState(null);
  return (
    <div>
      <div style={{ ...S.pageTitle, marginBottom:8 }}>Email <span style={{ color:COLORS.teal }}>Log</span></div>
      <div style={{ fontSize:"0.78rem", color:COLORS.brownMid, marginBottom:20, lineHeight:1.6 }}>
        In production, these emails would be delivered directly to employee inboxes. This log shows all emails the system would send.{" "}
        {!isManager && "Only emails addressed to you are shown."}
      </div>
      <div style={S.card}>
        <div style={S.cardBody}>
          {emailLog.length === 0
            ? <div style={{ textAlign:"center", padding:"40px 0", color:COLORS.brownMid, fontStyle:"italic" }}>No emails sent yet. Publish the schedule or approve/deny requests to trigger emails.</div>
            : emailLog.map(e => (
              <div key={e.id} style={{ padding:"12px 0", borderBottom:`1px solid ${COLORS.border}`, cursor:"pointer" }} onClick={() => setExpanded(expanded===e.id ? null : e.id)}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:"0.82rem" }}>{e.subject}</div>
                    <div style={{ fontSize:"0.7rem", color:COLORS.brownMid, marginTop:3 }}>To: {e.to} · {new Date(e.sentAt).toLocaleString()}</div>
                  </div>
                  <span style={{ fontSize:"0.7rem", color:COLORS.teal, fontWeight:700 }}>{expanded===e.id ? "▲ Hide" : "▼ Show"}</span>
                </div>
                {expanded===e.id && (
                  <pre style={{ marginTop:12, padding:14, background:COLORS.creamDark, borderRadius:8, fontSize:"0.73rem", whiteSpace:"pre-wrap", color:COLORS.brown, border:`1px solid ${COLORS.border}`, fontFamily:"'Nunito',sans-serif", lineHeight:1.7 }}>{e.body}</pre>
                )}
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [userId, setUserId] = useState(null);
  const [employees, setEmployees] = useState(SEED_EMPLOYEES);
  const [schedule, setSchedule] = useState({});
  const [timeOffRequests, setTimeOffRequests] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [emailLog, setEmailLog] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTab, setActiveTab] = useState("schedule");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const keys = ["cc_employees","cc_schedule","cc_timeoff","cc_swaps","cc_emaillog2"];
        const results = await Promise.all(keys.map(k => window.storage.get(k).catch(() => null)));
        if (results[0]?.value) setEmployees(JSON.parse(results[0].value));
        if (results[1]?.value) setSchedule(JSON.parse(results[1].value));
        if (results[2]?.value) setTimeOffRequests(JSON.parse(results[2].value));
        if (results[3]?.value) setSwapRequests(JSON.parse(results[3].value));
        if (results[4]?.value) setEmailLog(JSON.parse(results[4].value));
      } catch(e) {}
      setLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        await Promise.all([
          window.storage.set("cc_employees", JSON.stringify(employees)),
          window.storage.set("cc_schedule", JSON.stringify(schedule)),
          window.storage.set("cc_timeoff", JSON.stringify(timeOffRequests)),
          window.storage.set("cc_swaps", JSON.stringify(swapRequests)),
          window.storage.set("cc_emaillog2", JSON.stringify(emailLog.slice(0, 150))),
        ]);
      } catch(e) {}
    })();
  }, [employees, schedule, timeOffRequests, swapRequests, emailLog, loaded]);

  if (!loaded) return <div style={{ ...S.app, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}><div style={{ color:COLORS.brownMid, fontStyle:"italic" }}>Loading…</div></div>;
  if (!userId) return <LoginScreen onLogin={setUserId} />;

  const currentUser = employees.find(e => e.id === userId) || employees[0];
  const isManager = currentUser.role === "manager";
  const pendingTimeOff = timeOffRequests.filter(r => r.status === "pending").length;
  const pendingSwaps = swapRequests.filter(r => r.status === "accepted").length;
  const myEmailCount = emailLog.filter(e => e.to === currentUser.email).length;

  const tabs = [
    { id:"schedule", label:"Schedule" },
    { id:"timeoff", label:`Time Off${isManager && pendingTimeOff>0 ? ` (${pendingTimeOff})` : ""}` },
    { id:"swaps", label:`Shift Swaps${isManager && pendingSwaps>0 ? ` (${pendingSwaps})` : ""}` },
    { id:"availability", label:"Availability" },
    ...(isManager ? [{ id:"staff", label:"Staff" }] : []),
    { id:"emails", label:`📧 Emails${!isManager && myEmailCount>0 ? ` (${myEmailCount})` : ""}` },
  ];

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      <nav style={S.nav}>
        <div style={S.brand}>
          <div style={{ width:44, height:44, borderRadius:"50%", background:"white", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem" }}>☀️</div>
          <div><div style={S.brandName}>Corner Cafe</div><div style={S.brandSub}>Staff Portal</div></div>
        </div>
        <div style={S.navLinks}>{tabs.map(t => <NavLink key={t.id} label={t.label} active={activeTab===t.id} onClick={() => setActiveTab(t.id)} />)}</div>
        <div style={S.navUser}>
          <span style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.6)", fontWeight:600 }}>{currentUser.name}</span>
          <div style={S.avatar}>{currentUser.name.split(" ").map(n=>n[0]).join("").slice(0,2)}</div>
          <button onClick={() => { setUserId(null); setActiveTab("schedule"); }} style={{ background:"rgba(255,255,255,0.1)", border:"none", color:"rgba(255,255,255,0.6)", borderRadius:6, padding:"5px 10px", fontSize:"0.7rem", cursor:"pointer", fontFamily:"'Nunito',sans-serif" }}>Sign out</button>
        </div>
      </nav>
      <div style={S.main}>
        {activeTab==="schedule" && <ScheduleView currentUser={currentUser} employees={employees} schedule={schedule} setSchedule={setSchedule} timeOffRequests={timeOffRequests} setTimeOffRequests={setTimeOffRequests} swapRequests={swapRequests} setSwapRequests={setSwapRequests} weekOffset={weekOffset} setWeekOffset={setWeekOffset} setEmailLog={setEmailLog} />}
        {activeTab==="timeoff" && <TimeOffView employees={employees} timeOffRequests={isManager ? timeOffRequests : timeOffRequests.filter(r=>r.empId===currentUser.id)} setTimeOffRequests={setTimeOffRequests} schedule={schedule} setSchedule={setSchedule} setEmailLog={setEmailLog} isManagerView={isManager} />}
        {activeTab==="swaps" && <SwapsView currentUser={currentUser} employees={employees} swapRequests={swapRequests} setSwapRequests={setSwapRequests} schedule={schedule} setSchedule={setSchedule} setEmailLog={setEmailLog} />}
        {activeTab==="availability" && <AvailabilityView currentUser={currentUser} employees={employees} setEmployees={setEmployees} />}
        {activeTab==="staff" && isManager && <StaffView employees={employees} setEmployees={setEmployees} />}
        {activeTab==="emails" && <EmailLogView emailLog={isManager ? emailLog : emailLog.filter(e=>e.to===currentUser.email)} isManager={isManager} />}
      </div>
    </div>
  );
}

