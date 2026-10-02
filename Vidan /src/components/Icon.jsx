const paths = {
  leaf: <><path d="M5 19C5 10 11 5 20 4c0 9-5 15-15 15z" /><path d="M5 19l9-9" /></>,
  flask: <><path d="M9 3h6M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3" /><path d="M7 15h10" /></>,
  doctor: <><circle cx="12" cy="7" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /><path d="M12 16v4M10 18h4" /></>,
  factory: <><path d="M3 21V10l6 3V10l6 3V6l6-3v18z" /><path d="M7 17h2M12 17h2M17 17h1" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  shield: <><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M12 8v8M8 12h8" /></>,
  spark: <><path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" /></>,
  bolt: <><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></>,
  bag: <><path d="M5 8h14l-1 13H6z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  chevron: <><path d="M6 9l6 6 6-6" /></>,
  check: <><path d="M5 12l5 5 9-10" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  close: <><path d="M6 6l12 12M18 6L6 18" /></>,
};

export default function Icon({ name, size = 22, stroke = 1.8, className }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
