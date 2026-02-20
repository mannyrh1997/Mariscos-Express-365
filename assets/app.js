/* ==========================================
   Mariscos Express 365 — app.js (clean v4)
   - Shell (header/nav/cart) injected on all pages
   - Mobile nav drawer + overlay
   - Cart drawer + WhatsApp checkout
   - Home slider (if present)
   - Loader: min 3.5s, smooth exit
========================================== */

"use strict";

/* ========= CONFIG ========= */
const CONFIG = {
  brand: "Mariscos Express 365",

  // WhatsApp (needs country code)
  whatsappNumber: "+12143944223",
  phoneLabel: "+1 (214) 394-4223",

  // Social
  facebookUrl: "https://www.facebook.com/profile.php?id=61556986174642",
  instagramUrl: "https://instagram.com/",

  // Loader
  loaderMinMs: 3500,

  // Slider autoplay
  sliderAutoMs: 4500,
};

/* ========= PRODUCTS ========= */
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

/* ========= HELPERS ========= */
const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function byId(id){ return document.getElementById(id); }

function pageName(){
  return (location.pathname.split("/").pop() || "index.html").toLowerCase();
}

function money(n){
  return "$" + Number(n).toFixed(2);
}

function digitsOnly(s){
  return String(s || "").replace(/\D/g, "");
}

function safeSetHref(el, url){
  if(!el) return;
  el.href = url && url.trim() ? url.trim() : "#";
}

/* ========= LOADER (min duration + ready) ========= */
let _loaderStart = 0;
function loaderStart(){
  _loaderStart = Date.now();
}
function loaderFinish(){
  const el = byId("pageLoader");
  if(!el) return;

  const elapsed = Date.now() - _loaderStart;
  const wait = Math.max(0, CONFIG.loaderMinMs - elapsed);

  setTimeout(() => {
    el.classList.add("hide");
    // allow transition to complete then remove from a11y flow
    setTimeout(() => { el.style.display = "none"; }, 500);
  }, wait);
}

/* ========= CART ========= */
const CART_KEY = "me365_cart_v4";

