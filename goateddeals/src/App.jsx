import { useState, useEffect, useRef, useCallback } from "react";

/* ─── GitHub Config ──────────────────────────────────────────────── */
const GITHUB_USER  = "Hareesh2008";
const GITHUB_REPO  = "GOATDEALS2";
const GITHUB_FILE = "goateddeals/products.json";
const GITHUB_BRANCH = "main";
// ⚠️ Paste your NEW GitHub PAT token below (keep this file private / use env var for production)
const GITHUB_TOKEN = "ghp_Yq0a3ijGRFxUl7uAJR80n1EzWbpxTx43bDmH";

const GITHUB_API = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${GITHUB_FILE}`;

/* ─── GitHub helpers ─────────────────────────────────────────────── */
async function fetchProductsFromGitHub() {
  try {
    const res = await fetch(`${GITHUB_API}?ref=${GITHUB_BRANCH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" }
    });
    if (res.status === 404) return { products: [], sha: null }; // file doesn't exist yet
    if (!res.ok) throw new Error(`GitHub fetch failed: ${res.status}`);
    const data = await res.json();
    const decoded = JSON.parse(atob(data.content.replace(/\n/g, "")));
    return { products: decoded, sha: data.sha };
  } catch (e) {
    console.error("GitHub fetch error:", e);
    return { products: [], sha: null };
  }
}

async function saveProductsToGitHub(products, sha) {
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(products, null, 2))));
  const body = {
    message: `Update products — ${new Date().toISOString()}`,
    content,
    branch: GITHUB_BRANCH,
    ...(sha ? { sha } : {})
  };
  const res = await fetch(GITHUB_API, {
    method: "PUT",
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github.v3+json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "GitHub save failed");
  }
  const data = await res.json();
  return data.content.sha; // new sha
}

/* ─── Constants ─────────────────────────────────────────────────── */
const ADMIN = { user: "HAREESHTECH", pass: "0987654321" };
const DEAL_TAGS = ["🔥 Top Deal","⚡ Flash Deal","💎 Best Value","🎵 Editor's Pick","🖥️ Hot Pick","🆕 Just In","💰 Budget Pick","👑 Premium Deal"];
const EMPTY_FORM = { title:"", storeUrl:"", store:"amazon", price:"", originalPrice:"", discount:"", mainImage:"", additionalImages:["","",""], description:"", rating:"4.2", reviews:"1000", dealTag:"🔥 Top Deal" };

const DEMO_PRODUCTS = [];

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
  return <span style={{ color:"#F5A623", fontSize:"12px", letterSpacing:"1px" }}>{"★".repeat(Math.max(0,n))}{"☆".repeat(Math.max(0,5-n))}</span>;
};

const StoreBadge = ({ store }) => (
  <span style={{ fontSize:"10px", fontWeight:700, color: store==="flipkart"?"#4D8EF7":"#FF9900", background: store==="flipkart"?"rgba(40,116,240,0.12)":"rgba(255,153,0,0.12)", padding:"3px 8px", borderRadius:"5px", flexShrink:0 }}>
    {store==="flipkart"?"Flipkart":store==="amazon"?"Amazon":"Store"}
  </span>
);

const DealBadge = ({ tag }) => tag ? (
  <div style={{ display:"inline-flex", alignItems:"center", gap:"4px", background:"rgba(245,166,35,0.1)", color:"#F5A623", fontSize:"11px", fontWeight:600, padding:"3px 9px", borderRadius:"5px", border:"1px solid rgba(245,166,35,0.2)", marginBottom:"7px" }}>{tag}</div>
) : null;

/* ─── Admin form field ──────────────────────────────────────────── */
const Field = ({ label, required, error, children }) => (
  <div>
    <label style={{ display:"block", fontSize:"11px", fontWeight:700, color:"#6B6B8A", marginBottom:"5px", textTransform:"uppercase", letterSpacing:"0.7px" }}>
      {label}{required && <span style={{ color:"#F54F1E" }}> *</span>}
    </label>
    {children}
    {error && <p style={{ fontSize:"11px", color:"#F54F1E", marginTop:"4px" }}>{error}</p>}
  </div>
);

const AI = (props) => <input {...props} className="ai" style={{ ...props.style }} />;
const ASel = (props) => <select {...props} className="ai" style={{ cursor:"pointer", ...props.style }} />;
const ATa = (props) => <textarea {...props} className="ai" style={{ resize:"vertical", lineHeight:1.65, ...props.style }} />;

