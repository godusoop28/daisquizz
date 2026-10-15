// Figuras decorativas SVG y emojis flotantes (puramente visuales).
export function Shapes({ variant = 'home' }) {
  return (
    <div className={`shapes shapes--${variant}`} aria-hidden="true">
      <svg className="shape shape--ring" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="14" />
      </svg>
      <svg className="shape shape--star" viewBox="0 0 100 100">
        <path
          d="M50 4 L61 37 L96 37 L68 58 L79 92 L50 71 L21 92 L32 58 L4 37 L39 37 Z"
          fill="currentColor"
        />
      </svg>
      <svg className="shape shape--squiggle" viewBox="0 0 160 40">
        <path
          d="M5 20 Q 22 2 40 20 T 75 20 T 110 20 T 155 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
        />
      </svg>
      <svg className="shape shape--triangle" viewBox="0 0 100 100">
        <path d="M50 8 L94 88 L6 88 Z" fill="none" stroke="currentColor" strokeWidth="12" strokeLinejoin="round" />
      </svg>
      <svg className="shape shape--dots" viewBox="0 0 100 100">
        {[0, 1, 2, 3].flatMap((r) =>
          [0, 1, 2, 3].map((c) => <circle key={`${r}-${c}`} cx={14 + c * 24} cy={14 + r * 24} r="6" fill="currentColor" />),
        )}
      </svg>
      <span className="shape shape--plus">+</span>
    </div>
  )
}

export function FloatingEmojis() {
  const items = ['🧠', '🌍', '📚', '🔬', '🏛️', '🎨', '⚽', '🎬']
  return (
    <div className="floaters" aria-hidden="true">
      {items.map((e, i) => (
        <span key={e} className={`floater floater--${i}`}>
          {e}
        </span>
      ))}
    </div>
  )
}
