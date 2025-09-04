// ========== SUPABASE INIT ==========
const SUPABASE_URL = "https://ucuvjoybmvalbynerzns.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...."; // tumar key
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ========== DOM SELECTORS ==========
const productsContainer = document.getElementById("product-list"); // ✅ fix
const reviewsContainer = document.getElementById("review-list");   // ✅ fix

// ========== LOAD PRODUCTS ==========
async function loadProducts() {
  const { data, error } = await supabaseClient.from("products").select("*");
  if (error) {
    console.error("❌ Error loading products:", error.message);
    return;
  }

  productsContainer.innerHTML = "";
  data.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p>৳${p.price}</p>
      <button onclick="addToCart(${p.id})">Add to Cart</button>
    `;
    productsContainer.appendChild(card);
  });
}

// ========== CART ==========
let cart = [];
function addToCart(productId) {
  cart.push(productId);
  document.getElementById("cart-count").innerText = cart.length;
  alert("✅ Added to cart!");
}

// ========== ADMIN ==========
function openAdmin() {
  document.getElementById("admin-modal").style.display = "flex"; // ✅ fix
}
function closeAdmin() {
  document.getElementById("admin-modal").style.display = "none";
}

async function addProduct() {
  const name = document.getElementById("p-name").value;
  const price = parseFloat(document.getElementById("p-price").value);
  const sizes = document.getElementById("p-sizes").value;
  const image = document.getElementById("p-img").value;

  if (!name || !price || !image) {
    alert("⚠️ Please fill all fields");
    return;
  }

  const { error } = await supabaseClient.from("products").insert([
    { name, price, sizes, image }
  ]);

  if (error) {
    alert("❌ Error: " + error.message);
  } else {
    alert("✅ Product added!");
    loadProducts();
  }
}

// ========== AUTH ==========
function openAuth() {
  document.getElementById("auth-modal").style.display = "flex"; // ✅ fix
}
function closeAuth() {
  document.getElementById("auth-modal").style.display = "none";
}

async function signUp() {
  const email = document.getElementById("auth-email").value;
  const password = document.getElementById("auth-pass").value;

  const { error } = await supabaseClient.auth.signUp({ email, password });
  if (error) {
    alert("❌ " + error.message);
  } else {
    alert("✅ Check your email to confirm!");
  }
}

async function signIn() {
  const email = document.getElementById("auth-email").value;
  const password = document.getElementById("auth-pass").value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    alert("❌ " + error.message);
  } else {
    alert("✅ Logged in!");
  }
}

async function signOut() {
  await supabaseClient.auth.signOut();
  alert("👋 Signed out!");
}

// ========== START ==========
loadProducts();
