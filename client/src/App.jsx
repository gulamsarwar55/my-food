import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownUp,
  ArrowRight,
  Check,
  ChefHat,
  ChevronDown,
  Clock3,
  Flame,
  Leaf,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  ShoppingBasket,
  Sparkles,
  Star,
  X,
} from 'lucide-react';

const fallbackMenu = [
  { _id: 'roast-bowl', name: 'Sunday roast bowl', description: 'Slow-roasted chicken, herby potatoes, greens & lemon gravy.', category: 'Mains', price: 14.5, rating: 4.9, time: '25 min', tag: 'Bestseller', image: 'photo-1547592180-85f173990554', tint: 'sage' },
  { _id: 'garden-pasta', name: 'Garden pesto pasta', description: 'Basil pesto, blistered tomatoes, parmesan & toasted pine nuts.', category: 'Mains', price: 13, rating: 4.8, time: '20 min', tag: 'Veggie', image: 'photo-1473093295043-cdd812d0e601', tint: 'peach' },
  { _id: 'crispy-tacos', name: 'Crispy fish tacos', description: 'Golden cod, crunchy slaw, pickled onion & smoky crema.', category: 'Mains', price: 15.5, rating: 4.9, time: '30 min', tag: 'Popular', image: 'photo-1551504734-5ee1c4a1479b', tint: 'yellow' },
  { _id: 'green-salad', name: 'Little green salad', description: 'Avocado, cucumber, edamame & ginger sesame dressing.', category: 'Salads', price: 11, rating: 4.7, time: '15 min', tag: 'Fresh pick', image: 'photo-1512621776951-a57141f2eefd', tint: 'mint' },
  { _id: 'tomato-soup', name: 'Roasted tomato soup', description: 'Slow-roasted tomatoes, basil oil & sourdough for dipping.', category: 'Sides', price: 8.5, rating: 4.8, time: '15 min', tag: 'Comfort food', image: 'photo-1547592166-23ac45744acd', tint: 'peach' },
  { _id: 'market-sandwich', name: 'Market club sandwich', description: 'Free-range chicken, smashed avocado & crisp little gem.', category: 'Mains', price: 12.5, rating: 4.6, time: '15 min', tag: 'Lunch fave', image: 'photo-1528735602780-2552fd46c7af', tint: 'sage' },
  { _id: 'berry-yogurt', name: 'Berry breakfast pot', description: 'Thick Greek yogurt, maple granola & seasonal berries.', category: 'Breakfast', price: 7.5, rating: 4.8, time: '5 min', tag: 'No prep', image: 'photo-1488477181946-6428a0291777', tint: 'pink' },
  { _id: 'lemon-cake', name: 'Olive oil lemon cake', description: 'Soft crumb, bright citrus & a spoonful of whipped cream.', category: 'Treats', price: 6.5, rating: 4.9, time: '5 min', tag: 'A little treat', image: 'photo-1519915028121-7d3463d20b13', tint: 'yellow' },
];