function loadCart(){
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function cartItems(cart){
  return Object.values(cart);
}
function cartCount(cart){
  return cartItems(cart).reduce((sum, it) => sum + it.qty, 0);
}
function cartTotal(cart){
  return cartItems(cart).reduce((sum, it) => sum + it.qty * it.price, 0);
}

function addToCart(productId, qty=1){
  const p = PRODUCTS.find(x => x.id === productId);
  if(!p) return;

  const cart = loadCart();
  if(!cart[productId]){
    cart[productId] = { id:p.id, name:p.name, price:p.price, unit:p.unit || "", qty:0 };
  }
  cart[productId].qty += qty;

  saveCart(cart);
  renderCartBadge();
}

function incItem(id){
  const cart = loadCart();
  if(!cart[id]) return;
  cart[id].qty += 1;
  saveCart(cart);
  renderCart();
}
function decItem(id){
  const cart = loadCart();
  if(!cart[id]) return;
  cart[id].qty -= 1;
  if(cart[id].qty <= 0) delete cart[id];
  saveCart(cart);
  renderCart();
}
function removeItem(id){
  const cart = loadCart();
  delete cart[id];
  saveCart(cart);
  renderCart();
}
function clearCart(){
  saveCart({});
  renderCart();
}

/* ========= WHATSAPP ========= */
function waLink(message){
  const phone = digitsOnly(CONFIG.whatsappNumber);
  if(!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function buildOrderMessage(){
  const cart = loadCart();
  const items = cartItems(cart);
  if(items.length === 0) return null;

  let total = 0;
  const lines = items.map(it => {
    const sub = it.qty * it.price;
    total += sub;
    return `• ${it.qty} x ${it.name} (${money(it.price)}${it.unit ? " " + it.unit : ""}) = ${money(sub)}`;
  });

  return `Hola! Quiero hacer un pedido:

${lines.join("\n")}

Total: ${money(total)}

Nombre:
Dirección / zona:
Hora preferida:`;
}

function checkoutToWhatsApp(){
  const msg = buildOrderMessage();
  if(!msg){
    alert("Tu carrito está vacío.");
    return;
  }
  const link = waLink(msg);
  if(link) window.open(link, "_blank", "noopener");
}

/* ========= SHELL (HEADER / NAV / DRAWERS) ========= */
function injectShell(){
  const shell = byId("shell");
  if(!shell) return;

  shell.innerHTML = `
    <div class="topbar">
      <div class="container">
        <div class="toprow">
          <div class="chip">WhatsApp: <b id="phoneLabel"></b></div>
          <div class="chip chip--pink">Delivery en Puerto de La Libertad y alrededores</div>
        </div>
      </div>
    </div>

    <header class="siteHeader">
      <div class="container">
        <div class="headerRow">

          <a class="brand" href="index.html" data-link>
            <img class="brandLogo" src="images/logo.jpg" alt="Logo de ${CONFIG.brand}">
            <div class="brandText">
              <span class="brandName">${CONFIG.brand}</span>
              <span class="brandTag">Distribuidora local</span>
            </div>
          </a>

          <nav class="navDesk" aria-label="Menú principal">
            <a href="index.html" data-page="index.html" data-link>Inicio</a>
            <a href="products.html" data-page="products.html" data-link>Productos</a>
            <a href="locations.html" data-page="locations.html" data-link>Puntos de venta</a>
          </nav>

          <div class="headerActions">
            <button class="iconBtn menuBtn" id="menuBtn" type="button" aria-label="Abrir menú" aria-expanded="false">
              <span aria-hidden="true">☰</span>
            </button>

            <button class="btn btn--primary cartBtn" id="openCartBtn" type="button" aria-label="Abrir carrito">
              🛒 <span class="hideSm">Carrito</span>
              <span class="badge" id="cartCount">0</span>
            </button>
          </div>

        </div>
      </div>
    </header>

    <!-- Mobile nav drawer -->
    <div class="overlay" id="navOverlay" hidden></div>
    <aside class="drawer drawer--left" id="navDrawer" aria-label="Menú móvil" aria-hidden="true">
      <div class="drawerHead">
        <b>Menú</b>
        <button class="iconBtn" id="closeNavBtn" type="button" aria-label="Cerrar menú">✕</button>
      </div>
      <div class="drawerBody">
        <a class="mLink" href="index.html" data-page="index.html" data-link>Inicio</a>
        <a class="mLink" href="products.html" data-page="products.html" data-link>Productos</a>
        <a class="mLink" href="locations.html" data-page="locations.html" data-link>Puntos de venta</a>
        <div class="drawerDivider"></div>
        <a class="mLink mLink--soft" id="mobileWhatsApp" href="#" target="_blank" rel="noopener">Pedir por WhatsApp</a>
      </div>
    </aside>

    <!-- Cart drawer -->
    <div class="overlay" id="cartOverlay" hidden></div>
    <aside class="drawer drawer--right" id="cartDrawer" aria-label="Carrito" aria-hidden="true">
      <div class="drawerHead">
        <b>Tu carrito</b>
        <button class="iconBtn" id="closeCartBtn" type="button" aria-label="Cerrar carrito">✕</button>
      </div>

      <div class="drawerBody" id="cartBody"></div>

      <div class="drawerFoot">
        <div class="totalsRow">
          <span>Total</span>
          <span id="cartTotal">$0.00</span>
        </div>
        <button class="btn btn--primary btn--full" id="checkoutBtn" type="button">Enviar pedido por WhatsApp</button>
        <button class="btn btn--ghost btn--full" id="clearBtn" type="button">Vaciar carrito</button>
      </div>
    </aside>
  `;

  const phoneEl = byId("phoneLabel");
  if(phoneEl) phoneEl.textContent = CONFIG.phoneLabel;

  // mobile whatsapp quick link
  const mobileWA = byId("mobileWhatsApp");
  if(mobileWA){
    const link = waLink("Hola! Me gustaría hacer un pedido.");
    safeSetHref(mobileWA, link || "#");
  }

  setActiveLinks();
  setupNavDrawer();
  setupCartDrawer();
  renderCartBadge();
}

/* ========= ACTIVE LINKS ========= */
function setActiveLinks(){
  const p = pageName();
  $$("[data-page]").forEach(a => {
    a.classList.toggle("active", (a.getAttribute("data-page") || "").toLowerCase() === p);
  });
}

/* ========= DRAWER CONTROLLER ========= */
function lockScroll(locked){
  document.body.classList.toggle("noScroll", !!locked);
}

function openDrawer({ drawerEl, overlayEl, openerEl }){
  if(!drawerEl || !overlayEl) return;

  overlayEl.hidden = false;
  drawerEl.classList.add("open");
  drawerEl.setAttribute("aria-hidden", "false");
  overlayEl.classList.add("show");
  lockScroll(true);

  if(openerEl) openerEl.setAttribute("aria-expanded", "true");
}

function closeDrawer({ drawerEl, overlayEl, openerEl }){
  if(!drawerEl || !overlayEl) return;

  drawerEl.classList.remove("open");
  drawerEl.setAttribute("aria-hidden", "true");
  overlayEl.classList.remove("show");
  lockScroll(false);

  if(openerEl) openerEl.setAttribute("aria-expanded", "false");

  // wait for CSS transition before hiding overlay
  setTimeout(() => { overlayEl.hidden = true; }, 220);
}

/* ========= MOBILE NAV ========= */
function setupNavDrawer(){
  const btn = byId("menuBtn");
  const overlay = byId("navOverlay");
  const drawer = byId("navDrawer");
  const closeBtn = byId("closeNavBtn");
  if(!btn || !overlay || !drawer || !closeBtn) return;

  const api = {
    open: () => openDrawer({ drawerEl: drawer, overlayEl: overlay, openerEl: btn }),
    close: () => closeDrawer({ drawerEl: drawer, overlayEl: overlay, openerEl: btn }),
    toggle: () => drawer.classList.contains("open") ? api.close() : api.open()
  };

  btn.addEventListener("click", api.toggle);
  closeBtn.addEventListener("click", api.close);
  overlay.addEventListener("click", api.close);

  drawer.addEventListener("click", (e) => {
    if(e.target.closest("a")) api.close();
  });

  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") api.close();
  });
}

/* ========= CART DRAWER ========= */
function setupCartDrawer(){
  const openBtn = byId("openCartBtn");
  const closeBtn = byId("closeCartBtn");
  const overlay = byId("cartOverlay");
  const drawer = byId("cartDrawer");
  const checkoutBtn = byId("checkoutBtn");
  const clearBtn = byId("clearBtn");

  if(!openBtn || !closeBtn || !overlay || !drawer) return;

  const api = {
    open: () => {
      openDrawer({ drawerEl: drawer, overlayEl: overlay });
      renderCart();
    },
    close: () => closeDrawer({ drawerEl: drawer, overlayEl: overlay })
  };

  openBtn.addEventListener("click", api.open);
  closeBtn.addEventListener("click", api.close);
  overlay.addEventListener("click", api.close);

  if(checkoutBtn) checkoutBtn.addEventListener("click", checkoutToWhatsApp);
  if(clearBtn) clearBtn.addEventListener("click", clearCart);

  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") api.close();
  });
}

