import { useEffect, useRef, useState } from 'react';
import Bottle from './Bottle.jsx';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';
import { useStore } from '../store.js';
import {
  products as seedProducts, collections, reasons, testimonials, blogs, faqs, benefits, brand, formatPrice,
} from '../data/site.js';

const Leaf = ({ style }) => (
  <svg className="deco-leaf" style={style} viewBox="0 0 40 40" aria-hidden="true">
    <path d="M4 36C4 16 18 5 36 4c0 18-12 32-32 32z" fill="#5fb96b" />
    <path d="M4 36L26 14" stroke="#e9f7ea" strokeWidth="1.5" />
  </svg>
);

export function Hero() {
  const [a, b, c] = [seedProducts[0], seedProducts[6], seedProducts[3]]; // fixed hero art
  return (
    <section className="hero" id="top">
      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="eyebrow">Ayurveda meets modern science</span>
          <h1>Rooted in Nature.<br />Proven by Science.</h1>
          <p>Clean, plant-powered supplements crafted for everyday balance.</p>
          <a href="#shop" className="btn btn-dark">Explore our Formulas <Icon name="arrow" size={18} /></a>
        </div>
        <div className="hero-art">
          <Leaf style={{ left: '2%', top: '55%', width: 60, transform: 'rotate(-20deg)' }} />
          <Leaf style={{ right: '0%', top: '20%', width: 70, transform: 'scaleX(-1) rotate(-15deg)' }} />
          <Leaf style={{ left: '14%', top: '8%', width: 40, transform: 'rotate(40deg)' }} />
          <div className="hero-bottle side"><Bottle product={a} size={170} /></div>
          <div className="hero-bottle main"><Bottle product={b} size={220} /></div>
          <div className="hero-bottle side"><Bottle product={c} size={170} /></div>
        </div>
      </div>
    </section>
  );
}

export function Intro() {
  return (
    <section className="section intro container">
      <h2>Formulated From Nature</h2>
      <p>
        At {brand.name}, we believe lasting wellness begins with what the earth already offers. Each formula
        combines time-tested Ayurvedic botanicals with modern research, is third-party tested for purity,
        and made in a GMP-certified facility — so you can feel confident in every capsule.
      </p>
    </section>
  );
}

