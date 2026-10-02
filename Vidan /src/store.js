// Shared app data (products, users, orders, session) kept in localStorage.
// NOTE: this is a front-end-only demo store. Anyone can edit their own browser
// storage, so before going live, move users/orders/products to a real backend.
import { useSyncExternalStore } from 'react';
import { products as seedProducts } from './data/site.js';

const KEY = 'vidan-store-v1';

const seed = () => ({
  products: seedProducts,
  users: [{
    id: 'admin',
    name: 'Store Admin',
    email: 'admin@vidan.example',
    // sha256("admin123") — change this password after first sign-in.
    passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    role: 'admin',
    phone: '',
    address: '',
    createdAt: new Date().toISOString(),
  }],
  orders: [],
  sessionUserId: null,
});

const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved?.products && saved?.users && saved?.orders) return saved;
  } catch { /* storage unavailable or corrupt */ }
  return seed();
};

let state = load();
const listeners = new Set();
const notify = () => listeners.forEach((l) => l());

// Re-read before every write so a change made in another tab is never overwritten by stale data.
const setState = (updater) => {
  const latest = load();
  state = { ...latest, ...updater(latest) };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  notify();
};

// Keep every open tab in sync (e.g. admin edits a product while the shop is open elsewhere).
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    state = load();
    notify();
  });
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useStore = (selector) => useSyncExternalStore(subscribe, () => selector(state));
export const selectCurrentUser = (s) => s.users.find((u) => u.id === s.sessionUserId) || null;

const newId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

async function hashPassword(pw) {
  if (!crypto?.subtle) throw new Error('Secure context required — open the site via localhost or https.');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ---------- Auth ---------- */
export async function register({ name, email, password }) {
  email = email.trim().toLowerCase();
  if (state.users.some((u) => u.email === email)) throw new Error('An account with this email already exists.');
  if (password.length < 6) throw new Error('Password must be at least 6 characters.');
  const user = {
    id: newId('u'), name: name.trim(), email, passwordHash: await hashPassword(password),
    role: 'customer', phone: '', address: '', createdAt: new Date().toISOString(),
  };
  setState((s) => ({ users: [...s.users, user], sessionUserId: user.id }));
}

export async function login({ email, password }) {
  const user = state.users.find((u) => u.email === email.trim().toLowerCase());
  if (!user || user.passwordHash !== await hashPassword(password)) throw new Error('Incorrect email or password.');
  setState(() => ({ sessionUserId: user.id }));
}

export const logout = () => setState(() => ({ sessionUserId: null }));

export function updateProfile(id, fields) {
  setState((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...fields } : u)) }));
}

export async function changePassword(id, current, next) {
  const user = state.users.find((u) => u.id === id);
  if (!user || user.passwordHash !== await hashPassword(current)) throw new Error('Current password is incorrect.');
  if (next.length < 6) throw new Error('New password must be at least 6 characters.');
  const passwordHash = await hashPassword(next);
  updateProfile(id, { passwordHash });
}

/* ---------- Admin: users ---------- */
export function setUserRole(id, role) {
  const admins = state.users.filter((u) => u.role === 'admin');
  if (role !== 'admin' && admins.length === 1 && admins[0].id === id) throw new Error('At least one admin is required.');
  updateProfile(id, { role });
}

export function deleteUser(id) {
  if (id === state.sessionUserId) throw new Error('You cannot delete your own account while signed in.');
  setState((s) => ({ users: s.users.filter((u) => u.id !== id) }));
}

/* ---------- Admin: products ---------- */
export function saveProduct(product) {
  setState((s) => {
    const exists = s.products.some((p) => p.id === product.id);
    return {
      products: exists
        ? s.products.map((p) => (p.id === product.id ? product : p))
        : [...s.products, { ...product, id: product.id || newId('p') }],
    };
  });
}

export const deleteProduct = (id) => setState((s) => ({ products: s.products.filter((p) => p.id !== id) }));

/* ---------- Orders ---------- */
export const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export function placeOrder(cart, address) {
  const user = selectCurrentUser(state);
  if (!user) throw new Error('Please sign in to place an order.');
  address = (address ?? user.address).trim();
  if (!address) throw new Error('Please add a shipping address.');
  if (address !== user.address) updateProfile(user.id, { address });
  const items = Object.entries(cart)
    .map(([id, qty]) => {
      const p = state.products.find((x) => x.id === id);
      return p && { id, name: p.name, price: p.price, qty };
    })
    .filter(Boolean);
  if (!items.length) throw new Error('Your cart is empty.');
  const order = {
    id: `VD${Date.now().toString().slice(-8)}`,
    userId: user.id,
    customer: user.name,
    email: user.email,
    address,
    items,
    total: items.reduce((sum, i) => sum + i.price * i.qty, 0),
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  setState((s) => ({ orders: [order, ...s.orders] }));
  return order;
}

export function updateOrderStatus(id, status) {
  setState((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) }));
}
