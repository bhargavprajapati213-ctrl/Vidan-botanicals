export default function Logo({ light = false }) {
  const c = light ? '#fff' : '#1f3b4d';
  return (
    <span className="logo" style={{ color: c }}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M6 26C6 12 16 5 27 5c0 12-7 21-21 21z" fill="#3f9d4f" />
        <path d="M6 26L20 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span>
        <strong>VIDAN</strong>
        <small>BOTANICALS</small>
      </span>
    </span>
  );
}
