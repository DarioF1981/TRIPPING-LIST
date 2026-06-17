import { useState, useEffect, useRef } from "react";
import "./App.css";


// ── Default data ──────────────────────────────────────────────────────────────
const DEFAULT_DATA = {
  "💊 Medicine":  [],
  "📦 Gruppo 1":  [],
  "📦 Gruppo 2":  [],
};

const DEFAULT_CAT_COLORS = {
  "💊 Medicine":  "#EF4444",
  "📦 Gruppo 1":  "#3B82F6",
  "📦 Gruppo 2":  "#10B981",
};

const QTY_STATES = {
  none:   { bg: "#283548",              border: "#334155", text: "#94A3B8" },
  green:  { bg: "rgba(16,185,129,.18)", border: "#10B981", text: "#10B981" },
  orange: { bg: "rgba(249,115,22,.18)", border: "#F97316", text: "#F97316" },
};

// Storage keys
const K_STATE    = "cv_itemstate_v4";
const K_CUSTOM   = "cv_custom_v4";
const K_REMOVED  = "cv_removed_v4";    // permanently deleted item ids
const K_CATNAMES = "cv_catnames_v4";   // { originalKey: displayName }
const K_SAVED    = "cv_saved_v4";      // saved list snapshot
const K_EXPIRY   = "cv_expiry_v4";     // { itemId: "YYYY-MM" } medicine expiry dates
const K_PROGRESS   = "cv_progress_v4";
const K_DEPARTURE  = "cv_departure_v4";
const K_NOTIFYTIME = "cv_notifytime_v4";
const K_PROFILE    = "cv_profile_v4";
const K_DEST       = "cv_dest_v4";
const K_TRIPDAYS   = "cv_tripdays_v4";
const K_HISTORY    = "cv_history_v4";   // [ { destination, departure, returnDate, savedAt } ]

// ── Travel profiles ───────────────────────────────────────────────────────────
const PROFILES = {
  "🏖 Mare": {
    color: "#F59E0B",
    groups: {
      "💊 Medicine":   [
        { id: "pm1", nome: "Antidolorifici", qty: 1 },
        { id: "pm2", nome: "Cerotti", qty: 1 },
        { id: "pm3", nome: "Crema doposole", qty: 1 },
      ],
      "🧴 Beauty":     [
        { id: "pb1", nome: "Crema solare SPF 50", qty: 2 },
        { id: "pb2", nome: "Shampoo", qty: 1 },
        { id: "pb3", nome: "Deodorante", qty: 1 },
      ],
      "🩴 Valigia Mare": [
        { id: "pv1", nome: "Costume da bagno", qty: 2 },
        { id: "pv2", nome: "Telo mare", qty: 1 },
        { id: "pv3", nome: "Infradito", qty: 1 },
        { id: "pv4", nome: "Occhiali da sole", qty: 1 },
        { id: "pv5", nome: "Cappello", qty: 1 },
        { id: "pv6", nome: "T-shirt", qty: 5 },
        { id: "pv7", nome: "Shorts", qty: 3 },
      ],
      "📄 Documenti":  [
        { id: "pd1", nome: "Carta d'identità / Passaporto", qty: 1 },
        { id: "pd2", nome: "Carta di credito", qty: 1 },
        { id: "pd3", nome: "Prenotazione hotel", qty: 1 },
      ],
    }
  },
  "💼 Lavoro": {
    color: "#3B82F6",
    groups: {
      "💊 Medicine":   [
        { id: "lm1", nome: "Antidolorifici", qty: 1 },
        { id: "lm2", nome: "Cerotti", qty: 1 },
      ],
      "💻 Elettronica": [
        { id: "le1", nome: "Laptop e caricatore", qty: 1 },
        { id: "le2", nome: "Cavi USB", qty: 2 },
        { id: "le3", nome: "Power bank", qty: 1 },
        { id: "le4", nome: "Cuffie", qty: 1 },
      ],
      "👔 Valigia Lavoro": [
        { id: "lv1", nome: "Camicie", qty: 3 },
        { id: "lv2", nome: "Pantaloni", qty: 2 },
        { id: "lv3", nome: "Scarpe eleganti", qty: 1 },
        { id: "lv4", nome: "Giacca", qty: 1 },
        { id: "lv5", nome: "Cintura", qty: 1 },
      ],
      "📄 Documenti":  [
        { id: "ld1", nome: "Carta d'identità / Passaporto", qty: 1 },
        { id: "ld2", nome: "Carta di credito / contanti", qty: 1 },
        { id: "ld3", nome: "Biglietti / prenotazioni", qty: 1 },
        { id: "ld4", nome: "Materiale riunione", qty: 1 },
      ],
    }
  },
  "🏔 Montagna": {
    color: "#10B981",
    groups: {
      "💊 Medicine":   [
        { id: "mm1", nome: "Antidolorifici", qty: 1 },
        { id: "mm2", nome: "Cerotti", qty: 1 },
        { id: "mm3", nome: "Crema protettiva viso", qty: 1 },
      ],
      "📱 Elettronica": [
        { id: "me1", nome: "Cellulare e caricatore", qty: 1 },
        { id: "me2", nome: "Power bank", qty: 1 },
        { id: "me3", nome: "Torcia frontale", qty: 1 },
      ],
      "🥾 Valigia Montagna": [
        { id: "mv1", nome: "Scarponi da trekking", qty: 1 },
        { id: "mv2", nome: "Giacca impermeabile", qty: 1 },
        { id: "mv3", nome: "Pile / felpa calda", qty: 2 },
        { id: "mv4", nome: "Pantaloni da trekking", qty: 2 },
        { id: "mv5", nome: "Calzini tecnici", qty: 4 },
        { id: "mv6", nome: "Zaino", qty: 1 },
        { id: "mv7", nome: "Borraccia", qty: 1 },
      ],
      "📄 Documenti":  [
        { id: "md1", nome: "Carta d'identità", qty: 1 },
        { id: "md2", nome: "Carta di credito / contanti", qty: 1 },
        { id: "md3", nome: "Prenotazione rifugio/hotel", qty: 1 },
      ],
    }
  },
  "🏙 Weekend": {
    color: "#8B5CF6",
    groups: {
      "💊 Medicine":   [
        { id: "wm1", nome: "Antidolorifici", qty: 1 },
        { id: "wm2", nome: "Cerotti", qty: 1 },
      ],
      "🧴 Beauty":     [
        { id: "wb1", nome: "Shampoo (mini)", qty: 1 },
        { id: "wb2", nome: "Deodorante", qty: 1 },
        { id: "wb3", nome: "Spazzolino e dentifricio", qty: 1 },
      ],
      "👕 Valigia Weekend": [
        { id: "wv1", nome: "T-shirt / magliette", qty: 2 },
        { id: "wv2", nome: "Pantaloni / jeans", qty: 1 },
        { id: "wv3", nome: "Scarpe comode", qty: 1 },
        { id: "wv4", nome: "Pigiama", qty: 1 },
        { id: "wv5", nome: "Intimo", qty: 2 },
      ],
      "📄 Documenti":  [
        { id: "wd1", nome: "Carta d'identità", qty: 1 },
        { id: "wd2", nome: "Carta di credito / contanti", qty: 1 },
        { id: "wd3", nome: "Prenotazione hotel", qty: 1 },
      ],
    }
  },
};

const MEDICINE_CAT_KEY = "💊 Medicine";

// Returns "expired" | "soon" (≤30 days) | "ok" | null (no date set)
function expiryStatus(yyyymm) {
  if (!yyyymm) return null;
  const [y, m] = yyyymm.split("-").map(Number);
  // last day of expiry month
  const expDate = new Date(y, m, 0); // day 0 of next month = last day of this month
  const today = new Date();
  today.setHours(0,0,0,0);
  const diffMs = expDate - today;
  const diffDays = Math.ceil(diffMs / 86400000);
  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "soon";
  return "ok";
}

const EXPIRY_COLORS = {
  expired: { bg: "rgba(239,68,68,.18)",  border: "#3B82F6", text: "#EF4444", rowBg: "rgba(239,68,68,.10)" },
  soon:    { bg: "rgba(249,115,22,.18)", border: "#3B82F6", text: "#F97316", rowBg: "rgba(249,115,22,.08)" },
  ok:      { bg: "rgba(16,185,129,.18)", border: "#3B82F6", text: "#10B981", rowBg: "rgba(16,185,129,.06)" },
};

let _idCounter = Date.now();
const newId = () => `c${_idCounter++}`;

