import React, { useState, useEffect, useMemo, useReducer, useContext, createContext } from "react";

/* ---------- Data ----------
   Photos: put files in  public/plants/<slug>.jpg  (e.g. public/plants/monstera.jpg)
   or set  image: "https://..."  on any product. If a photo is missing, a soft tile shows instead. */
const PRODUCTS = [
  { id: 1, slug: "monstera", name: "Monstera Deliciosa", category: "Indoor plants", price: 899, rating: 4.9, emoji: "🌿", color: "#cfe5d3", desc: "Big, split leaves that make any corner feel like a jungle. Bright, indirect light and water once the top soil dries." },
  { id: 2, slug: "snake-plant", name: "Snake Plant", category: "Indoor plants", price: 449, rating: 4.8, emoji: "🌱", color: "#d8e8c6", desc: "Hard to kill. Handles low light and forgotten waterings, and it stays tidy and upright." },
  { id: 3, slug: "fiddle-leaf-fig", name: "Fiddle Leaf Fig", category: "Trees", price: 1499, rating: 4.4, emoji: "🌳", color: "#c8e2cf", desc: "A tall, sculptural tree with large glossy leaves. Give it a sunny window and keep it in one spot." },
  { id: 4, slug: "areca-palm", name: "Areca Palm", category: "Trees", price: 799, rating: 4.7, emoji: "🌴", color: "#d2e9bf", desc: "Feathery fronds that soften a room and freshen the air. Likes bright light and regular water." },
  { id: 5, slug: "money-plant", name: "Money Plant", category: "Indoor plants", price: 249, rating: 4.9, emoji: "🍃", color: "#c4e3c9", desc: "Trailing vines that grow in soil or in a jar of water. A good first plant." },
  { id: 6, slug: "bonsai-ficus", name: "Ficus Bonsai", category: "Trees", price: 1899, rating: 4.6, emoji: "🌲", color: "#d6e4cc", desc: "A small tree trained over years into a calm, sculpted shape. Comes in a shallow ceramic tray." },
  { id: 7, slug: "peace-lily", name: "Peace Lily", category: "Indoor plants", price: 549, rating: 4.5, emoji: "🪷", color: "#e0ead6", desc: "Glossy leaves and white blooms. It droops when thirsty, so it tells you when to water." },
  { id: 8, slug: "rubber-plant", name: "Rubber Plant", category: "Trees", price: 999, rating: 4.6, emoji: "🌳", color: "#cde0c8", desc: "Thick, deep green leaves on a strong stem. Grows into a small indoor tree." },
  { id: 9, slug: "ceramic-pot", name: "Glazed Ceramic Pot", category: "Pots & tools", price: 399, rating: 4.7, emoji: "🪴", color: "#e8dcc4", desc: "Hand-glazed pot with a drainage hole and a matching saucer." },
  { id: 10, slug: "watering-can", name: "Brass Watering Can", category: "Pots & tools", price: 699, rating: 4.5, emoji: "🫗", color: "#efe0b4", desc: "A long, slim spout for precise watering of small and hanging pots." },
];

/* ---------- Cart state ---------- */
const CartCtx = createContext(null);
const FREE_SHIP = 999; // free delivery above this subtotal
const SHIP_FEE = 49;

function cartReducer(state, a) {
  switch (a.type) {
    case "add": {
      const found = state.find((i) => i.id === a.id);
      return found
        ? state.map((i) => (i.id === a.id ? { ...i, qty: i.qty + 1 } : i))
        : [...state, { id: a.id, qty: 1 }];
    }
    case "setQty":
      return a.qty < 1
        ? state.filter((i) => i.id !== a.id)
        : state.map((i) => (i.id === a.id ? { ...i, qty: a.qty } : i));
    case "remove":
      return state.filter((i) => i.id !== a.id);
    case "clear":
      return [];
    default:
      return state;
  }
}

