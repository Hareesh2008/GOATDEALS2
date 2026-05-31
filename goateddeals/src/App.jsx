import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Constants ─────────────────────────────────────────────────── */
const ADMIN = { user: "HAREESHTECH", pass: "0987654321" };
const STORAGE_KEY = "goateddeals_v2";
const DEAL_TAGS = ["🔥 Top Deal","⚡ Flash Deal","💎 Best Value","🎵 Editor's Pick","🖥️ Hot Pick","🆕 Just In","💰 Budget Pick","👑 Premium Deal"];
const EMPTY_FORM = { title:"", storeUrl:"", store:"amazon", price:"", originalPrice:"", discount:"", mainImage:"", additionalImages:["","",""], description:"", rating:"4.2", reviews:"1000", dealTag:"🔥 Top Deal" };

const DEMO_PRODUCTS = [
  { id:"d1", title:"boAt Airdopes 141 Truly Wireless Earbuds 42H Playtime", price:"₹1,299", originalPrice:"₹4,990", discount:"74% off", mainImage:"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80", additionalImages:["https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80","https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80"], description:"42H total playtime, IPX4 water resistance, ENx™ HD call technology and BEAST™ mode for gaming with zero lag.", store:"amazon", storeUrl:"https://www.amazon.in", rating:4.2, reviews:12843, dealTag:"🔥 Top Deal", isNew:false, addedAt:Date.now()-172800000 },
  { id:"d2", title:"5G Smartphone 6GB RAM 128GB Storage 5000mAh Battery", price:"₹9,999", originalPrice:"₹15,999", discount:"37% off", mainImage:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80", additionalImages:["https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80","https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80"], description:"5G ready, 50MP AI triple camera, 5000mAh battery with 33W fast charge — flagship performance at half the price.", store:"flipkart", storeUrl:"https://www.flipkart.com", rating:4.1, reviews:15234, dealTag:"⚡ Flash Deal", isNew:true, addedAt:Date.now()-3600000 },
  { id:"d3", title:"Smart Watch Health Monitor SpO2 Heart Rate GPS", price:"₹1,799", originalPrice:"₹5,499", discount:"67% off", mainImage:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", additionalImages:["https://images.unsplash.com/photo-1434493651957-4ec10a8a1be8?w=600&q=80","https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80"], description:"100+ sport modes, blood oxygen & stress monitoring, 7-day battery life and always-on display.", store:"amazon", storeUrl:"https://www.amazon.in", rating:4.0, reviews:6721, dealTag:"💎 Best Value", isNew:false, addedAt:Date.now()-259200000 },
  { id:"d4", title:"Portable Bluetooth Speaker 360° Sound IPX5 Waterproof", price:"₹899", originalPrice:"₹2,999", discount:"70% off", mainImage:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80", additionalImages:["https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80","https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600&q=80"], description:"12H playtime, IPX5 waterproof, powerful 360° surround bass and TWS stereo pairing support.", store:"amazon", storeUrl:"https://www.amazon.in", rating:4.4, reviews:3190, dealTag:"🎵 Editor's Pick", isNew:false, addedAt:Date.now()-345600000 },
  { id:"d5", title:"Ultra-slim Laptop 15.6\" Intel i5 16GB RAM 512GB SSD", price:"₹34,990", originalPrice:"₹55,000", discount:"36% off", mainImage:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80", additionalImages:["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80","https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80"], description:"Full HD IPS display, 8-hour battery, backlit keyboard, Windows 11 — work and entertainment powerhouse.", store:"flipkart", storeUrl:"https://www.flipkart.com", rating:4.2, reviews:2445, dealTag:"🖥️ Hot Pick", isNew:false, addedAt:Date.now()-432000000 },
  { id:"d6", title:"65W GaN Fast Charger USB-C Multi-port PD Charger", price:"₹549", originalPrice:"₹1,999", discount:"72% off", mainImage:"https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80", additionalImages:["https://images.unsplash.com/photo-1601524909162-ae8725290836?w=600&q=80"], description:"65W Power Delivery, 3-port simultaneous charging — works with laptops, phones and tablets.", store:"amazon", storeUrl:"https://www.amazon.in", rating:4.3, reviews:5821, dealTag:"⚡ Flash Deal", isNew:true, addedAt:Date.now()-7200000 },
];

/* ─── Storage helpers ───────────────────────────────────────────── */
const STORAGE_KEY_HIDDEN = "goateddeals_hidden_demos";
const loadCustom  = () => { try { const r = localStorage.getItem(STORAGE_KEY);        return r ? JSON.parse(r) : []; } catch { return []; } };
const saveCustom  = (l) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(l)); } catch {} };
const loadHidden  = () => { try { const r = localStorage.getItem(STORAGE_KEY_HIDDEN); return r ? JSON.parse(r) : []; } catch { return []; } };
const saveHidden  = (l) => { try { localStorage.setItem(STORAGE_KEY_HIDDEN, JSON.stringify(l)); } catch {} };
const visibleDemos = () => { const h = loadHidden(); return DEMO_PRODUCTS.filter(p => !h.includes(p.id)); };

/* ─── Scroll reveal hook ────────────────────────────────────────── */
const useScrollReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const ob = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); ob.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => ob.observe(el));
    return () => ob.disconnect();
  });
};

/* ─── Tiny helpers ──────────────────────────────────────────────── */
const Stars = ({ rating }) => {
  const n = Math.round(Number(rating));
  return <span style={{ color:"#F59E0B", fontSize:"12px", letterSpacing:"1px" }}>{"★".repeat(Math.max(0,n))}{"☆".repeat(Math.max(0,5-n))}</span>;
};

const StoreBadge = ({ store }) => (
  <span style={{ fontSize:"10px", fontWeight:700, color: store==="flipkart"?"#4D8EF7":"#FF9900", background: store==="flipkart"?"rgba(40,116,240,0.12)":"rgba(255,153,0,0.12)", padding:"3px 8px", borderRadius:"5px", flexShrink:0 }}>
    {store==="flipkart"?"Flipkart":store==="amazon"?"Amazon":"Store"}
  </span>
);