/* ========= CART RENDER ========= */
function renderCartBadge(){
  const el = byId("cartCount");
  if(!el) return;
  el.textContent = String(cartCount(loadCart()));
}

function renderCart(){
  const body = byId("cartBody");
  const totalEl = byId("cartTotal");
  if(!body || !totalEl) return;

  const cart = loadCart();
  const items = cartItems(cart);

  if(items.length === 0){
    body.innerHTML = `
      <div class="empty">
        <div class="emptyEmoji" aria-hidden="true">🧊</div>
        <div class="emptyTitle">Tu carrito está vacío</div>
        <div class="emptyText">Agrega productos y luego envía tu pedido por WhatsApp.</div>
      </div>
    `;
    totalEl.textContent = "$0.00";
    renderCartBadge();
    return;
  }

  body.innerHTML = items.map(it => {
    const sub = it.qty * it.price;
    return `
      <div class="cartItem">
        <div class="cartTop">
          <div class="cartMeta">
            <div class="cartName">${it.name}</div>
            <div class="cartSub">${money(it.price)} ${it.unit || ""}</div>
          </div>
          <button class="iconBtn" data-rm="${it.id}" type="button" aria-label="Quitar">✕</button>
        </div>

        <div class="cartBottom">
          <div class="qty">
            <button type="button" class="qtyBtn" data-dec="${it.id}" aria-label="Menos">−</button>
            <div class="qtyNum" aria-label="Cantidad">${it.qty}</div>
            <button type="button" class="qtyBtn" data-inc="${it.id}" aria-label="Más">+</button>
          </div>
          <div class="cartPrice">${money(sub)}</div>
        </div>
      </div>
    `;
  }).join("");

  totalEl.textContent = money(cartTotal(cart));
  renderCartBadge();

  // Events
  $$("[data-inc]", body).forEach(b => b.addEventListener("click", () => incItem(b.dataset.inc)));
  $$("[data-dec]", body).forEach(b => b.addEventListener("click", () => decItem(b.dataset.dec)));
  $$("[data-rm]", body).forEach(b => b.addEventListener("click", () => removeItem(b.dataset.rm)));
}

