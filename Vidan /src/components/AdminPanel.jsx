import { useState } from 'react';
import Bottle from './Bottle.jsx';
import Icon from './Icon.jsx';
import { collections, formatPrice } from '../data/site.js';
import {
  useStore, selectCurrentUser, saveProduct, deleteProduct, updateOrderStatus, ORDER_STATUSES,
  setUserRole, deleteUser,
} from '../store.js';
import { SignInPrompt, StatusBadge, formatDate } from './UserPanel.jsx';

const collectionLabel = (id) => collections.find((c) => c.id === id)?.label || id;

function Overview({ setTab }) {
  const { products, orders, users } = useStore((s) => s);
  const revenue = orders.filter((o) => o.status !== 'Cancelled').reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter((o) => o.status === 'Pending').length;
  const stats = [
    ['Revenue', formatPrice(revenue)],
    ['Orders', orders.length],
    ['Pending orders', pending],
    ['Products', products.length],
    ['Customers', users.filter((u) => u.role === 'customer').length],
  ];
  return (
    <>
      <div className="stat-grid">
        {stats.map(([label, value]) => (
          <div key={label} className="stat"><span className="muted small">{label}</span><strong>{value}</strong></div>
        ))}
      </div>
      <div className="dash-card">
        <div className="dash-card-head">
          <h3>Recent orders</h3>
          <button className="link-btn" onClick={() => setTab('orders')}>View all</button>
        </div>
        <OrdersTable orders={orders.slice(0, 5)} />
      </div>
    </>
  );
}