const DealBadge = ({ tag }) => tag ? (
  <div style={{ display:"inline-flex", alignItems:"center", gap:"4px", background:"rgba(245,158,11,0.1)", color:"#F59E0B", fontSize:"11px", fontWeight:600, padding:"3px 9px", borderRadius:"5px", border:"1px solid rgba(245,158,11,0.2)", marginBottom:"7px" }}>{tag}</div>
) : null;

/* ─── Admin form field ──────────────────────────────────────────── */
const Field = ({ label, required, error, children }) => (
  <div>
    <label style={{ display:"block", fontSize:"11px", fontWeight:700, color:"#7068A0", marginBottom:"5px", textTransform:"uppercase", letterSpacing:"0.7px" }}>
      {label}{required && <span style={{ color:"#8B5CF6" }}> *</span>}
    </label>
    {children}
    {error && <p style={{ fontSize:"11px", color:"#8B5CF6", marginTop:"4px" }}>{error}</p>}
  </div>
);

const AI = (props) => (
  <input {...props} className="ai" style={{ ...props.style }} />
);
const ASel = (props) => (
  <select {...props} className="ai" style={{ cursor:"pointer", ...props.style }} />
);
const ATa = (props) => (
  <textarea {...props} className="ai" style={{ resize:"vertical", lineHeight:1.65, ...props.style }} />
);

/* ─── Ticker bar ────────────────────────────────────────────────── */
const TICKER_TEXT = "⚡ Flash Deals Live  •  🔥 Up to 74% OFF  •  🛡️ Quality Verified  •  💰 Price Tracked Daily  •  ✅ Amazon & Flipkart  •  🐐 Goated Prices Only  •  ";
const TickerBar = () => (
  <div style={{ background:"linear-gradient(90deg,#8B5CF6,#EC4899,#A855F7)", padding:"7px 0", overflow:"hidden", position:"relative", zIndex:200 }}>
    <div style={{ display:"flex", animation:"ticker 22s linear infinite", whiteSpace:"nowrap", willChange:"transform" }}>
      {[TICKER_TEXT, TICKER_TEXT].map((t,i) => (
        <span key={i} style={{ color:"white", fontSize:"12px", fontWeight:600, letterSpacing:"0.3px", paddingRight:"60px" }}>{t}</span>
      ))}
    </div>
  </div>
);