// ── QR Modal ──────────────────────────────────────────────────────────────────
function QRModal({ catMap, catNames, destination, departure, tripDays, onClose }) {
  const [qrSrc, setQrSrc] = useState(null);
  const [qrError, setQrError] = useState(false);

  const buildListText = () => {
    const lines = [];
    if (destination) lines.push(`📍 ${destination}`);
    if (departure)   lines.push(`📅 Partenza: ${departure} (${tripDays}gg)`);
    lines.push("");
    for (const [cat, items] of Object.entries(catMap)) {
      if (!items.length) continue;
      lines.push(`▸ ${catNames[cat]||cat}`);
      for (const item of items) lines.push(`  • ${item.nome} x${item.qty}`);
    }
    return lines.join("\n");
  };

  useEffect(() => {
    const text = buildListText().slice(0, 1500);
    // Use Google Charts QR API — works on mobile browser
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(text)}`;
    const img = new Image();
    img.onload  = () => setQrSrc(url);
    img.onerror = () => setQrError(true);
    img.src = url;
  }, []);

  const saveQR = () => {
    if (!qrSrc) return;
    // Cross-origin images can't always trigger download attribute — open in new tab as reliable fallback
    window.open(qrSrc, "_blank");
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.85)", zIndex:300,
                  display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
         onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
           style={{ background:"#1E293B", borderRadius:20, padding:"24px 20px", width:"100%", maxWidth:320 }}>
        <div style={{ fontWeight:800, fontSize:17, color:"#F1F5F9", textAlign:"center", marginBottom:4 }}>
          📲 Condividi lista
        </div>
        <div style={{ fontSize:12, color:"#64748B", textAlign:"center", marginBottom:16 }}>
          Fai scansionare il QR per vedere la lista
        </div>

        {/* QR */}
        <div style={{ background:"#F1F5F9", borderRadius:12, padding:16,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      minHeight:240, marginBottom:16 }}>
          {qrError ? (
            <div style={{ color:"#64748B", fontSize:12, textAlign:"center" }}>
              ⚠️ QR non disponibile<br/>senza connessione internet
            </div>
          ) : qrSrc ? (
            <img src={qrSrc} width={240} height={240} alt="QR Lista Viaggio"
                 style={{ borderRadius:8, display:"block" }}/>
          ) : (
            <div style={{ color:"#64748B", fontSize:12 }}>Generazione...</div>
          )}
        </div>

        {/* List preview */}
        <div style={{ background:"#0F172A", borderRadius:10, padding:"10px 14px",
                      maxHeight:120, overflowY:"auto", marginBottom:16 }}>
          {Object.entries(catMap).filter(([,items])=>items.length>0).map(([cat,items])=>(
            <div key={cat} style={{ marginBottom:6 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#94A3B8" }}>{catNames[cat]||cat}</div>
              {items.map(i=>(
                <div key={i.id} style={{ fontSize:11, color:"#64748B", paddingLeft:8 }}>
                  • {i.nome} ×{i.qty}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, background:"#334155", border:"none",
            borderRadius:12, padding:"13px 0", color:"#94A3B8", fontWeight:700, fontSize:14, cursor:"pointer" }}>
            Chiudi
          </button>
          {qrSrc && (
            <button onClick={saveQR} style={{ flex:1, background:"#10B981", border:"none",
              borderRadius:12, padding:"13px 0", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>
              🔍 Apri immagine
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Weather icons map ─────────────────────────────────────────────────────────
function weatherIcon(code) {
  if (code === 0) return "☀️";
  if (code <= 2)  return "🌤";
  if (code <= 3)  return "☁️";
  if (code <= 49) return "🌫";
  if (code <= 59) return "🌦";
  if (code <= 69) return "🌧";
  if (code <= 79) return "🌨";
  if (code <= 82) return "🌧";
  if (code <= 86) return "❄️";
  if (code <= 99) return "⛈";
  return "🌡";
}

// ── Weather Banner ────────────────────────────────────────────────────────────
function WeatherBanner({ destination, departure, tripDays }) {
  const [weather,  setWeather]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [current,  setCurrent]  = useState(null);
  const [cityName, setCityName] = useState("");

  useEffect(() => {
    if (!destination || destination.length < 3 || !departure) { setWeather(null); setError(null); return; }
    let cancelled = false;
    let timer = setTimeout(() => {
    const fetchWeather = async () => {
      setLoading(true); setError(null); setWeather(null);
      try {
        // 1. Geocode
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=it&format=json`
        );
        const geoData = await geoRes.json();
        if (!geoData.results?.length) throw new Error("Città non trovata");
        const { latitude: lat, longitude: lon, name } = geoData.results[0];
        if (!cancelled) setCityName(name);

        // 2. Open-Meteo forecast: max 16 days from today
        const today = new Date();
        const depDate = new Date(departure + "T00:00:00");
        const daysFromToday = Math.ceil((depDate - today) / 86400000);
        const forecastDays = Math.min(tripDays, Math.max(0, 16 - daysFromToday));

        let days_arr = [];

        if (forecastDays > 0) {
          const endDate = new Date(depDate);
          endDate.setDate(endDate.getDate() + forecastDays - 1);
          const startStr = departure;
          const endStr   = endDate.toISOString().split("T")[0];

          const wRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&start_date=${startStr}&end_date=${endStr}&timezone=auto`
          );
          const wData = await wRes.json();
          if (cancelled) return;
          if (wData.current_weather) setCurrent(Math.round(wData.current_weather.temperature));
          days_arr = (wData.daily?.time || []).map((date, i) => ({
            date, forecast: true,
            code: wData.daily.weathercode[i],
            max:  Math.round(wData.daily.temperature_2m_max[i]),
            min:  Math.round(wData.daily.temperature_2m_min[i]),
          }));
        }

        // 3. For days beyond 16, use climate normals (historical avg last 10 years same period)
        const remaining = tripDays - forecastDays;
        if (remaining > 0) {
          const climateStart = new Date(depDate);
          climateStart.setDate(climateStart.getDate() + forecastDays);
          const climateEnd = new Date(depDate);
          climateEnd.setDate(climateEnd.getDate() + tripDays - 1);

          // Use historical reference: same dates last year
          const refStart = new Date(climateStart); refStart.setFullYear(refStart.getFullYear()-1);
          const refEnd   = new Date(climateEnd);   refEnd.setFullYear(refEnd.getFullYear()-1);
          const rs = refStart.toISOString().split("T")[0];
          const re = refEnd.toISOString().split("T")[0];

          const hRes = await fetch(
            `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${rs}&end_date=${re}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`
          );
          const hData = await hRes.json();
          if (cancelled) return;
          const historical = (hData.daily?.time || []).map((_, i) => {
            const d = new Date(climateStart);
            d.setDate(d.getDate() + i);
            return {
              date: d.toISOString().split("T")[0], forecast: false,
              code: hData.daily.weathercode[i],
              max:  Math.round(hData.daily.temperature_2m_max[i]),
              min:  Math.round(hData.daily.temperature_2m_min[i]),
            };
          });
          days_arr = [...days_arr, ...historical];
        }

        if (!cancelled) setWeather(days_arr);
      } catch(e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchWeather();
    }, 800); // debounce 800ms
    return () => { cancelled = true; clearTimeout(timer); };
  }, [destination, departure, tripDays]);

  if (!destination || !departure) return null;
  const today = new Date().toISOString().split("T")[0];

  if (loading) return (
    <div style={{ margin:"0 0 10px", background:"#1E293B", borderRadius:12, padding:"12px 16px",
                  color:"#64748B", fontSize:12, textAlign:"center" }}>
      🌡 Caricamento meteo per <b style={{color:"#94A3B8"}}>{destination}</b>...
      <div style={{ fontSize:11, color:"#475569", marginTop:4 }}>
        (Il meteo funziona nell'app installata — qui la rete esterna è bloccata)
      </div>
    </div>
  );
  if (error) return (
    <div style={{ margin:"0 0 10px", background:"#1E293B", borderRadius:12, padding:"10px 16px",
                  color:"#EF4444", fontSize:12 }}>⚠️ {error}</div>
  );
  if (!weather || weather.length === 0) return null;

  return (
    <div style={{ margin:"0 0 10px", background:"#1E293B", borderRadius:12, overflow:"hidden" }}>
      <div style={{ padding:"10px 16px 6px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#F1F5F9" }}>📍 {cityName||destination}</div>
        {current !== null && (
          <div style={{ fontSize:13, fontWeight:700, color:"#10B981" }}>🌡 {current}° ora</div>
        )}
      </div>
      <div style={{ display:"flex", gap:8, overflowX:"auto", padding:"4px 16px 12px",
                    scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
        {weather.map((day) => {
          const isToday = day.date === today;
          const d = new Date(day.date + "T12:00:00");
          const label = isToday ? "Oggi" : d.toLocaleDateString("it-IT",{weekday:"short",day:"numeric"});
          return (
            <div key={day.date} style={{
              flexShrink:0, background: isToday?"#0F172A": day.forecast?"#283548":"#1a2535",
              borderRadius:10, padding:"10px 10px", minWidth:64, textAlign:"center",
              border: isToday?"1.5px solid #3B82F6": day.forecast?"1.5px solid transparent":"1px dashed #334155"
            }}>
              <div style={{ fontSize:10, color:isToday?"#3B82F6":"#64748B", fontWeight:600, marginBottom:3 }}>{label}</div>
              <div style={{ fontSize:20, marginBottom:3 }}>{weatherIcon(day.code)}</div>
              <div style={{ fontSize:12, fontWeight:700, color:"#EF4444" }}>{day.max}°</div>
              <div style={{ fontSize:11, color:"#3B82F6" }}>{day.min}°</div>
              {!day.forecast && <div style={{ fontSize:9, color:"#475569", marginTop:2 }}>~media</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── History View ──────────────────────────────────────────────────────────────
function HistoryView({ history, onDelete, onClose }) {
  const fmt = (d) => {
    if (!d) return "";
    const [y,m,day] = d.split("-");
    return `${day}/${m}/${y}`;
  };
  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:"#0F172A", minHeight:"100vh", color:"#F1F5F9", paddingBottom:40 }}>
      <div style={{ background:"#1E293B", padding:"16px 20px", display:"flex", alignItems:"center", gap:12,
                    position:"sticky", top:0, zIndex:10, borderBottom:"1px solid #334155" }}>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#94A3B8", fontSize:22, cursor:"pointer", padding:0 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:17 }}>📊 Storico viaggi</div>
          <div style={{ fontSize:11, color:"#64748B" }}>{history.length} viaggi registrati</div>
        </div>
      </div>

      <div style={{ padding:"12px 16px" }}>
        {history.length === 0 && (
          <div style={{ textAlign:"center", color:"#475569", fontSize:14, marginTop:60 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🗺</div>
            Nessun viaggio ancora registrato.<br/>
            Salva il progresso di un viaggio per vederlo qui.
          </div>
        )}
        {history.map((h, i) => {
          const nights = h.tripDays ? h.tripDays - 1 : 0;
          return (
            <div key={h.id||i} style={{ background:"#1E293B", borderRadius:12, padding:"14px 16px",
                                         marginBottom:10, display:"flex", alignItems:"center", gap:12,
                                         borderLeft:"4px solid #3B82F6" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15, color:"#F1F5F9", marginBottom:4 }}>
                  📍 {h.destination}
                </div>
                <div style={{ fontSize:12, color:"#94A3B8" }}>
                  {fmt(h.departure)} → {fmt(h.returnDate)}
                </div>
                <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>
                  {h.tripDays} giorn{h.tripDays===1?"o":"i"} · {nights} nott{nights===1?"e":"i"}
                </div>
              </div>
              <button onClick={()=>onDelete(h.id||i)} style={{
                background:"none", border:"none", color:"#475569", fontSize:20,
                cursor:"pointer", padding:"4px 8px", lineHeight:1
              }}>🗑</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Profile Selector ──────────────────────────────────────────────────────────
function ProfileSelector({ onSelect, onClose }) {
  const [chosen,   setChosen]   = useState(null);   // profile key
  const [groups,   setGroups]   = useState([]);      // selected group keys
  const [step,     setStep]     = useState(1);       // 1=pick profile, 2=confirm groups

  const selectProfile = (key) => {
    setChosen(key);
    setGroups(Object.keys(PROFILES[key].groups));
    setStep(2);
  };

  const toggleGroup = (g) =>
    setGroups(p => p.includes(g) ? p.filter(x=>x!==g) : [...p, g]);

  const confirm = () => {
    const profile = PROFILES[chosen];
    // Build customItems from selected groups only
    const items = [];
    for (const g of groups) {
      for (const item of profile.groups[g]) {
        items.push({ ...item, cat: g });
      }
    }
    onSelect({ profileName: chosen, groups, items });
  };

  if (step === 1) return (
    <div style={{ position:"fixed", inset:0, background:"#0F172A", zIndex:300,
                  display:"flex", flexDirection:"column" }}>
      <div style={{ background:"#1E293B", padding:"20px 20px 16px", borderBottom:"1px solid #334155" }}>
        <div style={{ fontWeight:800, fontSize:20, color:"#F1F5F9", marginBottom:4 }}>✈️ Nuovo viaggio</div>
        <div style={{ fontSize:13, color:"#64748B" }}>Che tipo di viaggio stai pianificando?</div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
        {Object.entries(PROFILES).map(([key, p]) => (
          <button key={key} onClick={()=>selectProfile(key)} style={{
            width:"100%", background:"#1E293B", border:`2px solid ${p.color}22`,
            borderRadius:14, padding:"18px 20px", marginBottom:12,
            cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:16
          }}>
            <div style={{ width:48, height:48, borderRadius:12, background:`${p.color}22`,
                          display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>
              {key.split(" ")[0]}
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:16, color:"#F1F5F9", marginBottom:4 }}>{key}</div>
              <div style={{ fontSize:12, color:"#64748B" }}>
                {Object.keys(p.groups).join(" · ")}
              </div>
            </div>
          </button>
        ))}
        {/* Custom / blank */}
        <button onClick={()=>onSelect({ profileName: null, groups: [], items: [] })} style={{
          width:"100%", background:"#1E293B", border:"2px dashed #334155",
          borderRadius:14, padding:"18px 20px", cursor:"pointer", textAlign:"left",
          display:"flex", alignItems:"center", gap:16
        }}>
          <div style={{ width:48, height:48, borderRadius:12, background:"#334155",
                        display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>➕</div>
          <div>
            <div style={{ fontWeight:700, fontSize:16, color:"#F1F5F9", marginBottom:4 }}>Lista vuota</div>
            <div style={{ fontSize:12, color:"#64748B" }}>Parti da zero e crea la tua lista personalizzata</div>
          </div>
        </button>
      </div>
      <div style={{ padding:"14px 16px 28px" }}>
        <button onClick={onClose} style={{ width:"100%", background:"#334155", border:"none",
          borderRadius:12, padding:"14px 0", color:"#94A3B8", fontWeight:700, fontSize:15, cursor:"pointer" }}>
          Annulla
        </button>
      </div>
    </div>
  );

  // Step 2 — confirm/adjust groups
  const profile = PROFILES[chosen];
  return (
    <div style={{ position:"fixed", inset:0, background:"#0F172A", zIndex:300,
                  display:"flex", flexDirection:"column" }}>
      <div style={{ background:"#1E293B", padding:"20px 20px 16px", borderBottom:"1px solid #334155" }}>
        <button onClick={()=>setStep(1)} style={{ background:"none", border:"none", color:"#94A3B8", fontSize:22, cursor:"pointer", padding:0, marginBottom:8 }}>←</button>
        <div style={{ fontWeight:800, fontSize:19, color:"#F1F5F9", marginBottom:4 }}>{chosen}</div>
        <div style={{ fontSize:13, color:"#64748B" }}>Seleziona i gruppi da includere nella lista</div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
        {Object.entries(profile.groups).map(([g, items]) => {
          const included = groups.includes(g);
          return (
            <button key={g} onClick={()=>toggleGroup(g)} style={{
              width:"100%", background: included?"#1E293B":"#0F172A",
              border:`2px solid ${included ? profile.color : "#334155"}`,
              borderRadius:12, padding:"14px 16px", marginBottom:10,
              cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:12
            }}>
              <div style={{
                width:24, height:24, borderRadius:6, flexShrink:0,
                background: included ? profile.color : "transparent",
                border:`2px solid ${included ? profile.color : "#475569"}`,
                display:"flex", alignItems:"center", justifyContent:"center"
              }}>
                {included && <span style={{ color:"#fff", fontSize:14, fontWeight:900 }}>✓</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, color: included?"#F1F5F9":"#64748B", marginBottom:3 }}>{g}</div>
                <div style={{ fontSize:11, color:"#475569" }}>
                  {items.map(i=>i.nome).join(", ")}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ padding:"14px 16px 28px", background:"#0F172A", borderTop:"1px solid #1E293B" }}>
        <button onClick={confirm} disabled={groups.length===0} style={{
          width:"100%", background: groups.length>0 ? profile.color : "#283548",
          border:"none", borderRadius:12, padding:"15px 0",
          color: groups.length>0?"#fff":"#475569", fontWeight:800, fontSize:16, cursor:"pointer"
        }}>
          ✓ Inizia con {groups.length} grupp{groups.length===1?"o":"i"}
        </button>
      </div>
    </div>
  );
}

// ── NumPad ────────────────────────────────────────────────────────────────────
function NumPad({ item, currentQtyVal, onConfirm, onClose }) {
  const [input, setInput] = useState(String(currentQtyVal ?? item.qty));
  const press = (k) => {
    if (k === "⌫") setInput(p => p.length > 1 ? p.slice(0, -1) : "0");
    else if (k === "C") setInput("0");
    else setInput(p => p === "0" ? String(k) : p + String(k));
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.78)", zIndex:200,
                  display:"flex", flexDirection:"column", justifyContent:"flex-end" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
           style={{ background:"#1E293B", borderRadius:"20px 20px 0 0", padding:"20px 20px 34px" }}>
        <div style={{ fontWeight:700, fontSize:15, color:"#F1F5F9", marginBottom:3, lineHeight:1.3 }}>{item.nome}</div>
        <div style={{ fontSize:11, color:"#475569", marginBottom:14 }}>Quantità prevista: {item.qty}</div>
        <div style={{ background:"#0F172A", borderRadius:12, padding:"12px 18px",
                      display:"flex", justifyContent:"space-between", alignItems:"center",
                      marginBottom:14, border:"2px solid #334155" }}>
          <span style={{ fontSize:12, color:"#64748B" }}>Quantità contata:</span>
          <span style={{ fontSize:38, fontWeight:800, color:"#F1F5F9" }}>{input}</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:14 }}>
          {[1,2,3,4,5,6,7,8,9,"C",0,"⌫"].map(k => (
            <button key={k} onClick={()=>press(k)} style={{
              background: k==="C"||k==="⌫" ? "#334155" : "#283548",
              border:"none", borderRadius:12, padding:"17px 0",
              fontSize: k==="⌫"?19:22, fontWeight:700,
              color: k==="C"?"#EF4444": k==="⌫"?"#94A3B8":"#F1F5F9", cursor:"pointer"
            }}>{k}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:8 }}>
          <button onClick={()=>onConfirm(parseInt(input,10)||0,"green")} style={{
            flex:1, background:"#10B981", border:"none", borderRadius:12,
            padding:"13px 0", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer"
          }}>✓ Confermato</button>
          <button onClick={()=>onConfirm(parseInt(input,10)||0,"orange")} style={{
            flex:1, background:"#F97316", border:"none", borderRadius:12,
            padding:"13px 0", color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer"
          }}>⚠ Non sufficiente</button>
        </div>
        <button onClick={onClose} style={{ width:"100%", background:"#334155", border:"none", borderRadius:12,
          padding:"12px 0", color:"#94A3B8", fontWeight:700, fontSize:14, cursor:"pointer" }}>Annulla</button>
      </div>
    </div>
  );
}

// ── Add Item Modal ────────────────────────────────────────────────────────────
function AddItemModal({ categories, onAdd, onClose }) {
  const [cat, setCat]   = useState(categories[0] || "");
  const [nome, setNome] = useState("");
  const [qty, setQty]   = useState("1");
  const [newCat, setNewCat] = useState("");
  const [useNew, setUseNew] = useState(false);
  const finalCat = useNew ? newCat.trim() : cat;
  const submit = () => {
    if (!nome.trim() || !finalCat) return;
    onAdd({ cat: finalCat, nome: nome.trim(), qty: parseInt(qty,10)||1 });
    onClose();
  };
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.78)", zIndex:200,
                  display:"flex", flexDirection:"column", justifyContent:"flex-end" }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
           style={{ background:"#1E293B", borderRadius:"20px 20px 0 0", padding:"22px 20px 36px" }}>
        <div style={{ fontWeight:800, fontSize:17, marginBottom:18, color:"#F1F5F9" }}>➕ Nuovo elemento</div>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:"#64748B", marginBottom:6, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Categoria</div>
          {!useNew
            ? <select value={cat} onChange={e=>setCat(e.target.value)} style={{ width:"100%", background:"#0F172A", border:"1px solid #334155", borderRadius:10, color:"#F1F5F9", fontSize:14, padding:"10px 14px", boxSizing:"border-box", outline:"none" }}>
                {categories.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            : <input value={newCat} onChange={e=>setNewCat(e.target.value)} placeholder="es. 🏖️ Mare"
                style={{ width:"100%", background:"#0F172A", border:"1px solid #334155", borderRadius:10, color:"#F1F5F9", fontSize:14, padding:"10px 14px", boxSizing:"border-box", outline:"none" }}/>
          }
          <button onClick={()=>setUseNew(p=>!p)} style={{ background:"none", border:"none", color:"#3B82F6", fontSize:12, fontWeight:600, marginTop:6, cursor:"pointer", padding:0 }}>
            {useNew ? "← Scegli esistente" : "+ Crea nuova categoria"}
          </button>
        </div>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, color:"#64748B", marginBottom:6, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Nome elemento</div>
          <input value={nome} onChange={e=>setNome(e.target.value)} placeholder="es. Crema solare SPF 50"
            style={{ width:"100%", background:"#0F172A", border:"1px solid #334155", borderRadius:10, color:"#F1F5F9", fontSize:14, padding:"10px 14px", boxSizing:"border-box", outline:"none" }}/>
        </div>
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, color:"#64748B", marginBottom:6, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Quantità</div>
          <input value={qty} onChange={e=>setQty(e.target.value)} type="number" min="1"
            style={{ width:"100%", background:"#0F172A", border:"1px solid #334155", borderRadius:10, color:"#F1F5F9", fontSize:14, padding:"10px 14px", boxSizing:"border-box", outline:"none" }}/>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, background:"#334155", border:"none", borderRadius:12, padding:"13px 0", color:"#94A3B8", fontWeight:700, fontSize:15, cursor:"pointer" }}>Annulla</button>
          <button onClick={submit} disabled={!nome.trim()||!finalCat} style={{ flex:2, background:nome.trim()&&finalCat?"#3B82F6":"#283548", border:"none", borderRadius:12, padding:"13px 0", color:nome.trim()&&finalCat?"#fff":"#475569", fontWeight:800, fontSize:15, cursor:"pointer" }}>Aggiungi</button>
        </div>
      </div>
    </div>
  );
}

// ── Category name inline editor ───────────────────────────────────────────────
function CatNameEditor({ value, onSave, onCancel }) {
  const [v, setV] = useState(value);
  const ref = useRef();
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  return (
    <div style={{ display:"flex", gap:6, flex:1, alignItems:"center" }}>
      <input ref={ref} value={v} onChange={e=>setV(e.target.value)}
        onKeyDown={e=>{ if(e.key==="Enter") onSave(v.trim()||value); if(e.key==="Escape") onCancel(); }}
        style={{ flex:1, background:"#0F172A", border:"1px solid #3B82F6", borderRadius:7,
                 color:"#F1F5F9", fontSize:14, fontWeight:700, padding:"4px 10px", outline:"none" }}/>
      <button onClick={()=>onSave(v.trim()||value)} style={{ background:"#10B981", border:"none", borderRadius:7, color:"#fff", fontWeight:700, fontSize:13, padding:"4px 10px", cursor:"pointer" }}>✓</button>
      <button onClick={onCancel} style={{ background:"#334155", border:"none", borderRadius:7, color:"#94A3B8", fontWeight:700, fontSize:13, padding:"4px 10px", cursor:"pointer" }}>✗</button>
    </div>
  );
}

// ── Gestione Lista view ───────────────────────────────────────────────────────
function GestioneLista({ catMap, catNames, customItems, removedIds, expiry, onSave, onClose }) {
  const [localNames,    setLocalNames]   = useState({ ...catNames });
  const [localRemoved,  setLocalRemoved] = useState([...removedIds]);
  const [localExpiry,   setLocalExpiry]  = useState({ ...expiry });
  const [localQtys,     setLocalQtys]    = useState({});
  const [deletedGroups, setDeletedGroups]= useState([]); // group keys to delete entirely
  const [editingCat,    setEditingCat]   = useState(null);
  const [openCats,      setOpenCats]     = useState({});
  const [showNewGroup,  setShowNewGroup] = useState(false);
  const [newGroupName,  setNewGroupName] = useState("");

  const allCategories = Object.keys(catMap).filter(k => !deletedGroups.includes(k));

  const toggleRemove = (id) =>
    setLocalRemoved(p => p.includes(id) ? p.filter(x=>x!==id) : [...p, id]);

  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(null); // catKey to delete

  const deleteGroup = (catKey) => {
    setDeletedGroups(p => [...p, catKey]);
    const items = catMap[catKey] || [];
    setLocalRemoved(p => [...new Set([...p, ...items.map(i=>i.id)])]);
    setConfirmDeleteGroup(null);
  };

  const setExpiryVal = (id, val) =>
    setLocalExpiry(p => ({ ...p, [id]: val }));

  const setQty = (id, val) => {
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) setLocalQtys(p => ({ ...p, [id]: n }));
    else if (val === "") setLocalQtys(p => ({ ...p, [id]: "" }));
  };

  const handleSave = () => {
    onSave({ catNames: localNames, removedIds: localRemoved, expiry: localExpiry, qtys: localQtys, newGroup: newGroupName.trim()||null, deletedGroups });
  };

  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:"#0F172A", minHeight:"100vh", color:"#F1F5F9", paddingBottom:100 }}>
      {/* Header */}
      <div style={{ background:"#1E293B", padding:"16px 20px", display:"flex", alignItems:"center", gap:12,
                    position:"sticky", top:0, zIndex:10, borderBottom:"1px solid #334155" }}>
        <button onClick={onClose} style={{ background:"none", border:"none", color:"#94A3B8", fontSize:22, cursor:"pointer", padding:0 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:17 }}>⚙️ Gestione Lista</div>
          <div style={{ fontSize:11, color:"#64748B", marginTop:1 }}>Rinomina · Quantità · Rimuovi · Nuovo gruppo</div>
        </div>
      </div>

      <div style={{ padding:"12px 16px" }}>
        {/* Info box */}
        <div style={{ background:"#1E293B", border:"1px solid #334155", borderRadius:10, padding:"10px 14px", marginBottom:14 }}>
          <div style={{ fontSize:12, color:"#94A3B8", lineHeight:1.6 }}>
            ✏️ Tocca il <b style={{color:"#F1F5F9"}}>nome gruppo</b> per rinominarlo &nbsp;·&nbsp;
            🗑 Tocca il <b style={{color:"#F1F5F9"}}>nome riga</b> per rimuoverla &nbsp;·&nbsp;
            🔢 Modifica il <b style={{color:"#F1F5F9"}}>numero</b> per cambiare la quantità di default
          </div>
        </div>

        {allCategories.map(catKey => {
          const displayName = localNames[catKey] || catKey;
          const items = catMap[catKey] || [];
          const isOpen = openCats[catKey] !== false;
          const removedCount = items.filter(i=>localRemoved.includes(i.id)).length;

          return (
            <div key={catKey} style={{ marginBottom:10 }}>
              {/* Category header */}
              <div style={{ display:"flex", alignItems:"center",
                            background:"#1E293B", borderRadius: isOpen?"10px 10px 0 0":10,
                            padding:"0 10px 0 14px", borderLeft:"4px solid #3B82F6", minHeight:46 }}>
                {editingCat === catKey
                  ? <CatNameEditor value={displayName}
                      onSave={v=>{ setLocalNames(p=>({...p,[catKey]:v})); setEditingCat(null); }}
                      onCancel={()=>setEditingCat(null)}/>
                  : <>
                      <button onClick={()=>setEditingCat(catKey)} style={{
                        flex:1, background:"none", border:"none", textAlign:"left",
                        color:"#F1F5F9", fontWeight:700, fontSize:14, cursor:"pointer", padding:"12px 0"
                      }}>
                        {displayName}
                        <span style={{ fontSize:11, color:"#3B82F6", marginLeft:8 }}>✏️</span>
                      </button>
                      {removedCount>0 && <span style={{ fontSize:11, color:"#EF4444", marginRight:8 }}>{removedCount} rimossi</span>}
                      <button onClick={()=>setOpenCats(p=>({...p,[catKey]:!isOpen}))} style={{
                        background:"none", border:"none", color:"#475569", fontSize:11, cursor:"pointer", padding:"8px 4px"
                      }}>{isOpen?"▲":"▼"}</button>
                      <button onClick={()=>setConfirmDeleteGroup(catKey)} style={{
                        background:"none", border:"none", color:"#EF4444", fontSize:20,
                        cursor:"pointer", padding:"8px 10px 8px 2px", lineHeight:1, fontWeight:700
                      }} title="Elimina gruppo">−</button>
                    </>
                }
              </div>

              {isOpen && (
                <div style={{ background:"#1E293B", borderRadius:"0 0 10px 10px", overflow:"hidden" }}>
                  {items.map((item, idx) => {
                    const isRemoved = localRemoved.includes(item.id);
                    const isMed = catKey === MEDICINE_CAT_KEY;
                    const expVal = localExpiry[item.id] || "";
                    const status = expiryStatus(expVal);
                    const ec = status ? EXPIRY_COLORS[status] : null;
                    const currentQty = localQtys[item.id] !== undefined ? localQtys[item.id] : item.qty;

                    return (
                      <div key={item.id} style={{
                        borderTop: idx===0?"1px solid #334155":"1px solid #0F172A",
                        background: isRemoved ? "rgba(239,68,68,.08)" : ec ? ec.rowBg : "transparent",
                      }}>
                        {/* Main row */}
                        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px" }}>
                          {/* Remove toggle */}
                          <div onClick={()=>toggleRemove(item.id)} style={{
                            width:20, height:20, borderRadius:5, flexShrink:0, cursor:"pointer",
                            background: isRemoved?"#EF4444":"transparent",
                            border:`2px solid ${isRemoved?"#EF4444":"#475569"}`,
                            display:"flex", alignItems:"center", justifyContent:"center"
                          }}>
                            {isRemoved && <span style={{ color:"#fff", fontSize:12, fontWeight:900 }}>✕</span>}
                          </div>
                          {/* Name */}
                          <span onClick={()=>toggleRemove(item.id)} style={{
                            fontSize:13, flex:1, cursor:"pointer",
                            color: isRemoved?"#EF4444":"#CBD5E1",
                            textDecoration: isRemoved?"line-through":"none", lineHeight:1.3
                          }}>{item.nome}</span>
                          {/* Qty editor */}
                          {!isRemoved && (
                            <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                              <span style={{ fontSize:11, color:"#475569" }}>×</span>
                              <input
                                type="number" min="1" value={currentQty}
                                onChange={e=>setQty(item.id, e.target.value)}
                                style={{
                                  width:44, background:"#0F172A", border:"1.5px solid #334155",
                                  borderRadius:7, color:"#F1F5F9", fontSize:14, fontWeight:700,
                                  padding:"3px 6px", textAlign:"center", outline:"none",
                                  WebkitAppearance:"none", MozAppearance:"textfield"
                                }}
                              />
                            </div>
                          )}
                        </div>
                        {/* Expiry row — only for medicines */}
                        {isMed && !isRemoved && (
                          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 14px 10px 44px" }}>
                            <span style={{ fontSize:11, color:"#64748B", flexShrink:0 }}>Scad.:</span>
                            <input
                              type="month" value={expVal}
                              onChange={e=>setExpiryVal(item.id, e.target.value)}
                              style={{
                                background:"#0F172A", border:`1.5px solid ${ec ? ec.border : "#334155"}`,
                                borderRadius:7, color: ec ? ec.text : "#94A3B8",
                                fontSize:13, fontWeight:600, padding:"4px 10px",
                                outline:"none", cursor:"pointer"
                              }}
                            />
                            {status && (
                              <span style={{ fontSize:11, fontWeight:700, color: ec.text }}>
                                {status==="expired"?"SCADUTO ⚠️": status==="soon"?"In scadenza":"OK ✓"}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* ── Crea nuovo gruppo ── */}
        <div style={{ marginTop:6 }}>
          {!showNewGroup ? (
            <button onClick={()=>setShowNewGroup(true)} style={{
              width:"100%", background:"#1E293B", border:"2px dashed #334155",
              borderRadius:10, padding:"13px 0", color:"#3B82F6",
              fontWeight:700, fontSize:14, cursor:"pointer"
            }}>+ Crea nuovo gruppo</button>
          ) : (
            <div style={{ background:"#1E293B", borderRadius:10, padding:"14px 16px", border:"1px solid #3B82F6" }}>
              <div style={{ fontSize:12, color:"#64748B", marginBottom:8, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>Nome nuovo gruppo</div>
              <input
                value={newGroupName}
                onChange={e=>setNewGroupName(e.target.value)}
                placeholder="es. 🏖️ Mare"
                autoFocus
                style={{ width:"100%", background:"#0F172A", border:"1px solid #334155", borderRadius:8,
                  color:"#F1F5F9", fontSize:15, padding:"10px 14px", boxSizing:"border-box", outline:"none", marginBottom:10 }}
              />
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>{ setShowNewGroup(false); setNewGroupName(""); }} style={{
                  flex:1, background:"#334155", border:"none", borderRadius:8,
                  padding:"10px 0", color:"#94A3B8", fontWeight:700, fontSize:14, cursor:"pointer"
                }}>Annulla</button>
                <button onClick={()=>{ if(newGroupName.trim()) setShowNewGroup(false); }} style={{
                  flex:2, background: newGroupName.trim()?"#3B82F6":"#283548",
                  border:"none", borderRadius:8, padding:"10px 0",
                  color: newGroupName.trim()?"#fff":"#475569", fontWeight:700, fontSize:14, cursor:"pointer"
                }}>✓ Conferma nome</button>
              </div>
              {newGroupName.trim() && (
                <div style={{ marginTop:8, fontSize:11, color:"#10B981" }}>
                  ✓ Il gruppo «{newGroupName.trim()}» verrà creato al salvataggio. Usa ➕ Aggiungi dalla lista principale per aggiungere elementi.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save button fixed at bottom */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:"14px 16px 28px", background:"#0F172A", borderTop:"1px solid #1E293B" }}>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, background:"#334155", border:"none", borderRadius:12, padding:"14px 0", color:"#94A3B8", fontWeight:700, fontSize:15, cursor:"pointer" }}>Annulla</button>
          <button onClick={handleSave} style={{ flex:2, background:"#10B981", border:"none", borderRadius:12, padding:"14px 0", color:"#fff", fontWeight:800, fontSize:15, cursor:"pointer" }}>💾 Salva Lista</button>
        </div>
      </div>

      {/* Delete group confirm modal */}
      {confirmDeleteGroup && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.78)", zIndex:300,
                      display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ background:"#1E293B", borderRadius:16, padding:"24px 20px", width:"100%", maxWidth:320 }}>
            <div style={{ fontSize:28, textAlign:"center", marginBottom:10 }}>🗑</div>
            <div style={{ fontWeight:800, fontSize:16, color:"#F1F5F9", textAlign:"center", marginBottom:8 }}>
              Eliminare il gruppo?
            </div>
            <div style={{ fontSize:13, color:"#94A3B8", textAlign:"center", marginBottom:20, lineHeight:1.5 }}>
              «{localNames[confirmDeleteGroup] || confirmDeleteGroup}» e tutti i suoi elementi verranno rimossi definitivamente.
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setConfirmDeleteGroup(null)} style={{ flex:1, background:"#334155", border:"none", borderRadius:12, padding:"13px 0", color:"#94A3B8", fontWeight:700, fontSize:15, cursor:"pointer" }}>Annulla</button>
              <button onClick={()=>deleteGroup(confirmDeleteGroup)} style={{ flex:1, background:"#EF4444", border:"none", borderRadius:12, padding:"13px 0", color:"#fff", fontWeight:800, fontSize:15, cursor:"pointer" }}>Elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  // Saved list snapshot: { customItems, removedIds, catNames }
  const [savedList, setSavedList] = useState(() => {
    try { return JSON.parse(localStorage.getItem(K_SAVED)) || null; } catch { return null; }
  });

  // Custom items added by user
  const [customItems, setCustomItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(K_CUSTOM)) || []; } catch { return []; }
  });

  // Permanently removed item ids
  const [removedIds, setRemovedIds] = useState(() => {
    try {
      if (localStorage.getItem(K_SAVED)) {
        const s = JSON.parse(localStorage.getItem(K_SAVED));
        return s.removedIds || [];
      }
      return JSON.parse(localStorage.getItem(K_REMOVED)) || [];
    } catch { return []; }
  });

  // Category display names override
  const [catNames, setCatNames] = useState(() => {
    try {
      if (localStorage.getItem(K_SAVED)) {
        const s = JSON.parse(localStorage.getItem(K_SAVED));
        return s.catNames || {};
      }
      return JSON.parse(localStorage.getItem(K_CATNAMES)) || {};
    } catch { return {}; }
  });

  // Per-item trip state — saved manually with 💾 button
  const [checkedIds, setCheckedIds] = useState(() => {
    try { const p = JSON.parse(localStorage.getItem(K_PROGRESS)); return p?.checkedIds || []; } catch { return []; }
  });
  const [qtyState, setQtyState] = useState(() => {
    try { const p = JSON.parse(localStorage.getItem(K_PROGRESS)); return p?.qtyState || {}; } catch { return {}; }
  });

  const [openCats,    setOpenCats]   = useState({});
  const [filter,      setFilter]     = useState("all");
  const [search,      setSearch]     = useState("");
  const [view,        setView]       = useState("list");
  const [numpadItem,  setNumpadItem] = useState(null);
  const [showAdd,     setShowAdd]    = useState(false);
  const [editingCat,  setEditingCat] = useState(null);
  const [resetKey,    setResetKey]   = useState(0);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [saveFlash,        setSaveFlash]        = useState(false);
  const [showQR,           setShowQR]           = useState(false);
  const [showHistory,      setShowHistory]       = useState(false);
  const [itemOrder, setItemOrder] = useState({});
  const [reorderCat, setReorderCat] = useState(null); // cat being reordered
  const [showProfile, setShowProfile] = useState(() => {
    // Show profile selector on first launch (no custom items, no progress)
    try {
      const hasProgress = !!localStorage.getItem(K_PROGRESS);
      const hasCustom   = JSON.parse(localStorage.getItem(K_CUSTOM)||"[]").length > 0;
      return !hasProgress && !hasCustom;
    } catch { return true; }
  });

  // Departure date & notifications
  const [departure,   setDeparture]  = useState(() => {
    try { return localStorage.getItem(K_DEPARTURE) || ""; } catch { return ""; }
  });
  const [destination, setDestination] = useState(() => {
    try { return localStorage.getItem(K_DEST) || ""; } catch { return ""; }
  });
  const [destSearch,  setDestSearch]  = useState(() => {
    try { return localStorage.getItem(K_DEST) || ""; } catch { return ""; }
  });
  const [tripDays,    setTripDays]   = useState(() => {
    try { return parseInt(localStorage.getItem(K_TRIPDAYS)||"3",10); } catch { return 3; }
  });
  const [history,     setHistory]    = useState(() => {
    try { return JSON.parse(localStorage.getItem(K_HISTORY)) || []; } catch { return []; }
  });
  const [notifyTime,  setNotifyTime] = useState(() => {
    try { return localStorage.getItem(K_NOTIFYTIME) || "09:00"; } catch { return "09:00"; }
  });
  const [notifPerm,   setNotifPerm]  = useState(() =>
    typeof Notification !== "undefined" ? Notification.permission : "denied"
  );

  // Expiry dates for medicines: { itemId: "YYYY-MM" }
  const [expiry, setExpiry] = useState(() => {
    try { return JSON.parse(localStorage.getItem(K_EXPIRY)) || {}; } catch { return {}; }
  });

  // Excluded this trip (temporary, reset clears them)
  const [excluded, setExcluded] = useState([]);

  // Persist (only permanent data — trip state intentionally not saved)
  useEffect(() => { try { localStorage.setItem(K_CUSTOM,    JSON.stringify(customItems)); } catch {} }, [customItems]);
  useEffect(() => { try { localStorage.setItem(K_REMOVED,   JSON.stringify(removedIds));  } catch {} }, [removedIds]);
  useEffect(() => { try { localStorage.setItem(K_CATNAMES,  JSON.stringify(catNames));    } catch {} }, [catNames]);
  useEffect(() => { try { localStorage.setItem(K_EXPIRY,    JSON.stringify(expiry));      } catch {} }, [expiry]);
  useEffect(() => { try { if(departure) localStorage.setItem(K_DEPARTURE, departure); else localStorage.removeItem(K_DEPARTURE); } catch {} }, [departure]);
  useEffect(() => { try { if(destination) localStorage.setItem(K_DEST, destination); else localStorage.removeItem(K_DEST); } catch {} }, [destination]);
  useEffect(() => { try { localStorage.setItem(K_TRIPDAYS, String(tripDays)); } catch {} }, [tripDays]);
  useEffect(() => { try { localStorage.setItem(K_HISTORY,  JSON.stringify(history));  } catch {} }, [history]);
  useEffect(() => { try { localStorage.setItem(K_NOTIFYTIME, notifyTime); } catch {} }, [notifyTime]);
  useEffect(() => { try { if(savedList) localStorage.setItem(K_SAVED,     JSON.stringify(savedList)); } catch {} }, [savedList]);

  // Build category map — keep empty groups (user can add items with ➕)
  const buildCatMap = () => {
    const map = {};
    for (const [cat, items] of Object.entries(DEFAULT_DATA)) {
      map[cat] = items.filter(i => !removedIds.includes(i.id));
    }
    for (const ci of customItems) {
      if (removedIds.includes(ci.id)) continue;
      if (!map[ci.cat]) map[ci.cat] = [];
      if (!map[ci.cat].find(x=>x.id===ci.id)) map[ci.cat].push(ci);
    }
    return map;
  };
  const catMap = buildCatMap();
  const allCategories = Object.keys(catMap);
  const getCatColor = (key) => DEFAULT_CAT_COLORS[key] || "#64748B";

  const allItems    = allCategories.flatMap(c => catMap[c]);
  const activeItems = allItems.filter(i => !excluded.includes(i.id));
  const totalItems  = activeItems.length;
  const doneItems   = activeItems.filter(i => checkedIds.includes(i.id)).length;
  const progress    = totalItems ? Math.round((doneItems/totalItems)*100) : 0;
  const progressColor = progress < 40 ? "#EF4444" : progress < 75 ? "#F59E0B" : "#10B981";

  // Actions
  const toggleCheck = (id) =>
    setCheckedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const confirmNumpad = (val, color) => {
    const id = numpadItem.item.id;
    setQtyState(p => ({ ...p, [id]: { qtyVal: val, qtyColor: color } }));
    setNumpadItem(null);
  };

  // Open device calendar with pre-filled daily reminder event
  const openCalendarReminder = () => {
    if (!departure || !notifyTime) return;
    const [h, m] = notifyTime.split(":").map(Number);
    const dep = departure.replace(/-/g, "");
    const pad = n => String(n).padStart(2,"0");

    // Helper: date string shifted by hours
    const shiftedDT = (dateStr, shiftHours) => {
      const d = new Date(dateStr + "T" + pad(h) + ":" + pad(m) + ":00");
      d.setHours(d.getHours() + shiftHours);
      return d.getFullYear().toString() +
        pad(d.getMonth()+1) + pad(d.getDate()) +
        "T" + pad(d.getHours()) + pad(d.getMinutes()) + "00";
    };

    const dtStart    = `${dep}T${pad(h)}${pad(m)}00`;
    const dtEnd      = `${dep}T${pad(h)}${pad(m<45?m+15:59)}00`;
    const dt24start  = shiftedDT(departure, -24);
    const dt24end    = shiftedDT(departure, -23);
    const dt2start   = shiftedDT(departure, -2);
    const dt2end     = shiftedDT(departure, -1);

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ChecklistViaggio//IT",

      // ── Reminder giornaliero ──
      "BEGIN:VEVENT",
      "UID:daily-reminder@checklist-viaggio",
      `DTSTART:${dep.slice(0,8).replace(/(\d{4})(\d{2})(\d{2})/,"$1$2$3")}T${pad(h)}${pad(m)}00`,
      `DTEND:${dep.slice(0,8).replace(/(\d{4})(\d{2})(\d{2})/,"$1$2$3")}T${pad(h)}${pad(m<45?m+15:59)}00`,
      `RRULE:FREQ=DAILY;UNTIL=${dep}T235959Z`,
      `SUMMARY:✈️ Lista viaggio — ${progress}% completato`,
      `DESCRIPTION:Hai completato il ${progress}% della checklist.`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "TRIGGER:-PT0M",
      `DESCRIPTION:✈️ Lista viaggio — ${progress}% completato`,
      "END:VALARM",
      "END:VEVENT",

      // ── 24h prima ──
      "BEGIN:VEVENT",
      "UID:depart-24h@checklist-viaggio",
      `DTSTART:${dt24start}`,
      `DTEND:${dt24end}`,
      "SUMMARY:✈️ Domani si parte! Controlla la lista",
      `DESCRIPTION:Manca 1 giorno alla partenza. Lista completata al ${progress}%.`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "TRIGGER:-PT0M",
      "DESCRIPTION:✈️ Domani si parte! Controlla la lista",
      "END:VALARM",
      "END:VEVENT",

      // ── 2h prima ──
      "BEGIN:VEVENT",
      "UID:depart-2h@checklist-viaggio",
      `DTSTART:${dt2start}`,
      `DTEND:${dt2end}`,
      "SUMMARY:⏰ Mancano 2 ore alla partenza!",
      "DESCRIPTION:Ultima verifica della checklist prima di partire!",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "TRIGGER:-PT0M",
      "DESCRIPTION:⏰ Mancano 2 ore alla partenza!",
      "END:VALARM",
      "END:VEVENT",

      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    // IMPORTANT: no "download" attribute — this lets Android show
    // "Open with → Calendar" instead of just downloading the file.
    window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  // Manual save: persist current progress + calendar reminder
  const saveProgress = () => {
    try {
      localStorage.setItem(K_PROGRESS, JSON.stringify({ checkedIds, qtyState, excluded }));
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 1500);
    } catch {}
    // Save to history if departure is set
    if (departure && destination) {
      const returnDate = (() => {
        const d = new Date(departure + "T00:00:00");
        d.setDate(d.getDate() + (tripDays||1) - 1);
        return d.toISOString().split("T")[0];
      })();
      const entry = { id: Date.now(), destination, departure, returnDate, tripDays, savedAt: new Date().toISOString() };
      setHistory(prev => {
        const filtered = prev.filter(h => !(h.destination===destination && h.departure===departure));
        return [entry, ...filtered].slice(0, 30);
      });
    }
  };

  // Load a profile
  const handleProfileSelect = ({ profileName, items }) => {
    // Reset trip state
    setCheckedIds([]);
    setQtyState({});
    setExcluded([]);
    try { localStorage.removeItem(K_PROGRESS); } catch {}
    // Load profile items as custom items
    if (items && items.length > 0) {
      setCustomItems(items);
      try { localStorage.setItem(K_CUSTOM, JSON.stringify(items)); } catch {}
    } else {
      setCustomItems([]);
      try { localStorage.setItem(K_CUSTOM, JSON.stringify([])); } catch {}
    }
    setRemovedIds([]);
    setCatNames({});
    setShowProfile(false);
  };

  // Reset: wipe trip state → show profile selector
  const doReset = () => {
    setCheckedIds([]);
    setQtyState({});
    setExcluded([]);
    setDeparture("");
    try { localStorage.removeItem(K_PROGRESS); localStorage.removeItem(K_DEPARTURE); } catch {}
    setShowConfirmReset(false);
    setShowProfile(true);
  };

  const getOrderedItems = (cat, items) => {
    const order = itemOrder[cat];
    if (!order) return items;
    const sorted = [...items].sort((a,b) => {
      const ai = order.indexOf(a.id);
      const bi = order.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
    return sorted;
  };

  const moveItem = (cat, id, dir) => {
    const items = getOrderedItems(cat, catMap[cat]||[]);
    const idx = items.findIndex(i=>i.id===id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= items.length) return;
    const newOrder = items.map(i=>i.id);
    [newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]];
    setItemOrder(p => ({...p, [cat]: newOrder}));
  };

  const addItem = ({ cat, nome, qty }) => {
    setCustomItems(p => [...p, { id: newId(), cat, nome, qty }]);
  };

  const saveCatName = (key, name) => {
    setCatNames(p => ({ ...p, [key]: name }));
    setEditingCat(null);
  };

  const handleGestioneSave = ({ catNames: newNames, removedIds: newRemoved, expiry: newExpiry, qtys, newGroup, deletedGroups: delGroups }) => {
    if (qtys && Object.keys(qtys).length > 0) {
      setCustomItems(prev => {
        const updated = [...prev];
        for (const [id, qty] of Object.entries(qtys)) {
          if (!qty) continue;
          const existing = updated.findIndex(x => x.id === id);
          if (existing >= 0) { updated[existing] = { ...updated[existing], qty }; }
          else {
            for (const items of Object.values(DEFAULT_DATA)) {
              const found = items.find(i => i.id === id);
              if (found) { updated.push({ ...found, qty }); break; }
            }
          }
        }
        return updated;
      });
    }
    if (newGroup) {
      const placeholderId = newId();
      setCustomItems(prev => [...prev, { id: placeholderId, cat: newGroup, nome: "Nuovo elemento", qty: 1 }]);
    }
    // Remove entire deleted groups from customItems
    if (delGroups && delGroups.length > 0) {
      setCustomItems(prev => prev.filter(ci => !delGroups.includes(ci.cat)));
      // Also remove from catNames
      const filteredNames = { ...newNames };
      delGroups.forEach(k => delete filteredNames[k]);
      newNames = filteredNames;
    }
    const snap = { catNames: newNames, removedIds: newRemoved, customItems };
    setSavedList(snap);
    setCatNames(newNames);
    setRemovedIds(newRemoved);
    setExpiry(newExpiry);
    try { localStorage.setItem(K_EXPIRY, JSON.stringify(newExpiry)); } catch {}
    setExcluded(p => p.filter(id => !newRemoved.includes(id)));
    setView("list");
  };

  const getFilteredItems = (items) =>
    items
      .filter(i => !excluded.includes(i.id))
      .filter(i => {
        const isChk = checkedIds.includes(i.id);
        const matchSearch = i.nome.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter==="all" ? true : filter==="todo" ? !isChk : isChk;
        return matchSearch && matchFilter;
      });

  // ── History view ────────────────────────────────────────────────────────────
  if (showHistory) {
    return <HistoryView
      history={history}
      onDelete={(id) => setHistory(prev => prev.filter((h,i) => (h.id||i) !== id))}
      onClose={()=>setShowHistory(false)}
    />;
  }

  // ── Profile selector ────────────────────────────────────────────────────────
  if (showProfile) {
    return <ProfileSelector
      onSelect={handleProfileSelect}
      onClose={()=>setShowProfile(false)}
    />;
  }

  // ── Gestione view ───────────────────────────────────────────────────────────
  if (view === "gestione") {
    return <GestioneLista
      catMap={catMap}
      catNames={catNames}
      customItems={customItems}
      removedIds={removedIds}
      expiry={expiry}
      onSave={handleGestioneSave}
      onClose={()=>setView("list")}
    />;
  }

  // ── Summary view ────────────────────────────────────────────────────────────
  if (view === "summary") {
    return (
      <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:"#0F172A", minHeight:"100vh", color:"#F1F5F9", paddingBottom:40 }}>
        <div style={{ background:"#1E293B", padding:"16px 20px", display:"flex", alignItems:"center", gap:12,
                      position:"sticky", top:0, zIndex:10, borderBottom:"1px solid #334155" }}>
          <button onClick={()=>setView("list")} style={{ background:"none", border:"none", color:"#94A3B8", fontSize:22, cursor:"pointer", padding:0 }}>←</button>
          <span style={{ fontWeight:700, fontSize:17 }}>Riepilogo quantità</span>
        </div>
        <div style={{ padding:"12px 16px" }}>
          {allCategories.map(cat => {
            const displayName = catNames[cat] || cat;
            const items = (catMap[cat]||[]).filter(i=>!excluded.includes(i.id));
            if (!items.length) return null;
            const color = getCatColor(cat);
            const done = items.filter(i=>checkedIds.includes(i.id)).length;
            const pct  = Math.round((done/items.length)*100);
            return (
              <div key={cat} style={{ background:"#1E293B", borderRadius:12, marginBottom:10, overflow:"hidden", borderLeft:`4px solid ${color}` }}>
                <div style={{ padding:"10px 14px 7px", display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontWeight:700, fontSize:14 }}>{displayName}</span>
                  <span style={{ fontSize:12, color:pct===100?"#10B981":"#94A3B8", fontWeight:700 }}>{done}/{items.length}</span>
                </div>
                {items.map((item,idx) => {
                  const isChk = checkedIds.includes(item.id);
                  const qs = qtyState[item.id]||{};
                  const qc = QTY_STATES[qs.qtyColor]||QTY_STATES.none;
                  return (
                    <div key={item.id} style={{ display:"flex", alignItems:"center", padding:"8px 14px",
                      borderTop:idx>0?"1px solid #1E293B":"1px solid #0F172A",
                      background:isChk?"rgba(16,185,129,.05)":"#0F172A" }}>
                      <span style={{ fontSize:13, flex:1, lineHeight:1.3, color:isChk?"#64748B":"#CBD5E1" }}>{item.nome}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:qc.text, background:qc.bg,
                        border:`1px solid ${qc.border}`, borderRadius:6, padding:"2px 8px" }}>
                        {qs.qtyVal!=null?qs.qtyVal:item.qty}
                      </span>
                    </div>
                  );
                })}
                <div style={{ background:"#334155", height:4 }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:pct===100?"#10B981":color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── List view ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif", background:"#0F172A", minHeight:"100vh", color:"#F1F5F9", paddingBottom:20 }}>

      {/* Header */}
      <div style={{ background:"#1E293B", padding:"16px 20px 12px", position:"sticky", top:0, zIndex:10, borderBottom:"1px solid #334155" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div>
            <div style={{ fontWeight:800, fontSize:19 }}>✈️ Checklist Viaggio</div>
            <div style={{ fontSize:11, color:"#64748B", marginTop:2 }}>
              {doneItems}/{totalItems} spuntati{excluded.length>0?` · ${excluded.length} esclusi`:""}
            </div>
          </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ fontSize:28, fontWeight:800, color:progressColor }}>{progress}%</div>
          <button onClick={saveProgress} style={{
            background: saveFlash ? "#10B981" : "#1E293B",
            border:`1px solid ${saveFlash?"#10B981":"#334155"}`,
            borderRadius:8, padding:"6px 10px", cursor:"pointer",
            fontSize:18, transition:"all 0.3s", lineHeight:1
          }} title="Salva progresso">
            {saveFlash ? "✓" : "💾"}
          </button>
        </div>
        </div>
        <div style={{ background:"#334155", borderRadius:6, height:7, overflow:"hidden", marginBottom:10 }}>
          <div style={{ width:`${progress}%`, height:"100%", background:progressColor, transition:"width 0.3s", borderRadius:6 }}/>
        </div>
        <input placeholder="🔍 Cerca elemento..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{ width:"100%", background:"#334155", border:"none", borderRadius:8, padding:"9px 14px",
                   color:"#F1F5F9", fontSize:14, boxSizing:"border-box", outline:"none" }}/>

        {/* Departure date + notify time */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
          <span style={{ fontSize:13, color:"#64748B", flexShrink:0 }}>📅</span>
          <input type="date" value={departure} onChange={e=>setDeparture(e.target.value)}
            style={{ flex:1, background:"#334155", border:"none", borderRadius:8,
                     padding:"7px 10px", color: departure?"#F1F5F9":"#64748B",
                     fontSize:13, outline:"none", minWidth:0 }}/>
          <button onClick={openCalendarReminder} disabled={!departure} style={{
            background:"none", border:"none", flexShrink:0, fontSize:13,
            cursor: departure?"pointer":"default", opacity: departure?1:0.4, padding:"0 2px"
          }} title="Aggiungi reminder al calendario">🔔</button>
          <input type="time" value={notifyTime} onChange={e=>setNotifyTime(e.target.value)}
            style={{ width:88, background:"#334155", border:"none", borderRadius:8,
                     padding:"7px 10px", color:"#F1F5F9", fontSize:13, outline:"none" }}/>
          {departure && (
            <button onClick={()=>setDeparture("")} style={{ background:"none", border:"none",
              color:"#475569", fontSize:16, cursor:"pointer", padding:0, lineHeight:1, flexShrink:0 }}>✕</button>
          )}
        </div>

        {/* Destination + trip days */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8 }}>
          <span style={{ fontSize:13, color:"#64748B", flexShrink:0 }}>📍</span>
          <input
            placeholder="Destinazione..."
            value={destination}
            onChange={e=>setDestination(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter") setDestSearch(destination); }}
            style={{ flex:1, background:"#334155", border:"none", borderRadius:8,
                     padding:"7px 10px", color:"#F1F5F9", fontSize:13,
                     outline:"none", minWidth:0 }}/>
          <button onClick={()=>setDestSearch(destination)} style={{
            background:"#3B82F6", border:"none", borderRadius:8, color:"#fff",
            fontSize:13, fontWeight:700, padding:"7px 10px", cursor:"pointer", flexShrink:0
          }}>🔍</button>
          <input
            type="number" min="1" max="99"
            value={tripDays}
            onChange={e => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) setTripDays(v);
              else if (e.target.value === "") setTripDays("");
            }}
            style={{
              width:52, background:"#334155", border:"none", borderRadius:8,
              color:"#F1F5F9", fontSize:14, fontWeight:700,
              padding:"7px 6px", outline:"none", textAlign:"center",
              WebkitAppearance:"none", MozAppearance:"textfield"
            }}/>
          <span style={{ fontSize:11, color:"#64748B", flexShrink:0 }}>gg</span>
        </div>

        {departure && (
          <div style={{ fontSize:10, color:"#475569", marginTop:6, textAlign:"center" }}>
            Tocca 🔔 per aggiungere i promemoria al Calendario del telefono
          </div>
        )}
      </div>

      {/* Weather banner — outside sticky header */}
      {destSearch && departure && (
        <div style={{ padding:"10px 16px 0" }}>
          <WeatherBanner destination={destSearch} departure={departure} tripDays={tripDays}/>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:"flex", gap:8, padding:"10px 16px 6px" }}>
        {[["all","Tutti"],["todo","Da fare"],["done","Fatti"]].map(([val,label])=>(
          <button key={val} onClick={()=>setFilter(val)} style={{
            flex:1, padding:"7px 0", borderRadius:8, border:"none", cursor:"pointer",
            fontWeight:600, fontSize:13,
            background:filter===val?"#3B82F6":"#1E293B",
            color:filter===val?"#fff":"#94A3B8"
          }}>{label}</button>
        ))}
      </div>

      {/* Actions bar */}
      <div style={{ display:"flex", gap:7, padding:"0 16px 10px", flexWrap:"wrap" }}>
        <button onClick={()=>setView("summary")}        style={{ flex:1, minWidth:60, background:"#1E293B", border:"1px solid #334155", color:"#94A3B8", borderRadius:8, padding:"7px 4px", fontSize:11, fontWeight:600, cursor:"pointer" }}>📊 Riepilogo</button>
        <button onClick={()=>setShowAdd(true)}          style={{ flex:1, minWidth:60, background:"#1E293B", border:"1px solid #334155", color:"#3B82F6",  borderRadius:8, padding:"7px 4px", fontSize:11, fontWeight:600, cursor:"pointer" }}>➕ Aggiungi</button>
        <button onClick={()=>setShowQR(true)}           style={{ flex:1, minWidth:60, background:"#1E293B", border:"1px solid #10B981", color:"#10B981",  borderRadius:8, padding:"7px 4px", fontSize:11, fontWeight:600, cursor:"pointer" }}>📲 QR</button>
        <button onClick={()=>setShowHistory(true)}      style={{ flex:1, minWidth:60, background:"#1E293B", border:"1px solid #8B5CF6", color:"#8B5CF6",  borderRadius:8, padding:"7px 4px", fontSize:11, fontWeight:600, cursor:"pointer" }}>🗺 Storico</button>
        <button onClick={()=>setView("gestione")}       style={{ flex:1, minWidth:60, background:"#1E293B", border:"1px solid #F59E0B", color:"#F59E0B",  borderRadius:8, padding:"7px 4px", fontSize:11, fontWeight:600, cursor:"pointer" }}>⚙️ Gestione</button>
        <button onClick={()=>setShowConfirmReset(true)} style={{ flex:1, minWidth:60, background:"#1E293B", border:"1px solid #EF4444", color:"#EF4444",  borderRadius:8, padding:"7px 4px", fontSize:11, fontWeight:600, cursor:"pointer" }}>🔄 Reset</button>
      </div>

      {/* Hint */}
      <div style={{ margin:"0 16px 10px", background:"#1E293B", borderRadius:10, padding:"8px 14px", border:"1px solid #334155", display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:15 }}>💡</span>
        <span style={{ fontSize:11, color:"#64748B", lineHeight:1.4 }}>
          <b style={{color:"#94A3B8"}}>Nome</b> → spunta &nbsp;·&nbsp;
          <b style={{color:"#94A3B8"}}>Numero</b> → conta &nbsp;·&nbsp;
          <b style={{color:"#94A3B8"}}>🚫</b> → escludi &nbsp;·&nbsp;
          <b style={{color:"#94A3B8"}}>☰</b> → riordina
        </span>
      </div>

      {/* Categories */}
      <div key={resetKey} style={{ padding:"0 16px" }}>
        {allCategories.map(cat => {
          const filtered = getFilteredItems(catMap[cat]||[]);
          if (!filtered.length) return null;
          const color = getCatColor(cat);
          const isOpen = openCats[cat] !== false;
          const catActive = (catMap[cat]||[]).filter(i=>!excluded.includes(i.id));
          const catDone   = catActive.filter(i=>checkedIds.includes(i.id)).length;
          const allDone   = catDone===catActive.length && catActive.length>0;
          const displayName = catNames[cat] || cat;

          return (
            <div key={cat} style={{ marginBottom:10 }}>
              {/* Category header */}
              <div style={{ display:"flex", alignItems:"center", background:"#1E293B",
                            borderRadius:isOpen?"10px 10px 0 0":10,
                            borderLeft:`4px solid ${color}`, minHeight:46 }}>
                {editingCat===cat
                  ? <div style={{ flex:1, padding:"0 10px" }}>
                      <CatNameEditor value={displayName}
                        onSave={v=>saveCatName(cat,v)}
                        onCancel={()=>setEditingCat(null)}/>
                    </div>
                  : <>
                      <button onClick={()=>setEditingCat(cat)} style={{
                        flex:1, background:"none", border:"none", textAlign:"left",
                        color:"#F1F5F9", fontWeight:700, fontSize:14, cursor:"pointer",
                        padding:"12px 14px"
                      }}>{displayName}</button>
                      <span style={{ fontSize:12, color:allDone?"#10B981":"#94A3B8", fontWeight:700, paddingRight:8 }}>
                        {catDone}/{catActive.length}
                      </span>
                      <button onClick={()=>setOpenCats(p=>({...p,[cat]:!isOpen}))} style={{
                        background:"none", border:"none", color:"#475569", fontSize:11,
                        cursor:"pointer", padding:"12px 14px 12px 4px"
                      }}>{isOpen?"▲":"▼"}</button>
                    </>
                }
              </div>

              {isOpen && (
                <div style={{ background:"#1E293B", borderRadius:"0 0 10px 10px", overflow:"hidden" }}>
                  {(catMap[cat]||[]).filter(i=>!excluded.includes(i.id)).length === 0 ? (
                    <div style={{ padding:"14px 16px", color:"#475569", fontSize:13, textAlign:"center", fontStyle:"italic" }}>
                      Nessun elemento · tocca ➕ per aggiungere
                    </div>
                  ) : getOrderedItems(cat, filtered).map((item,idx,arr) => {
                    const isChk = checkedIds.includes(item.id);
                    const qs  = qtyState[item.id]||{};
                    const qc = QTY_STATES[qs.qtyColor]||QTY_STATES.none;
                    const displayQty = qs.qtyVal!=null ? qs.qtyVal : item.qty;
                    const isMed = cat === MEDICINE_CAT_KEY;
                    const expVal = isMed ? (expiry[item.id]||"") : "";
                    const expSt  = isMed ? expiryStatus(expVal) : null;
                    const ec     = expSt ? EXPIRY_COLORS[expSt] : null;
                    const isReordering = reorderCat === cat;
                    return (
                      <div key={item.id} style={{
                        display:"flex", alignItems:"center",
                        background: ec ? ec.rowBg : isChk?"rgba(16,185,129,.06)":"transparent",
                        borderTop:idx===0?"1px solid #334155":"1px solid #0F172A",
                        borderLeft: ec ? `3px solid ${ec.border}` : "3px solid transparent",
                        minHeight:50
                      }}>
                        {/* Reorder handle / arrows */}
                        {isReordering ? (
                          <div style={{ display:"flex", flexDirection:"column", padding:"0 4px 0 10px", gap:2, flexShrink:0 }}>
                            <button onClick={()=>moveItem(cat,item.id,-1)} disabled={idx===0}
                              style={{ background:"none", border:"none", color:idx===0?"#334155":"#64748B",
                                       fontSize:14, cursor:idx===0?"default":"pointer", lineHeight:1, padding:"1px 4px" }}>▲</button>
                            <button onClick={()=>moveItem(cat,item.id,1)} disabled={idx===arr.length-1}
                              style={{ background:"none", border:"none", color:idx===arr.length-1?"#334155":"#64748B",
                                       fontSize:14, cursor:idx===arr.length-1?"default":"pointer", lineHeight:1, padding:"1px 4px" }}>▼</button>
                          </div>
                        ) : (
                          <button onClick={()=>setReorderCat(reorderCat===cat?null:cat)} style={{
                            background:"none", border:"none", color:"#334155", fontSize:16,
                            cursor:"pointer", padding:"0 4px 0 10px", flexShrink:0, lineHeight:1
                          }}>☰</button>
                        )}

                        {/* Checkbox + name */}
                        <button onClick={()=>!isReordering && toggleCheck(item.id)} style={{
                          display:"flex", alignItems:"center", gap:10, flex:1,
                          background:"none", border:"none", padding:"10px 8px 10px 6px",
                          cursor: isReordering?"default":"pointer", textAlign:"left", minWidth:0
                        }}>
                          <div style={{
                            width:22, height:22, borderRadius:6, flexShrink:0,
                            background:isChk?color:"transparent",
                            border:`2px solid ${isChk?color:"#475569"}`,
                            display:"flex", alignItems:"center", justifyContent:"center"
                          }}>
                            {isChk && <span style={{ color:"#fff", fontSize:13, fontWeight:900 }}>✓</span>}
                          </div>
                          <div style={{ minWidth:0 }}>
                            <span style={{ fontSize:13, color:isChk?"#94A3B8":"#E2E8F0",
                                           lineHeight:1.3, wordBreak:"break-word" }}>{item.nome}</span>
                            {ec && (
                              <div style={{ fontSize:10, fontWeight:700, color: ec.text, marginTop:1 }}>
                                {expSt==="expired"?"⚠️ SCADUTO": expSt==="soon"?"⚠️ In scadenza":"✓ OK"} · {expVal.split("-").reverse().join("/")}
                              </div>
                            )}
                          </div>
                        </button>

                        {/* Qty badge */}
                        <button onClick={()=>setNumpadItem({item})} style={{
                          background:"none", border:"none", padding:"10px 6px", cursor:"pointer", flexShrink:0
                        }}>
                          <div style={{ background:qc.bg, border:`1.5px solid ${qc.border}`,
                                        borderRadius:8, padding:"4px 11px", minWidth:32, textAlign:"center" }}>
                            <span style={{ fontSize:14, fontWeight:800, color:qc.text }}>{displayQty}</span>
                          </div>
                        </button>

                        {/* Exclude */}
                        {!isReordering && (
                          <button onClick={()=>setExcluded(p=>[...p,item.id])} style={{
                            background:"none", border:"none", padding:"0 14px 0 4px",
                            cursor:"pointer", color:"#475569", fontSize:16, flexShrink:0,
                            lineHeight:1, display:"flex", alignItems:"center"
                          }}>🚫</button>
                        )}
                      </div>
                    );
                  })}
                  {/* Exit reorder mode button */}
                  {reorderCat === cat && (
                    <button onClick={()=>setReorderCat(null)} style={{
                      width:"100%", background:"#1E293B", border:"none", borderTop:"1px solid #334155",
                      color:"#10B981", fontWeight:700, fontSize:13, padding:"10px 0", cursor:"pointer"
                    }}>✓ Fine riordino</button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Excluded this trip restore section */}
        {excluded.length > 0 && (
          <div style={{ background:"#1E293B", borderRadius:10, padding:"12px 14px", marginTop:4, border:"1px solid #334155" }}>
            <div style={{ fontSize:12, color:"#64748B", marginBottom:8, fontWeight:600 }}>
              🚫 Esclusi questo viaggio ({excluded.length})
            </div>
            {excluded.map(id => {
              const item = allItems.find(i=>i.id===id);
              if (!item) return null;
              return (
                <div key={id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 0",
                                       borderTop:"1px solid #0F172A" }}>
                  <span style={{ fontSize:13, color:"#64748B" }}>{item.nome}</span>
                  <button onClick={()=>setExcluded(p=>p.filter(x=>x!==id))} style={{
                    background:"none", border:"none", color:"#10B981", fontSize:12, fontWeight:600, cursor:"pointer"
                  }}>Ripristina</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {progress===100 && (
        <div style={{ margin:"10px 16px 20px", background:"linear-gradient(135deg,#10B981,#059669)", borderRadius:12, padding:"18px 20px", textAlign:"center" }}>
          <div style={{ fontSize:32 }}>🎉</div>
          <div style={{ fontWeight:800, fontSize:18, marginTop:4 }}>Tutto pronto!</div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.85)", marginTop:4 }}>Buon viaggio! ✈️</div>
        </div>
      )}

      {showConfirmReset && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.78)", zIndex:200,
                      display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div style={{ background:"#1E293B", borderRadius:16, padding:"24px 20px", width:"100%", maxWidth:320 }}>
            <div style={{ fontSize:32, textAlign:"center", marginBottom:12 }}>🔄</div>
            <div style={{ fontWeight:800, fontSize:17, color:"#F1F5F9", textAlign:"center", marginBottom:8 }}>
              Azzera il viaggio?
            </div>
            <div style={{ fontSize:13, color:"#94A3B8", textAlign:"center", marginBottom:24, lineHeight:1.5 }}>
              Tutte le spunte, le quantità confermate e gli elementi esclusi verranno ripristinati come «da fare».
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>setShowConfirmReset(false)} style={{
                flex:1, background:"#334155", border:"none", borderRadius:12,
                padding:"13px 0", color:"#94A3B8", fontWeight:700, fontSize:15, cursor:"pointer"
              }}>Annulla</button>
              <button onClick={doReset} style={{
                flex:1, background:"#EF4444", border:"none", borderRadius:12,
                padding:"13px 0", color:"#fff", fontWeight:800, fontSize:15, cursor:"pointer"
              }}>Azzera</button>
            </div>
          </div>
        </div>
      )}

      {showQR && (
        <QRModal
          allItems={allItems}
          catMap={catMap}
          catNames={catNames}
          destination={destination}
          departure={departure}
          tripDays={tripDays}
          onClose={()=>setShowQR(false)}
        />
      )}

      {numpadItem && (
        <NumPad item={numpadItem.item} currentQtyVal={qtyState[numpadItem.item.id]?.qtyVal}
          onConfirm={confirmNumpad} onClose={()=>setNumpadItem(null)}/>
      )}
      {showAdd && (
        <AddItemModal categories={allCategories} onAdd={addItem} onClose={()=>setShowAdd(false)}/>
      )}
    </div>
  );
}