/* ========= PRODUCTS PAGE ========= */
function renderProducts(){
  const gridCal = byId("gridCalamar");
  const gridCam = byId("gridCamarones");
  const gridEsp = byId("gridEspeciales");

  // If not on products page, stop.
  if(!gridCal && !gridCam && !gridEsp) return;

  const card = (p) => `
    <article class="pCard">
      <div class="pImg">
        <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.src='images/logo.jpg'">
      </div>
      <div class="pBody">
        <div class="pRow">
          <h3 class="pName">${p.name}</h3>
          <div class="pPrice">${money(p.price)} <span>${p.unit || ""}</span></div>
        </div>
        ${p.note ? `<div class="pNote">${p.note}</div>` : ``}
        <button class="btn btn--primary btn--full" data-add="${p.id}" type="button">Agregar al carrito</button>
      </div>
    </article>
  `;

  if(gridCal) gridCal.innerHTML = PRODUCTS.filter(p => p.cat === "calamar").map(card).join("");
  if(gridCam) gridCam.innerHTML = PRODUCTS.filter(p => p.cat === "camarones").map(card).join("");
  if(gridEsp) gridEsp.innerHTML = PRODUCTS.filter(p => p.cat === "especiales").map(card).join("");

  $$("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.add, 1);
      // tiny feedback
      btn.classList.add("pulse");
      const prev = btn.textContent;
      btn.textContent = "Agregado ✅";
      setTimeout(() => { btn.textContent = prev; btn.classList.remove("pulse"); }, 900);
    });
  });
}

/* ========= FOOTER LINKS ========= */
function setupFooterLinks(){
  safeSetHref(byId("fbCircle"), CONFIG.facebookUrl);
  safeSetHref(byId("igCircle"), CONFIG.instagramUrl);

  const wa = byId("waCircle");
  if(wa){
    safeSetHref(wa, waLink("Hola! Me gustaría hacer un pedido.") || "#");
  }
}

/* ========= LOCATIONS PAGE ========= */
function setupLocations(){
  const btn = byId("orderNowBtn");
  if(!btn) return;
  btn.addEventListener("click", () => {
    const link = waLink("Hola! Quiero hacer un pedido. ¿Me puedes confirmar cobertura y tiempo de entrega?");
    if(link) window.open(link, "_blank", "noopener");
  });
}

/* ========= HOME SLIDER ========= */
function setupSlider(){
  const slider = byId("homeSlider");
  if(!slider) return;

  const slides = $$(".slide", slider);
  if(slides.length <= 1) return;

  const prev = byId("prevSlide");
  const next = byId("nextSlide");
  const dotsWrap = byId("sliderDots");

  let idx = 0;
  let timer = null;

  function apply(){
    slides.forEach((s,i)=> s.classList.toggle("active", i === idx));
    if(dotsWrap){
      $$(".dot", dotsWrap).forEach((d,i)=> d.classList.toggle("active", i === idx));
    }
  }
  function go(n){
    idx = (n + slides.length) % slides.length;
    apply();
  }
  function startAuto(){
    stopAuto();
    timer = setInterval(()=> go(idx + 1), CONFIG.sliderAutoMs);
  }
  function stopAuto(){
    if(timer) clearInterval(timer);
    timer = null;
  }

  if(dotsWrap){
    dotsWrap.innerHTML = slides.map((_,i)=> `<button class="dot ${i===0?"active":""}" type="button" aria-label="Ir a slide ${i+1}"></button>`).join("");
    $$(".dot", dotsWrap).forEach((b,i)=> b.addEventListener("click", ()=> { go(i); startAuto(); }));
  }

  if(prev) prev.addEventListener("click", ()=> { go(idx - 1); startAuto(); });
  if(next) next.addEventListener("click", ()=> { go(idx + 1); startAuto(); });

  slider.addEventListener("pointerdown", stopAuto, { passive:true });
  slider.addEventListener("pointerup", startAuto, { passive:true });
  slider.addEventListener("pointercancel", startAuto, { passive:true });

  apply();
  startAuto();
}

/* ========= INIT ========= */
loaderStart();

document.addEventListener("DOMContentLoaded", () => {
  injectShell();
  setupFooterLinks();
  renderProducts();
  setupLocations();
  setupSlider();

  // Ensure loader ends after min duration AND DOM ready
  loaderFinish();
});

// Extra safety: if browser delays DOMContentLoaded, still finish loader after full load
window.addEventListener("load", () => {
  loaderFinish();
});