function OrdersTable({ orders }) {
  if (!orders.length) return <p className="muted">No orders yet.</p>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td><strong>#{o.id}</strong></td>
              <td>{formatDate(o.createdAt)}</td>
              <td>
                {o.customer}<br /><span className="muted small">{o.email}</span>
                {o.address && <><br /><span className="muted small">{o.address}</span></>}
              </td>
              <td className="small">{o.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}</td>
              <td>{formatPrice(o.total)}</td>
              <td>
                <select value={o.status} aria-label={`Status of order ${o.id}`}
                  onChange={(e) => updateOrderStatus(o.id, e.target.value)}>
                  {ORDER_STATUSES.map((st) => <option key={st}>{st}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const emptyProduct = {
  id: '', name: '', sub: '', count: '', color: '#3f9d4f', collection: collections[0].id, title: '', benefits: [], price: 0,
};

function ProductForm({ product, onDone }) {
  const [p, setP] = useState({ ...product, benefitsText: product.benefits.join('\n') });
  const set = (k) => (e) => setP({ ...p, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const { benefitsText, ...rest } = p;
    saveProduct({
      ...rest,
      name: rest.name.trim().toUpperCase(),
      price: Number(rest.price),
      benefits: benefitsText.split('\n').map((b) => b.trim()).filter(Boolean),
    });
    onDone();
  };
  return (
    <form className="dash-card product-form" onSubmit={submit}>
      <div className="dash-card-head">
        <h3>{product.id ? 'Edit product' : 'Add product'}</h3>
        <button type="button" className="drawer-close" aria-label="Close form" onClick={onDone}><Icon name="close" size={18} /></button>
      </div>
      <div className="product-form-grid">
        <div className="product-form-preview"><Bottle product={{ ...p, name: p.name.toUpperCase() || 'NAME' }} size={140} /></div>
        <div className="account-form">
          <label>Name (on label)<input required maxLength={12} value={p.name} onChange={set('name')} /></label>
          <label>Sub-heading<input value={p.sub} onChange={set('sub')} /></label>
          <div className="form-row">
            <label>Badge<input value={p.count} onChange={set('count')} placeholder="e.g. 5 IN 1" /></label>
            <label>Colour<input type="color" value={p.color} onChange={set('color')} /></label>
          </div>
          <div className="form-row">
            <label>Price (₹)<input required type="number" min="1" value={p.price} onChange={set('price')} /></label>
            <label>Collection
              <select value={p.collection} onChange={set('collection')}>
                {collections.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </label>
          </div>
        </div>
      </div>
      <div className="account-form">
        <label>Full title<textarea required rows={2} value={p.title} onChange={set('title')} /></label>
        <label>Benefits (one per line)<textarea rows={4} value={p.benefitsText} onChange={set('benefitsText')} /></label>
        <button className="btn btn-dark">{product.id ? 'Save changes' : 'Add product'}</button>
      </div>
    </form>
  );
}

function Products() {
  const products = useStore((s) => s.products);
  const [editing, setEditing] = useState(null);
  const remove = (p) => {
    if (window.confirm(`Delete ${p.name}? This cannot be undone.`)) deleteProduct(p.id);
  };
  if (editing) return <ProductForm product={editing} onDone={() => setEditing(null)} />;
  return (
    <div className="dash-card">
      <div className="dash-card-head">
        <h3>Products ({products.length})</h3>
        <button className="btn btn-dark btn-sm" onClick={() => setEditing(emptyProduct)}>+ Add product</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th /><th>Product</th><th>Collection</th><th>Price</th><th /></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td><Bottle product={p} size={44} /></td>
                <td><strong>{p.name}</strong><br /><span className="muted small">{p.sub}</span></td>
                <td>{collectionLabel(p.collection)}</td>
                <td>{formatPrice(p.price)}</td>
                <td className="row-actions">
                  <button className="link-btn" onClick={() => setEditing(p)}>Edit</button>
                  <button className="link-btn danger" onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Customers() {
  const { users, orders } = useStore((s) => s);
  const [error, setError] = useState('');
  const run = (fn) => {
    setError('');
    try { fn(); } catch (err) { setError(err.message); }
  };
  return (
    <div className="dash-card">
      <h3>Users ({users.length})</h3>
      {error && <p className="form-error">{error}</p>}
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Orders</th><th>Role</th><th /></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong>{u.phone && <><br /><span className="muted small">{u.phone}</span></>}</td>
                <td>{u.email}</td>
                <td>{formatDate(u.createdAt)}</td>
                <td>{orders.filter((o) => o.userId === u.id).length}</td>
                <td>
                  <select value={u.role} aria-label={`Role of ${u.name}`} onChange={(e) => run(() => setUserRole(u.id, e.target.value))}>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <button className="link-btn danger"
                    onClick={() => window.confirm(`Delete user ${u.email}?`) && run(() => deleteUser(u.id))}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TABS = [['overview', 'Dashboard'], ['products', 'Products'], ['orders', 'Orders'], ['customers', 'Users']];

export default function AdminPanel({ onSignIn }) {
  const user = useStore(selectCurrentUser);
  const orders = useStore((s) => s.orders);
  const [tab, setTab] = useState('overview');
  if (!user) return <SignInPrompt onSignIn={onSignIn} text="Sign in with an admin account to continue." />;
  if (user.role !== 'admin') {
    return (
      <section className="container dash-empty">
        <h2>Admins only</h2>
        <p className="muted">Your account doesn’t have access to the admin panel.</p>
        <a href="#top" className="btn btn-dark">Back to shop</a>
      </section>
    );
  }
  return (
    <section className="container dash">
      <div className="dash-top">
        <div>
          <p className="eyebrow">Admin Panel</p>
          <h2>Store management</h2>
        </div>
        <div className="dash-actions"><a href="#top" className="btn btn-outline">View store</a></div>
      </div>
      <div className="seg dash-tabs">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {tab === 'overview' && <Overview setTab={setTab} />}
      {tab === 'products' && <Products />}
      {tab === 'orders' && <div className="dash-card"><h3>All orders ({orders.length})</h3><OrdersTable orders={orders} /></div>}
      {tab === 'customers' && <Customers />}
    </section>
  );
}