function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [], () => {
    try { return JSON.parse(localStorage.getItem("ugaao-cart")) || []; } catch { return []; }
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    try { localStorage.setItem("ugaao-cart", JSON.stringify(items)); } catch {}
  }, [items]);

  const lines = items.map((i) => ({ ...PRODUCTS.find((p) => p.id === i.id), qty: i.qty }));
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const shipping = total === 0 || total >= FREE_SHIP ? 0 : SHIP_FEE;
  const grand = total + shipping;
  const addItem = (id) => { dispatch({ type: "add", id }); setDrawerOpen(true); };
  return (
    <CartCtx.Provider value={{ lines, count, total, shipping, grand, dispatch, addItem, drawerOpen, setDrawerOpen }}>
      {children}
    </CartCtx.Provider>
  );
}
const useCart = () => useContext(CartCtx);

/* ---------- Helpers ---------- */
function useRoute() {
  const get = () => window.location.hash.slice(1) || "/";
  const [path, setPath] = useState(get);
  useEffect(() => {
    const on = () => { setPath(get()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return path;
}
const money = (n) => `₹${n.toLocaleString("en-IN")}`;

function Photo({ p, className = "" }) {
  const [bad, setBad] = useState(false);
  if (bad)
    return <div className={`${className} ph`} style={{ background: p.color }}><span>{p.emoji}</span></div>;
  return (
    <img className={className} src={p.image || `${import.meta.env.BASE_URL}plants/${p.slug}.jpg`} alt={p.name}
         loading="lazy" onError={() => setBad(true)} />
  );
}

/* ---------- Components ---------- */
function Header() {
  const { count, setDrawerOpen } = useCart();
  return (
    <header className="bar">
      <a href="#/" className="logo">ugaao</a>
      <nav>
        <a href="#/">Shop</a>
        <button className="cart-link" onClick={() => setDrawerOpen(true)} aria-label={`Open cart, ${count} items`}>
          Cart <span className="badge">{count}</span>
        </button>
      </nav>
    </header>
  );
}

function Totals({ total, shipping, grand }) {
  return (
    <dl className="totals">
      <div><dt>Subtotal</dt><dd>{money(total)}</dd></div>
      <div><dt>Delivery</dt><dd>{shipping === 0 ? "Free" : money(shipping)}</dd></div>
      <div className="grand"><dt>Total</dt><dd>{money(grand)}</dd></div>
    </dl>
  );
}

function OrderLines({ lines }) {
  return (
    <ul className="order-lines">
      {lines.map((l) => (
        <li key={l.id}>
          <Photo p={l} className="mini" />
          <span className="grow">{l.name}<br /><span className="muted">Qty {l.qty}</span></span>
          <strong>{money(l.price * l.qty)}</strong>
        </li>
      ))}
    </ul>
  );
}

function CartDrawer() {
  const { lines, total, shipping, grand, dispatch, drawerOpen, setDrawerOpen } = useCart();
  const close = () => setDrawerOpen(false);
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, setDrawerOpen]);
  if (!drawerOpen) return null;

  const remaining = FREE_SHIP - total;
  return (
    <div className="drawer-wrap">
      <div className="scrim" onClick={close} />
      <aside className="drawer" role="dialog" aria-label="Your cart">
        <div className="drawer-head">
          <h2>Your cart</h2>
          <button className="icon-btn" onClick={close} aria-label="Close cart">✕</button>
        </div>
        {lines.length === 0 ? (
          <div className="drawer-body">
            <p className="empty">Nothing here yet. Add a plant and it will show up here.</p>
            <a href="#/" className="btn block" onClick={close}>Browse plants</a>
          </div>
        ) : (
          <>
            <div className="drawer-body">
              <div className="ship">
                {remaining > 0 ? `Add ${money(remaining)} more for free delivery` : "You get free delivery"}
                <div className="track"><div style={{ width: `${Math.min(100, (total / FREE_SHIP) * 100)}%` }} /></div>
              </div>
              <ul className="lines compact">
                {lines.map((l) => (
                  <li key={l.id}>
                    <Photo p={l} className="mini" />
                    <span className="grow">
                      {l.name}<br /><span className="muted">{money(l.price)}</span>
                      <span className="qty">
                        <button aria-label="Decrease" onClick={() => dispatch({ type: "setQty", id: l.id, qty: l.qty - 1 })}>−</button>
                        {l.qty}
                        <button aria-label="Increase" onClick={() => dispatch({ type: "setQty", id: l.id, qty: l.qty + 1 })}>+</button>
                      </span>
                    </span>
                    <span className="col-end">
                      <strong>{money(l.price * l.qty)}</strong>
                      <button className="link" onClick={() => dispatch({ type: "remove", id: l.id })}>Remove</button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="drawer-foot">
              <Totals total={total} shipping={shipping} grand={grand} />
              <a href="#/checkout" className="btn block" onClick={close}>Checkout</a>
              <a href="#/cart" className="link center" onClick={close}>View full cart</a>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

function Hero() {
  const picks = PRODUCTS.filter((p) => [1, 3, 4].includes(p.id));
  return (
    <section className="hero">
      <div className="hero-text">
        <h1>Grow something green at home.</h1>
        <p className="lead">Healthy indoor plants and small trees, packed with care and delivered to your door. ugaao means “grow”.</p>
        <a href="#shop" className="btn" onClick={(e) => { e.preventDefault(); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }}>Shop plants</a>
      </div>
      <div className="hero-art">
        {picks.map((p, i) => (
          <a key={p.id} href={`#/product/${p.id}`} className={`arch a${i}`}><Photo p={p} /></a>
        ))}
      </div>
    </section>
  );
}

function ProductCard({ p }) {
  const { addItem } = useCart();
  return (
    <article className="card">
      <a href={`#/product/${p.id}`} className="thumb" aria-label={p.name}><Photo p={p} /></a>
      <div className="card-body">
        <p className="muted">{p.category}</p>
        <h3><a href={`#/product/${p.id}`}>{p.name}</a></h3>
        <div className="row">
          <div><strong>{money(p.price)}</strong> <span className="muted">★ {p.rating}</span></div>
          <button className="btn small" onClick={() => addItem(p.id)}>Add</button>
        </div>
      </div>
    </article>
  );
}

function Shop() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(2000);
  const categories = ["All", ...new Set(PRODUCTS.map((p) => p.category))];

  const visible = useMemo(() => {
    let list = PRODUCTS.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        p.price <= maxPrice &&
        p.name.toLowerCase().includes(query.trim().toLowerCase())
    );
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [query, category, sort, maxPrice]);

  return (
    <>
      <Hero />
      <main className="wrap" id="shop">
        <h2>All plants</h2>
        <div className="filters">
          <input type="search" placeholder="Search plants" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search plants" />
          <div className="chips" role="group" aria-label="Category">
            {categories.map((c) => (
              <button key={c} className={`chip ${c === category ? "on" : ""}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>
          <label className="range">Up to {money(maxPrice)}
            <input type="range" min="200" max="2000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} />
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
        {visible.length === 0 ? (
          <p className="empty">Nothing matches these filters. Try a higher price limit or a different search.</p>
        ) : (
          <div className="grid">{visible.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        )}
      </main>
    </>
  );
}

function ProductPage({ id }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const p = PRODUCTS.find((x) => x.id === Number(id));
  if (!p) return <main className="wrap"><p className="empty">Product not found. <a href="#/">Back to shop</a></p></main>;
  const add = () => { addItem(p.id); setAdded(true); setTimeout(() => setAdded(false), 1500); };
  return (
    <main className="wrap detail">
      <Photo p={p} className="big" />
      <div>
        <a href="#/" className="muted">← All plants</a>
        <h1>{p.name}</h1>
        <p className="muted">{p.category} · ★ {p.rating}</p>
        <p className="lead">{p.desc}</p>
        <p className="price">{money(p.price)}</p>
        <button className="btn" onClick={add}>{added ? "Added to cart" : "Add to cart"}</button>
      </div>
    </main>
  );
}

function CartPage() {
  const { lines, total, shipping, grand, dispatch } = useCart();
  if (!lines.length)
    return <main className="wrap"><h1>Your cart</h1><p className="empty">Your cart is empty. <a href="#/">Browse plants</a></p></main>;
  return (
    <main className="wrap">
      <h1>Your cart</h1>
      <ul className="lines">
        {lines.map((l) => (
          <li key={l.id}>
            <Photo p={l} className="mini" />
            <span className="grow">{l.name}<br /><span className="muted">{money(l.price)} each</span></span>
            <span className="qty">
              <button aria-label="Decrease" onClick={() => dispatch({ type: "setQty", id: l.id, qty: l.qty - 1 })}>−</button>
              {l.qty}
              <button aria-label="Increase" onClick={() => dispatch({ type: "setQty", id: l.id, qty: l.qty + 1 })}>+</button>
            </span>
            <strong className="line-total">{money(l.price * l.qty)}</strong>
            <button className="link" onClick={() => dispatch({ type: "remove", id: l.id })}>Remove</button>
          </li>
        ))}
      </ul>
      <div className="summary-box cart-summary">
        <Totals total={total} shipping={shipping} grand={grand} />
        <a href="#/checkout" className="btn block">Proceed to checkout</a>
        <a href="#/" className="link center">Continue shopping</a>
      </div>
    </main>
  );
}

function Checkout() {
  const { lines, total, shipping, grand, dispatch } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });
  const [errors, setErrors] = useState({});
  const [receipt, setReceipt] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!form.name.trim()) err.name = "Enter your full name.";
    if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) err.phone = "Enter a 10-digit mobile number.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Enter a valid email address.";
    if (form.address.trim().length < 8) err.address = "Enter your full delivery address.";
    setErrors(err);
    if (Object.keys(err).length) return;
    // Replace with: await fetch("/api/orders", { method: "POST", body: JSON.stringify({ form, lines }) })
    setReceipt({ id: Math.random().toString(36).slice(2, 8).toUpperCase(), name: form.name, email: form.email, lines, total, shipping, grand });
    dispatch({ type: "clear" });
  };

  if (receipt)
    return (
      <main className="wrap narrow">
        <h1>Order placed</h1>
        <p className="lead">Thanks, {receipt.name}. Order <strong>{receipt.id}</strong> is confirmed. We sent the receipt to {receipt.email}.</p>
        <div className="summary-box">
          <OrderLines lines={receipt.lines} />
          <Totals total={receipt.total} shipping={receipt.shipping} grand={receipt.grand} />
        </div>
        <a href="#/" className="btn">Keep shopping</a>
      </main>
    );
  if (!lines.length)
    return <main className="wrap"><h1>Checkout</h1><p className="empty">Your cart is empty. <a href="#/">Browse plants</a></p></main>;

  const fields = [["name", "Full name", "text"], ["phone", "Mobile number", "tel"], ["email", "Email", "email"], ["address", "Delivery address", "text"]];
  return (
    <main className="wrap">
      <h1>Checkout</h1>
      <div className="co-grid">
        <form onSubmit={submit} noValidate>
          {fields.map(([k, label, type]) => (
            <label key={k} className="field">{label}
              <input type={type} value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} />
              {errors[k] && <span className="error">{errors[k]}</span>}
            </label>
          ))}
          <button className="btn" type="submit">Place order · {money(grand)}</button>
        </form>
        <aside className="summary-box">
          <h2>Your order</h2>
          <OrderLines lines={lines} />
          <Totals total={total} shipping={shipping} grand={grand} />
          <a href="#/cart" className="link center">Edit cart</a>
        </aside>
      </div>
    </main>
  );
}

/* ---------- App ---------- */
export default function App() {
  const path = useRoute();
  const parts = path.split("/").filter(Boolean);
  let page = <Shop />;
  if (parts[0] === "product") page = <ProductPage id={parts[1]} />;
  if (parts[0] === "cart") page = <CartPage />;
  if (parts[0] === "checkout") page = <Checkout />;
  useEffect(() => { document.title = "ugaao | plants and trees"; }, []);
  return (
    <CartProvider>
      <style>{CSS}</style>
      <Header />
      <CartDrawer />
      {page}
      <footer className="foot">ugaao · Plants delivered with care</footer>
    </CartProvider>
  );
}

/* ---------- Styles ---------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Nunito+Sans:wght@400;600;700&display=swap');
:root{--bg:#f2f6ef;--surface:#fff;--ink:#16261d;--muted:#5f7066;--brand:#1c4a35;--leaf:#4a8a56;--marigold:#f2b134;--line:#d9e3d6;--r:16px}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--ink);font:400 17px/1.6 'Nunito Sans',system-ui,sans-serif}
h1,h2,h3,.logo{font-family:'Fraunces',Georgia,serif;line-height:1.12;margin:0}
h1{font-size:clamp(2.2rem,5.5vw,3.8rem);font-weight:700;letter-spacing:-.02em;margin-bottom:1rem}
h2{font-size:clamp(1.6rem,3vw,2.1rem);margin-bottom:1.2rem}
a{color:inherit}
:focus-visible{outline:3px solid var(--marigold);outline-offset:2px}

.bar{display:flex;justify-content:space-between;align-items:center;padding:.8rem clamp(1rem,4vw,3rem);background:rgba(242,246,239,.88);backdrop-filter:blur(10px);position:sticky;top:0;z-index:5;border-bottom:1px solid var(--line)}
.logo{font-size:1.9rem;font-weight:700;color:var(--brand);text-decoration:none;letter-spacing:-.02em}
.bar nav{display:flex;gap:1.6rem;align-items:center}
.bar nav a{text-decoration:none;font-weight:700}
.cart-link{background:none;border:0;font:700 1rem 'Nunito Sans',sans-serif;color:var(--ink);cursor:pointer;padding:0}
.badge{background:var(--brand);color:#fff;border-radius:99px;padding:.05rem .6rem;margin-left:.25rem;font-size:.85rem}

.hero{max-width:1100px;margin:0 auto;padding:3.5rem clamp(1rem,4vw,2rem) 2rem;display:grid;grid-template-columns:1.1fr 1fr;gap:2.5rem;align-items:center}
.hero-text .lead{max-width:34ch;margin-bottom:1.6rem}
.hero-art{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:200px 200px;gap:1rem}
.arch{display:block;overflow:hidden;background:#dbe9d6}
.arch img,.arch .ph{width:100%;height:100%;object-fit:cover;display:grid}
.a0{grid-row:1 / 3;border-radius:999px 999px 20px 20px}
.a1{border-radius:20px 999px 20px 20px}
.a2{border-radius:20px 20px 999px 20px}

.wrap{max-width:1100px;margin:0 auto;padding:2rem clamp(1rem,4vw,2rem) 4rem}
.narrow{max-width:520px}
.muted{color:var(--muted);margin:0;font-size:.95rem}
.lead{font-size:1.15rem;max-width:46ch}
.filters{display:flex;flex-wrap:wrap;gap:.8rem 1.2rem;align-items:center;margin-bottom:1.8rem}
input,select{font:inherit;padding:.6rem .85rem;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--ink)}
.chips{display:flex;gap:.4rem;flex-wrap:wrap}
.chip{font:inherit;font-weight:600;border:1px solid var(--line);background:var(--surface);border-radius:99px;padding:.4rem 1rem;cursor:pointer}
.chip.on{background:var(--brand);color:#fff;border-color:var(--brand)}
.range{display:flex;flex-direction:column;font-size:.9rem;color:var(--muted)}
.range input{padding:0;accent-color:var(--leaf)}

.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.4rem}
.card{background:var(--surface);border-radius:var(--r);overflow:hidden;border:1px solid var(--line);transition:transform .2s,box-shadow .2s}
.card:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(28,74,53,.12)}
.thumb{display:block;aspect-ratio:4/5;overflow:hidden;background:#e4eee0}
.thumb img,.thumb .ph{width:100%;height:100%;object-fit:cover;transition:transform .4s}
.card:hover .thumb img{transform:scale(1.04)}
.ph{display:grid;place-items:center;font-size:3.5rem}
.card-body{padding:1rem 1.1rem 1.2rem}
.card h3{font-size:1.2rem;margin:.1rem 0 .7rem}
.card h3 a{text-decoration:none}
.row{display:flex;justify-content:space-between;align-items:center}

.btn{display:inline-block;font:700 1rem 'Nunito Sans',sans-serif;background:var(--brand);color:#fff;border:0;border-radius:99px;padding:.8rem 1.6rem;cursor:pointer;text-decoration:none;transition:background .2s}
.btn:hover{background:#14382a}
.btn.small{padding:.45rem 1.1rem;font-size:.92rem;background:var(--marigold);color:var(--ink)}
.btn.small:hover{background:#e6a21f}
.empty{background:var(--surface);border:1px dashed var(--line);border-radius:var(--r);padding:1.5rem}

.detail{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start}
.big{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:var(--r)}
.detail h1{font-size:clamp(2rem,4vw,2.8rem);margin-top:.8rem}
.price{font:700 2rem 'Fraunces',serif;margin:1.2rem 0}

.lines{list-style:none;padding:0;margin:0}
.lines li{display:flex;align-items:center;gap:1rem;background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:.8rem 1rem;margin-bottom:.8rem;flex-wrap:wrap}
.grow{flex:1;min-width:140px}
.mini{width:64px;height:64px;border-radius:12px;object-fit:cover}
.qty{display:flex;align-items:center;gap:.6rem}
.qty button{width:34px;height:34px;border-radius:50%;border:1px solid var(--line);background:var(--surface);cursor:pointer;font-size:1.1rem}
.line-total{min-width:80px;text-align:right}
.link{background:none;border:0;color:var(--muted);text-decoration:underline;cursor:pointer;font:inherit}
.summary{display:flex;justify-content:flex-end;align-items:center;gap:1.2rem;margin-top:1.4rem;font-size:1.2rem}
.field{display:block;margin-bottom:1rem;font-weight:700}
.field input{display:block;width:100%;margin-top:.3rem;font-weight:400}
.field input[aria-invalid="true"]{border-color:#b3261e}
.error{color:#b3261e;font-weight:400;font-size:.9rem}
.summary-line{font-size:1.15rem}
.foot{text-align:center;padding:2rem;color:var(--muted);border-top:1px solid var(--line)}

.btn.block{display:block;width:100%;text-align:center}
.link.center{display:block;text-align:center;margin-top:.7rem}
.summary-box{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);padding:1.3rem}
.summary-box h2{font-size:1.4rem;margin-bottom:1rem}
.cart-summary{max-width:380px;margin:1.5rem 0 0 auto}
.totals{margin:1rem 0}
.totals div{display:flex;justify-content:space-between;padding:.25rem 0}
.totals dt,.totals dd{margin:0}
.totals .grand{border-top:1px solid var(--line);margin-top:.4rem;padding-top:.7rem;font-weight:700;font-size:1.2rem}
.order-lines{list-style:none;padding:0;margin:0}
.order-lines li{display:flex;align-items:center;gap:.8rem;padding:.5rem 0}
.co-grid{display:grid;grid-template-columns:1fr 400px;gap:2.5rem;align-items:start}
.drawer-wrap{position:fixed;inset:0;z-index:20}
.scrim{position:absolute;inset:0;background:rgba(22,38,29,.45)}
.drawer{position:absolute;top:0;right:0;bottom:0;width:min(430px,100%);background:var(--bg);display:flex;flex-direction:column;box-shadow:-10px 0 30px rgba(0,0,0,.15);animation:slide .25s ease-out}
@keyframes slide{from{transform:translateX(100%)}to{transform:none}}
.drawer-head{display:flex;justify-content:space-between;align-items:center;padding:1.1rem 1.3rem;border-bottom:1px solid var(--line)}
.drawer-head h2{margin:0;font-size:1.5rem}
.icon-btn{width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:var(--surface);cursor:pointer;font-size:1rem}
.drawer-body{flex:1;overflow-y:auto;padding:1.1rem 1.3rem}
.drawer-foot{padding:1rem 1.3rem 1.3rem;border-top:1px solid var(--line);background:var(--surface)}
.ship{font-size:.95rem;font-weight:700;margin-bottom:1rem}
.track{height:8px;border-radius:99px;background:var(--line);margin-top:.4rem;overflow:hidden}
.track div{height:100%;background:var(--leaf);transition:width .3s}
.lines.compact li{padding:.7rem;align-items:flex-start}
.lines.compact .qty{margin-top:.4rem}
.col-end{display:flex;flex-direction:column;align-items:flex-end;gap:.4rem}
@media(max-width:760px){
  .co-grid{grid-template-columns:1fr}
  .cart-summary{max-width:none}
  .hero{grid-template-columns:1fr;padding-top:2rem}
  .hero-art{grid-template-rows:170px 170px}
  .detail{grid-template-columns:1fr;gap:1.5rem}
}
@media(prefers-reduced-motion:reduce){*{transition:none!important;scroll-behavior:auto!important}}
`;