export function ProductCard({ product, onAdd }) {
  const [added, setAdded] = useState(false);
  const addedTimer = useRef();
  useEffect(() => () => clearTimeout(addedTimer.current), []);
  const handleAdd = () => {
    onAdd(product);
    setAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1400);
  };
  return (
    <article className="product-card">
      <div className="product-img"><Bottle product={product} size={150} /></div>
      <h3>{product.title}</h3>
      <ul className="benefit-list">
        {product.benefits.map((b) => (
          <li key={b}><span className="dot"><Icon name="check" size={10} stroke={3} /></span>{b}</li>
        ))}
      </ul>
      <div className="product-foot">
        <strong>{formatPrice(product.price)}</strong>
        <button className={`btn-add ${added ? 'is-added' : ''}`} onClick={handleAdd}>
          {added ? 'Added ✓' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

export function FeaturedProducts({ onAdd }) {
  const products = useStore((s) => s.products);
  const [showAll, setShowAll] = useState(false);
  const list = showAll ? products : products.slice(0, 4);
  return (
    <section className="section container" id="shop">
      <h2 className="center">Featured Products</h2>
      <div className="product-grid">
        {list.map((p) => <ProductCard key={p.id} product={p} onAdd={onAdd} />)}
      </div>
      <div className="center mt">
        <button className="btn btn-outline" onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show fewer' : `View all ${products.length} products`}
        </button>
      </div>
    </section>
  );
}

export function WhyChoose() {
  return (
    <section className="section container">
      <h2 className="center">Why Choose {brand.name}</h2>
      <div className="why-grid">
        {reasons.map((r) => (
          <div className="why-card" key={r.title}>
            <div className="why-visual"><Icon name={r.icon} size={56} stroke={1.3} /></div>
            <h3>{r.title}</h3>
            <p>{r.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Collections({ onAdd }) {
  const [active, setActive] = useState(collections[0].id);
  const products = useStore((s) => s.products);
  const current = collections.find((c) => c.id === active);
  const items = products.filter((p) => p.collection === active);
  return (
    <section className="section container" id="collections">
      <h2 className="center">Our Featured Collections</h2>
      <p className="center muted small">Shop by wellness goal</p>
      <div className="collections">
        <div className="collection-tabs" role="tablist">
          {collections.map((c) => (
            <button key={c.id} role="tab" aria-selected={c.id === active}
              className={c.id === active ? 'active' : ''} onClick={() => setActive(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="collection-panel">
          <Leaf style={{ left: 18, top: 16, width: 34 }} />
          <h3>{current.headline}</h3>
          <span className="collection-tag">{current.tag}</span>
          <div className="collection-bottles">
            {items.length === 0 && <p className="muted small">New products coming soon.</p>}
            {items.map((p) => (
              <button key={p.id} className="collection-bottle" onClick={() => onAdd(p)} title={`Add ${p.name} to cart`}>
                <Bottle product={p} size={130} />
                <span>{formatPrice(p.price)} · Add</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  return (
    <section className="section container">
      <h2 className="center">What Our Customers Are Saying</h2>
      <div className="reviews-grid">
        {testimonials.map((t, i) => (
          <figure className="review" key={i}>
            <div className="stars" aria-label={`${t.rating} out of 5`}>{'★'.repeat(t.rating)}</div>
            <blockquote>“{t.text}”</blockquote>
            <figcaption>
              <span className="avatar" style={{ background: ['#3f9d4f', '#1f7a8c', '#c77d1e'][i % 3] }}>
                {t.name.charAt(0)}
              </span>
              {t.name}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="center mt"><a href="#shop" className="btn btn-dark">Shop Now</a></div>
    </section>
  );
}

export function Blogs() {
  return (
    <section className="section container" id="blog">
      <h2 className="center">From the Wellness Journal</h2>
      <div className="blog-grid">
        {blogs.map((b) => (
          <article className="blog-card" key={b.title}>
            <div className="blog-img" style={{ background: `linear-gradient(135deg, ${b.theme[0]}, #fff)`, color: b.theme[1] }}>
              <Icon name={b.icon} size={72} stroke={1.2} />
            </div>
            <h3>{b.title}</h3>
            <time>{new Date(`${b.date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
            <p>{b.excerpt}</p>
            <a href="#blog" className="read-more">Read more <Icon name="arrow" size={14} /></a>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section container faq" id="faq">
      <h2 className="center">Have Questions? We’ve Got Answers.</h2>
      <p className="center muted">Everything you need to know about {brand.name} — from ingredients to testing and delivery.</p>
      <div className="faq-list">
        {faqs.map((f, i) => (
          <div className={`faq-item ${open === i ? 'open' : ''}`} key={f.q}>
            <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
              {f.q}<Icon name="chevron" size={18} />
            </button>
            <div className="faq-answer"><p>{f.a}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Benefits() {
  return (
    <section className="benefits">
      <div className="container benefits-grid">
        {benefits.map((b) => (
          <div key={b.title}>
            <Icon name={b.icon} size={34} stroke={1.5} />
            <h3>{b.title}</h3>
            <p>{b.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (email.includes('@')) setDone(true);
  };
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo light />
          <p>
            {brand.name} {brand.tagline} blends the wisdom of Ayurveda with modern science to create clean,
            effective, plant-powered supplements — tested for purity and made with care.
          </p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <a href="#top">Home</a><a href="#shop">Shop</a><a href="#collections">Collections</a><a href="#blog">Journal</a>
        </div>
        <div>
          <h4>Start Your Wellness Journey</h4>
          <p>Get new launches, offers and wellness tips in your inbox.</p>
          {done ? (
            <p className="subscribed">Thanks for subscribing! 🌿</p>
          ) : (
            <form className="subscribe" onSubmit={submit}>
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button aria-label="Subscribe"><Icon name="arrow" size={18} /></button>
            </form>
          )}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {brand.year} {brand.name} {brand.tagline}</span>
        <span className="footer-legal">
          <a href="#top">Privacy policy</a><a href="#top">Refund policy</a><a href="#top">Terms of service</a><a href="#top">Shipping policy</a>
        </span>
      </div>
      <p className="container disclaimer">
        These statements have not been evaluated by any regulatory authority. Products are not intended to diagnose, treat, cure or prevent any disease.
      </p>
    </footer>
  );
}
