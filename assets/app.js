/* =========================
   Mariscos Express 365
   app.js (FULL REWRITE)
========================= */

// ========= CONFIG =========
const CONFIG = {
  // WhatsApp needs country code
  whatsappNumber: "+12143944223",
  phoneLabel: "+1 (214) 394-4223",

  // Put your real links here later
  facebookUrl: "https://facebook.com/",
  instagramUrl: "https://instagram.com/"
};

// ========= PRODUCTS (ONLY YOUR LIST) =========
const PRODUCTS = [
  // CALAMAR
  { id:"cal_aros",   cat:"calamar",   name:"Aros de Calamar",        price:7.99, unit:"/ libra", img:"images/CalamarArosFrescos.jpg" },
  { id:"cal_pat",    cat:"calamar",   name:"Arañitas de Calamar",    price:5.99, unit:"/ libra", img:"images/calamarPatitas.jpg" },
  { id:"cal_limpio", cat:"calamar",   name:"Calamar Limpio",         price:6.50, unit:"/ libra", img:"images/calamarLimpio.jpg" },
  { id:"cal_tubos",  cat:"calamar",   name:"Tubos de Calamar",       price:7.99, unit:"/ libra", img:"images/calamarTubos.jpg" },
  { id:"cal_tenta",  cat:"calamar",   name:"Tentáculos de Calamar",  price:6.99, unit:"/ libra", img:"images/tentaculos.jpg" },

  // CAMARONES
  { id:"cam_cola",   cat:"camarones", name:"Cola de camarón (pelado y desvenado)", price:6.99, unit:"/ libra", img:"images/camaronPequeno.jpg" },
  { id:"cam_med",    cat:"camarones", name:"Camarón mediano",        price:5.99, unit:"/ libra", img:"images/camaronMediano.jpg" },
  { id:"cam_grande", cat:"camarones", name:"Camarón grande",         price:6.99, unit:"/ libra", img:"images/camaronGrande.jpg" },

  // ESPECIAL
  {
    id:"esp_mix",
    cat:"especiales",
    name:"Mix para Mariscada",
    price:25.99,
    unit:"",
    img:"images/mariscadaMix.jpg",
    note:"Incluye 1 langosta, 1 jaiba, 2 camarones medianos, 3 oz de calamar"
  }
];

// ========= UTILS =========
function money(n){ return "$" + Number(n).toFixed(2); }
function digitsOnly(s){ return (s || "").replace(/\D/g,""); }
function byId(id){ return document.getElementById(id); }
function pageName(){
  return (location.pathname.split("/").pop() || "index.html").toLowerCase();
}

// ========= CART (localStorage) =========
const CART_KEY = "me365_cart_v3";
function loadCart(){
  try{
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  }catch{ return {}; }
}
function saveCart(cartObj){ localStorage.setItem(CART_KEY, JSON.stringify(cartObj)); }
function cartCount(cartObj){ return Object.values(cartObj).reduce((sum, it) => sum + it.qty, 0); }
function cartTotal(cartObj){ return Object.values(cartObj).reduce((sum, it) => sum + it.qty * it.price, 0); }

function addToCart(id){
  const p = PRODUCTS.find(x => x.id === id);
  if(!p) return;
  const cart = loadCart();
  if(cart[id]) cart[id].qty += 1;
  else cart[id] = { id:p.id, name:p.name, price:p.price, unit:p.unit || "", qty:1 };
  saveCart(cart);
  renderCartBadge();
}
function inc(id){
  const cart = loadCart();
  if(!cart[id]) return;
  cart[id].qty += 1;
  saveCart(cart);
  renderCart();
}
function dec(id){
  const cart = loadCart();
  if(!cart[id]) return;
  cart[id].qty -= 1;
  if(cart[id].qty <= 0) delete cart[id];
  saveCart(cart);
  renderCart();
}
function rm(id){
  const cart = loadCart();
  delete cart[id];
  saveCart(cart);
  renderCart();
}
function clearCart(){
  saveCart({});
  renderCart();
}

