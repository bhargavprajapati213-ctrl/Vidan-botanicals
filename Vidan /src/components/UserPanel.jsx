import { useState } from 'react';
import { formatPrice } from '../data/site.js';
import { useStore, selectCurrentUser, updateProfile, changePassword, logout } from '../store.js';

export const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
export const StatusBadge = ({ status }) => <span className={`status status-${status.toLowerCase()}`}>{status}</span>;

export function SignInPrompt({ onSignIn, text = 'Please sign in to view your account.' }) {
  return (
    <section className="container dash-empty">
      <h2>{text}</h2>
      <button className="btn btn-dark" onClick={onSignIn}>Sign in</button>
    </section>
  );
}

function Orders({ user }) {
  const allOrders = useStore((s) => s.orders);
  const orders = allOrders.filter((o) => o.userId === user.id);
  if (!orders.length) return <p className="muted">You haven’t placed any orders yet. <a href="#shop" className="read-more">Start shopping</a></p>;
  return (
    <div className="order-list">
      {orders.map((o) => (
        <article key={o.id} className="order-card">
          <div className="order-head">
            <div><strong>#{o.id}</strong><span className="muted small"> · {formatDate(o.createdAt)}</span></div>
            <StatusBadge status={o.status} />
          </div>
          <ul>
            {o.items.map((i) => (
              <li key={i.id}><span>{i.name} × {i.qty}</span><span>{formatPrice(i.price * i.qty)}</span></li>
            ))}
          </ul>
          <div className="order-total"><span>Total</span><strong>{formatPrice(o.total)}</strong></div>
        </article>
      ))}
    </div>
  );
}

function Profile({ user }) {
  const [form, setForm] = useState({ name: user.name, phone: user.phone, address: user.address });
  const [pw, setPw] = useState({ current: '', next: '' });
  const [msg, setMsg] = useState({ profile: '', pw: '', pwError: '' });

  const saveProfile = (e) => {
    e.preventDefault();
    updateProfile(user.id, { ...form, name: form.name.trim() });
    setMsg({ ...msg, profile: 'Profile saved.' });
  };
  const savePassword = async (e) => {
    e.preventDefault();
    try {
      await changePassword(user.id, pw.current, pw.next);
      setPw({ current: '', next: '' });
      setMsg({ ...msg, pw: 'Password updated.', pwError: '' });
    } catch (err) {
      setMsg({ ...msg, pw: '', pwError: err.message });
    }
  };

  return (
    <div className="dash-grid-2">
      <form className="dash-card account-form" onSubmit={saveProfile}>
        <h3>Profile</h3>
        <label>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>Email<input value={user.email} disabled /></label>
        <label>Phone<input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label>Shipping address
          <textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>
        {msg.profile && <p className="form-ok">{msg.profile}</p>}
        <button className="btn btn-dark">Save profile</button>
      </form>
      <form className="dash-card account-form" onSubmit={savePassword}>
        <h3>Change password</h3>
        <label>Current password
          <input required type="password" autoComplete="current-password" value={pw.current}
            onChange={(e) => setPw({ ...pw, current: e.target.value })} />
        </label>
        <label>New password
          <input required type="password" minLength={6} autoComplete="new-password" value={pw.next}
            onChange={(e) => setPw({ ...pw, next: e.target.value })} />
        </label>
        {msg.pwError && <p className="form-error">{msg.pwError}</p>}
        {msg.pw && <p className="form-ok">{msg.pw}</p>}
        <button className="btn btn-outline">Update password</button>
      </form>
    </div>
  );
}

export default function UserPanel({ onSignIn }) {
  const user = useStore(selectCurrentUser);
  const [tab, setTab] = useState('orders');
  if (!user) return <SignInPrompt onSignIn={onSignIn} />;
  return (
    <section className="container dash">
      <div className="dash-top">
        <div>
          <p className="eyebrow">My Account</p>
          <h2>Welcome, {user.name}</h2>
        </div>
        <div className="dash-actions">
          {user.role === 'admin' && <a href="#/admin" className="btn btn-outline">Admin panel</a>}
          <button className="btn btn-outline" onClick={logout}>Sign out</button>
        </div>
      </div>
      <div className="seg dash-tabs">
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>My orders</button>
        <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>Profile & security</button>
      </div>
      {tab === 'orders' ? <Orders user={user} /> : <Profile user={user} />}
    </section>
  );
}
