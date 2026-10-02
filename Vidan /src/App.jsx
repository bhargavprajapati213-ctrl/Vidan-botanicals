import { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import { SearchPanel, AccountPanel, CartPanel } from './components/Panels.jsx';
import UserPanel from './components/UserPanel.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import {
  Hero, Intro, FeaturedProducts, WhyChoose, Collections, Testimonials, Blogs, Faq, Benefits, Footer,
} from './components/Sections.jsx';
import { useStore, selectCurrentUser, placeOrder } from './store.js';

// "#/account" and "#/admin" are pages; any other hash (#shop, #faq…) is a section of the home page.
const routeFromHash = () => {
  const h = window.location.hash;
  if (h.startsWith('#/admin')) return 'admin';
  if (h.startsWith('#/account')) return 'account';
  return 'home';
};

const CART_KEY = 'vidan-cart';
const loadCart = () => {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; }
};

export default function App() {
  const [savedCart, setCart] = useState(loadCart); // { productId: qty }
  const [panel, setPanel] = useState(null); // 'search' | 'account' | 'cart' | null
  const [route, setRoute] = useState(routeFromHash);
  const [toast, setToast] = useState('');
  const toastTimer = useRef();
  const user = useStore(selectCurrentUser);
  const products = useStore((s) => s.products);

  // Ignore cart entries for products an admin has since deleted.
  const cart = Object.fromEntries(Object.entries(savedCart).filter(([id]) => products.some((p) => p.id === id)));

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(savedCart)); } catch { /* storage unavailable */ }
  }, [savedCart]);

  useEffect(() => {
    const onHash = () => {
      setRoute(routeFromHash());
      setPanel(null);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // When returning to the home page via a section link, scroll to it once it has rendered.
  useEffect(() => {
    if (route !== 'home') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, [route]);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  };

  const addToCart = (product) => {
    setCart((c) => ({ ...c, [product.id]: (c[product.id] || 0) + 1 }));
    showToast(`${product.name} added to cart`);
  };

  const changeQty = (id, qty) => {
    setCart((c) => {
      const next = { ...c };
      if (qty > 0) next[id] = qty; else delete next[id];
      return next;
    });
  };

  const checkout = (address) => {
    if (!user) {
      setPanel('account');
      showToast('Please sign in to checkout');
      return;
    }
    try {
      const order = placeOrder(cart, address);
      setCart({});
      showToast(`Order #${order.id} placed!`);
      window.location.hash = '#/account';
    } catch (err) {
      showToast(err.message);
    }
  };

  const closePanel = useCallback(() => setPanel(null), []);
  const openSignIn = useCallback(() => setPanel('account'), []);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <>
      <Header cartCount={cartCount} onOpen={setPanel} />
      <main>
        {route === 'admin' && <AdminPanel onSignIn={openSignIn} />}
        {route === 'account' && <UserPanel onSignIn={openSignIn} />}
        {route === 'home' && (
          <>
            <Hero />
            <Intro />
            <FeaturedProducts onAdd={addToCart} />
            <WhyChoose />
            <Collections onAdd={addToCart} />
            <Testimonials />
            <Blogs />
            <Faq />
            <Benefits />
          </>
        )}
      </main>
      <Footer />
      {panel === 'search' && <SearchPanel onClose={closePanel} onAdd={addToCart} />}
      {panel === 'account' && <AccountPanel onClose={closePanel} />}
      {panel === 'cart' && <CartPanel cart={cart} user={user} onClose={closePanel} onChangeQty={changeQty} onCheckout={checkout} />}
      <div className={`toast ${toast ? 'show' : ''}`} role="status">{toast}</div>
    </>
  );
}