// ========= WHATSAPP =========
function waLink(message){
  const phone = digitsOnly(CONFIG.whatsappNumber);
  if(!phone){
    alert("Falta configurar el número de WhatsApp en assets/app.js");
    return null;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function checkoutToWhatsApp(){
  const cart = loadCart();
  const items = Object.values(cart);
  if(items.length === 0){
    alert("Tu carrito está vacío.");
    return;
  }

  let total = 0;
  const lines = items.map(it => {
    const sub = it.qty * it.price;
    total += sub;
    const unit = it.unit ? ` ${it.unit}` : "";
    return `- ${it.qty} x ${it.name}${unit} (${money(it.price)}) = ${money(sub)}`;
  });

  const msg =
`Hola! Quiero hacer este pedido en Mariscos Express 365:
${lines.join("\n")}
Total: ${money(total)}

Nombre:
Para: (delivery / recoger)
Ubicacion:
`;

  const link = waLink(msg);
  if(link) window.location.href = link;
}

// ========= SOCIAL LINKS WIRING =========
function wireSocialLinks(){
  const fb = byId("fbCircle");
  const ig = byId("igCircle");
  const wa = byId("waCircle");

  if(fb && CONFIG.facebookUrl) fb.href = CONFIG.facebookUrl;
  if(ig && CONFIG.instagramUrl) ig.href = CONFIG.instagramUrl;

  // WhatsApp: default message (simple)
  if(wa){
    const msg = "Hola! Quiero hacer un pedido en Mariscos Express 365.";
    const link = waLink(msg);
    if(link) wa.href = link;
  }
}

// ========= HEADER + CART DRAWER =========
function setActiveNav(){
  const p = pageName();
  document.querySelectorAll('nav a[data-page]').forEach(a => {
    const target = a.getAttribute("data-page");
    a.classList.toggle("active", target === p);
  });
}

function injectShell(){
  const shell = byId("shell");
  if(!shell) return;

  shell.innerHTML = `
    <div class="topbar">
      <div class="container">
        <div class="row">
          <div class="pill">WhatsApp: <b id="phoneLabel"></b></div>
          <div class="pill link">Delivery en Puerto de La Libertad y alrededores</div>
        </div>
      </div>
    </div>

    <header>
      <div class="container">
        <div class="nav">
          <a class="brand" href="index.html" data-link>
            <img src="images/logo.jpg" alt="Logo de Mariscos Express 365" onerror="this.style.display='none'">
            <div class="name">
              <span>Mariscos Express 365</span>
              <span>Distribuidora local</span>
            </div>
          </a>

          <nav aria-label="Menú">
            <ul>
              <li><a href="index.html" data-page="index.html" data-link>Inicio</a></li>
              <li><a href="products.html" data-page="products.html" data-link>Productos</a></li>
              <li><a href="locations.html" data-page="locations.html" data-link>Puntos de venta</a></li>
            </ul>
          </nav>

          <div class="actions">
            <button class="btn primary cartBtn" id="openCartBtn" type="button" aria-label="Abrir carrito">
              🛒 Carrito
              <span class="cartCount" id="cartCount">0</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="overlay" id="overlay"></div>
    <aside class="drawer" id="drawer" aria-label="Carrito">
      <div class="drawerHeader">
        <b>Tu carrito</b>
        <button class="btn" id="closeCartBtn" type="button">Cerrar</button>
      </div>
      <div class="drawerBody" id="cartBody"></div>
      <div class="drawerFooter">
        <div class="totals"><span>Total</span><span id="cartTotal">$0.00</span></div>
        <button class="btn primary" id="checkoutBtn" type="button">Enviar pedido por WhatsApp</button>
        <button class="btn" id="clearBtn" type="button">Vaciar carrito</button>
      </div>
    </aside>
  `;

  const phoneEl = byId("phoneLabel");
  if(phoneEl) phoneEl.textContent = CONFIG.phoneLabel;

  setActiveNav();

  const overlay = byId("overlay");
  const drawer = byId("drawer");
  const openBtn = byId("openCartBtn");
  const closeBtn = byId("closeCartBtn");

  function open(){
    overlay.classList.add("show");
    drawer.classList.add("open");
    renderCart();
  }
  function close(){
    overlay.classList.remove("show");
    drawer.classList.remove("open");
  }

  openBtn?.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  overlay?.addEventListener("click", close);

  byId("checkoutBtn")?.addEventListener("click", checkoutToWhatsApp);
  byId("clearBtn")?.addEventListener("click", clearCart);

  document.addEventListener("click", (e) => {
    const t = e.target;
    const add = t?.getAttribute?.("data-add");
    const incId = t?.getAttribute?.("data-inc");
    const decId = t?.getAttribute?.("data-dec");
    const rmId  = t?.getAttribute?.("data-rm");

    if(add){ addToCart(add); open(); }
    if(incId){ inc(incId); }
    if(decId){ dec(decId); }
    if(rmId){ rm(rmId); }
  });

  renderCartBadge();
}

function renderCartBadge(){
  const cart = loadCart();
  const el = byId("cartCount");
  if(el) el.textContent = String(cartCount(cart));
}

function renderCart(){
  renderCartBadge();

  const cart = loadCart();
  const items = Object.values(cart);
  const body = byId("cartBody");
  const totalEl = byId("cartTotal");

  if(totalEl) totalEl.textContent = money(cartTotal(cart));
  if(!body) return;

  if(items.length === 0){
    body.innerHTML = `<div class="muted">Tu carrito está vacío.</div>`;
    return;
  }

  body.innerHTML = items.map(it => {
    const p = PRODUCTS.find(x => x.id === it.id);
    const img = p?.img || "images/logo.jpg";
    const unit = it.unit ? ` ${it.unit}` : "";

    return `
      <div class="cartItem">
        <div class="ciTop">
          <div style="display:flex; gap:12px; align-items:flex-start;">
            <div class="ciThumb">
              <img src="${img}" alt="${it.name}" loading="lazy"
                   onerror="this.onerror=null; this.src='images/logo.jpg';">
            </div>

            <div>
              <div class="ciName">${it.name}</div>
              <div class="muted" style="margin-top:6px;">${money(it.price)}${unit}</div>
            </div>
          </div>

          <div class="price">${money(it.qty * it.price)}</div>
        </div>

        <div class="ciRow">
          <div class="qty">
            <button data-dec="${it.id}" type="button" aria-label="Reducir">−</button>
            <b>${it.qty}</b>
            <button data-inc="${it.id}" type="button" aria-label="Aumentar">+</button>
          </div>
          <button class="btn" data-rm="${it.id}" type="button">Quitar</button>
        </div>
      </div>
    `;
  }).join("");
}

// ========= HOME SLIDER =========
function initHomeSlider(){
  const slider = byId("homeSlider");
  if(!slider) return;

  const slides = Array.from(slider.querySelectorAll(".slide"));
  const dotsWrap = byId("sliderDots");
  const prevBtn = byId("prevSlide");
  const nextBtn = byId("nextSlide");

  if(slides.length === 0) return;

  let idx = 0;

  function setActive(i){
    idx = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("active", k === idx));

    const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll(".dot")) : [];
    dots.forEach((d, k) => d.classList.toggle("active", k === idx));
  }

  if(dotsWrap){
    dotsWrap.innerHTML = slides
      .map((_, i) => `<span class="dot" data-dot="${i}" aria-label="Ir a imagen ${i+1}"></span>`)
      .join("");

    dotsWrap.addEventListener("click", (e) => {
      const d = e.target?.getAttribute?.("data-dot");
      if(d !== null && d !== undefined) setActive(Number(d));
    });
  }

  prevBtn?.addEventListener("click", () => setActive(idx - 1));
  nextBtn?.addEventListener("click", () => setActive(idx + 1));

  setActive(0);

  let timer = setInterval(() => setActive(idx + 1), 4000);
  slider.addEventListener("mouseenter", () => clearInterval(timer));
  slider.addEventListener("mouseleave", () => {
    timer = setInterval(() => setActive(idx + 1), 4000);
  });
}

