import { useId } from 'react';

// Pure SVG supplement bottle — no image files needed.
export default function Bottle({ product, size = 180 }) {
  const { name, sub, count, color } = product;
  // The same product renders in several places (hero, grid, collections), so gradient ids must be unique per instance.
  const id = useId().replace(/[^\w-]/g, '');
  const fontSize = 19;
  // Squeeze long names so they always fit inside the 104px label.
  const fit = name.length * fontSize * 0.68 > 94 ? { textLength: 94, lengthAdjust: 'spacingAndGlyphs' } : {};
  return (
    <svg viewBox="0 0 160 200" width={size} height={size * 1.25} role="img" aria-label={`${name} bottle`}>
      <defs>
        <linearGradient id={`body-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#2a1e1a" />
          <stop offset="0.45" stopColor="#4a3a33" />
          <stop offset="1" stopColor="#1e1512" />
        </linearGradient>
        <linearGradient id={`cap-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#111" />
          <stop offset="0.5" stopColor="#3a3a3a" />
          <stop offset="1" stopColor="#111" />
        </linearGradient>
      </defs>
      <ellipse cx="80" cy="192" rx="58" ry="6" fill="rgba(0,0,0,.15)" />
      <rect x="44" y="10" width="72" height="30" rx="6" fill={`url(#cap-${id})`} />
      {[...Array(9)].map((_, i) => (
        <line key={i} x1={50 + i * 7.5} x2={50 + i * 7.5} y1="13" y2="37" stroke="#555" strokeWidth="1" />
      ))}
      <rect x="40" y="38" width="80" height="10" rx="3" fill="#2a1e1a" />
      <path d="M28 60q0-14 16-14h72q16 0 16 14v118q0 12-12 12H40q-12 0-12-12z" fill={`url(#body-${id})`} />
      <rect x="28" y="72" width="104" height="100" fill="#fbfaf6" />
      <rect x="28" y="72" width="104" height="18" fill={color} />
      <path d="M72 84c0-6 4-9 8-9s8 3 8 9c-3-2-5-2-8 1-3-3-5-3-8-1z" fill="#fff" />
      <text x="80" y="112" textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800" fontSize={fontSize} fill={color} {...fit}>{name}</text>
      <text x="80" y="125" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="8" fontWeight="600" fill="#444">{sub}</text>
      <rect x="58" y="130" width="44" height="12" rx="6" fill={color} />
      <text x="80" y="139" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="7.5" fontWeight="700" fill="#fff">{count}</text>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <circle cx="44" cy={151 + i * 7} r="2.2" fill={color} />
          <rect x="50" y={149.5 + i * 7} width={46 - i * 8} height="3" rx="1.5" fill="#cfcac0" />
        </g>
      ))}
      <circle cx="116" cy="158" r="10" fill="#e9f5ea" stroke="#3f9d4f" strokeWidth="1.2" />
      <path d="M111 158l3.5 3.5 6.5-7" stroke="#3f9d4f" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <rect x="28" y="164" width="104" height="8" fill="#efece4" />
      <text x="80" y="170" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="4.5" fill="#777">DIETARY SUPPLEMENT · VEGAN CAPSULES</text>
      <rect x="34" y="62" width="6" height="104" rx="3" fill="rgba(255,255,255,.12)" />
    </svg>
  );
}
