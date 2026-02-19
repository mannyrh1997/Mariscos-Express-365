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
    return `• ${it.qty} x ${it.name} (${money(it.price)}${it.unit ? " " + it.unit : ""}) = ${money(sub)}`;
  });

  const msg =
`Hola! Quiero hacer un pedido:

${lines.join("\n")}

Total: ${money(total)}

Nombre:
Dirección / zona:
Hora preferida:`;

  const link = waLink(msg);
  if(link) window.open(link, "_blank");
}

function quickOrderMessage(){
  return `Hola! Quiero hacer un pedido. ¿Me puedes confirmar cobertura y tiempo de entrega?`;
}

// ========= NAV ACTIVE =========
function setActiveNav(){
  const p = pageName();
  document.querySelectorAll('nav a[data-page]').forEach(a => {
    const target = a.getAttribute("data-page");
    a.classList.toggle("active", target === p);
  });

  // Also highlight in mobile menu
  document.querySelectorAll('.mobileNav a[data-page]').forEach(a => {
    const target = a.getAttribute("data-page");
    a.classList.toggle("active", target === p);
  });
}

// ========= MOBILE MENU =========
function setupMobileMenu(){
  const menuBtn = byId("menuBtn");
  const mobileNav = byId("mobileNav");
  const navOverlay = byId("navOverlay");

  if(!menuBtn || !mobileNav || !navOverlay) return;

  function openMenu(){
    mobileNav.classList.add("open");
    navOverlay.classList.add("show");
    menuBtn.setAttribute("aria-expanded", "true");
    document.body.classList.add("noScroll");
  }
  function closeMenu(){
    mobileNav.classList.remove("open");
    navOverlay.classList.remove("show");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("noScroll");
  }
  function toggleMenu(){
    mobileNav.classList.contains("open") ? closeMenu() : openMenu();
  }

  menuBtn.addEventListener("click", toggleMenu);
  navOverlay.addEventListener("click", closeMenu);

  mobileNav.addEventListener("click", (e) => {
    if(e.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") closeMenu();
  });
}

// ========= HEADER + CART DRAWER =========
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
            <button class="menuBtn" id="menuBtn" type="button" aria-label="Abrir menú" aria-expanded="false">
              ☰
            </button>

            <button class="btn primary cartBtn" id="openCartBtn" type="button" aria-label="Abrir carrito">
              🛒 Carrito
              <span class="cartCount" id="cartCount">0</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Mobile menu overlay + panel -->
    <div class="navOverlay" id="navOverlay"></div>
    <div class="mobileNav" id="mobileNav" aria-label="Menú móvil">
      <a href="index.html" data-page="index.html" data-link>Inicio</a>
      <a href="products.html" data-page="products.html" data-link>Productos</a>
      <a href="locations.html" data-page="locations.html" data-link>Puntos de venta</a>
    </div>

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
  setupMobileMenu();

  const overlay = byId("overlay");
  const drawer = byId("drawer");
  const openBtn = byId("openCartBtn");
  const closeBtn = byId("closeCartBtn");
  const checkoutBtn = byId("checkoutBtn");
  const clearBtn = byId("clearBtn");

  function openCart(){
    overlay.classList.add("show");
    drawer.classList.add("open");
    document.body.classList.add("noScroll");
    renderCart();
  }
  function closeCart(){
    overlay.classList.remove("show");
    drawer.classList.remove("open");
    document.body.classList.remove("noScroll");
  }

  if(openBtn) openBtn.addEventListener("click", openCart);
  if(closeBtn) closeBtn.addEventListener("click", closeCart);
  if(overlay) overlay.addEventListener("click", closeCart);

  if(checkoutBtn) checkoutBtn.addEventListener("click", checkoutToWhatsApp);
  if(clearBtn) clearBtn.addEventListener("click", clearCart);

  renderCartBadge();
}

// ========= CART RENDER =========
function renderCartBadge(){
  const countEl = byId("cartCount");
  if(!countEl) return;
  const cart = loadCart();
  countEl.textContent = String(cartCount(cart));
}

