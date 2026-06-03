import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://shymkqlnmohcuzjqvpkh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoeW1rcWxubW9oY3V6anF2cGtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MzUwNTYsImV4cCI6MjA5NjAxMTA1Nn0.D5eD71t97xAvqISOKQPZI4m_LDoz04Rz7wDRkQvXrFM";
const sb = {
  headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` },
  async query(table, method = "GET", body = null, params = "") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${params}`, {
      method, headers: { ...this.headers, "Prefer": method === "POST" ? "return=representation" : "return=minimal" },
      body: body ? JSON.stringify(body) : null
    });
    return res.json();
  },
  async signIn(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST", headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  async signOut(token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST", headers: { ...this.headers, "Authorization": `Bearer ${token}` }
    });
  }
};

const TOURS = [
  { id:1,  nombre:"Valle Nevado & Farellones",      precio:230, cuposTotal:16, tipo:"nieve",    emoji:"⛷️",  horario:"6:00-6:30",   duracion:"Full day" },
  { id:2,  nombre:"Valle Nevado Panorámico",         precio:230, cuposTotal:16, tipo:"nieve",    emoji:"🏔️",  horario:"6:00-6:30",   duracion:"Full day" },
  { id:3,  nombre:"Farellones",                      precio:200, cuposTotal:16, tipo:"nieve",    emoji:"❄️",  horario:"6:00-6:30",   duracion:"Full day" },
  { id:4,  nombre:"Valle Nevado Ski Day",            precio:250, cuposTotal:14, tipo:"nieve",    emoji:"🎿",  horario:"6:00-6:30",   duracion:"Full day" },
  { id:5,  nombre:"Valle Nevado Sunset",             precio:260, cuposTotal:14, tipo:"nieve",    emoji:"🌅",  horario:"13:30-14:30", duracion:"Medio día" },
  { id:6,  nombre:"El Colorado",                    precio:230, cuposTotal:16, tipo:"nieve",    emoji:"🏂",  horario:"6:00-6:30",   duracion:"Full day" },
  { id:7,  nombre:"Portillo & Laguna del Inca",     precio:270, cuposTotal:14, tipo:"nieve",    emoji:"🦙",  horario:"6:00-6:30",   duracion:"Full day" },
  { id:8,  nombre:"Cajón del Maipo & Termas",       precio:365, cuposTotal:12, tipo:"natureza", emoji:"♨️",  horario:"6:00-6:30",   duracion:"Full day" },
  { id:9,  nombre:"Cajón del Maipo & El Yeso",      precio:270, cuposTotal:14, tipo:"natureza", emoji:"💧",  horario:"5:30-6:00",   duracion:"Full day" },
  { id:10, nombre:"Alyan Family Wines",             precio:560, cuposTotal:12, tipo:"viña",     emoji:"🍷",  horario:"PM",          duracion:"Medio día" },
  { id:11, nombre:"Concha y Toro",                  precio:500, cuposTotal:14, tipo:"viña",     emoji:"🍾",  horario:"AM-PM",       duracion:"Medio día" },
  { id:12, nombre:"Concha y Toro Tour Marquês",     precio:870, cuposTotal:12, tipo:"viña",     emoji:"👑",  horario:"AM-PM",       duracion:"Medio día" },
  { id:13, nombre:"Cousino Macul",                  precio:450, cuposTotal:14, tipo:"viña",     emoji:"🏡",  horario:"6:00-6:30",   duracion:"Full day" },
  { id:14, nombre:"Santa Rita",                     precio:430, cuposTotal:14, tipo:"viña",     emoji:"🌿",  horario:"AM-PM",       duracion:"Medio día" },
  { id:15, nombre:"Undurraga",                      precio:430, cuposTotal:14, tipo:"viña",     emoji:"🍇",  horario:"AM-PM",       duracion:"Medio día" },
  { id:16, nombre:"Cousino Macul & Templo Ba'Hai",  precio:500, cuposTotal:12, tipo:"viña",     emoji:"⛩️",  horario:"AM-PM",       duracion:"Medio día" },
  { id:17, nombre:"Viña del Mar & Valparaíso",      precio:230, cuposTotal:20, tipo:"ciudad",   emoji:"🌊",  horario:"6:00-6:30",   duracion:"Full day" },
  { id:18, nombre:"Isla Negra, Algarrobo & Undurraga", precio:480, cuposTotal:14, tipo:"ciudad",emoji:"🏖️", horario:"8:00-8:30",  duracion:"Full day" },
  { id:19, nombre:"City Tour Santiago",             precio:170, cuposTotal:24, tipo:"ciudad",   emoji:"🌆",  horario:"AM-PM",       duracion:"Medio día" },
  { id:20, nombre:"Bali Hai Jantar Show",           precio:650, cuposTotal:20, tipo:"especial", emoji:"🎭",  horario:"Noche",       duracion:"Noche" },
  { id:21, nombre:"Parque Safári Rancágua",         precio:440, cuposTotal:16, tipo:"especial", emoji:"🦁",  horario:"8:00-8:30",   duracion:"Medio día" },
];
const TIPOS = { nieve:"⛷️ Nieve", viña:"🍷 Viñas", natureza:"🌿 Naturaleza", ciudad:"🏙️ Ciudad", especial:"⭐ Especial" };
const TIPOS_DESC = [
  { id:"ninguno", label:"Sin descuento", icon:"—" },
  { id:"nino",    label:"Niño",          icon:"👶" },
  { id:"fidelidad",label:"Fidelidad",   icon:"⭐" },
  { id:"grupo",   label:"Grupo",         icon:"👥" },
  { id:"cortesia",label:"Cortesía",      icon:"🎁" },
  { id:"otro",    label:"Otro",          icon:"✏️" },
];

// Hoteles frecuentes en Santiago (el usuario puede escribir el suyo)
const HOTELES_FRECUENTES = [
  "Hotel W Santiago","Hotel Singular","NH Collection Plaza Santiago",
  "Holiday Inn Express Santiago","Marriott Santiago","Hyatt Centric Las Condes",
  "Hotel Magnolia","Cumbres Lastarria","The Aubrey","Hotel Director Vitacura",
];

