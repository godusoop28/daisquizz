import { useEffect, useRef, useState } from 'react'
import { ALL_QUESTIONS, CATEGORIES } from '../data/questions.js'

const LETTERS = ['A', 'B', 'C']
const STATE_LABEL = { ok: '✓ Acierto', timeout: '⏰ Sin responder', bad: '✗ Fallo' }

export default function Review({ answers, onBack, onReplay }) {
  const [filter, setFilter] = useState('all') // all | wrong
  const titleRef = useRef(null)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  const rows = ALL_QUESTIONS.map((q, i) => ({ q, a: answers[i], n: i + 1 })).filter(
    ({ a }) => filter === 'all' || !a?.correct,
  )

  return (
    <main className="review">
      <header className="review__header">
        <button type="button" className="btn btn--mini btn--ghost" onClick={onBack}>
          ← Resultados
        </button>
        <h1 ref={titleRef} tabIndex={-1}>
          Revisión de respuestas
        </h1>
        <div className="review__filter" role="group" aria-label="Filtrar preguntas">
          <button type="button" className="btn btn--mini" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
            Todas
          </button>
          <button
            type="button"
            className="btn btn--mini"
            aria-pressed={filter === 'wrong'}
            onClick={() => setFilter('wrong')}
          >
            Solo falladas
          </button>
        </div>
      </header>

      {rows.length === 0 && <p className="review__empty">🎉 ¡No fallaste ninguna! Nada que revisar por aquí.</p>}

      <ol className="review__list">
        {rows.map(({ q, a, n }) => {
          const cat = CATEGORIES[q.category]
          const state = a?.correct ? 'ok' : a?.timedOut ? 'timeout' : 'bad'
          return (
            <li key={q.id} className={`review-item review-item--${state} ${q.bonus ? 'review-item--bonus' : ''}`}>
              <div className="review-item__head">
                <span className="review-item__num">{q.bonus ? '⭐ Bonus' : `#${n}`}</span>
                <span className="chip chip--small" style={{ '--cat': cat.color }}>
                  <span aria-hidden="true">{cat.emoji}</span> {cat.label}
                </span>
                <span className={`pill pill--${state}`}>{STATE_LABEL[state]}</span>
              </div>
              <h2 className="review-item__q">{q.question}</h2>
              <p>
                <strong>Tu respuesta:</strong>{' '}
                {a?.selected == null ? (
                  <em>Sin responder (tiempo agotado)</em>
                ) : (
                  `${LETTERS[a.selected]}. ${q.options[a.selected]}`
                )}
              </p>
              <p>
                <strong>Respuesta correcta:</strong> {LETTERS[q.answer]}. {q.options[q.answer]}
              </p>
              <p className="review-item__explain">
                <span aria-hidden="true">💡</span> {q.explanation}
              </p>
            </li>
          )
        })}
      </ol>

      <div className="review__footer">
        <button type="button" className="btn btn--secondary" onClick={onBack}>
          ← Volver a resultados
        </button>
        <button type="button" className="btn btn--start" onClick={onReplay}>
          <span aria-hidden="true">🔁</span> Volver a jugar
        </button>
      </div>
    </main>
  )
}
