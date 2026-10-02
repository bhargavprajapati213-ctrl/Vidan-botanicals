import { useState } from 'react';
import Icon from './Icon.jsx';
import Logo from './Logo.jsx';

export default function Header({ cartCount, onOpen }) {
  const [open, setOpen] = useState(false);
  const openPanel = (name) => {
    setOpen(false); // don't leave the mobile menu open behind the drawer
    onOpen(name);
  };
  const links = [['Home', '#top'], ['Shop', '#shop'], ['Collections', '#collections'], ['Blog', '#blog'], ['FAQ', '#faq']];
  return (
    <header className="header">
      <div className="container header-inner">
        <a href="#top" aria-label="Vidan home"><Logo /></a>
        <nav className={`nav ${open ? 'nav-open' : ''}`}>
          {links.map(([label, href], i) => (
            <a key={label} href={href} className={i === 0 ? 'active' : ''} onClick={() => setOpen(false)}>{label}</a>
          ))}
        </nav>
        <div className="header-icons">
          <button aria-label="Search" onClick={() => openPanel('search')}><Icon name="search" size={20} /></button>
          <button aria-label="Account" onClick={() => openPanel('account')}><Icon name="user" size={20} /></button>
          <button aria-label="Cart" className="cart-btn" onClick={() => openPanel('cart')}>
            <Icon name="bag" size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          <button className="menu-btn" aria-label="Menu" onClick={() => setOpen(!open)}>
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}
