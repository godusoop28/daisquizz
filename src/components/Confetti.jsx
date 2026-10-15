import { useEffect, useMemo, useState } from 'react'

const COLORS = ['#facc15', '#ec4899', '#22d3ee', '#a78bfa', '#4ade80', '#fb923c']

export default function Confetti({ pieces = 110, duration = 4200 }) {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [visible, setVisible] = useState(!reduced)

  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 900,
        fall: 2200 + Math.random() * 1800,
        drift: (Math.random() - 0.5) * 160,
        spin: (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540),
        color: COLORS[i % COLORS.length],
        round: i % 3 === 0,
      })),
    [pieces],
  )

  useEffect(() => {
    if (!visible) return undefined
    const t = setTimeout(() => setVisible(false), duration)
    return () => clearTimeout(t)
  }, [visible, duration])

  if (!visible) return null
  return (
    <div className="confetti" aria-hidden="true">
      {items.map((p) => (
        <span
          key={p.id}
          className={`confetti__piece ${p.round ? 'is-round' : ''}`}
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.fall}ms`,
            '--drift': `${p.drift}px`,
            '--spin': `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  )
}
