// ========== GLOBAL STATE ==========
let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
let botReplies = JSON.parse(localStorage.getItem("botReplies")) || [
  { q: "price", a: "Our clothes start from 499৳ only!" },
  { q: "delivery", a: "Delivery takes 3–5 business days." },
  { q: "size", a: "We usually keep S, M, L, XL sizes." },
];
let user = JSON.parse(localStorage.getItem("user")) || null;
let secretCode = localStorage.getItem("secretCode") || "joyda";

// ========== RENDER FUNCTIONS ==========
function renderProducts() {
  const list = document.getElementById("product-list");
  list.innerHTML = "";
  products.forEach((p, idx) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>৳${p.price}</p>
      <p class="sizes">Sizes: ${p.sizes}</p>
      <button class="btn" onclick="addToCart(${idx})">Add to Cart</button>
    `;
    list.appendChild(card);
  });
}
function renderCart() {
  const items = document.getElementById("cart-items");
  items.innerHTML = "";
  let total = 0;
  cart.forEach((c, idx) => {
    total += c.price * c.qty;
    items.innerHTML += `
      <div class="mini-item">
        ${c.name} (x${c.qty}) - ৳${c.price * c.qty}
        <span onclick="removeFromCart(${idx})" class="link danger">✖</span>
      </div>
    `;
  });
  document.getElementById("cart-total").textContent = total;
  document.getElementById("cart-count").textContent = cart.length;
  localStorage.setItem("cart", JSON.stringify(cart));
}
function renderOrders() {
  const list = document.getElementById("order-history");
  const myOrders = document.getElementById("profile-orders");
  if (list) list.innerHTML = "";
  if (myOrders) myOrders.innerHTML = "";
  orders.forEach((o, idx) => {
    const orderEl = `
      <div class="mini-item">
        #${o.id} — ${o.items.length} items — ৳${o.total} — 
        <b>${o.status}</b>
        ${o.trx ? "(trx: " + o.trx + ")" : ""}
        <span class="link" onclick="updateOrderStatus(${idx})">✅ Confirm</span>
      </div>
    `;
    if (list) list.innerHTML += orderEl;
    if (myOrders && user && user.email === o.user.email) myOrders.innerHTML += orderEl;
  });
  localStorage.setItem("orders", JSON.stringify(orders));
}
function renderReviews() {
  const list = document.getElementById("review-list");
  const admin = document.getElementById("admin-reviews");
  list.innerHTML = "";
  if (admin) admin.innerHTML = "";
  reviews.forEach((r, idx) => {
    const el = `
      <div class="review card">
        <b>${r.name}</b> — ${r.title || ""}
        <p>${r.text}</p>
        ${admin ? `<span class="link danger" onclick="deleteReview(${idx})">Delete</span>` : ""}
      </div>
    `;
    list.innerHTML += el;
    if (admin) admin.innerHTML += el;
  });
  localStorage.setItem("reviews", JSON.stringify(reviews));
}
function renderBotReplies() {
  const list = document.getElementById("bot-replies");
  if (!list) return;
  list.innerHTML = "";
  botReplies.forEach((b, idx) => {
    list.innerHTML += `<div class="mini-item">${b.q} → ${b.a}</div>`;
  });
  localStorage.setItem("botReplies", JSON.stringify(botReplies));
}
function renderAdminProducts() {
  const list = document.getElementById("admin-products");
  if (!list) return;
  list.innerHTML = "";
  products.forEach((p, idx) => {
    list.innerHTML += `
      <div class="mini-item">
        ${p.name} — ৳${p.price}
        <span class="link" onclick="deleteProduct(${idx})">Delete</span>
      </div>
    `;
  });
}

// ========== CART ==========
function addToCart(idx) {
  const prod = products[idx];
  const existing = cart.find(c => c.name === prod.name);
  if (existing) existing.qty++;
  else cart.push({ ...prod, qty: 1 });
  renderCart();
}
function removeFromCart(idx) {
  cart.splice(idx, 1);
  renderCart();
}
function clearCart() {
  cart = [];
  renderCart();
}
function checkout() {
  if (cart.length === 0) return alert("Cart is empty!");
  document.getElementById("checkout-summary").innerHTML = cart.map(c => `${c.name} x${c.qty} = ৳${c.price * c.qty}`).join("<br>");
  document.getElementById("checkout-modal").style.display = "flex";
}
function placeOrder() {
  const address = document.getElementById("delivery-address").value;
  const method = document.getElementById("payment-method").value;
  const trx = document.getElementById("trx-id").value;
  if (!address) return alert("Enter address!");
  if (method === "bkash" && !trx) return alert("Enter bKash trxID!");
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const id = "ORD" + Date.now();
  orders.push({
    id, items: [...cart], total, address, method, trx,
    status: "Pending", user
  });
  cart = [];
  renderCart();
  renderOrders();
  closeCheckout();
  alert("Order placed! ID: " + id);
}

// ========== PROFILE ==========
function openProfile() {
  if (!user) return openAuth();
  document.getElementById("profile-name").textContent = user.name;
  document.getElementById("profile-email").textContent = user.email;
  document.getElementById("profile-phone").textContent = user.phone || "-";
  document.getElementById("profile-address").textContent = user.address || "-";
  document.getElementById("profile-balance").textContent = user.balance || 0;
  document.getElementById("profile-points").textContent = user.points || 0;
  renderOrders();
  document.getElementById("profile-modal").style.display = "flex";
}
function saveProfileEdit() {
  user.name = document.getElementById("edit-name").value;
  user.phone = document.getElementById("edit-phone").value;
  user.address = document.getElementById("edit-address").value;
  localStorage.setItem("user", JSON.stringify(user));
  closeProfileEdit();
  openProfile();
}
function signOut() {
  user = null;
  localStorage.removeItem("user");
  document.getElementById("auth-btn").style.display = "inline-block";
  closeProfile();
}

// ========== AUTH ==========
function signUp() {
  user = {
    name: document.getElementById("auth-name").value,
    email: document.getElementById("auth-email").value,
    phone: document.getElementById("auth-phone").value,
    pass: document.getElementById("auth-pass").value,
    balance: 0,
    points: 0
  };
  localStorage.setItem("user", JSON.stringify(user));
  document.getElementById("auth-btn").style.display = "none";
  closeAuth();
}
function signIn() {
  const email = document.getElementById("auth-email").value;
  const pass = document.getElementById("auth-pass").value;
  if (user && user.email === email && user.pass === pass) {
    document.getElementById("auth-btn").style.display = "none";
    closeAuth();
    openProfile();
  } else {
    alert("Invalid credentials");
  }
}

// ========== BALANCE ==========
function confirmAddBalance() {
  const amount = parseInt(document.getElementById("add-amount").value);
  const trx = document.getElementById("add-trx").value;
  if (!amount || !trx) return alert("Enter amount & trxID!");
  user.balance += amount;
  localStorage.setItem("user", JSON.stringify(user));
  document.getElementById("nav-balance").textContent = user.balance;
  closeAddBalance();
  openProfile();
}

// ========== REVIEWS ==========
document.getElementById("review-form").addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("reviewer").value;
  const title = document.getElementById("review-title").value;
  const text = document.getElementById("review-text").value;
  reviews.push({ name, title, text });
  renderReviews();
  e.target.reset();
});
function deleteReview(idx) {
  reviews.splice(idx, 1);
  renderReviews();
}

// ========== ADMIN ==========
function addProduct() {
  const name = document.getElementById("p-name").value;
  const price = parseInt(document.getElementById("p-price").value);
  const sizes = document.getElementById("p-sizes").value;
  const img = document.getElementById("p-img").value;
  if (!name || !price || !sizes || !img) return alert("Fill all fields!");
  products.push({ name, price, sizes, img });
  localStorage.setItem("products", JSON.stringify(products));
  renderProducts();
  renderAdminProducts();
}
function deleteProduct(idx) {
  products.splice(idx, 1);
  localStorage.setItem("products", JSON.stringify(products));
  renderProducts();
  
  renderAdminProducts();
}
function updateBanner() {
  document.getElementById("banner-img").src = document.getElementById("banner-img-url").value;
  document.getElementById("banner-title").textContent = document.getElementById("banner-text").value;
  document.getElementById("banner-subtitle").textContent = document.getElementById("banner-sub").value;
}
function updateOrderStatus(idx) {
  orders[idx].status = "Confirmed";
  renderOrders();
}
function addBotReply() {
  const q = document.getElementById("bot-question").value;
  const a = document.getElementById("bot-reply").value;
  if (!q || !a) return alert("Fill fields!");
  botReplies.push({ q, a });
  renderBotReplies();
}
function changeSecret() {
  const code = document.getElementById("verify-code").value;
  const newCode = document.getElementById("new-secret").value;
  if (code === "540274") {
    secretCode = newCode;
    localStorage.setItem("secretCode", secretCode);
    alert("Secret updated!");
  } else {
    alert("Wrong verify code!");
  }
}

// ========== CHATBOT ==========
function sendMessage() {
  const input = document.getElementById("chat-message");
  const msg = input.value.trim();
  if (!msg) return;
  const body = document.getElementById("chat-body");
  body.innerHTML += `<div class="msg user">${msg}</div>`;
  const found = botReplies.find(b => msg.toLowerCase().includes(b.q.toLowerCase()));
  setTimeout(() => {
    body.innerHTML += `<div class="msg bot">${found ? found.a : "Sorry, I don't know about that."}</div>`;
    body.scrollTop = body.scrollHeight;
  }, 500);
  input.value = "";
}
function toggleChat() {
  const c = document.getElementById("chatbot");
  c.style.display = (c.style.display === "flex" ? "none" : "flex");
}

// ========== MODALS ==========
function openCart() { document.getElementById("cart-modal").style.display = "flex"; renderCart(); }
function closeCart() { document.getElementById("cart-modal").style.display = "none"; }
function closeCheckout() { document.getElementById("checkout-modal").style.display = "none"; }
function closeProfile() { document.getElementById("profile-modal").style.display = "none"; }
function openProfileEdit() { document.getElementById("profile-edit-modal").style.display = "flex"; }
function closeProfileEdit() { document.getElementById("profile-edit-modal").style.display = "none"; }
function openAddBalance() { document.getElementById("add-balance-modal").style.display = "flex"; }
function closeAddBalance() { document.getElementById("add-balance-modal").style.display = "none"; }
function openAuth() { document.getElementById("auth-modal").style.display = "flex"; }
function closeAuth() { document.getElementById("auth-modal").style.display = "none"; }
function openAdmin() { 
  const code = prompt("Enter secret code:");
  if (code === secretCode) {
    document.getElementById("admin-modal").style.display = "flex"; 
    renderAdminProducts(); renderOrders(); renderReviews(); renderBotReplies();
  } else alert("Wrong code!");
}
function closeAdmin() { document.getElementById("admin-modal").style.display = "none"; }
function toggleTrxInput() {
  document.getElementById("trx-wrap").style.display = 
    (document.getElementById("payment-method").value === "bkash" ? "block" : "none");
}

// ========== INIT ==========
renderProducts();
renderCart();
renderOrders();
renderReviews();
renderBotReplies();
if (user) document.getElementById("auth-btn").style.display = "none";