/* ─── Product card ──────────────────────────────────────────────── */
const ProductCard = ({ product, onClick, animDelay=0 }) => {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="pcard" onClick={onClick}
      style={{ animation:`fadeInUp 0.55s ease both`, animationDelay:`${animDelay}ms` }}>
      <div className="img-wrap">
        <img src={imgErr?"https://placehold.co/400x400/12121C/F54F1E?text=Product":product.mainImage}
          alt={product.title} loading="lazy" onError={()=>setImgErr(true)} />
        {product.discount && (
          <div style={{ position:"absolute", top:10, left:10, background:"linear-gradient(135deg,#EC4899,#F59E0B)", color:"white", fontSize:"11px", fontWeight:700, padding:"3px 8px", borderRadius:"6px", zIndex:1 }}>{product.discount}</div>
        )}
        {product.isNew && (
          <div style={{ position:"absolute", top:10, right:10, background:"linear-gradient(135deg,#06B6D4,#22C55E)", color:"#001A1A", fontSize:"10px", fontWeight:700, padding:"3px 8px", borderRadius:"6px", zIndex:1, animation:"newPulse 2s infinite" }}>NEW</div>
        )}
        <div className="hover-cta">
          <span style={{ background:"#8B5CF6", color:"white", fontSize:"12px", fontWeight:700, padding:"7px 16px", borderRadius:"9px", pointerEvents:"none" }}>👁 Quick Preview</span>
        </div>
      </div>
      <div style={{ padding:"14px" }}>
        <DealBadge tag={product.dealTag} />
        <h3 style={{ fontSize:"13px", fontWeight:600, color:"#EDE9FF", lineHeight:1.45, marginBottom:"7px", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{product.title}</h3>
        <div style={{ display:"flex", alignItems:"center", gap:"4px", marginBottom:"10px" }}>
          <Stars rating={product.rating} />
          <span style={{ fontSize:"11px", color:"#7068A0" }}>({Number(product.reviews).toLocaleString()})</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <span style={{ fontSize:"21px", fontWeight:800, color:"#8B5CF6" }}>{product.price}</span>
            {product.originalPrice && <span style={{ fontSize:"11px", color:"#7068A0", textDecoration:"line-through", marginLeft:"6px" }}>{product.originalPrice}</span>}
          </div>
          <StoreBadge store={product.store} />
        </div>
      </div>
    </div>
  );
};

/* ─── Modal overlay ─────────────────────────────────────────────── */
const Overlay = ({ onClose, children }) => (
  <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)", zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", overflowY:"auto" }}>
    <div onClick={e=>e.stopPropagation()} style={{ animation:"scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>{children}</div>
  </div>
);

/* ─── Modal card wrapper ────────────────────────────────────────── */
const ModalCard = ({ children, maxWidth="820px", style={} }) => (
  <div style={{ background:"#0E0B1C", border:"1px solid #222235", borderRadius:"22px", width:`min(${maxWidth},96vw)`, maxHeight:"92vh", overflowY:"auto", position:"relative", ...style }}>{children}</div>
);

const CloseBtn = ({ onClose }) => (
  <button onClick={onClose} style={{ position:"absolute", top:14, right:14, background:"rgba(255,255,255,0.07)", border:"none", borderRadius:"50%", width:"34px", height:"34px", color:"#EDE9FF", fontSize:"18px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2, transition:"background 0.2s" }}
    onMouseEnter={e=>e.currentTarget.style.background="rgba(139,92,246,0.25)"}
    onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.07)"}>×</button>
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [products, setProducts] = useState(() => {
    const all = [...loadCustom(), ...visibleDemos()];
    return all.sort((a,b) => (b.addedAt||0) - (a.addedAt||0));
  });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [imgIdx, setImgIdx]     = useState(0);
  const [filter, setFilter]     = useState("all");
  const [navScrolled, setNavScrolled] = useState(false);

  // Admin
  const [showLogin, setShowLogin]   = useState(false);
  const [isAdmin, setIsAdmin]       = useState(false);
  const [showPanel, setShowPanel]   = useState(false);
  const [adminUser, setAdminUser]   = useState("");
  const [adminPass, setAdminPass]   = useState("");
  const [loginErr, setLoginErr]     = useState("");

  // Form
  const [form, setForm]         = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formMsg, setFormMsg]   = useState({ text:"", type:"" });
  const [adminTab, setAdminTab] = useState("add"); // "add" | "manage"

  useScrollReveal();

  // Navbar scroll effect
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const setF = (k,v) => setForm(f=>({...f,[k]:v}));
  const setImg = (i,v) => setForm(f=>{ const a=[...f.additionalImages]; a[i]=v; return {...f,additionalImages:a}; });

  const handleLogin = () => {
    if (adminUser===ADMIN.user && adminPass===ADMIN.pass) {
      setIsAdmin(true); setShowLogin(false); setShowPanel(true);
      setLoginErr(""); setAdminUser(""); setAdminPass("");
    } else setLoginErr("❌ Invalid credentials.");
  };

  const validate = () => {
    const e={};
    if (!form.title.trim())       e.title="Title is required";
    if (!form.storeUrl.trim())    e.storeUrl="Store link is required";
    if (!form.price.trim())       e.price="Price is required";
    if (!form.mainImage.trim())   e.mainImage="Main image URL is required";
    if (!form.description.trim()) e.description="Description is required";
    return e;
  };

  const handleAdd = () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    const np = {
      id:`c-${Date.now()}`, title:form.title.trim(), storeUrl:form.storeUrl.trim(),
      store:form.store, price:form.price.trim(), originalPrice:form.originalPrice.trim()||null,
      discount:form.discount.trim()||null, mainImage:form.mainImage.trim(),
      additionalImages:form.additionalImages.map(u=>u.trim()).filter(Boolean),
      description:form.description.trim(), rating:parseFloat(form.rating)||4.0,
      reviews:parseInt(form.reviews)||0, dealTag:form.dealTag, isNew:true, addedAt:Date.now()
    };
    const prev = loadCustom();
    const next = [np, ...prev];
    saveCustom(next);
    const combined = [...next, ...visibleDemos()];
    setProducts(combined.sort((a,b) => (b.addedAt||0) - (a.addedAt||0)));
    setForm(EMPTY_FORM);
    setFormMsg({ text:"✅ Product posted! Now live at the top.", type:"success" });
    setAdminTab("manage");
    setTimeout(() => setFormMsg({ text:"", type:"" }), 5000);
  };

  const handleDelete = (id) => {
    const isDemo = DEMO_PRODUCTS.some(p => p.id === id);
    if (isDemo) {
      const nextHidden = [...loadHidden(), id];
      saveHidden(nextHidden);
    } else {
      const next = loadCustom().filter(p => p.id !== id);
      saveCustom(next);
    }
    const combined = [...loadCustom(), ...visibleDemos()];
    setProducts(combined.sort((a,b) => (b.addedAt||0) - (a.addedAt||0)));
  };

  const handleRestoreAll = () => {
    saveHidden([]);
    const combined = [...loadCustom(), ...DEMO_PRODUCTS];
    setProducts(combined.sort((a,b) => (b.addedAt||0) - (a.addedAt||0)));
  };

  const q = search.trim().toLowerCase();
  const filtered = products.filter(p => {
    const matchFilter =
      filter==="amazon"   ? p.store==="amazon"   :
      filter==="flipkart" ? p.store==="flipkart" :
      filter==="new"      ? p.isNew              : true;
    const matchSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      (p.description||"").toLowerCase().includes(q) ||
      (p.dealTag||"").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });
  const recentDeals = products.filter(p=>p.isNew).slice(0,4);
  const customProducts = loadCustom();
  const hiddenDemoIds  = loadHidden();
  const allManaged     = [...customProducts, ...DEMO_PRODUCTS]; // full list for manage tab
  const allImgs = selected ? [selected.mainImage,...(selected.additionalImages||[])].filter(Boolean) : [];

  /* ── RENDER ─────────────────────────────────────────────────── */
  return (
    <div>
      {/* TICKER */}
      <TickerBar />

      {/* NAVBAR — with search bar built in */}
      <nav className={navScrolled?"nav-scrolled":""} style={{ padding:"0 20px", height:"64px", display:"flex", alignItems:"center", gap:"12px", background:"rgba(6,3,15,0.95)", position:"sticky", top:0, zIndex:100, backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,0.05)", transition:"background 0.3s, box-shadow 0.3s" }}>
        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:"9px", flexShrink:0 }}>
          <div style={{ width:"34px", height:"34px", background:"linear-gradient(135deg,#8B5CF6,#EC4899)", borderRadius:"9px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", boxShadow:"0 4px 14px rgba(139,92,246,0.4)" }}>🐐</div>
          <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"20px", fontWeight:700, letterSpacing:"1.5px", whiteSpace:"nowrap" }}>GOATED<span style={{ color:"#8B5CF6" }}>DEALS</span></span>
        </div>

        {/* Search bar — stretches in center */}
        <div style={{ flex:1, maxWidth:"560px", margin:"0 auto", position:"relative" }}>
          <span style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", fontSize:"15px", pointerEvents:"none", opacity:0.5 }}>🔍</span>
          <input
            type="text" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search products, brands, categories..."
            style={{ width:"100%", background:"#15103A", border:`1.5px solid ${search?"#8B5CF6":"#2A2060"}`, borderRadius:"10px", color:"#EDE9FF", padding:"9px 38px 9px 36px", fontSize:"13px", outline:"none", transition:"border-color 0.2s, box-shadow 0.2s", boxShadow:search?"0 0 0 3px rgba(139,92,246,0.1)":"none", fontFamily:"'DM Sans',sans-serif" }}
            onFocus={e=>{ e.target.style.borderColor="#8B5CF6"; e.target.style.boxShadow="0 0 0 3px rgba(139,92,246,0.1)"; }}
            onBlur={e=>{ if(!search){ e.target.style.borderColor="#2A2060"; e.target.style.boxShadow="none"; } }}
          />
          {search && (
            <button onClick={()=>setSearch("")}
              style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", background:"rgba(139,92,246,0.15)", border:"none", borderRadius:"50%", width:"22px", height:"22px", color:"#8B5CF6", fontSize:"13px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          )}
        </div>

        {/* Right info */}
        <div className="hide-mobile" style={{ display:"flex", alignItems:"center", gap:"12px", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#22C55E", animation:"pulseDot 2s infinite", display:"block" }}/>
            <span style={{ color:"#22C55E", fontWeight:600, fontSize:"12px" }}>Live</span>
          </div>
          <div style={{ background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:"7px", padding:"4px 10px", color:"#8B5CF6", fontSize:"11px", fontWeight:700 }}>
            {products.length} Deals
          </div>
        </div>
      </nav>

      {/* COMPACT HERO STRIP */}
      <section style={{ padding:"18px 24px 16px", background:"radial-gradient(ellipse 80% 100% at 50% 0%,rgba(139,92,246,0.1) 0%,rgba(236,72,153,0.04) 50%,transparent 70%)", borderBottom:"1px solid rgba(139,92,246,0.1)", animation:"fadeIn 0.5s ease both" }}>
        <div style={{ maxWidth:"1240px", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
          {/* Left: tagline */}
          <div>
            <h1 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"clamp(20px,3vw,28px)", fontWeight:700, letterSpacing:"1px", lineHeight:1.15, margin:0 }}>
              LOW PRICE. <span className="grad-text">ZERO COMPROMISE.</span>
            </h1>
            <p style={{ fontSize:"12px", color:"#7068A0", marginTop:"3px" }}>Handpicked Amazon &amp; Flipkart deals — quality verified, price tracked daily.</p>
          </div>
          {/* Right: stat pills */}
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {[
              { icon:"🏷️", val:"50–74% OFF", c:"#8B5CF6", bg:"rgba(139,92,246,0.08)", border:"rgba(139,92,246,0.2)" },
              { icon:"⭐", val:"4.0+ RATED",  c:"#F59E0B", bg:"rgba(245,158,11,0.08)", border:"rgba(245,158,11,0.2)" },
              { icon:"🔄", val:"DAILY DEALS", c:"#22C55E", bg:"rgba(34,197,94,0.08)",  border:"rgba(34,197,94,0.2)"  },
            ].map(b=>(
              <div key={b.val} style={{ background:b.bg, border:`1px solid ${b.border}`, borderRadius:"9px", padding:"6px 12px", display:"flex", alignItems:"center", gap:"6px" }}>
                <span style={{ fontSize:"14px" }}>{b.icon}</span>
                <span style={{ fontSize:"12px", fontWeight:700, color:b.c }}>{b.val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MANDATORY AFFILIATE DISCLOSURE BANNER ── */}
      <div style={{ background:"rgba(245,158,11,0.07)", borderBottom:"1px solid rgba(245,158,11,0.18)", padding:"9px 24px" }}>
        <div style={{ maxWidth:"1240px", margin:"0 auto", display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap", justifyContent:"center" }}>
          <span style={{ fontSize:"14px" }}>📢</span>
          <p style={{ fontSize:"12px", color:"#D4A017", lineHeight:1.5, textAlign:"center" }}>
            <strong style={{ color:"#F59E0B" }}>Affiliate Disclosure:</strong> As an Amazon Associate, GoatedDeals earns from qualifying purchases. We also participate in the Flipkart Affiliate Programme. Clicking product links and buying may earn us a commission — <strong style={{ color:"#F59E0B" }}>at no extra cost to you.</strong>
          </p>
        </div>
      </div>

      <div style={{ maxWidth:"1240px", margin:"0 auto", padding:"0 20px" }}>

        {/* RECENT TOP DEALS */}
        {recentDeals.length > 0 && (
          <section style={{ paddingTop:"52px", paddingBottom:"48px" }}>
            <div className="reveal" style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px", flexWrap:"wrap" }}>
              <div style={{ width:"4px", height:"32px", background:"linear-gradient(160deg,#8B5CF6,#EC4899)", borderRadius:"2px" }} />
              <h2 className="section-title">🔥 Recent Top Deals</h2>
              <span style={{ background:"rgba(139,92,246,0.1)", color:"#8B5CF6", fontSize:"11px", fontWeight:700, padding:"3px 12px", borderRadius:"50px", border:"1px solid rgba(236,72,153,0.4)", animation:"borderGlow 2s infinite", color:"#EC4899", background:"rgba(236,72,153,0.1)" }}>JUST ADDED</span>
            </div>
            <div className="pgrid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(245px,1fr))", gap:"18px" }}>
              {recentDeals.map((p,i)=>(
                <ProductCard key={p.id} product={p} animDelay={i*80} onClick={()=>{ setSelected(p); setImgIdx(0); }} />
              ))}
            </div>
          </section>
        )}

        {/* ALL PRODUCTS */}
        <section style={{ paddingBottom:"60px" }}>
          {/* Filter pills + result count */}
          <div className="reveal" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"22px", flexWrap:"wrap", gap:"12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
              <div style={{ width:"4px", height:"28px", background:"linear-gradient(160deg,#8B5CF6,#EC4899)", borderRadius:"2px" }} />
              <h2 className="section-title" style={{ fontSize:"24px" }}>{search ? `Results for "${search}"` : "All Products"}</h2>
              <span style={{ fontSize:"13px", color:"#7068A0", fontWeight:500 }}>({filtered.length} {filtered.length===1?"product":"products"})</span>
            </div>
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
              {[{k:"all",l:"All"},{k:"new",l:"🆕 New"},{k:"amazon",l:"🟠 Amazon"},{k:"flipkart",l:"🔵 Flipkart"}].map(f=>(
                <button key={f.k} className={`fpill${filter===f.k?" active":""}`} onClick={()=>setFilter(f.k)}>{f.l}</button>
              ))}
            </div>
          </div>
          {filtered.length > 0 ? (
            <div className="pgrid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(245px,1fr))", gap:"18px" }}>
              {filtered.map((p,i)=>(
                <ProductCard key={p.id} product={p} animDelay={Math.min(i*60,400)} onClick={()=>{ setSelected(p); setImgIdx(0); }} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign:"center", padding:"70px 20px", color:"#7068A0" }}>
              <div style={{ fontSize:"52px", marginBottom:"14px" }}>{search?"😕":"🔍"}</div>
              <p style={{ fontSize:"16px", fontWeight:600, color:"#9B98CE", marginBottom:"8px" }}>
                {search ? `No products found for "${search}"` : "No products found"}
              </p>
              <p style={{ fontSize:"13px" }}>{search ? "Try a different keyword or clear the search." : "Try a different filter."}</p>
              {search && (
                <button onClick={()=>setSearch("")}
                  style={{ marginTop:"18px", background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:"10px", color:"#8B5CF6", fontSize:"14px", fontWeight:600, padding:"10px 24px", cursor:"pointer" }}>
                  ✕ Clear Search
                </button>
              )}
            </div>
          )}
        </section>

        {/* WHY US */}
        <section style={{ paddingBottom:"70px" }}>
          <div className="reveal" style={{ textAlign:"center", marginBottom:"36px" }}>
            <h2 className="section-title" style={{ fontSize:"32px" }}>Why GoatedDeals?</h2>
            <p style={{ color:"#7068A0", marginTop:"10px", fontSize:"15px" }}>We don't just list deals — we verify every single one.</p>
          </div>
          <div className="trust-g" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"16px" }}>
            {[
              { icon:"🎯", t:"Handpicked Daily", d:"Every product is personally reviewed before it goes live on this page.", delay:0 },
              { icon:"💰", t:"Price Tracked", d:"We compare discounts across Amazon & Flipkart so you never overpay.", delay:1 },
              { icon:"⚡", t:"Fresh Every Day", d:"Deals are updated daily — stale listings get removed automatically.", delay:2 },
              { icon:"🛡️", t:"Quality Guarantee", d:"Only 4.0+ star rated products with thousands of reviews make the cut.", delay:3 },
            ].map((b,i)=>(
              <div key={b.t} className={`tcard reveal reveal-delay-${b.delay+1}`}>
                <div style={{ fontSize:"40px", marginBottom:"14px" }}>{b.icon}</div>
                <div style={{ fontWeight:700, fontSize:"17px", marginBottom:"8px" }}>{b.t}</div>
                <div style={{ color:"#7068A0", fontSize:"13px", lineHeight:1.65 }}>{b.d}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer style={{ borderTop:"1px solid #12121C", padding:"44px 24px 32px", textAlign:"center", color:"#7068A0", fontSize:"13px", lineHeight:1.9, background:"#06030F" }}>
        <div style={{ marginBottom:"16px" }}>
          <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"24px", fontWeight:700, color:"#EDE9FF" }}>GOATED<span style={{ color:"#8B5CF6" }}>DEALS</span></span>
        </div>

        {/* Primary mandatory disclosure box */}
        <div style={{ maxWidth:"680px", margin:"0 auto 20px", background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:"12px", padding:"16px 20px" }}>
          <p style={{ fontSize:"13px", color:"#D4A017", lineHeight:1.7 }}>
            <strong style={{ color:"#F59E0B", display:"block", marginBottom:"4px" }}>📢 Affiliate Disclosure</strong>
            <em>As an Amazon Associate, GoatedDeals earns from qualifying purchases.</em> We also participate in the Flipkart Affiliate Programme. When you click product links on this site and make a purchase, we may earn a small commission — at no additional cost to you. This helps us keep the site running and the deals coming.
          </p>
        </div>

        <p style={{ maxWidth:"600px", margin:"0 auto 10px", fontSize:"12px" }}>
          All product prices and availability are subject to change by Amazon and Flipkart at any time. GoatedDeals is not responsible for price discrepancies between this site and the respective stores.
        </p>
        <p style={{ fontSize:"12px" }}>© 2025 GoatedDeals · Built to help you shop smarter.</p>
      </footer>

      {/* MOBILE STICKY CTA */}
      <div className="mobile-cta">
        <button onClick={()=>window.scrollTo({top:400,behavior:"smooth"})} style={{ pointerEvents:"all", width:"100%", background:"linear-gradient(135deg,#8B5CF6,#EC4899)", color:"white", border:"none", borderRadius:"14px", padding:"15px", fontSize:"16px", fontWeight:700, cursor:"pointer", boxShadow:"0 8px 32px rgba(139,92,246,0.45)" }}>
          🛍 View Best Deals
        </button>
      </div>

      {/* ADMIN FAB */}
      <button onClick={()=>isAdmin?setShowPanel(true):setShowLogin(true)} title="Admin"
        onMouseEnter={e=>{ e.currentTarget.style.borderColor="#8B5CF6"; e.currentTarget.style.color="#8B5CF6"; e.currentTarget.style.boxShadow="0 0 0 4px rgba(139,92,246,0.15)"; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor="#2A2060"; e.currentTarget.style.color="#7068A0"; e.currentTarget.style.boxShadow="0 4px 24px rgba(0,0,0,0.5)"; }}
        style={{ position:"fixed", bottom:"24px", right:"24px", width:"52px", height:"52px", borderRadius:"50%", background:"#0E0B1C", border:"1.5px solid #2A2A3A", color:"#7068A0", fontSize:"22px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", zIndex:500, boxShadow:"0 4px 24px rgba(0,0,0,0.5)" }}>⚙</button>

      {/* ── PRODUCT MODAL ── */}
      {selected && (
        <Overlay onClose={()=>setSelected(null)}>
          <ModalCard>
            <CloseBtn onClose={()=>setSelected(null)} />
            <div className="mgrid" style={{ display:"flex" }}>
              <div className="mleft" style={{ flex:"0 0 50%", padding:"26px", borderRight:"1px solid #1C1C2A" }}>
                <div style={{ borderRadius:"16px", overflow:"hidden", background:"#06030F", marginBottom:"14px", aspectRatio:"1" }}>
                  <img src={allImgs[imgIdx]||"https://placehold.co/500x500/08080F/F54F1E?text=No+Image"} alt={selected.title} style={{ width:"100%", height:"100%", objectFit:"cover", transition:"opacity 0.25s" }} onError={e=>e.target.src="https://placehold.co/500x500/08080F/F54F1E?text=No+Image"} />
                </div>
                {allImgs.length>1 && (
                  <div style={{ display:"flex", gap:"9px", flexWrap:"wrap" }}>
                    {allImgs.map((img,i)=>(
                      <img key={i} src={img} alt="" loading="lazy" onClick={()=>setImgIdx(i)}
                        style={{ width:"60px", height:"60px", objectFit:"cover", borderRadius:"10px", cursor:"pointer", border:`2px solid ${i===imgIdx?"#8B5CF6":"#211A40"}`, transition:"border-color 0.2s, transform 0.2s", transform:i===imgIdx?"scale(1.05)":"scale(1)" }}
                        onError={e=>e.target.src="https://placehold.co/60x60/08080F/F54F1E?text=IMG"} />
                    ))}
                  </div>
                )}
              </div>
              <div style={{ flex:1, padding:"26px", minWidth:0 }}>
                <DealBadge tag={selected.dealTag} />
                <h3 style={{ fontSize:"17px", fontWeight:700, lineHeight:1.45, marginBottom:"12px" }}>{selected.title}</h3>
                <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"14px" }}>
                  <Stars rating={selected.rating} />
                  <span style={{ fontSize:"13px", color:"#7068A0" }}>{selected.rating} ({Number(selected.reviews).toLocaleString()} reviews)</span>
                </div>
                <div style={{ marginBottom:"16px" }}>
                  <div style={{ fontSize:"38px", fontWeight:800, color:"#8B5CF6", lineHeight:1 }}>{selected.price}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"4px" }}>
                    {selected.originalPrice && <span style={{ fontSize:"15px", color:"#7068A0", textDecoration:"line-through" }}>{selected.originalPrice}</span>}
                    {selected.discount && <span style={{ fontSize:"13px", color:"#22C55E", fontWeight:700, background:"rgba(34,197,94,0.1)", padding:"2px 8px", borderRadius:"4px" }}>You save {selected.discount}</span>}
                  </div>
                </div>
                <p style={{ fontSize:"14px", color:"#8888C8", lineHeight:1.75, marginBottom:"18px" }}>{selected.description}</p>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"22px", fontSize:"13px", background:"rgba(34,197,94,0.07)", border:"1px solid rgba(34,197,94,0.2)", borderRadius:"8px", padding:"8px 12px" }}>
                  <span style={{ color:"#22C55E" }}>✅</span>
                  <span style={{ color:"#7070B0" }}>Quality verified · Lowest price tracked · {selected.reviews?.toLocaleString()} buyers</span>
                </div>
                <a href={selected.storeUrl} target="_blank" rel="noopener noreferrer"
                  className={`btn-buy ${selected.store==="flipkart"?"flipkart":"amazon"}`}>
                  {selected.store==="flipkart"?"🔵 Buy on Flipkart":"🟠 Buy on Amazon"}
                </a>
                <div style={{ marginTop:"12px", background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.15)", borderRadius:"8px", padding:"8px 12px", display:"flex", alignItems:"flex-start", gap:"7px" }}>
                  <span style={{ fontSize:"12px", flexShrink:0, marginTop:"1px" }}>📢</span>
                  <p style={{ fontSize:"11px", color:"#B8921A", lineHeight:1.55 }}>
                    <strong style={{ color:"#D4A017" }}>Affiliate link</strong> — As an Amazon Associate / Flipkart Affiliate, we earn from qualifying purchases at no extra cost to you. Price may vary on store.
                  </p>
                </div>
              </div>
            </div>
          </ModalCard>
        </Overlay>
      )}

      {/* ── ADMIN LOGIN ── */}
      {showLogin && (
        <Overlay onClose={()=>{ setShowLogin(false); setLoginErr(""); }}>
          <ModalCard maxWidth="370px" style={{ padding:"38px" }}>
            <div style={{ textAlign:"center", marginBottom:"28px" }}>
              <div style={{ width:"56px", height:"56px", background:"linear-gradient(135deg,#8B5CF6,#EC4899)", borderRadius:"16px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px", margin:"0 auto 16px" }}>🐐</div>
              <h3 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"26px", fontWeight:700 }}>Admin Access</h3>
              <p style={{ fontSize:"13px", color:"#7068A0", marginTop:"6px" }}>Enter your credentials to manage deals</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <AI type="text" placeholder="Username" value={adminUser} onChange={e=>setAdminUser(e.target.value)} />
              <AI type="password" placeholder="Password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
              {loginErr && <p style={{ color:"#8B5CF6", fontSize:"13px" }}>{loginErr}</p>}
              <button onClick={handleLogin} style={{ background:"linear-gradient(135deg,#8B5CF6,#EC4899)", color:"white", border:"none", borderRadius:"10px", padding:"14px", fontSize:"15px", fontWeight:700, cursor:"pointer", marginTop:"4px", transition:"transform 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>Login →</button>
            </div>
          </ModalCard>
        </Overlay>
      )}

      {/* ── ADMIN PANEL ── */}
      {showPanel && isAdmin && (
        <Overlay onClose={()=>setShowPanel(false)}>
          <ModalCard maxWidth="660px">
            {/* Header */}
            <div style={{ padding:"24px 28px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ width:"38px", height:"38px", background:"linear-gradient(135deg,#8B5CF6,#EC4899)", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>⚙️</div>
                <h3 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"24px", fontWeight:700 }}>Admin Panel</h3>
              </div>
              <button onClick={()=>setShowPanel(false)} style={{ background:"none", border:"none", color:"#7068A0", fontSize:"24px", cursor:"pointer" }}>×</button>
            </div>

            {/* Stats */}
            <div style={{ padding:"18px 28px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px" }}>
                {[
                  { val:products.length, label:"Total Products", c:"#8B5CF6" },
                  { val:customProducts.length, label:"Your Deals", c:"#22C55E" },
                  { val:products.filter(p=>p.store==="flipkart").length, label:"Flipkart", c:"#4D8EF7" },
                ].map(s=>(
                  <div key={s.label} style={{ background:"#06030F", borderRadius:"12px", padding:"14px", textAlign:"center", border:"1px solid #1C1C2A" }}>
                    <div style={{ fontSize:"28px", fontWeight:800, color:s.c }}>{s.val}</div>
                    <div style={{ fontSize:"11px", color:"#7068A0", marginTop:"2px" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ padding:"0 28px", display:"flex", gap:"8px", marginBottom:"18px" }}>
              {[{k:"add",l:"➕ Add Product"},{k:"manage",l:`📋 Manage (${allManaged.length})`}].map(t=>(
                <button key={t.k} onClick={()=>setAdminTab(t.k)}
                  style={{ padding:"9px 20px", borderRadius:"10px", border:`1.5px solid ${adminTab===t.k?"#8B5CF6":"#211A40"}`, background:adminTab===t.k?"rgba(139,92,246,0.12)":"transparent", background:adminTab===t.k?"rgba(139,92,246,0.1)":"transparent", color:adminTab===t.k?"#8B5CF6":"#7068A0", fontSize:"13px", fontWeight:600, cursor:"pointer", transition:"all 0.18s" }}>{t.l}</button>
              ))}
            </div>

            {/* ADD PRODUCT FORM */}
            {adminTab==="add" && (
              <div style={{ padding:"0 28px 28px" }}>
                <div style={{ background:"#06030F", borderRadius:"16px", padding:"22px", border:"1px solid #1C1C2A" }}>
                  <h4 style={{ color:"#F59E0B", fontSize:"15px", fontWeight:700, marginBottom:"18px" }}>📦 Post New Product</h4>
                  <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>

                    <Field label="Product Title" required error={formErrors.title}>
                      <AI value={form.title} onChange={e=>setF("title",e.target.value)} placeholder="e.g. boAt Airdopes 141 Truly Wireless Earbuds" />
                    </Field>

                    <div className="formrow" style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:"10px", alignItems:"start" }}>
                      <Field label="Buy Link / Store URL" required error={formErrors.storeUrl}>
                        <AI value={form.storeUrl} onChange={e=>setF("storeUrl",e.target.value)} placeholder="https://www.amazon.in/dp/..." />
                      </Field>
                      <Field label="Store">
                        <ASel value={form.store} onChange={e=>setF("store",e.target.value)} style={{ width:"130px" }}>
                          <option value="amazon">🟠 Amazon</option>
                          <option value="flipkart">🔵 Flipkart</option>
                          <option value="other">🔗 Other</option>
                        </ASel>
                      </Field>
                    </div>

                    <div className="formrow" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px" }}>
                      <Field label="Current Price" required error={formErrors.price}>
                        <AI value={form.price} onChange={e=>setF("price",e.target.value)} placeholder="₹1,299" />
                      </Field>
                      <Field label="Original / MRP">
                        <AI value={form.originalPrice} onChange={e=>setF("originalPrice",e.target.value)} placeholder="₹4,990" />
                      </Field>
                      <Field label="Discount">
                        <AI value={form.discount} onChange={e=>setF("discount",e.target.value)} placeholder="74% off" />
                      </Field>
                    </div>

                    <Field label="Main Image URL" required error={formErrors.mainImage}>
                      <AI value={form.mainImage} onChange={e=>setF("mainImage",e.target.value)} placeholder="https://example.com/product-main.jpg" />
                      {form.mainImage && (
                        <img src={form.mainImage} alt="preview" style={{ marginTop:"8px", width:"72px", height:"72px", objectFit:"cover", borderRadius:"9px", border:"1px solid #1C1C2A" }} onError={e=>e.target.style.display="none"} />
                      )}
                    </Field>

                    <Field label="Additional Images (up to 3)">
                      <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
                        {form.additionalImages.map((img,i)=>(
                          <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                            <AI value={img} onChange={e=>setImg(i,e.target.value)} placeholder={`Extra image ${i+1} URL (optional)`} />
                            {img && <img src={img} alt="" style={{ width:"38px", height:"38px", objectFit:"cover", borderRadius:"7px", border:"1px solid #1C1C2A", flexShrink:0 }} onError={e=>e.target.style.display="none"} />}
                          </div>
                        ))}
                      </div>
                    </Field>

                    <Field label="Description" required error={formErrors.description}>
                      <ATa value={form.description} onChange={e=>setF("description",e.target.value)} placeholder="2–3 sentences highlighting key features and why it's a great deal..." rows={3} />
                    </Field>

                    <div className="formrow" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"10px" }}>
                      <Field label="Rating (1–5)">
                        <AI type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e=>setF("rating",e.target.value)} placeholder="4.2" />
                      </Field>
                      <Field label="Reviews Count">
                        <AI type="number" value={form.reviews} onChange={e=>setF("reviews",e.target.value)} placeholder="1000" />
                      </Field>
                      <Field label="Deal Tag">
                        <ASel value={form.dealTag} onChange={e=>setF("dealTag",e.target.value)}>
                          {DEAL_TAGS.map(t=><option key={t} value={t}>{t}</option>)}
                        </ASel>
                      </Field>
                    </div>

                    {formMsg.text && (
                      <div style={{ background:formMsg.type==="success"?"rgba(34,197,94,0.08)":"rgba(139,92,246,0.08)", border:`1px solid ${formMsg.type==="success"?"rgba(34,197,94,0.25)":"rgba(139,92,246,0.25)"}`, borderRadius:"10px", padding:"12px 14px", fontSize:"13px", color:formMsg.type==="success"?"#22C55E":"#8B5CF6" }}>
                        {formMsg.text}
                      </div>
                    )}

                    <button onClick={handleAdd}
                      onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                      onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}
                      style={{ background:"linear-gradient(135deg,#8B5CF6,#EC4899)", color:"white", border:"none", borderRadius:"12px", padding:"15px", fontSize:"15px", fontWeight:700, cursor:"pointer", transition:"transform 0.2s, box-shadow 0.2s", boxShadow:"0 8px 28px rgba(139,92,246,0.4)" }}>
                      🚀 Post Product as Top Deal
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MANAGE PRODUCTS */}
            {adminTab==="manage" && (
              <div style={{ padding:"0 28px 28px" }}>

                {/* Restore banner if any demos are hidden */}
                {hiddenDemoIds.length > 0 && (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:"12px", padding:"12px 16px", marginBottom:"14px" }}>
                    <span style={{ fontSize:"13px", color:"#F59E0B" }}>⚠️ {hiddenDemoIds.length} built-in product{hiddenDemoIds.length>1?"s":""} hidden</span>
                    <button onClick={handleRestoreAll}
                      style={{ background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.4)", borderRadius:"8px", color:"#F59E0B", fontSize:"12px", fontWeight:700, padding:"6px 14px", cursor:"pointer" }}>
                      ↩ Restore All
                    </button>
                  </div>
                )}

                {allManaged.length === 0 ? (
                  <div style={{ background:"#06030F", borderRadius:"16px", padding:"40px", textAlign:"center", border:"1px solid #1C1C2A" }}>
                    <div style={{ fontSize:"40px", marginBottom:"12px" }}>📭</div>
                    <p style={{ color:"#7068A0", fontSize:"14px" }}>No products yet.</p>
                    <button onClick={()=>setAdminTab("add")} style={{ marginTop:"14px", background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:"9px", padding:"9px 20px", color:"#8B5CF6", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>➕ Add First Product</button>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:"1px", background:"#211A40", borderRadius:"16px", overflow:"hidden", border:"1px solid #1C1C2A" }}>
                    {allManaged.map((p, i) => {
                      const isDemo   = DEMO_PRODUCTS.some(d => d.id === p.id);
                      const isHidden = hiddenDemoIds.includes(p.id);
                      return (
                        <div key={p.id}
                          style={{ display:"flex", alignItems:"center", gap:"12px", background: isHidden?"#0A0817":"#0E0B1C", padding:"14px 16px", borderBottom:i<allManaged.length-1?"1px solid #1C1C2A":"none", transition:"background 0.18s", opacity: isHidden ? 0.45 : 1 }}
                          onMouseEnter={e=>{ if(!isHidden) e.currentTarget.style.background="#100D22"; }}
                          onMouseLeave={e=>{ e.currentTarget.style.background=isHidden?"#0A0817":"#0E0B1C"; }}>

                          <img src={p.mainImage} alt="" loading="lazy"
                            style={{ width:"52px", height:"52px", objectFit:"cover", borderRadius:"10px", flexShrink:0, border:"1px solid #1C1C2A" }}
                            onError={e=>e.target.src="https://placehold.co/52x52/08080F/F54F1E?text=IMG"} />

                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"3px" }}>
                              {isDemo && (
                                <span style={{ fontSize:"9px", fontWeight:700, background:"rgba(100,100,180,0.15)", color:"#8888C8", border:"1px solid rgba(100,100,180,0.25)", borderRadius:"4px", padding:"1px 6px", flexShrink:0 }}>BUILT-IN</span>
                              )}
                              {isHidden && (
                                <span style={{ fontSize:"9px", fontWeight:700, background:"rgba(245,158,11,0.12)", color:"#F59E0B", border:"1px solid rgba(245,158,11,0.25)", borderRadius:"4px", padding:"1px 6px", flexShrink:0 }}>HIDDEN</span>
                              )}
                            </div>
                            <p style={{ fontSize:"13px", fontWeight:600, color:"#EDE9FF", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:"3px" }}>{p.title}</p>
                            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                              <span style={{ fontSize:"14px", fontWeight:800, color:"#8B5CF6" }}>{p.price}</span>
                              {p.originalPrice && <span style={{ fontSize:"11px", color:"#7068A0", textDecoration:"line-through" }}>{p.originalPrice}</span>}
                              <StoreBadge store={p.store} />
                            </div>
                          </div>

                          <div style={{ display:"flex", gap:"7px", flexShrink:0 }}>
                            <a href={p.storeUrl} target="_blank" rel="noopener noreferrer"
                              style={{ background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:"8px", color:"#F59E0B", fontSize:"12px", fontWeight:600, padding:"6px 11px", cursor:"pointer", textDecoration:"none" }} title="Open store">🔗</a>

                            {isHidden ? (
                              <button onClick={()=>{ const next=hiddenDemoIds.filter(id=>id!==p.id); saveHidden(next); setProducts([...loadCustom(),...visibleDemos()]); }}
                                style={{ background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:"8px", color:"#22C55E", fontSize:"12px", fontWeight:600, padding:"6px 11px", cursor:"pointer" }}>↩ Restore</button>
                            ) : (
                              <button onClick={()=>handleDelete(p.id)}
                                onMouseEnter={e=>{ e.currentTarget.style.background="rgba(139,92,246,0.25)"; e.currentTarget.style.borderColor="rgba(139,92,246,0.6)"; }}
                                onMouseLeave={e=>{ e.currentTarget.style.background="rgba(139,92,246,0.08)"; e.currentTarget.style.borderColor="rgba(139,92,246,0.25)"; }}
                                style={{ background:"rgba(139,92,246,0.08)", border:"1px solid rgba(139,92,246,0.25)", borderRadius:"8px", color:"#8B5CF6", fontSize:"12px", fontWeight:600, padding:"6px 11px", cursor:"pointer", transition:"all 0.18s" }}>🗑 Delete</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </ModalCard>
        </Overlay>
      )}
    </div>
  );
}