const categories = ['Everything', 'Mains', 'Salads', 'Sides', 'Breakfast', 'Treats'];
const formatPrice = (price) => `$${Number(price).toFixed(2)}`;
const imageUrl = (id, width = 720) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=82`;

function ProductCard({ product, onAdd, quantity }) {
  return (
    <article className="product-card">
      <div className={`product-image ${product.tint || 'sage'}`}>
        <img src={imageUrl(product.image)} alt={product.name} loading="lazy" />
        <span className="product-tag"><Sparkles size={12} />{product.tag}</span>
        <button className={`quick-add ${quantity ? 'is-added' : ''}`} onClick={() => onAdd(product)} aria-label={`Add ${product.name} to basket`} title={`Add ${product.name}`}>
          {quantity ? <Check size={19} /> : <Plus size={20} />}
        </button>
      </div>
      <div className="product-info">
        <div className="product-title-row"><h3>{product.name}</h3><span className="product-price">{formatPrice(product.price)}</span></div>
        <p>{product.description}</p>
        <div className="product-meta"><span><Star size={13} fill="currentColor" /> {product.rating || '4.8'}</span><i /><span><Clock3 size={13} /> {product.time || '20 min'}</span><span className="in-cart">{quantity ? `${quantity} in basket` : ''}</span></div>
      </div>
    </article>
  );
}

function CartLine({ item, onChange }) {
  return (
    <div className="cart-line">
      <img src={imageUrl(item.image, 180)} alt="" />
      <div className="cart-line-copy"><strong>{item.name}</strong><span>{formatPrice(item.price)}</span><div className="quantity-stepper"><button aria-label={`Remove one ${item.name}`} onClick={() => onChange(item._id, -1)}><Minus size={13} /></button><span>{item.quantity}</span><button aria-label={`Add one ${item.name}`} onClick={() => onChange(item._id, 1)}><Plus size={13} /></button></div></div>
      <strong className="line-total">{formatPrice(item.price * item.quantity)}</strong>
    </div>
  );
}

export default function App() {
  const [menu, setMenu] = useState(fallbackMenu);
  const [category, setCategory] = useState('Everything');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('good-food-cart') || '[]'); } catch { return []; }
  });
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: '', email: '', address: '' });
  const [orderStatus, setOrderStatus] = useState('');
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [menuSource, setMenuSource] = useState('demo');

  useEffect(() => {
    localStorage.setItem('good-food-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    fetch('/api/products')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Menu API unavailable')))
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setMenu(data.map((item) => ({ ...item, image: item.image || fallbackMenu.find((food) => food._id === item._id)?.image || fallbackMenu[0].image, tint: item.tint || 'sage' })));
          setMenuSource('api');
        }
      })
      .catch(() => setMenuSource('demo'));
  }, []);

  const visibleMenu = useMemo(() => {
    const query = search.trim().toLowerCase();
    return menu
      .filter((item) => category === 'Everything' || item.category === category)
      .filter((item) => !query || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query))
      .sort((a, b) => sort === 'price' ? a.price - b.price : Number(b.rating || 0) - Number(a.rating || 0));
  }, [menu, category, search, sort]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const delivery = subtotal === 0 || subtotal >= 30 ? 0 : 2.5;
  const total = subtotal + delivery;

  function addToCart(product) {
    setOrderStatus('');
    setCart((current) => {
      const existing = current.find((item) => item._id === product._id);
      return existing
        ? current.map((item) => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }];
    });
  }

  function changeQuantity(id, difference) {
    setCart((current) => current.map((item) => item._id === id ? { ...item, quantity: item.quantity + difference } : item).filter((item) => item.quantity > 0));
  }

  async function placeOrder(event) {
    event.preventDefault();
    if (!cart.length) return;
    setLoadingOrder(true);
    const payload = { customer, items: cart.map(({ _id, quantity }) => ({ product: _id, quantity })), deliveryAddress: customer.address, paymentMethod: 'cash-on-delivery' };
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Could not place your order. Please try again.');
      const order = await response.json();
      setOrderStatus(`Order ${String(order._id || order.id).slice(-6).toUpperCase()} is confirmed. We’ll be in touch shortly.`);
    } catch {
      const localOrder = `GF-${Date.now().toString().slice(-6)}`;
      setOrderStatus(`Order ${localOrder} is confirmed for the demo. Connect MongoDB to save orders to your database.`);
    }
    setCart([]);
    setCustomer({ name: '', email: '', address: '' });
    setLoadingOrder(false);
  }

  return (
    <div className="app-shell">
      <div className="announcement"><span><Sparkles size={13} /> GOOD FOOD, GOOD MOOD</span><span>Free delivery on orders over $30</span><span className="announcement-right">Made fresh, just for you <ArrowRight size={13} /></span></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Good Food Market home"><span className="brand-icon"><Leaf size={20} /></span><span>goodfood<span className="brand-dot">.</span></span></a>
        <nav className="desktop-nav" aria-label="Main navigation"><a className="nav-active" href="#menu">Order food</a><a href="#how-it-works">Our promise</a><a href="#footer">Find us</a></nav>
        <div className="header-actions"><span className="delivery-note"><span className="status-dot" /> Delivering in <strong>25–35 min</strong></span><button className="basket-button" onClick={() => document.getElementById('basket')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}><ShoppingBasket size={17} /><span>Basket</span><b>{cartCount}</b></button></div>
      </header>

      <main id="top">
        <section className="intro-wrap">
          <div className="intro-copy"><div className="eyebrow"><span className="eyebrow-line" /> YOUR NEIGHBORHOOD KITCHEN</div><h1>Fresh picks.<br /><em>Happy bites.</em></h1><p>Good food, made with care. Pick your favorites and we’ll bring a little joy right to your door.</p><a className="browse-link" href="#menu">Explore today’s menu <ArrowRight size={15} /></a></div>
          <div className="intro-visual"><img src={imageUrl('photo-1547592180-85f173990554', 1000)} alt="A colorful fresh meal prepared with seasonal ingredients" /><div className="visual-sticker"><span>LOCAL<br />& LOVELY</span><span className="sticker-spark">✳</span></div><div className="visual-caption"><span className="caption-dot" /> Cooked fresh today <span className="caption-divider" /> <Clock3 size={13} /> Here in 25–35 min</div></div>
          <div className="delivery-stamp"><span>GOOD THINGS<br />ARE GROWING</span><Leaf size={21} /></div>
        </section>

        <section className="benefits" id="how-it-works"><div><span className="benefit-icon mint-icon"><Leaf size={17} /></span><span><strong>Real ingredients</strong><small>Picked with care</small></span></div><div><span className="benefit-icon peach-icon"><ChefHat size={17} /></span><span><strong>Made to order</strong><small>Never just reheated</small></span></div><div><span className="benefit-icon yellow-icon"><Flame size={17} /></span><span><strong>Good in every bite</strong><small>Local, fresh, delicious</small></span></div><div className="benefit-review"><span className="review-stars">★★★★★</span><span><strong>4.9 out of 5</strong><small>Loved by your neighbors</small></span></div></section>

        <section className="menu-section" id="menu">
          <div className="menu-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> THE GOOD STUFF</div><h2>Today’s <em>menu</em></h2><p>Little-batch cooking, big-time flavor.</p></div><div className="menu-tools"><label className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find something tasty" aria-label="Search menu" />{search && <button aria-label="Clear search" onClick={() => setSearch('')}><X size={15} /></button>}</label><label className="sort-control"><ArrowDownUp size={15} /><select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort menu"><option value="popular">Most loved</option><option value="price">Price: low to high</option></select><ChevronDown size={14} /></label></div></div>
          <div className="category-bar" role="tablist" aria-label="Food categories">{categories.map((item) => <button key={item} role="tab" aria-selected={category === item} className={category === item ? 'category-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
          {visibleMenu.length ? <div className="product-grid">{visibleMenu.map((product) => <ProductCard key={product._id} product={product} onAdd={addToCart} quantity={cart.find((item) => item._id === product._id)?.quantity || 0} />)}</div> : <div className="empty-menu"><Search size={24} /><strong>No bites found</strong><span>Try a different search or category.</span><button onClick={() => { setSearch(''); setCategory('Everything'); }}>Show the whole menu</button></div>}
        </section>

        <section className="basket-section" id="basket">
          <div className="basket-heading"><div className="basket-icon"><ShoppingBag size={19} /></div><div><h2>Your basket <span>{cartCount}</span></h2><p>A lovely choice, if we may say so.</p></div><span className="basket-flower">✳</span></div>
          {orderStatus && <div className="order-confirmation"><span className="confirmation-check"><Check size={17} /></span><span>{orderStatus}</span><button aria-label="Dismiss confirmation" onClick={() => setOrderStatus('')}><X size={15} /></button></div>}
          {cart.length ? <div className="basket-content"><div className="cart-lines">{cart.map((item) => <CartLine key={item._id} item={item} onChange={changeQuantity} />)}</div><div className="basket-summary"><div><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><div><span>Delivery {subtotal > 0 && subtotal < 30 && <small>(free over $30)</small>}</span><span>{delivery ? formatPrice(delivery) : 'Free'}</span></div><div className="summary-total"><strong>Total</strong><strong>{formatPrice(total)}</strong></div><button className="checkout-button" onClick={() => setCheckoutOpen(true)}>Continue to checkout <ArrowRight size={16} /></button><p className="secure-note"><Check size={13} /> Easy, secure checkout</p></div></div> : <div className="empty-basket"><span className="empty-basket-icon"><ShoppingBasket size={23} /></span><span><strong>Your basket is taking a little break</strong><small>Add a few favorites and they’ll show up here.</small></span><a href="#menu">Browse menu <ArrowRight size={14} /></a></div>}
        </section>

        <section className="closing-note"><span className="closing-star">✳</span><div><span className="eyebrow">FROM OUR KITCHEN TO YOURS</span><p>Good things are better <em>shared.</em></p></div><a href="#menu">Find your new favorite <ArrowRight size={15} /></a></section>
      </main>

      <footer id="footer"><a className="brand footer-brand" href="#top"><span className="brand-icon"><Leaf size={19} /></span><span>goodfood<span className="brand-dot">.</span></span></a><span className="footer-middle">A neighborhood kitchen, made with care. © 2026 Good Food Market.</span><span className="footer-right"><span className="status-dot" /> {menuSource === 'api' ? 'Live menu' : 'Demo menu'} <span className="footer-separator">·</span> Cooked fresh, always</span></footer>

      {checkoutOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCheckoutOpen(false); }}><section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title"><div className="modal-top"><span className="modal-icon"><ShoppingBag size={18} /></span><button className="modal-close" aria-label="Close checkout" onClick={() => setCheckoutOpen(false)}><X size={19} /></button></div><div className="eyebrow"><span className="eyebrow-line" /> ALMOST THERE</div><h2 id="checkout-title">Make it <em>yours.</em></h2><p className="modal-intro">Where should we bring all this good stuff?</p><form onSubmit={placeOrder}><label>Your name<input required autoComplete="name" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Jamie Green" /></label><label>Email address<input required type="email" autoComplete="email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} placeholder="jamie@example.com" /></label><label>Delivery address<input required autoComplete="street-address" value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="12 Market Street, City" /></label><div className="checkout-total"><span>{cartCount} good thing{cartCount === 1 ? '' : 's'} · {delivery ? 'Delivery $2.50' : 'Free delivery'}</span><strong>{formatPrice(total)}</strong></div><button className="checkout-button" type="submit" disabled={loadingOrder}>{loadingOrder ? 'Placing your order…' : <>Place order <ArrowRight size={16} /></>}</button><p className="secure-note"><Check size={13} /> No payment needed for this demo checkout</p></form></section></div>}
    </div>
  );
}