function renderCart(){
  const body = byId("cartBody");
  const totalEl = byId("cartTotal");
  if(!body || !totalEl) return;

  const cart = loadCart();
  const items = Object.values(cart);

  if(items.length === 0){
    body.innerHTML = `
      <div class="emptyState">
        <div class="emoji">🧊</div>
        <b>Tu carrito está vacío</b>
        <p class="muted">Agrega productos y luego envía tu pedido por WhatsApp.</p>
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
        <div class="ciTop">
          <div>
            <div class="ciName">${it.name}</div>
            <div class="muted">${money(it.price)} ${it.unit || ""}</div>
          </div>
          <button class="iconBtn" data-rm="${it.id}" aria-label="Quitar">✕</button>
        </div>

        <div class="ciRow">
          <div class="qty" aria-label="Cantidad">
            <button type="button" data-dec="${it.id}" aria-label="Menos">−</button>
            <b>${it.qty}</b>
            <button type="button" data-inc="${it.id}" aria-label="Más">+</button>
          </div>
          <b>${money(sub)}</b>
        </div>
      </div>
    `;
  }).join("");

  totalEl.textContent = money(cartTotal(cart));
  renderCartBadge();

  body.querySelectorAll("[data-inc]").forEach(b => b.addEventListener("click", () => inc(b.dataset.inc)));
  body.querySelectorAll("[data-dec]").forEach(b => b.addEventListener("click", () => dec(b.dataset.dec)));
  body.querySelectorAll("[data-rm]").forEach(b => b.addEventListener("click", () => rm(b.dataset.rm)));
}

// ========= PRODUCTS PAGE =========
function renderProducts(){
  const gridCal = byId("gridCalamar");
  const gridCam = byId("gridCamarones");
  const gridEsp = byId("gridEspeciales");

  function card(p){
    return `
      <article class="pCard">
        <div class="pImg">
          <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.src='images/logo.jpg'">
        </div>
        <div class="pBody">
          <div class="pTop">
            <h3>${p.name}</h3>
            <div class="price">${money(p.price)} <span>${p.unit || ""}</span></div>
          </div>
          ${p.note ? `<div class="note">${p.note}</div>` : ``}
          <button class="btn primary full" data-add="${p.id}" type="button">Agregar al carrito</button>
        </div>
      </article>
    `;
  }

  if(gridCal){
    const list = PRODUCTS.filter(p => p.cat === "calamar");
    gridCal.innerHTML = list.map(card).join("");
  }
  if(gridCam){
    const list = PRODUCTS.filter(p => p.cat === "camarones");
    gridCam.innerHTML = list.map(card).join("");
  }
  if(gridEsp){
    const list = PRODUCTS.filter(p => p.cat === "especiales");
    gridEsp.innerHTML = list.map(card).join("");
  }

  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.add);
      // small feedback
      btn.textContent = "Agregado ✅";
      setTimeout(() => btn.textContent = "Agregar al carrito", 850);
    });
  });
}

// ========= HOME SLIDER =========
function setupSlider(){
  const slider = byId("homeSlider");
  if(!slider) return;

  const slides = Array.from(slider.querySelectorAll(".slide"));
  const prev = byId("prevSlide");
  const next = byId("nextSlide");
  const dotsWrap = byId("sliderDots");

  let idx = 0;
  function go(n){
    idx = (n + slides.length) % slides.length;
    slides.forEach((s,i) => s.classList.toggle("active", i === idx));
    if(dotsWrap){
      dotsWrap.querySelectorAll("button").forEach((b,i) => b.classList.toggle("active", i === idx));
    }
  }

  if(dotsWrap){
    dotsWrap.innerHTML = slides.map((_,i) => `<button class="dot ${i===0?"active":""}" aria-label="Ir a slide ${i+1}"></button>`).join("");
    dotsWrap.querySelectorAll("button").forEach((b,i) => b.addEventListener("click", () => go(i)));
  }

  if(prev) prev.addEventListener("click", () => go(idx - 1));
  if(next) next.addEventListener("click", () => go(idx + 1));

  // auto-play (desktop + mobile)
  let timer = setInterval(() => go(idx + 1), 4500);

  // pause on interaction
  slider.addEventListener("pointerdown", () => { clearInterval(timer); timer = setInterval(() => go(idx + 1), 4500); }, {passive:true});
}

// ========= FOOTER SOCIAL LINKS =========
function setupFooterLinks(){
  const fb = byId("fbCircle");
  const ig = byId("igCircle");
  const wa = byId("waCircle");

  if(fb) fb.href = CONFIG.facebookUrl || "#";
  if(ig) ig.href = CONFIG.instagramUrl || "#";

  if(wa){
    const link = waLink("Hola! Me gustaría hacer un pedido.");
    wa.href = link || "#";
  }
}

// ========= LOCATIONS PAGE =========
function setupLocations(){
  const btn = byId("orderNowBtn");
  if(!btn) return;

  btn.addEventListener("click", () => {
    const link = waLink(quickOrderMessage());
    if(link) window.open(link, "_blank");
  });
}

// ========= LOADER =========
function hideLoaderSoon(){
  const el = byId("pageLoader");
  if(!el) return;
  setTimeout(() => el.classList.add("hide"), 450);
}

// ========= INIT =========
document.addEventListener("DOMContentLoaded", () => {
  injectShell();
  setupFooterLinks();
  setupSlider();
  renderProducts();
  setupLocations();
  hideLoaderSoon();
});