// ========= PRODUCTS PAGE =========
function renderProducts(){
  const wrapCal = byId("gridCalamar");
  const wrapCam = byId("gridCamarones");
  const wrapEsp = byId("gridEspeciales");

  function card(p){
    const note = p.note ? `<div class="muted">${p.note}</div>` : "";
    const unit = p.unit ? ` ${p.unit}` : "";
    return `
      <div class="prod">
        <div class="pimg">
          <img src="${p.img}" alt="${p.name}" loading="lazy">
        </div>
        <div class="pb">
          <div class="meta">
            <span class="badge2">${p.cat.toUpperCase()}</span>
            <span class="price">${money(p.price)}${unit}</span>
          </div>
          <div class="name">${p.name}</div>
          ${note}
          <button class="btn primary" data-add="${p.id}" type="button">Agregar al carrito</button>
        </div>
      </div>
    `;
  }

  if(wrapCal) wrapCal.innerHTML = PRODUCTS.filter(p => p.cat==="calamar").map(card).join("");
  if(wrapCam) wrapCam.innerHTML = PRODUCTS.filter(p => p.cat==="camarones").map(card).join("");
  if(wrapEsp) wrapEsp.innerHTML = PRODUCTS.filter(p => p.cat==="especiales").map(card).join("");

  const params = new URLSearchParams(location.search);
  const cat = (params.get("cat") || "").toLowerCase();
  const targetId =
    cat === "calamar" ? "secCalamar" :
    cat === "camarones" ? "secCamarones" :
    cat === "especiales" ? "secEspeciales" : null;

  if(targetId){
    byId(targetId)?.scrollIntoView({behavior:"smooth", block:"start"});
  }
}

// ========= PAGE TRANSITION + LOADER =========
function setupTransitions(){
  requestAnimationFrame(() => document.body.classList.add("page-ready"));

  document.addEventListener("click", (e) => {
    const a = e.target?.closest?.("a[data-link]");
    if(!a) return;

    const href = a.getAttribute("href");
    if(!href) return;

    if(a.target === "_blank") return;
    if(href.startsWith("http")) return;
    if(href.startsWith("#")) return;
    if(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    e.preventDefault();
    document.body.classList.add("page-leave");

    setTimeout(() => {
      window.location.href = href;
    }, 160);
  });
}

function hideLoaderAfterMinTime(minMs = 3000){
  const loader = byId("pageLoader");
  if(!loader) return;

  const start = Date.now();

  function done(){
    const elapsed = Date.now() - start;
    const wait = Math.max(0, minMs - elapsed);
    setTimeout(() => loader.classList.add("hide"), wait);
  }

  if(document.readyState === "complete") done();
  else window.addEventListener("load", done, { once:true });
}

// ========= INIT =========
function init(){
  setupTransitions();
  injectShell();
  initHomeSlider();
  renderProducts();
  wireSocialLinks();        // ✅ makes footer icons work
  hideLoaderAfterMinTime(3000);
}

document.addEventListener("DOMContentLoaded", init);