/* ─── Ticker bar ────────────────────────────────────────────────── */
const TICKER_TEXT = "⚡ Flash Deals Live  •  🔥 Up to 74% OFF  •  🛡️ Quality Verified  •  💰 Price Tracked Daily  •  ✅ Amazon & Flipkart  •  🐐 Goated Prices Only  •  ";
const TickerBar = () => (
  <div style={{ background:"linear-gradient(90deg,#F54F1E,#F5A623)", padding:"7px 0", overflow:"hidden", position:"relative", zIndex:200 }}>
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
          <div style={{ position:"absolute", top:10, left:10, background:"#F54F1E", color:"white", fontSize:"11px", fontWeight:700, padding:"3px 8px", borderRadius:"6px", zIndex:1 }}>{product.discount}</div>
        )}
        {product.isNew && (
          <div style={{ position:"absolute", top:10, right:10, background:"#22C55E", color:"#002200", fontSize:"10px", fontWeight:700, padding:"3px 8px", borderRadius:"6px", zIndex:1, animation:"newPulse 2s infinite" }}>NEW</div>
        )}
        <div className="hover-cta">
          <span style={{ background:"#F54F1E", color:"white", fontSize:"12px", fontWeight:700, padding:"7px 16px", borderRadius:"9px", pointerEvents:"none" }}>👁 Quick Preview</span>
        </div>
      </div>
      <div style={{ padding:"14px" }}>
        <DealBadge tag={product.dealTag} />
        <h3 style={{ fontSize:"13px", fontWeight:600, color:"#E8E8F0", lineHeight:1.45, marginBottom:"7px", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{product.title}</h3>
        <div style={{ display:"flex", alignItems:"center", gap:"4px", marginBottom:"10px" }}>
          <Stars rating={product.rating} />
          <span style={{ fontSize:"11px", color:"#5E5E78" }}>({Number(product.reviews).toLocaleString()})</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <span style={{ fontSize:"21px", fontWeight:800, color:"#F54F1E" }}>{product.price}</span>
            {product.originalPrice && <span style={{ fontSize:"11px", color:"#5E5E78", textDecoration:"line-through", marginLeft:"6px" }}>{product.originalPrice}</span>}
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

const ModalCard = ({ children, maxWidth="820px", style={} }) => (
  <div style={{ background:"#12121C", border:"1px solid #222235", borderRadius:"22px", width:`min(${maxWidth},96vw)`, maxHeight:"92vh", overflowY:"auto", position:"relative", ...style }}>{children}</div>
);

const CloseBtn = ({ onClose }) => (
  <button onClick={onClose} style={{ position:"absolute", top:14, right:14, background:"rgba(255,255,255,0.07)", border:"none", borderRadius:"50%", width:"34px", height:"34px", color:"#E8E8F0", fontSize:"18px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2, transition:"background 0.2s" }}
    onMouseEnter={e=>e.currentTarget.style.background="rgba(245,79,30,0.25)"}
    onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.07)"}>×</button>
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════════ */
export default function App() {

  /* ── GitHub state ─────────────────────────────────────────────── */
  const [ghProducts, setGhProducts] = useState([]);
  const [ghSha, setGhSha]           = useState(null);
  const [ghLoading, setGhLoading]   = useState(true);
  const [ghError, setGhError]       = useState("");

  /* ── Load products from GitHub on mount ─────────────────────── */
  useEffect(() => {
    (async () => {
      setGhLoading(true);
      const { products, sha } = await fetchProductsFromGitHub();
      setGhProducts(products);
      setGhSha(sha);
      setGhLoading(false);
    })();
  }, []);

  /* ── Combined product list: GitHub products first, then demos ── */
  const allProducts = [
    ...ghProducts,
    ...DEMO_PRODUCTS.filter(d => !ghProducts.some(g => g.id === d.id))
  ].sort((a,b) => (b.addedAt||0) - (a.addedAt||0));

  const [search, setSearch]         = useState("");
  const [selected, setSelected]     = useState(null);
  const [imgIdx, setImgIdx]         = useState(0);
  const [filter, setFilter]         = useState("all");
  const [navScrolled, setNavScrolled] = useState(false);

  // Admin
  const [showLogin, setShowLogin]   = useState(false);
  const [isAdmin, setIsAdmin]       = useState(false);
  const [showPanel, setShowPanel]   = useState(false);
  const [adminUser, setAdminUser]   = useState("");
  const [adminPass, setAdminPass]   = useState("");
  const [loginErr, setLoginErr]     = useState("");

  // Form
  const [form, setForm]             = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formMsg, setFormMsg]       = useState({ text:"", type:"" });
  const [adminTab, setAdminTab]     = useState("add");
  const [saving, setSaving]         = useState(false);

  useScrollReveal();

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const setF   = (k,v) => setForm(f=>({...f,[k]:v}));
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

  /* ── Add product → save to GitHub ──────────────────────────── */
  const handleAdd = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setFormErrors({});
    setSaving(true);
    setFormMsg({ text:"⏳ Saving to GitHub…", type:"info" });

    const np = {
      id:`c-${Date.now()}`,
      title:form.title.trim(), storeUrl:form.storeUrl.trim(),
      store:form.store, price:form.price.trim(),
      originalPrice:form.originalPrice.trim()||null,
      discount:form.discount.trim()||null,
      mainImage:form.mainImage.trim(),
      additionalImages:form.additionalImages.map(u=>u.trim()).filter(Boolean),
      description:form.description.trim(),
      rating:parseFloat(form.rating)||4.0,
      reviews:parseInt(form.reviews)||0,
      dealTag:form.dealTag, isNew:true, addedAt:Date.now()
    };

    try {
      const updatedList = [np, ...ghProducts];
      const newSha = await saveProductsToGitHub(updatedList, ghSha);
      setGhProducts(updatedList);
      setGhSha(newSha);
      setForm(EMPTY_FORM);
      setFormMsg({ text:"✅ Product saved to GitHub! Site will update in ~1–2 min after Netlify rebuilds.", type:"success" });
      setAdminTab("manage");
    } catch (err) {
      setFormMsg({ text:`❌ Failed to save: ${err.message}`, type:"error" });
    } finally {
      setSaving(false);
      setTimeout(() => setFormMsg({ text:"", type:"" }), 8000);
    }
  };

  /* ── Delete product → save updated list to GitHub ────────────── */
  const handleDelete = async (id) => {
    const isDemo = DEMO_PRODUCTS.some(p => p.id === id);
    if (isDemo) { alert("Demo products can't be deleted from GitHub. Remove them from DEMO_PRODUCTS in code."); return; }
    setSaving(true);
    try {
      const updatedList = ghProducts.filter(p => p.id !== id);
      const newSha = await saveProductsToGitHub(updatedList, ghSha);
      setGhProducts(updatedList);
      setGhSha(newSha);
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = allProducts.filter(p => {
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
  const recentDeals = allProducts.filter(p=>p.isNew).slice(0,4);
  const allManaged  = [...ghProducts, ...DEMO_PRODUCTS];
  const allImgs     = selected ? [selected.mainImage,...(selected.additionalImages||[])].filter(Boolean) : [];

  /* ── RENDER ─────────────────────────────────────────────────── */
  return (
    <div>
      <TickerBar />

      {/* NAVBAR */}
      <nav className={navScrolled?"nav-scrolled":""} style={{ padding:"0 20px", height:"64px", display:"flex", alignItems:"center", gap:"12px", background:"rgba(8,8,15,0.95)", position:"sticky", top:0, zIndex:100, backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,0.05)", transition:"background 0.3s, box-shadow 0.3s" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"9px", flexShrink:0 }}>
          <div style={{ width:"34px", height:"34px", background:"linear-gradient(135deg,#F54F1E,#F5A623)", borderRadius:"9px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", boxShadow:"0 4px 14px rgba(245,79,30,0.4)" }}>🐐</div>
          <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"20px", fontWeight:700, letterSpacing:"1.5px", whiteSpace:"nowrap" }}>GOATED<span style={{ color:"#F54F1E" }}>DEALS</span></span>
        </div>

        <div style={{ flex:1, maxWidth:"560px", margin:"0 auto", position:"relative" }}>
          <span style={{ position:"absolute", left:"13px", top:"50%", transform:"translateY(-50%)", fontSize:"15px", pointerEvents:"none", opacity:0.5 }}>🔍</span>
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search products, brands, categories..."
            style={{ width:"100%", background:"#1A1A26", border:`1.5px solid ${search?"#F54F1E":"#252535"}`, borderRadius:"10px", color:"#E8E8F0", padding:"9px 38px 9px 36px", fontSize:"13px", outline:"none", transition:"border-color 0.2s, box-shadow 0.2s", boxShadow:search?"0 0 0 3px rgba(245,79,30,0.1)":"none", fontFamily:"'DM Sans',sans-serif" }}
            onFocus={e=>{ e.target.style.borderColor="#F54F1E"; e.target.style.boxShadow="0 0 0 3px rgba(245,79,30,0.1)"; }}
            onBlur={e=>{ if(!search){ e.target.style.borderColor="#252535"; e.target.style.boxShadow="none"; } }}
          />
          {search && (
            <button onClick={()=>setSearch("")} style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", background:"rgba(245,79,30,0.15)", border:"none", borderRadius:"50%", width:"22px", height:"22px", color:"#F54F1E", fontSize:"13px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          )}
        </div>

        <div className="hide-mobile" style={{ display:"flex", alignItems:"center", gap:"12px", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", background: ghLoading?"#F5A623":"#22C55E", animation:"pulseDot 2s infinite", display:"block" }}/>
            <span style={{ color: ghLoading?"#F5A623":"#22C55E", fontWeight:600, fontSize:"12px" }}>{ghLoading?"Loading…":"Live"}</span>
          </div>
          <div style={{ background:"rgba(245,79,30,0.12)", border:"1px solid rgba(245,79,30,0.25)", borderRadius:"7px", padding:"4px 10px", color:"#F54F1E", fontSize:"11px", fontWeight:700 }}>
            {allProducts.length} Deals
          </div>
        </div>
      </nav>

      {/* COMPACT HERO STRIP */}
      <section style={{ padding:"18px 24px 16px", background:"radial-gradient(ellipse 80% 100% at 50% 0%,rgba(245,79,30,0.07) 0%,transparent 70%)", borderBottom:"1px solid rgba(255,255,255,0.04)", animation:"fadeIn 0.5s ease both" }}>
        <div style={{ maxWidth:"1240px", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
          <div>
            <h1 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"clamp(20px,3vw,28px)", fontWeight:700, letterSpacing:"1px", lineHeight:1.15, margin:0 }}>
              LOW PRICE. <span className="grad-text">ZERO COMPROMISE.</span>
            </h1>
            <p style={{ fontSize:"12px", color:"#5E5E78", marginTop:"3px" }}>Handpicked Amazon &amp; Flipkart deals — quality verified, price tracked daily.</p>
          </div>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {[
              { icon:"🏷️", val:"50–74% OFF", c:"#F54F1E", bg:"rgba(245,79,30,0.08)", border:"rgba(245,79,30,0.2)" },
              { icon:"⭐", val:"4.0+ RATED",  c:"#F5A623", bg:"rgba(245,166,35,0.08)", border:"rgba(245,166,35,0.2)" },
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

      {/* TRUST BAR */}
      <div style={{ background:"rgba(255,255,255,0.02)", borderBottom:"1px solid rgba(255,255,255,0.04)", padding:"8px 24px", overflowX:"auto" }}>
        <div style={{ maxWidth:"1240px", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center", gap:"24px", flexWrap:"nowrap", whiteSpace:"nowrap" }}>
          {["✅ Quality Verified","🛡️ Trusted Links","💸 No Hidden Charges","📦 Direct Store Purchase","🔄 Updated Daily"].map(t=>(
            <span key={t} style={{ fontSize:"12px", fontWeight:600, color:"#6B6B8A" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* GitHub loading banner */}
      {ghLoading && (
        <div style={{ background:"rgba(245,166,35,0.08)", borderBottom:"1px solid rgba(245,166,35,0.2)", padding:"10px 24px", textAlign:"center" }}>
          <span style={{ fontSize:"13px", color:"#F5A623", fontWeight:600 }}>⏳ Loading latest deals from GitHub…</span>
        </div>
      )}

      <div style={{ maxWidth:"1240px", margin:"0 auto", padding:"0 20px" }}>

        {/* RECENT TOP DEALS */}
        {recentDeals.length > 0 && (
          <section style={{ paddingTop:"52px", paddingBottom:"48px" }}>
            <div className="reveal" style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px", flexWrap:"wrap" }}>
              <div style={{ width:"4px", height:"32px", background:"linear-gradient(#F54F1E,#F5A623)", borderRadius:"2px" }} />
              <h2 className="section-title">🔥 Recent Top Deals</h2>
              <span style={{ background:"rgba(245,79,30,0.1)", color:"#F54F1E", fontSize:"11px", fontWeight:700, padding:"3px 12px", borderRadius:"50px", border:"1px solid rgba(245,79,30,0.28)", animation:"borderGlow 2s infinite" }}>JUST ADDED</span>
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
          <div className="reveal" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"22px", flexWrap:"wrap", gap:"12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" }}>
              <div style={{ width:"4px", height:"28px", background:"linear-gradient(#F54F1E,#F5A623)", borderRadius:"2px" }} />
              <h2 className="section-title" style={{ fontSize:"24px" }}>{search ? `Results for "${search}"` : "All Products"}</h2>
              <span style={{ fontSize:"13px", color:"#5E5E78", fontWeight:500 }}>({filtered.length} {filtered.length===1?"product":"products"})</span>
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
            <div style={{ textAlign:"center", padding:"70px 20px", color:"#5E5E78" }}>
              <div style={{ fontSize:"52px", marginBottom:"14px" }}>{search?"😕":"🔍"}</div>
              <p style={{ fontSize:"16px", fontWeight:600, color:"#9999B0", marginBottom:"8px" }}>
                {search ? `No products found for "${search}"` : "No products found"}
              </p>
              <p style={{ fontSize:"13px" }}>{search ? "Try a different keyword or clear the search." : "Try a different filter."}</p>
              {search && (
                <button onClick={()=>setSearch("")}
                  style={{ marginTop:"18px", background:"rgba(245,79,30,0.1)", border:"1px solid rgba(245,79,30,0.3)", borderRadius:"10px", color:"#F54F1E", fontSize:"14px", fontWeight:600, padding:"10px 24px", cursor:"pointer" }}>
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
            <p style={{ color:"#5E5E78", marginTop:"10px", fontSize:"15px" }}>We don't just list deals — we verify every single one.</p>
          </div>
          <div className="trust-g" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"16px" }}>
            {[
              { icon:"🔍", title:"Handpicked Deals",   desc:"Every product is manually reviewed for quality, reviews and real discount value." },
              { icon:"🛡️", title:"Verified Links",     desc:"All links go directly to Amazon & Flipkart — no sketchy redirects, ever." },
              { icon:"💰", title:"Price Tracked",      desc:"We track prices daily so you only see genuine discounts, not fake MRPs." },
              { icon:"⚡", title:"Updated Daily",      desc:"Fresh deals added every day — bookmark us and never miss a sale again." },
            ].map(c=>(
              <div key={c.title} className="tcard reveal">
                <div style={{ fontSize:"32px", marginBottom:"14px" }}>{c.icon}</div>
                <h3 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"18px", fontWeight:700, marginBottom:"8px", letterSpacing:"0.5px" }}>{c.title}</h3>
                <p style={{ color:"#5E5E78", fontSize:"13px", lineHeight:1.7 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid #1C1C2A", padding:"32px 24px", textAlign:"center" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"9px", marginBottom:"12px" }}>
          <div style={{ width:"28px", height:"28px", background:"linear-gradient(135deg,#F54F1E,#F5A623)", borderRadius:"7px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px" }}>🐐</div>
          <span style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"18px", fontWeight:700, letterSpacing:"1.5px" }}>GOATED<span style={{ color:"#F54F1E" }}>DEALS</span></span>
        </div>
        <p style={{ color:"#3E3E58", fontSize:"12px", lineHeight:1.8 }}>
          As an Amazon Associate & Flipkart Affiliate, we earn from qualifying purchases.<br />
          Prices and availability are subject to change. Always verify on the store before buying.
        </p>
        <p style={{ color:"#2A2A3A", fontSize:"11px", marginTop:"16px" }}>© 2025 GoatedDeals. All rights reserved.</p>
      </footer>

      {/* ADMIN GEAR BTN */}
      <button onClick={()=>{ isAdmin?setShowPanel(true):setShowLogin(true); }}
        title="Admin Panel"
        style={{ position:"fixed", bottom:"24px", right:"24px", width:"48px", height:"48px", borderRadius:"50%", background:"linear-gradient(135deg,#1C1C2A,#252535)", border:"1.5px solid #2E2E42", color:"#5E5E78", fontSize:"20px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, transition:"all 0.2s", boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor="#F54F1E"; e.currentTarget.style.color="#F54F1E"; e.currentTarget.style.boxShadow="0 4px 24px rgba(245,79,30,0.3)"; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor="#2E2E42"; e.currentTarget.style.color="#5E5E78"; e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.4)"; }}>
        ⚙
      </button>

      {/* PRODUCT MODAL */}
      {selected && (
        <Overlay onClose={()=>setSelected(null)}>
          <ModalCard>
            <CloseBtn onClose={()=>setSelected(null)} />
            <div className="mgrid" style={{ display:"flex" }}>
              {/* Left: images */}
              <div className="mleft" style={{ flex:"0 0 340px", borderRight:"1px solid #1C1C2A", padding:"24px" }}>
                <div style={{ borderRadius:"16px", overflow:"hidden", marginBottom:"12px", background:"#08080F", aspectRatio:"1" }}>
                  <img src={allImgs[imgIdx]||"https://placehold.co/400x400/12121C/F54F1E?text=Product"} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}
                    onError={e=>e.target.src="https://placehold.co/400x400/12121C/F54F1E?text=Product"} />
                </div>
                {allImgs.length > 1 && (
                  <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    {allImgs.map((img,i)=>(
                      <div key={i} onClick={()=>setImgIdx(i)}
                        style={{ width:"56px", height:"56px", borderRadius:"9px", overflow:"hidden", cursor:"pointer", border:`2px solid ${i===imgIdx?"#F54F1E":"#1C1C2A"}`, transition:"border-color 0.2s", flexShrink:0 }}>
                        <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}
                          onError={e=>e.target.src="https://placehold.co/56x56/08080F/F54F1E?text=IMG"} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Right: details */}
              <div style={{ flex:1, padding:"28px", minWidth:0 }}>
                <DealBadge tag={selected.dealTag} />
                <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
                  <StoreBadge store={selected.store} />
                  {selected.isNew && <span style={{ fontSize:"10px", fontWeight:700, background:"rgba(34,197,94,0.12)", color:"#22C55E", padding:"2px 8px", borderRadius:"5px", border:"1px solid rgba(34,197,94,0.25)" }}>NEW</span>}
                </div>
                <h2 style={{ fontSize:"18px", fontWeight:700, lineHeight:1.45, marginBottom:"12px", color:"#E8E8F0" }}>{selected.title}</h2>
                <div style={{ display:"flex", alignItems:"center", gap:"6px", marginBottom:"16px" }}>
                  <Stars rating={selected.rating} />
                  <span style={{ fontSize:"13px", color:"#5E5E78" }}>({Number(selected.reviews).toLocaleString()} reviews)</span>
                </div>
                <div style={{ display:"flex", alignItems:"baseline", gap:"10px", marginBottom:"8px" }}>
                  <span style={{ fontSize:"34px", fontWeight:900, color:"#F54F1E" }}>{selected.price}</span>
                  {selected.originalPrice && <span style={{ fontSize:"16px", color:"#5E5E78", textDecoration:"line-through" }}>{selected.originalPrice}</span>}
                  {selected.discount && <span style={{ fontSize:"14px", fontWeight:700, color:"#22C55E" }}>{selected.discount}</span>}
                </div>
                {selected.description && (
                  <p style={{ color:"#9999B0", fontSize:"13px", lineHeight:1.75, marginBottom:"24px", borderTop:"1px solid #1C1C2A", paddingTop:"16px" }}>{selected.description}</p>
                )}
                <a href={selected.storeUrl} target="_blank" rel="noopener noreferrer sponsored"
                  className={`btn-buy ${selected.store}`}>
                  {selected.store==="flipkart"?"🔵":"🟠"} Buy on {selected.store==="flipkart"?"Flipkart":"Amazon"}
                  <span style={{ fontSize:"12px", opacity:0.8 }}>→</span>
                </a>
                <p style={{ fontSize:"11px", color:"#3E3E58", marginTop:"10px", textAlign:"center" }}>
                  Affiliate link — we may earn a small commission at no extra cost to you.
                </p>
              </div>
            </div>
          </ModalCard>
        </Overlay>
      )}

      {/* LOGIN MODAL */}
      {showLogin && !isAdmin && (
        <Overlay onClose={()=>setShowLogin(false)}>
          <ModalCard maxWidth="380px">
            <CloseBtn onClose={()=>setShowLogin(false)} />
            <div style={{ padding:"36px 28px" }}>
              <div style={{ textAlign:"center", marginBottom:"24px" }}>
                <div style={{ fontSize:"32px", marginBottom:"8px" }}>🔐</div>
                <h2 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"22px", fontWeight:700, letterSpacing:"1px" }}>Admin Login</h2>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                <Field label="Username" required>
                  <AI value={adminUser} onChange={e=>setAdminUser(e.target.value)} placeholder="Username" onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
                </Field>
                <Field label="Password" required>
                  <AI type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} placeholder="Password" onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
                </Field>
                {loginErr && <p style={{ fontSize:"13px", color:"#F54F1E", textAlign:"center" }}>{loginErr}</p>}
                <button onClick={handleLogin}
                  style={{ background:"linear-gradient(135deg,#F54F1E,#F5A623)", color:"white", border:"none", borderRadius:"12px", padding:"14px", fontSize:"15px", fontWeight:700, cursor:"pointer", marginTop:"4px" }}>
                  Login →
                </button>
              </div>
            </div>
          </ModalCard>
        </Overlay>
      )}

      {/* ADMIN PANEL */}
      {showPanel && isAdmin && (
        <Overlay onClose={()=>setShowPanel(false)}>
          <ModalCard maxWidth="680px">
            <CloseBtn onClose={()=>setShowPanel(false)} />

            {/* Header */}
            <div style={{ padding:"24px 28px 0" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"20px" }}>
                <div style={{ width:"36px", height:"36px", background:"linear-gradient(135deg,#F54F1E,#F5A623)", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px" }}>⚙️</div>
                <div>
                  <h2 style={{ fontFamily:"'Rajdhani',sans-serif", fontSize:"20px", fontWeight:700, letterSpacing:"0.5px" }}>Admin Panel</h2>
                  <p style={{ fontSize:"11px", color:"#5E5E78" }}>Products sync to GitHub → auto-deploys on Netlify</p>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ display:"flex", gap:"4px", background:"#08080F", borderRadius:"10px", padding:"4px", marginBottom:"20px" }}>
                {[{k:"add",l:"➕ Add Product"},{k:"manage",l:`📦 Manage (${ghProducts.length})`}].map(t=>(
                  <button key={t.k} onClick={()=>setAdminTab(t.k)}
                    style={{ flex:1, padding:"9px", borderRadius:"7px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:700, transition:"all 0.2s",
                      background:adminTab===t.k?"linear-gradient(135deg,#F54F1E,#F5A623)":"transparent",
                      color:adminTab===t.k?"white":"#5E5E78" }}>
                    {t.l}
                  </button>
                ))}
              </div>
            </div>

            {/* ADD PRODUCT TAB */}
            {adminTab==="add" && (
              <div style={{ padding:"0 28px 28px" }}>
                <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                  <Field label="Product Title" required error={formErrors.title}>
                    <AI value={form.title} onChange={e=>setF("title",e.target.value)} placeholder="e.g. boAt Airdopes 141 Wireless Earbuds" />
                  </Field>
                  <div className="formrow" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                    <Field label="Store" required>
                      <ASel value={form.store} onChange={e=>setF("store",e.target.value)}>
                        <option value="amazon">Amazon</option>
                        <option value="flipkart">Flipkart</option>
                      </ASel>
                    </Field>
                    <Field label="Deal Tag">
                      <ASel value={form.dealTag} onChange={e=>setF("dealTag",e.target.value)}>
                        {DEAL_TAGS.map(t=><option key={t} value={t}>{t}</option>)}
                      </ASel>
                    </Field>
                  </div>
                  <Field label="Buy Link / Store URL" required error={formErrors.storeUrl}>
                    <AI value={form.storeUrl} onChange={e=>setF("storeUrl",e.target.value)} placeholder="https://www.amazon.in/dp/..." />
                  </Field>
                  <div className="formrow" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"14px" }}>
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
                    <AI value={form.mainImage} onChange={e=>setF("mainImage",e.target.value)} placeholder="https://..." />
                  </Field>
                  {[0,1,2].map(i=>(
                    <Field key={i} label={`Additional Image ${i+1}`}>
                      <AI value={form.additionalImages[i]} onChange={e=>setImg(i,e.target.value)} placeholder="https://..." />
                    </Field>
                  ))}
                  <Field label="Description" required error={formErrors.description}>
                    <ATa value={form.description} onChange={e=>setF("description",e.target.value)} rows={3} placeholder="Key features and why this is a great deal..." />
                  </Field>
                  <div className="formrow" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
                    <Field label="Rating (1–5)">
                      <AI type="number" value={form.rating} onChange={e=>setF("rating",e.target.value)} min="1" max="5" step="0.1" />
                    </Field>
                    <Field label="Reviews Count">
                      <AI type="number" value={form.reviews} onChange={e=>setF("reviews",e.target.value)} min="0" />
                    </Field>
                  </div>

                  {formMsg.text && (
                    <div style={{ background: formMsg.type==="success"?"rgba(34,197,94,0.1)": formMsg.type==="error"?"rgba(245,79,30,0.1)":"rgba(245,166,35,0.1)", border:`1px solid ${formMsg.type==="success"?"rgba(34,197,94,0.3)":formMsg.type==="error"?"rgba(245,79,30,0.3)":"rgba(245,166,35,0.3)"}`, borderRadius:"10px", padding:"12px 14px", fontSize:"13px", color: formMsg.type==="success"?"#22C55E":formMsg.type==="error"?"#F54F1E":"#F5A623" }}>
                      {formMsg.text}
                    </div>
                  )}

                  <button onClick={handleAdd} disabled={saving}
                    onMouseEnter={e=>{ if(!saving) e.currentTarget.style.transform="translateY(-2px)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; }}
                    style={{ background: saving?"#2A2A3A":"linear-gradient(135deg,#F54F1E,#F5A623)", color: saving?"#5E5E78":"white", border:"none", borderRadius:"12px", padding:"15px", fontSize:"15px", fontWeight:700, cursor: saving?"not-allowed":"pointer", transition:"transform 0.2s, box-shadow 0.2s", boxShadow: saving?"none":"0 6px 24px rgba(245,79,30,0.35)" }}>
                    {saving ? "⏳ Saving to GitHub…" : "🚀 Post Product as Top Deal"}
                  </button>
                </div>
              </div>
            )}

            {/* MANAGE PRODUCTS TAB */}
            {adminTab==="manage" && (
              <div style={{ padding:"0 28px 28px" }}>
                {ghProducts.length === 0 ? (
                  <div style={{ background:"#08080F", borderRadius:"16px", padding:"40px", textAlign:"center", border:"1px solid #1C1C2A" }}>
                    <div style={{ fontSize:"40px", marginBottom:"12px" }}>📭</div>
                    <p style={{ color:"#5E5E78", fontSize:"14px" }}>No custom products yet.</p>
                    <button onClick={()=>setAdminTab("add")} style={{ marginTop:"14px", background:"rgba(245,79,30,0.1)", border:"1px solid rgba(245,79,30,0.3)", borderRadius:"9px", padding:"9px 20px", color:"#F54F1E", fontSize:"13px", fontWeight:600, cursor:"pointer" }}>➕ Add First Product</button>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:"1px", background:"#1C1C2A", borderRadius:"16px", overflow:"hidden", border:"1px solid #1C1C2A" }}>
                    {ghProducts.map((p,i)=>(
                      <div key={p.id}
                        style={{ display:"flex", alignItems:"center", gap:"12px", background:"#12121C", padding:"14px 16px", borderBottom:i<ghProducts.length-1?"1px solid #1C1C2A":"none", transition:"background 0.18s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#181824"}
                        onMouseLeave={e=>e.currentTarget.style.background="#12121C"}>
                        <img src={p.mainImage} alt="" loading="lazy"
                          style={{ width:"52px", height:"52px", objectFit:"cover", borderRadius:"10px", flexShrink:0, border:"1px solid #1C1C2A" }}
                          onError={e=>e.target.src="https://placehold.co/52x52/08080F/F54F1E?text=IMG"} />
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:"13px", fontWeight:600, color:"#E8E8F0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginBottom:"3px" }}>{p.title}</p>
                          <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                            <span style={{ fontSize:"14px", fontWeight:800, color:"#F54F1E" }}>{p.price}</span>
                            {p.originalPrice && <span style={{ fontSize:"11px", color:"#5E5E78", textDecoration:"line-through" }}>{p.originalPrice}</span>}
                            <StoreBadge store={p.store} />
                          </div>
                        </div>
                        <div style={{ display:"flex", gap:"7px", flexShrink:0 }}>
                          <a href={p.storeUrl} target="_blank" rel="noopener noreferrer"
                            style={{ background:"rgba(245,166,35,0.1)", border:"1px solid rgba(245,166,35,0.25)", borderRadius:"8px", color:"#F5A623", fontSize:"12px", fontWeight:600, padding:"6px 11px", cursor:"pointer", textDecoration:"none" }}>🔗</a>
                          <button onClick={()=>handleDelete(p.id)} disabled={saving}
                            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(245,79,30,0.25)"; e.currentTarget.style.borderColor="rgba(245,79,30,0.6)"; }}
                            onMouseLeave={e=>{ e.currentTarget.style.background="rgba(245,79,30,0.08)"; e.currentTarget.style.borderColor="rgba(245,79,30,0.25)"; }}
                            style={{ background:"rgba(245,79,30,0.08)", border:"1px solid rgba(245,79,30,0.25)", borderRadius:"8px", color:"#F54F1E", fontSize:"12px", fontWeight:600, padding:"6px 11px", cursor: saving?"not-allowed":"pointer", transition:"all 0.18s" }}>
                            {saving?"…":"🗑 Delete"}
                          </button>
                        </div>
                      </div>
                    ))}
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
