import { useEffect, useRef, useState } from 'react';
import Bottle from './Bottle.jsx';
import Icon from './Icon.jsx';
import { formatPrice } from '../data/site.js';
import { useStore, selectCurrentUser, login, register, logout } from '../store.js';

// Slide-in side panel shared by search, account and cart.
function Drawer({ title, onClose, children, footer }) {
  const panelRef = useRef();
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector('input, button:not(.drawer-close)')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={title} ref={panelRef}
        onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h3>{title}</h3>
          <button className="drawer-close" aria-label="Close" onClick={onClose}><Icon name="close" size={20} /></button>
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </aside>
    </div>
  );
}

export function SearchPanel({ onClose, onAdd }) {
  const products = useStore((st) => st.products);
  const [q, setQ] = useState('');
  const term = q.trim().toLowerCase();
  const results = term
    ? products.filter((p) => [p.name, p.sub, p.title, p.collection, ...p.benefits].join(' ').toLowerCase().includes(term))
    : products;
  return (
    <Drawer title="Search" onClose={onClose}>
      <div className="search-field">
        <Icon name="search" size={18} />
        <input type="search" placeholder="Search products, e.g. sleep, turmeric…" value={q}
          onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
      </div>
      <p className="muted small">{term ? `${results.length} result${results.length === 1 ? '' : 's'}` : 'All products'}</p>
      <ul className="panel-list">
        {results.map((p) => (
          <li key={p.id} className="panel-item">
            <Bottle product={p} size={56} />
            <div className="panel-item-info">
              <strong>{p.name}</strong>
              <span className="muted small">{p.sub}</span>
              <span className="panel-price">{formatPrice(p.price)}</span>
            </div>
            <button className="btn-add" onClick={() => onAdd(p)}>Add</button>
          </li>
        ))}
      </ul>
      {term && results.length === 0 && <p className="muted">No products match “{q}”.</p>}
    </Drawer>
  );
}

export function AccountPanel({ onClose }) {
  const user = useStore(selectCurrentUser);
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const field = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await (mode === 'login' ? login(form) : register(form));
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer title="My Account" onClose={onClose}>
      {user ? (
        <div className="account-box">
          <div className="avatar account-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <h4>Hi, {user.name}</h4>
          <p className="muted small">{user.email}</p>
          <a href="#/account" className="btn btn-dark" onClick={onClose}>My dashboard</a>
          {user.role === 'admin' && <a href="#/admin" className="btn btn-outline" onClick={onClose}>Admin panel</a>}
          <button className="link-btn" onClick={logout}>Sign out</button>
        </div>
      ) : (
        <form className="account-form" onSubmit={submit}>
          <div className="seg">
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); }}>Sign in</button>
            <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); }}>Create account</button>
          </div>
          {mode === 'register' && <label>Name<input required {...field('name')} /></label>}
          <label>Email<input required type="email" autoComplete="email" {...field('email')} /></label>
          <label>Password
            <input required type="password" minLength={6} {...field('password')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-dark" type="submit" disabled={busy}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>
      )}
    </Drawer>
  );
}

export function CartPanel({ cart, user, onClose, onChangeQty, onCheckout }) {
  const products = useStore((s) => s.products);
  const [address, setAddress] = useState(user?.address || '');
  const items = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
    .filter((i) => i.product);
  const total = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  return (
    <Drawer title="Your Cart" onClose={onClose} footer={items.length > 0 && (
      <>
        <div className="cart-total"><span>Subtotal</span><strong>{formatPrice(total)}</strong></div>
        {user ? (
          <form className="account-form" onSubmit={(e) => { e.preventDefault(); onCheckout(address); }}>
            <label>Shipping address
              <textarea required rows={2} value={address} onChange={(e) => setAddress(e.target.value)} />
            </label>
            <button className="btn btn-dark cart-checkout">Place order</button>
          </form>
        ) : (
          <button className="btn btn-dark cart-checkout" onClick={() => onCheckout()}>Sign in to checkout</button>
        )}
      </>
    )}>
      {items.length === 0 ? (
        <div className="cart-empty">
          <Icon name="bag" size={40} />
          <p className="muted">Your cart is empty.</p>
          <a href="#shop" className="btn btn-outline" onClick={onClose}>Shop products</a>
        </div>
      ) : (
        <ul className="panel-list">
          {items.map(({ product: p, qty }) => (
            <li key={p.id} className="panel-item">
              <Bottle product={p} size={56} />
              <div className="panel-item-info">
                <strong>{p.name}</strong>
                <span className="panel-price">{formatPrice(p.price * qty)}</span>
                <div className="qty">
                  <button aria-label={`Decrease ${p.name}`} onClick={() => onChangeQty(p.id, qty - 1)}>−</button>
                  <span>{qty}</span>
                  <button aria-label={`Increase ${p.name}`} onClick={() => onChangeQty(p.id, qty + 1)}>+</button>
                </div>
              </div>
              <button className="remove-btn" aria-label={`Remove ${p.name}`} onClick={() => onChangeQty(p.id, 0)}>
                <Icon name="close" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