const DEMO = SUPABASE_URL === "TU_SUPABASE_URL";
const hoy = new Date().toISOString().split("T")[0];
const fmtR = n => "R$ " + Number(n).toLocaleString("pt-BR");
const fmtF = f => { if (!f) return ""; const [,m,d] = f.split("-"); return `${d}/${m}`; };
const fmtFull = f => { if (!f) return ""; const [y,m,d] = f.split("-"); const ms=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]; return `${d} ${ms[+m-1]} ${y}`; };
function dias7() { return Array.from({length:7},(_,i)=>{ const d=new Date(); d.setDate(d.getDate()+i); return d.toISOString().split("T")[0]; }); }
function meses6() { const ms=[]; for(let i=5;i>=0;i--){ const d=new Date(); d.setMonth(d.getMonth()-i); ms.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`); } return ms; }
function loadLS(k,d){ try{const v=localStorage.getItem(k); return v?JSON.parse(v):d;}catch{return d;} }
function saveLS(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch{} }
const C = { rojo:"#7b1414", crema:"#f9f6f1", oro:"#c8a96e", texto:"#1a0a0a" };

export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loginForm, setLoginForm] = useState({ email:"", password:"" });

  const [tab, setTab] = useState("dashboard");
  const [ventas, setVentas] = useState([]);
  const [cuposUsados, setCuposUsados] = useState(() => loadLS("vtc_cupos", {}));
  const [savedMsg, setSavedMsg] = useState("");

  // fecha seleccionada en hoja de ruta
  const [fechaRuta, setFechaRuta] = useState(hoy);

  const formInit = {
    tourId:"", fecha:hoy, cliente:"", pax:1, pagado:false, notas:"",
    // hotel & pickup
    hotel:"", hotelDireccion:"", pickupHora:"",
    // descuento
    descuentoTipo:"ninguno", descuentoMonto:0, descuentoPct:0,
    usarPct:false, editandoTotal:false, motivo:"", totalFinal:0, totalBase:0,
  };
  const [form, setForm] = useState(formInit);
  const [modalVenta, setModalVenta] = useState(false);
  const [formError, setFormError] = useState("");
  const [hotelSugg, setHotelSugg] = useState([]);

  const [modalEditar, setModalEditar] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [chatMsgs, setChatMsgs] = useState([{ role:"assistant", text:"¡Hola! Soy el asistente de Valle Tours Chile 🦅 Pregúntame sobre ventas, pickups del día, hoteles o disponibilidad." }]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // ── Auth ──────────────────────────────────────────────────────
  async function handleLogin() {
    setAuthLoading(true); setAuthError("");
    const USUARIOS = [
      { email:"admin@valletours.cl",    pwd:"ValleTours2025" },
      { email:"jarajuan470@gmail.com",  pwd:"ValleTours2025" },
      { email:"vendedor@valletours.cl", pwd:"ValleTours2025" },
    ];
    await new Promise(r => setTimeout(r, 300));
    const match = USUARIOS.find(u => u.email===loginForm.email.trim() && u.pwd===loginForm.password);
    if (match) {
      setSession({ user:{ email:loginForm.email.trim() }, access_token: SUPABASE_KEY });
    } else {
      setAuthError("Credenciales incorrectas. Email: admin@valletours.cl | Pass: ValleTours2025");
    }
    setAuthLoading(false);
  }
  async function handleLogout() {
    if (!DEMO && session?.access_token) await sb.signOut(session.access_token);
    setSession(null); setVentas([]);
  }

  const cargarVentas = useCallback(async () => {
    if (!session) return;
    if (DEMO) { setVentas(loadLS("vtc_ventas",[])); }
    else { const d=await sb.query("ventas","GET",null,"?order=created_at.desc"); if(Array.isArray(d)) setVentas(d); }
  }, [session]);
  useEffect(() => { cargarVentas(); }, [cargarVentas]);
  useEffect(() => { saveLS("vtc_cupos", cuposUsados); }, [cuposUsados]);

  function cuposDisp(tourId, fecha) {
    const t = TOURS.find(x=>x.id===tourId); if (!t) return 0;
    return t.cuposTotal - (cuposUsados[`${tourId}_${fecha}`]??0);
  }

  function calcTotal(tourId, pax, dMonto, dPct, usarPct) {
    const tour = TOURS.find(t=>t.id===+tourId); if (!tour) return {base:0,descuento:0,final:0};
    const base = tour.precio * +pax;
    const desc = usarPct ? Math.round(base*(+dPct/100)) : +dMonto;
    return { base, descuento:desc, final:Math.max(0,base-desc) };
  }

  function updateForm(changes) {
    setForm(prev => {
      const next = {...prev,...changes};
      if (!next.editandoTotal) {
        const {base,final} = calcTotal(next.tourId,next.pax,next.descuentoMonto,next.descuentoPct,next.usarPct);
        next.totalBase=base; next.totalFinal=final;
      }
      return next;
    });
  }

  // Hotel autocomplete
  function onHotelChange(val) {
    updateForm({hotel:val});
    if (val.length>1) setHotelSugg(HOTELES_FRECUENTES.filter(h=>h.toLowerCase().includes(val.toLowerCase())));
    else setHotelSugg([]);
  }

  // ── Registrar venta ───────────────────────────────────────────
  async function registrarVenta() {
    setFormError("");
    if (!form.tourId||!form.fecha||!form.cliente.trim()) { setFormError("Completa los campos obligatorios."); return; }
    const tour = TOURS.find(t=>t.id===+form.tourId);
    const disp = cuposDisp(+form.tourId, form.fecha);
    if (+form.pax>disp) { setFormError(`Solo quedan ${disp} cupos para esa fecha.`); return; }

    const {base,descuento,final} = calcTotal(form.tourId,form.pax,form.descuentoMonto,form.descuentoPct,form.usarPct);
    const totalFinal = form.editandoTotal ? +form.totalFinal : final;

    const nueva = {
      id:Date.now(), tour_id:+form.tourId, tour_nombre:tour.nombre, tour_emoji:tour.emoji,
      fecha:form.fecha, cliente:form.cliente.trim(), pax:+form.pax,
      total_base:base, descuento:base-totalFinal, total:totalFinal,
      descuento_tipo:form.descuentoTipo, motivo_descuento:form.motivo,
      hotel:form.hotel, hotel_direccion:form.hotelDireccion, pickup_hora:form.pickupHora,
      pagado:form.pagado, notas:form.notas,
      created_at:new Date().toISOString(), usuario:session?.user?.email??"—"
    };

    if (DEMO) { const prev=loadLS("vtc_ventas",[]); const upd=[nueva,...prev]; saveLS("vtc_ventas",upd); setVentas(upd); }
    else { await sb.query("ventas","POST",nueva); await cargarVentas(); }

    const key=`${form.tourId}_${form.fecha}`;
    setCuposUsados(prev=>({...prev,[key]:(prev[key]??0)+ +form.pax}));
    setModalVenta(false); setForm(formInit); setHotelSugg([]);
    setSavedMsg("✓ Venta guardada"); setTimeout(()=>setSavedMsg(""),3000);
  }

  // ── Editar venta ──────────────────────────────────────────────
  function abrirEditar(v) {
    setEditForm({
      total:v.total, pagado:v.pagado, notas:v.notas??"",
      descuento:v.descuento??0, motivo_descuento:v.motivo_descuento??"",
      descuento_tipo:v.descuento_tipo??"ninguno",
      hotel:v.hotel??"", hotel_direccion:v.hotel_direccion??"", pickup_hora:v.pickup_hora??""
    });
    setModalEditar(v);
  }
  async function guardarEdicion() {
    const act = {...modalEditar,...editForm, total:+editForm.total, descuento:+editForm.descuento};
    if (DEMO) { const upd=ventas.map(v=>v.id===modalEditar.id?act:v); saveLS("vtc_ventas",upd); setVentas(upd); }
    else { await sb.query("ventas","PATCH",{total:+editForm.total,pagado:editForm.pagado,notas:editForm.notas,descuento:+editForm.descuento,motivo_descuento:editForm.motivo_descuento,descuento_tipo:editForm.descuento_tipo,hotel:editForm.hotel,hotel_direccion:editForm.hotel_direccion,pickup_hora:editForm.pickup_hora},`?id=eq.${modalEditar.id}`); await cargarVentas(); }
    setModalEditar(null);
    setSavedMsg("✓ Actualizado"); setTimeout(()=>setSavedMsg(""),3000);
  }

  // ── Chat IA ───────────────────────────────────────────────────
  async function enviarChat() {
    if (!chatInput.trim()||chatLoading) return;
    const msg=chatInput.trim(); setChatInput(""); setChatLoading(true);
    setChatMsgs(prev=>[...prev,{role:"user",text:msg}]);
    const hoyV=ventas.filter(v=>v.fecha===hoy);
    const pickupsHoy=hoyV.filter(v=>v.hotel).map(v=>`${v.pickup_hora||"?"} → ${v.hotel} (${v.cliente}, ${v.pax} pax)`).join(" | ");
    const ctx=`Eres el asistente de Valle Tours Chile. Tel: (56) 99973-3161
TOURS: ${TOURS.map(t=>`${t.emoji}${t.nombre} R$${t.precio}`).join(" | ")}
HOY ${hoy}: ${hoyV.length} ventas | Pickups: ${pickupsHoy||"ninguno registrado"}
FINANCIERO: Cobrado R$${ventas.filter(v=>v.pagado).reduce((a,v)=>a+v.total,0).toLocaleString("pt-BR")} | Pendiente R$${ventas.filter(v=>!v.pagado).reduce((a,v)=>a+v.total,0).toLocaleString("pt-BR")} | Total reservas: ${ventas.length}
Responde en español, amable y conciso.`;
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,system:ctx,messages:[...chatMsgs.slice(1).map(m=>({role:m.role,content:m.text})),{role:"user",content:msg}]})});
      const d=await res.json();
      setChatMsgs(prev=>[...prev,{role:"assistant",text:d.content?.[0]?.text??"Sin respuesta."}]);
    } catch { setChatMsgs(prev=>[...prev,{role:"assistant",text:"Error de conexión."}]); }
    setChatLoading(false);
  }

  // ── Métricas ──────────────────────────────────────────────────
  const cobrado   = ventas.filter(v=>v.pagado).reduce((a,v)=>a+v.total,0);
  const pendiente = ventas.filter(v=>!v.pagado).reduce((a,v)=>a+v.total,0);
  const descTotal = ventas.reduce((a,v)=>a+(v.descuento??0),0);
  const hoyVentas = ventas.filter(v=>v.fecha===hoy);
  const porTour   = TOURS.map(t=>({...t,pax:ventas.filter(v=>v.tour_id===t.id).reduce((a,v)=>a+v.pax,0),ingresos:ventas.filter(v=>v.tour_id===t.id).reduce((a,v)=>a+v.total,0)})).sort((a,b)=>b.pax-a.pax);
  const ventasPorMes=meses6().map(mes=>({mes,total:ventas.filter(v=>v.fecha?.startsWith(mes)).reduce((a,v)=>a+v.total,0),count:ventas.filter(v=>v.fecha?.startsWith(mes)).length}));
  const maxMes=Math.max(...ventasPorMes.map(m=>m.total),1);

  // Pickups del día seleccionado ordenados por hora
  const pickupsDia = ventas
    .filter(v=>v.fecha===fechaRuta && v.hotel)
    .sort((a,b)=>(a.pickup_hora||"99:99").localeCompare(b.pickup_hora||"99:99"));

  // ══════════════════════════════════════════════════════════════
  // LOGIN
  // ══════════════════════════════════════════════════════════════
  if (!session) return (
    <div style={{minHeight:"100vh",background:C.rojo,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:16,padding:"36px 28px",width:"100%",maxWidth:380,boxShadow:"0 20px 60px rgba(0,0,0,.4)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:44}}>🦅</div>
          <div style={{fontWeight:"bold",fontSize:18,color:C.rojo,letterSpacing:1}}>VALLE TOURS CHILE</div>
          <div style={{fontSize:11,color:"#aaa",letterSpacing:2}}>SOFTWARE DE GESTIÓN</div>
        </div>
        {DEMO&&<div style={{background:"#fff8e7",border:"1px solid #f0c040",borderRadius:8,padding:"10px 12px",marginBottom:14,fontSize:12,color:"#7a5c00"}}><strong>Modo demo</strong> — datos locales. Configura Supabase para la nube.</div>}
        {authError&&<div style={{background:"#fce8e8",color:"#c62828",borderRadius:8,padding:"9px 12px",marginBottom:12,fontSize:13}}>⚠️ {authError}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <label style={{fontSize:13,fontWeight:"bold"}}>Email
            <input value={loginForm.email} onChange={e=>setLoginForm(f=>({...f,email:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleLogin()} type="email" placeholder="tu@email.com" style={{display:"block",width:"100%",marginTop:4,padding:"10px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:14,boxSizing:"border-box"}}/>
          </label>
          <label style={{fontSize:13,fontWeight:"bold"}}>Contraseña
            <input value={loginForm.password} onChange={e=>setLoginForm(f=>({...f,password:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleLogin()} type="password" placeholder="••••••••" style={{display:"block",width:"100%",marginTop:4,padding:"10px 12px",borderRadius:8,border:"1px solid #ddd",fontSize:14,boxSizing:"border-box"}}/>
          </label>
          <button onClick={handleLogin} disabled={authLoading} style={{background:C.rojo,color:"#fff",border:"none",borderRadius:8,padding:"13px",fontWeight:"bold",fontSize:15,cursor:"pointer",opacity:authLoading?.7:1}}>
            {authLoading?"Ingresando...":"Ingresar →"}
          </button>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════
  // APP
  // ══════════════════════════════════════════════════════════════
  return (
    <div style={{fontFamily:"'Georgia',serif",minHeight:"100vh",background:C.crema,color:C.texto}}>
      <header style={{background:C.rojo,color:"#fff",padding:"0 18px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,boxShadow:"0 2px 10px rgba(0,0,0,.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <span style={{fontSize:22}}>🦅</span>
          <div>
            <div style={{fontWeight:"bold",fontSize:14,letterSpacing:1}}>VALLE TOURS CHILE</div>
            <div style={{fontSize:10,opacity:.7}}>SOFTWARE DE GESTIÓN</div>
          </div>
          {DEMO&&<span style={{background:"#f0c040",color:"#7a5c00",fontSize:10,fontWeight:"bold",padding:"2px 8px",borderRadius:10,marginLeft:4}}>DEMO</span>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {savedMsg&&<span style={{background:"#2e7d32",color:"#fff",fontSize:11,padding:"3px 10px",borderRadius:12}}>{savedMsg}</span>}
          <button onClick={()=>setModalVenta(true)} style={{background:C.oro,color:C.texto,border:"none",borderRadius:6,padding:"6px 13px",fontWeight:"bold",cursor:"pointer",fontSize:12}}>+ Venta</button>
          <button onClick={handleLogout} style={{background:"rgba(255,255,255,.15)",color:"#fff",border:"none",borderRadius:6,padding:"6px 10px",cursor:"pointer",fontSize:12}}>Salir</button>
        </div>
      </header>

      <nav style={{background:"#fff",borderBottom:"2px solid #e8ded0",display:"flex",overflowX:"auto",padding:"0 14px"}}>
        {[["dashboard","📊 Dashboard"],["ventas","🎟️ Ventas"],["pickups","🚐 Pickups"],["horarios","🗓️ Horarios"],["reportes","📈 Reportes"],["ia","🤖 IA"]].map(([k,label])=>(
          <button key={k} onClick={()=>setTab(k)} style={{background:"none",border:"none",whiteSpace:"nowrap",borderBottom:tab===k?`3px solid ${C.rojo}`:"3px solid transparent",padding:"13px 15px",cursor:"pointer",fontWeight:tab===k?"bold":"normal",fontSize:12,color:tab===k?C.rojo:"#888"}}>{label}</button>
        ))}
      </nav>

      <main style={{maxWidth:1000,margin:"0 auto",padding:"22px 14px"}}>

        {/* ── DASHBOARD ── */}
        {tab==="dashboard"&&(
          <div>
            <h2 style={{fontSize:17,marginBottom:16,color:C.rojo}}>Dashboard — {fmtFull(hoy)}</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:20}}>
              {[
                {label:"Total cobrado",    val:fmtR(cobrado),   icon:"💰",border:"#2e7d32",bg:"#e6f7ec"},
                {label:"Pendiente cobro",  val:fmtR(pendiente), icon:"⏳",border:"#e65100",bg:"#fff8e7"},
                {label:"Descuentos dados", val:fmtR(descTotal), icon:"🏷️",border:"#1565c0",bg:"#e8f4fd"},
                {label:"Ventas hoy",       val:hoyVentas.length,icon:"📅",border:C.rojo,   bg:"#f5ede8"},
                {label:"Pickups hoy",      val:hoyVentas.filter(v=>v.hotel).length,icon:"🚐",border:"#6a1b9a",bg:"#f3e5f5"},
              ].map(k=>(
                <div key={k.label} style={{background:k.bg,borderRadius:10,padding:"13px 12px",borderLeft:`4px solid ${k.border}`}}>
                  <div style={{fontSize:20}}>{k.icon}</div>
                  <div style={{fontSize:18,fontWeight:"bold",margin:"5px 0 2px",color:k.border}}>{k.val}</div>
                  <div style={{fontSize:10,color:"#666"}}>{k.label}</div>
                </div>
              ))}
            </div>

            {/* Ventas hoy */}
            <h3 style={{fontSize:14,marginBottom:10,color:C.rojo}}>Ventas de hoy ({hoyVentas.length})</h3>
            {hoyVentas.length===0?<div style={{color:"#aaa",fontSize:13,marginBottom:18}}>Sin ventas hoy.</div>:
              hoyVentas.map(v=>(
                <div key={v.id} style={{background:"#fff",borderRadius:9,padding:"10px 13px",display:"flex",alignItems:"flex-start",gap:10,marginBottom:8,boxShadow:"0 1px 4px rgba(0,0,0,.07)",flexWrap:"wrap"}}>
                  <span style={{fontSize:22,marginTop:2}}>{v.tour_emoji}</span>
                  <div style={{flex:1,minWidth:140}}>
                    <div style={{fontWeight:"bold",fontSize:12}}>{v.tour_nombre}</div>
                    <div style={{fontSize:11,color:"#666"}}>👤 {v.cliente} · {v.pax} pax</div>
                    {v.hotel&&<div style={{fontSize:11,color:"#6a1b9a",marginTop:2}}>🏨 {v.hotel}{v.pickup_hora?` · ⏰ Pickup ${v.pickup_hora}`:""}</div>}
                    {v.hotel_direccion&&<div style={{fontSize:10,color:"#aaa"}}>📍 {v.hotel_direccion}</div>}
                    {v.descuento>0&&<div style={{fontSize:10,color:"#1565c0"}}>🏷️ Descuento: {fmtR(v.descuento)}</div>}
                  </div>
                  <div style={{textAlign:"right"}}>
                    {v.descuento>0&&<div style={{fontSize:10,color:"#ccc",textDecoration:"line-through"}}>{fmtR((v.total_base)||v.total+v.descuento)}</div>}
                    <div style={{fontWeight:"bold",fontSize:14,color:C.rojo}}>{fmtR(v.total)}</div>
                    <span style={{fontSize:10,background:v.pagado?"#e6f7ec":"#fff3e0",color:v.pagado?"#2e7d32":"#e65100",padding:"2px 7px",borderRadius:8,fontWeight:"bold"}}>{v.pagado?"✓ Pago":"⏳ Pendente"}</span>
                  </div>
                  <button onClick={()=>abrirEditar(v)} style={{background:"#f0e8e0",border:"none",borderRadius:6,padding:"5px 10px",fontSize:11,cursor:"pointer",color:C.rojo,fontWeight:"bold",alignSelf:"center"}}>✏️</button>
                </div>
              ))
            }
          </div>
        )}

        {/* ── VENTAS ── */}
        {tab==="ventas"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h2 style={{fontSize:17,margin:0,color:C.rojo}}>Todas las ventas ({ventas.length})</h2>
              <button onClick={()=>setModalVenta(true)} style={{background:C.rojo,color:"#fff",border:"none",borderRadius:6,padding:"7px 14px",fontWeight:"bold",cursor:"pointer",fontSize:12}}>+ Nueva</button>
            </div>
            {ventas.length===0?<div style={{textAlign:"center",padding:"50px 0",color:"#aaa"}}><div style={{fontSize:44}}>🎟️</div><div>Sin ventas aún.</div></div>:
              ventas.map(v=>(
                <div key={v.id} style={{background:"#fff",borderRadius:10,padding:"11px 13px",display:"flex",alignItems:"flex-start",gap:10,boxShadow:"0 1px 5px rgba(0,0,0,.07)",marginBottom:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:22,marginTop:2}}>{v.tour_emoji}</span>
                  <div style={{flex:1,minWidth:140}}>
                    <div style={{fontWeight:"bold",fontSize:12}}>{v.tour_nombre}</div>
                    <div style={{fontSize:11,color:"#666"}}>👤 {v.cliente} · {v.pax} pax · {fmtFull(v.fecha)}</div>
                    {v.hotel&&<div style={{fontSize:11,color:"#6a1b9a"}}>🏨 {v.hotel}{v.pickup_hora?` · ⏰ ${v.pickup_hora}`:""}</div>}
                    {v.hotel_direccion&&<div style={{fontSize:10,color:"#aaa"}}>📍 {v.hotel_direccion}</div>}
                    {v.descuento>0&&<div style={{fontSize:10,color:"#1565c0"}}>🏷️ {TIPOS_DESC.find(d=>d.id===v.descuento_tipo)?.label} — {fmtR(v.descuento)}{v.motivo_descuento?` · "${v.motivo_descuento}"`:""}</div>}
                    {v.notas&&<div style={{fontSize:10,color:"#bbb"}}>📝 {v.notas}</div>}
                  </div>
                  <div style={{textAlign:"right"}}>
                    {v.descuento>0&&<div style={{fontSize:10,color:"#ccc",textDecoration:"line-through"}}>{fmtR(v.total_base||v.total+v.descuento)}</div>}
                    <div style={{fontWeight:"bold",fontSize:14,color:C.rojo}}>{fmtR(v.total)}</div>
                    <span style={{fontSize:10,background:v.pagado?"#e6f7ec":"#fff3e0",color:v.pagado?"#2e7d32":"#e65100",padding:"2px 7px",borderRadius:8,fontWeight:"bold"}}>{v.pagado?"✓ Pago":"⏳ Pendente"}</span>
                  </div>
                  <button onClick={()=>abrirEditar(v)} style={{background:"#f0e8e0",border:"none",borderRadius:6,padding:"5px 10px",fontSize:11,cursor:"pointer",color:C.rojo,fontWeight:"bold",alignSelf:"center"}}>✏️</button>
                </div>
              ))
            }
          </div>
        )}

        {/* ── PICKUPS / HOJA DE RUTA ── */}
        {tab==="pickups"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
              <h2 style={{fontSize:17,margin:0,color:C.rojo}}>🚐 Hoja de ruta del conductor</h2>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <label style={{fontSize:12,color:"#888"}}>Fecha:</label>
                <input type="date" value={fechaRuta} onChange={e=>setFechaRuta(e.target.value)} style={{padding:"6px 10px",borderRadius:8,border:"1px solid #ddd",fontSize:13}}/>
              </div>
            </div>

            {pickupsDia.length===0?(
              <div style={{textAlign:"center",padding:"50px 0",color:"#aaa"}}>
                <div style={{fontSize:44}}>🚐</div>
                <div style={{marginTop:10}}>Sin pickups registrados para {fmtFull(fechaRuta)}.</div>
                <div style={{fontSize:12,marginTop:6}}>Agrega el hotel y horario al registrar o editar una venta.</div>
              </div>
            ):(
              <>
                {/* Resumen del día */}
                <div style={{background:"#f3e5f5",borderRadius:10,padding:"12px 16px",marginBottom:16,border:"1px solid #ce93d8"}}>
                  <div style={{fontWeight:"bold",fontSize:13,color:"#6a1b9a",marginBottom:4}}>📋 Resumen {fmtFull(fechaRuta)}</div>
                  <div style={{fontSize:12,color:"#555",display:"flex",gap:16,flexWrap:"wrap"}}>
                    <span>🏨 {pickupsDia.length} pickups</span>
                    <span>👥 {pickupsDia.reduce((a,v)=>a+v.pax,0)} pasajeros</span>
                    <span>🗺️ {[...new Set(pickupsDia.map(v=>v.tour_nombre))].join(", ")}</span>
                  </div>
                </div>

                {/* Agrupar por tour */}
                {[...new Set(pickupsDia.map(v=>v.tour_nombre))].map(tourNombre=>{
                  const grupo = pickupsDia.filter(v=>v.tour_nombre===tourNombre);
                  const tourData = TOURS.find(t=>t.nombre===tourNombre);
                  return (
                    <div key={tourNombre} style={{marginBottom:20}}>
                      <div style={{background:C.rojo,color:"#fff",borderRadius:"10px 10px 0 0",padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:20}}>{tourData?.emoji}</span>
                        <div>
                          <div style={{fontWeight:"bold",fontSize:13}}>{tourNombre}</div>
                          <div style={{fontSize:11,opacity:.8}}>{grupo.reduce((a,v)=>a+v.pax,0)} pasajeros · Salida {tourData?.horario}</div>
                        </div>
                      </div>
                      {grupo.map((v,i)=>(
                        <div key={v.id} style={{background:"#fff",borderLeft:"4px solid #6a1b9a",padding:"12px 14px",borderBottom:i<grupo.length-1?"1px solid #f0e8f8":"none",display:"flex",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
                          {/* Número de parada */}
                          <div style={{background:"#6a1b9a",color:"#fff",borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:"bold",flexShrink:0}}>
                            {i+1}
                          </div>
                          <div style={{flex:1,minWidth:160}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                              <span style={{fontWeight:"bold",fontSize:14,color:"#6a1b9a"}}>⏰ {v.pickup_hora||"Sin horario"}</span>
                              <span style={{fontSize:12,color:"#555"}}>👤 {v.cliente} · {v.pax} {v.pax===1?"pasajero":"pasajeros"}</span>
                            </div>
                            <div style={{fontWeight:"bold",fontSize:13,color:C.texto}}>🏨 {v.hotel||"Hotel no especificado"}</div>
                            {v.hotel_direccion&&<div style={{fontSize:12,color:"#888",marginTop:2}}>📍 {v.hotel_direccion}</div>}
                            {v.notas&&<div style={{fontSize:11,color:"#aaa",marginTop:2,fontStyle:"italic"}}>💬 {v.notas}</div>}
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            <span style={{fontSize:10,background:v.pagado?"#e6f7ec":"#fff3e0",color:v.pagado?"#2e7d32":"#e65100",padding:"3px 9px",borderRadius:10,fontWeight:"bold"}}>{v.pagado?"✓ Pago":"⏳ Pendente"}</span>
                          </div>
                        </div>
                      ))}
                      <div style={{background:"#f3e5f5",borderRadius:"0 0 10px 10px",padding:"8px 14px",fontSize:11,color:"#6a1b9a"}}>
                        ✓ {grupo.length} paradas · {grupo.reduce((a,v)=>a+v.pax,0)} pasajeros en total
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ── HORARIOS ── */}
        {tab==="horarios"&&(
          <div>
            <h2 style={{fontSize:17,marginBottom:14,color:C.rojo}}>Disponibilidad — próximos 7 días</h2>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",background:"#fff",borderRadius:10,overflow:"hidden",boxShadow:"0 1px 6px rgba(0,0,0,.08)"}}>
                <thead><tr style={{background:C.rojo,color:"#fff"}}>
                  <th style={{padding:"10px 12px",textAlign:"left",fontSize:11,fontWeight:"normal"}}>Paseo</th>
                  {dias7().map(f=><th key={f} style={{padding:"8px 5px",fontSize:10,fontWeight:"normal",textAlign:"center",minWidth:64}}>{fmtF(f)}{f===hoy?" 🔴":""}</th>)}
                </tr></thead>
                <tbody>{TOURS.map((t,i)=>(
                  <tr key={t.id} style={{background:i%2===0?"#fff":"#fdf8f4",borderBottom:"1px solid #f0e8e0"}}>
                    <td style={{padding:"9px 12px",fontSize:11,fontWeight:"bold"}}>{t.emoji} {t.nombre}</td>
                    {dias7().map(f=>{ const d=cuposDisp(t.id,f); const p=d/t.cuposTotal; return <td key={f} style={{padding:"7px 3px",textAlign:"center"}}><span style={{background:p>.5?"#e6f7ec":p>.2?"#fff3e0":"#fce8e8",color:p>.5?"#2e7d32":p>.2?"#e65100":"#c62828",borderRadius:5,padding:"2px 7px",fontSize:10,fontWeight:"bold"}}>{d}/{t.cuposTotal}</span></td>; })}
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── REPORTES ── */}
        {tab==="reportes"&&(
          <div>
            <h2 style={{fontSize:17,marginBottom:16,color:C.rojo}}>Reportes de temporada</h2>
            <div style={{background:"#fff",borderRadius:12,padding:"18px",marginBottom:14,boxShadow:"0 1px 6px rgba(0,0,0,.08)"}}>
              <h3 style={{fontSize:13,marginBottom:13,color:C.rojo}}>Ingresos últimos 6 meses</h3>
              <div style={{display:"flex",alignItems:"flex-end",gap:8,height:140}}>
                {ventasPorMes.map(m=>{ const h=Math.max((m.total/maxMes)*120,m.total>0?6:0); const [,mo]=m.mes.split("-"); const ms=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]; return (
                  <div key={m.mes} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                    <div style={{fontSize:9,color:C.rojo,fontWeight:"bold"}}>{m.total>0?fmtR(m.total):""}</div>
                    <div style={{width:"100%",height:h,background:C.rojo,borderRadius:"4px 4px 0 0",opacity:m.total>0?1:.15}}/>
                    <div style={{fontSize:9,color:"#888"}}>{ms[+mo-1]}</div>
                    <div style={{fontSize:9,color:"#bbb"}}>{m.count}v</div>
                  </div>
                );})}
              </div>
            </div>
            <div style={{background:"#fff",borderRadius:12,padding:"18px",marginBottom:14,boxShadow:"0 1px 6px rgba(0,0,0,.08)"}}>
              <h3 style={{fontSize:13,marginBottom:12,color:C.rojo}}>Ranking por ingresos</h3>
              {porTour.filter(t=>t.ingresos>0).length===0?<div style={{color:"#aaa",fontSize:12}}>Sin ventas aún.</div>:
                porTour.filter(t=>t.ingresos>0).map((t,i)=>{ const mx=porTour[0].ingresos||1; return (
                  <div key={t.id} style={{marginBottom:9}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:2}}>
                      <span>{i+1}. {t.emoji} {t.nombre}</span>
                      <span style={{fontWeight:"bold",color:C.rojo}}>{fmtR(t.ingresos)} · {t.pax} pax</span>
                    </div>
                    <div style={{background:"#f0e8e0",borderRadius:4,height:7}}>
                      <div style={{background:C.rojo,width:`${(t.ingresos/mx)*100}%`,height:7,borderRadius:4}}/>
                    </div>
                  </div>
                );})}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10}}>
              {[
                {label:"Total facturado",  val:fmtR(cobrado+pendiente), icon:"📋"},
                {label:"Total cobrado",    val:fmtR(cobrado),           icon:"✅"},
                {label:"Pendiente cobro",  val:fmtR(pendiente),         icon:"⏳"},
                {label:"Descuentos dados", val:fmtR(descTotal),         icon:"🏷️"},
                {label:"Ticket promedio",  val:ventas.length>0?fmtR(Math.round((cobrado+pendiente)/ventas.length)):"R$ 0", icon:"📊"},
              ].map(k=>(
                <div key={k.label} style={{background:"#fff",borderRadius:10,padding:"13px",boxShadow:"0 1px 5px rgba(0,0,0,.07)",textAlign:"center"}}>
                  <div style={{fontSize:22}}>{k.icon}</div>
                  <div style={{fontWeight:"bold",fontSize:15,color:C.rojo,margin:"5px 0 3px"}}>{k.val}</div>
                  <div style={{fontSize:10,color:"#888"}}>{k.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── IA ── */}
        {tab==="ia"&&(
          <div>
            <h2 style={{fontSize:17,marginBottom:4,color:C.rojo}}>Asistente IA</h2>
            <p style={{color:"#888",fontSize:12,marginBottom:13}}>Accede a ventas, pickups y disponibilidad en tiempo real.</p>
            <div style={{background:"#fff",borderRadius:12,boxShadow:"0 1px 8px rgba(0,0,0,.08)",overflow:"hidden"}}>
              <div style={{height:320,overflowY:"auto",padding:"13px",display:"flex",flexDirection:"column",gap:8}}>
                {chatMsgs.map((m,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                    <div style={{maxWidth:"80%",padding:"9px 12px",borderRadius:m.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",background:m.role==="user"?C.rojo:"#f5ede8",color:m.role==="user"?"#fff":C.texto,fontSize:13,lineHeight:1.5}}>{m.text}</div>
                  </div>
                ))}
                {chatLoading&&<div style={{display:"flex"}}><div style={{background:"#f5ede8",borderRadius:"12px 12px 12px 2px",padding:"9px 14px",fontSize:16,letterSpacing:4}}>• • •</div></div>}
              </div>
              <div style={{borderTop:"1px solid #f0e8e0",padding:"9px 13px",display:"flex",gap:7}}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&enviarChat()} placeholder="Ej: ¿Qué pickups tengo mañana?" style={{flex:1,border:"1px solid #ddd",borderRadius:8,padding:"8px 11px",fontSize:13,outline:"none"}}/>
                <button onClick={enviarChat} disabled={chatLoading||!chatInput.trim()} style={{background:C.rojo,color:"#fff",border:"none",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontWeight:"bold",opacity:chatLoading?.5:1}}>→</button>
              </div>
            </div>
            <div style={{marginTop:8,display:"flex",gap:7,flexWrap:"wrap"}}>
              {["¿Qué pickups tengo hoy?","¿Cuánto vendí esta semana?","¿Qué tour tiene más cupos mañana?","Resume ventas pendientes"].map(s=>(
                <button key={s} onClick={()=>setChatInput(s)} style={{background:"#f5ede8",border:"none",borderRadius:20,padding:"5px 11px",fontSize:11,cursor:"pointer",color:C.rojo}}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ══════════ MODAL NUEVA VENTA ══════════ */}
      {modalVenta&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:12}}>
          <div style={{background:"#fff",borderRadius:14,padding:"22px 18px",width:"100%",maxWidth:450,boxShadow:"0 10px 40px rgba(0,0,0,.25)",maxHeight:"93vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h3 style={{margin:0,fontSize:16,color:C.rojo}}>🎟️ Nueva Venta</h3>
              <button onClick={()=>{setModalVenta(false);setForm(formInit);setHotelSugg([]);}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#aaa"}}>×</button>
            </div>
            {formError&&<div style={{background:"#fce8e8",color:"#c62828",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:12}}>⚠️ {formError}</div>}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>

              {/* Tour */}
              <label style={{fontSize:12,fontWeight:"bold"}}>Tour *
                <select value={form.tourId} onChange={e=>updateForm({tourId:e.target.value})} style={{display:"block",width:"100%",marginTop:3,padding:"8px 10px",borderRadius:8,border:"1px solid #ddd",fontSize:12}}>
                  <option value="">— Selecciona —</option>
                  {Object.entries(TIPOS).map(([tipo,label])=>(
                    <optgroup key={tipo} label={label}>
                      {TOURS.filter(t=>t.tipo===tipo).map(t=><option key={t.id} value={t.id}>{t.emoji} {t.nombre} — R${t.precio}/pax</option>)}
                    </optgroup>
                  ))}
                </select>
              </label>

              {/* Fecha + Pax */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <label style={{fontSize:12,fontWeight:"bold"}}>Fecha *
                  <input type="date" value={form.fecha} onChange={e=>updateForm({fecha:e.target.value})} style={{display:"block",width:"100%",marginTop:3,padding:"8px 10px",borderRadius:8,border:"1px solid #ddd",fontSize:12,boxSizing:"border-box"}}/>
                </label>
                <label style={{fontSize:12,fontWeight:"bold"}}>Pasajeros
                  <input type="number" min={1} max={50} value={form.pax} onChange={e=>updateForm({pax:e.target.value})} style={{display:"block",width:"100%",marginTop:3,padding:"8px 10px",borderRadius:8,border:"1px solid #ddd",fontSize:12,boxSizing:"border-box"}}/>
                </label>
              </div>

              {form.tourId&&form.fecha&&(
                <div style={{background:"#f5ede8",borderRadius:8,padding:"6px 11px",fontSize:11,color:C.rojo,fontWeight:"bold"}}>
                  Disponibles: {cuposDisp(+form.tourId,form.fecha)} de {TOURS.find(t=>t.id===+form.tourId)?.cuposTotal} cupos
                </div>
              )}

              {/* Cliente */}
              <label style={{fontSize:12,fontWeight:"bold"}}>Cliente *
                <input value={form.cliente} onChange={e=>updateForm({cliente:e.target.value})} placeholder="Nombre del cliente" style={{display:"block",width:"100%",marginTop:3,padding:"8px 10px",borderRadius:8,border:"1px solid #ddd",fontSize:12,boxSizing:"border-box"}}/>
              </label>

              {/* ── HOTEL & PICKUP ── */}
              <div style={{background:"#f3e5f5",borderRadius:10,padding:"12px",border:"1px solid #ce93d8"}}>
                <div style={{fontSize:12,fontWeight:"bold",color:"#6a1b9a",marginBottom:9}}>🏨 Hotel & Pickup</div>
                <div style={{position:"relative",marginBottom:8}}>
                  <label style={{fontSize:11,fontWeight:"bold",color:"#555"}}>Nombre del hotel
                    <input value={form.hotel} onChange={e=>onHotelChange(e.target.value)} placeholder="Ej: Hotel W Santiago" style={{display:"block",width:"100%",marginTop:3,padding:"8px 10px",borderRadius:8,border:"1px solid #ce93d8",fontSize:12,boxSizing:"border-box"}}/>
                  </label>
                  {hotelSugg.length>0&&(
                    <div style={{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1px solid #ce93d8",borderRadius:8,zIndex:10,boxShadow:"0 4px 12px rgba(0,0,0,.1)"}}>
                      {hotelSugg.map(h=>(
                        <div key={h} onClick={()=>{updateForm({hotel:h});setHotelSugg([]);}} style={{padding:"8px 12px",fontSize:12,cursor:"pointer",borderBottom:"1px solid #f0e0f8"}} onMouseOver={e=>e.target.style.background="#f3e5f5"} onMouseOut={e=>e.target.style.background="#fff"}>
                          🏨 {h}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <label style={{fontSize:11,fontWeight:"bold",color:"#555",display:"block",marginBottom:8}}>Dirección exacta
                  <input value={form.hotelDireccion} onChange={e=>updateForm({hotelDireccion:e.target.value})} placeholder="Ej: Isidora Goyenechea 3000, Las Condes" style={{display:"block",width:"100%",marginTop:3,padding:"8px 10px",borderRadius:8,border:"1px solid #ce93d8",fontSize:12,boxSizing:"border-box"}}/>
                </label>
                <label style={{fontSize:11,fontWeight:"bold",color:"#555"}}>Horario de pickup
                  <input type="time" value={form.pickupHora} onChange={e=>updateForm({pickupHora:e.target.value})} style={{display:"block",width:"100%",marginTop:3,padding:"8px 10px",borderRadius:8,border:"1px solid #ce93d8",fontSize:13,boxSizing:"border-box"}}/>
                </label>
                {form.tourId&&<div style={{fontSize:10,color:"#9c27b0",marginTop:6}}>⏱ Salida del tour: {TOURS.find(t=>t.id===+form.tourId)?.horario}</div>}
              </div>

              {/* ── DESCUENTO ── */}
              {form.tourId&&(
                <div style={{background:"#f0f8ff",borderRadius:10,padding:"12px",border:"1px solid #d0e8f8"}}>
                  <div style={{fontSize:12,fontWeight:"bold",color:"#1565c0",marginBottom:9}}>🏷️ Descuento (opcional)</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:9}}>
                    {TIPOS_DESC.map(d=>(
                      <button key={d.id} onClick={()=>updateForm({descuentoTipo:d.id,descuentoMonto:0,descuentoPct:0,editandoTotal:false})} style={{background:form.descuentoTipo===d.id?"#1565c0":"#fff",color:form.descuentoTipo===d.id?"#fff":"#555",border:"1px solid #c0d8f0",borderRadius:20,padding:"4px 9px",fontSize:10,cursor:"pointer",fontWeight:form.descuentoTipo===d.id?"bold":"normal"}}>
                        {d.icon} {d.label}
                      </button>
                    ))}
                  </div>
                  {form.descuentoTipo!=="ninguno"&&(
                    <>
                      <input value={form.motivo} onChange={e=>updateForm({motivo:e.target.value})} placeholder="Descripción (opcional)" style={{width:"100%",marginBottom:8,padding:"7px 10px",borderRadius:7,border:"1px solid #c0d8f0",fontSize:11,boxSizing:"border-box"}}/>
                      <div style={{display:"flex",gap:6,marginBottom:8}}>
                        <button onClick={()=>updateForm({usarPct:false,editandoTotal:false,descuentoMonto:0})} style={{flex:1,background:!form.usarPct&&!form.editandoTotal?"#1565c0":"#fff",color:!form.usarPct&&!form.editandoTotal?"#fff":"#555",border:"1px solid #c0d8f0",borderRadius:7,padding:"6px",fontSize:11,cursor:"pointer"}}>R$ Fijo</button>
                        <button onClick={()=>updateForm({usarPct:true,editandoTotal:false,descuentoPct:0})} style={{flex:1,background:form.usarPct&&!form.editandoTotal?"#1565c0":"#fff",color:form.usarPct&&!form.editandoTotal?"#fff":"#555",border:"1px solid #c0d8f0",borderRadius:7,padding:"6px",fontSize:11,cursor:"pointer"}}>% Pct.</button>
                        <button onClick={()=>updateForm({editandoTotal:true,usarPct:false,descuentoMonto:0,descuentoPct:0,totalFinal:form.totalBase})} style={{flex:1,background:form.editandoTotal?"#1565c0":"#fff",color:form.editandoTotal?"#fff":"#555",border:"1px solid #c0d8f0",borderRadius:7,padding:"6px",fontSize:11,cursor:"pointer"}}>✏️ Total libre</button>
                      </div>
                      {!form.editandoTotal&&!form.usarPct&&<input type="number" min={0} value={form.descuentoMonto} onChange={e=>updateForm({descuentoMonto:e.target.value})} placeholder="Monto R$" style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #c0d8f0",fontSize:13,boxSizing:"border-box"}}/>}
                      {!form.editandoTotal&&form.usarPct&&<input type="number" min={0} max={100} value={form.descuentoPct} onChange={e=>updateForm({descuentoPct:e.target.value})} placeholder="%" style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"1px solid #c0d8f0",fontSize:13,boxSizing:"border-box"}}/>}
                      {form.editandoTotal&&<input type="number" min={0} value={form.totalFinal} onChange={e=>setForm(f=>({...f,totalFinal:e.target.value}))} style={{width:"100%",padding:"7px 10px",borderRadius:7,border:"2px solid #1565c0",fontSize:14,fontWeight:"bold",boxSizing:"border-box"}}/>}
                    </>
                  )}
                </div>
              )}

              {/* Resumen precio */}
              {form.tourId&&(()=>{
                const {base,final}=calcTotal(form.tourId,form.pax,form.descuentoMonto,form.descuentoPct,form.usarPct);
                const totalM=form.editandoTotal?+form.totalFinal:final;
                const descM=base-totalM;
                return (
                  <div style={{background:"#f5ede8",borderRadius:10,padding:"11px 14px",border:`2px solid ${C.rojo}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#888",marginBottom:3}}>
                      <span>Base ({form.pax} × R${TOURS.find(t=>t.id===+form.tourId)?.precio})</span><span>{fmtR(base)}</span>
                    </div>
                    {descM>0&&<div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#1565c0",marginBottom:3}}><span>🏷️ Descuento</span><span>− {fmtR(descM)}</span></div>}
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:"bold",color:C.rojo,borderTop:"1px solid #e8d0c0",paddingTop:6}}>
                      <span>TOTAL</span><span>{fmtR(totalM)}</span>
                    </div>
                  </div>
                );
              })()}

              <label style={{fontSize:12,display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <input type="checkbox" checked={form.pagado} onChange={e=>updateForm({pagado:e.target.checked})}/>
                Marcar como pagado
              </label>
              <label style={{fontSize:12,fontWeight:"bold"}}>Notas
                <textarea value={form.notas} onChange={e=>updateForm({notas:e.target.value})} placeholder="Observaciones adicionales..." style={{display:"block",width:"100%",marginTop:3,padding:"8px 10px",borderRadius:8,border:"1px solid #ddd",fontSize:12,resize:"vertical",minHeight:48,boxSizing:"border-box"}}/>
              </label>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{setModalVenta(false);setForm(formInit);setHotelSugg([]);}} style={{flex:1,background:"#f0e8e0",border:"none",borderRadius:8,padding:"10px",cursor:"pointer",fontWeight:"bold",fontSize:13}}>Cancelar</button>
                <button onClick={registrarVenta} style={{flex:2,background:C.rojo,color:"#fff",border:"none",borderRadius:8,padding:"10px",cursor:"pointer",fontWeight:"bold",fontSize:13}}>✓ Registrar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODAL EDITAR VENTA ══════════ */}
      {modalEditar&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:12}}>
          <div style={{background:"#fff",borderRadius:14,padding:"22px 18px",width:"100%",maxWidth:420,boxShadow:"0 10px 40px rgba(0,0,0,.25)",maxHeight:"92vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h3 style={{margin:0,fontSize:16,color:C.rojo}}>✏️ Editar Venta</h3>
              <button onClick={()=>setModalEditar(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#aaa"}}>×</button>
            </div>
            <div style={{background:"#f5ede8",borderRadius:9,padding:"10px 12px",marginBottom:14,fontSize:12}}>
              <strong>{modalEditar.tour_emoji} {modalEditar.tour_nombre}</strong><br/>
              <span style={{color:"#888"}}>👤 {modalEditar.cliente} · {modalEditar.pax} pax · {fmtFull(modalEditar.fecha)}</span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:11}}>

              {/* Hotel & Pickup en edición */}
              <div style={{background:"#f3e5f5",borderRadius:10,padding:"12px",border:"1px solid #ce93d8"}}>
                <div style={{fontSize:12,fontWeight:"bold",color:"#6a1b9a",marginBottom:9}}>🏨 Hotel & Pickup</div>
                <label style={{fontSize:11,fontWeight:"bold",color:"#555",display:"block",marginBottom:8}}>Nombre del hotel
                  <input value={editForm.hotel} onChange={e=>setEditForm(f=>({...f,hotel:e.target.value}))} placeholder="Ej: Hotel W Santiago" style={{display:"block",width:"100%",marginTop:3,padding:"8px 10px",borderRadius:8,border:"1px solid #ce93d8",fontSize:12,boxSizing:"border-box"}}/>
                </label>
                <label style={{fontSize:11,fontWeight:"bold",color:"#555",display:"block",marginBottom:8}}>Dirección exacta
                  <input value={editForm.hotel_direccion} onChange={e=>setEditForm(f=>({...f,hotel_direccion:e.target.value}))} placeholder="Ej: Isidora Goyenechea 3000" style={{display:"block",width:"100%",marginTop:3,padding:"8px 10px",borderRadius:8,border:"1px solid #ce93d8",fontSize:12,boxSizing:"border-box"}}/>
                </label>
                <label style={{fontSize:11,fontWeight:"bold",color:"#555"}}>Horario de pickup
                  <input type="time" value={editForm.pickup_hora} onChange={e=>setEditForm(f=>({...f,pickup_hora:e.target.value}))} style={{display:"block",width:"100%",marginTop:3,padding:"8px 10px",borderRadius:8,border:"1px solid #ce93d8",fontSize:13,boxSizing:"border-box"}}/>
                </label>
              </div>

              <label style={{fontSize:12,fontWeight:"bold"}}>💰 Total a cobrar (R$)
                <input type="number" min={0} value={editForm.total} onChange={e=>setEditForm(f=>({...f,total:e.target.value}))} style={{display:"block",width:"100%",marginTop:3,padding:"9px 11px",borderRadius:8,border:`2px solid ${C.rojo}`,fontSize:16,fontWeight:"bold",color:C.rojo,boxSizing:"border-box"}}/>
              </label>
              <label style={{fontSize:12,fontWeight:"bold"}}>🏷️ Descuento (R$)
                <input type="number" min={0} value={editForm.descuento} onChange={e=>setEditForm(f=>({...f,descuento:e.target.value}))} style={{display:"block",width:"100%",marginTop:3,padding:"8px 10px",borderRadius:8,border:"1px solid #c0d8f0",fontSize:13,boxSizing:"border-box"}}/>
              </label>
              <label style={{fontSize:12,fontWeight:"bold"}}>Motivo descuento
                <select value={editForm.descuento_tipo} onChange={e=>setEditForm(f=>({...f,descuento_tipo:e.target.value}))} style={{display:"block",width:"100%",marginTop:3,padding:"8px 10px",borderRadius:8,border:"1px solid #ddd",fontSize:12}}>
                  {TIPOS_DESC.map(d=><option key={d.id} value={d.id}>{d.icon} {d.label}</option>)}
                </select>
              </label>
              <input value={editForm.motivo_descuento} onChange={e=>setEditForm(f=>({...f,motivo_descuento:e.target.value}))} placeholder="Descripción del descuento..." style={{padding:"8px 10px",borderRadius:8,border:"1px solid #ddd",fontSize:12,boxSizing:"border-box"}}/>
              <label style={{fontSize:12,display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <input type="checkbox" checked={editForm.pagado} onChange={e=>setEditForm(f=>({...f,pagado:e.target.checked}))}/>
                Marcar como pagado
              </label>
              <label style={{fontSize:12,fontWeight:"bold"}}>Notas
                <textarea value={editForm.notas} onChange={e=>setEditForm(f=>({...f,notas:e.target.value}))} style={{display:"block",width:"100%",marginTop:3,padding:"8px 10px",borderRadius:8,border:"1px solid #ddd",fontSize:12,resize:"vertical",minHeight:48,boxSizing:"border-box"}}/>
              </label>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setModalEditar(null)} style={{flex:1,background:"#f0e8e0",border:"none",borderRadius:8,padding:"10px",cursor:"pointer",fontWeight:"bold",fontSize:13}}>Cancelar</button>
                <button onClick={guardarEdicion} style={{flex:2,background:C.rojo,color:"#fff",border:"none",borderRadius:8,padding:"10px",cursor:"pointer",fontWeight:"bold",fontSize:13}}>✓ Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
