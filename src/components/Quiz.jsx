import { useCallback, useEffect, useRef, useState } from 'react'
import { CATEGORIES, POINTS, TIME_PER_QUESTION } from '../data/questions.js'
import { Shapes } from './Decorations.jsx'

const LETTERS = ['A', 'B', 'C']
const KEY_MAP = { a: 0, b: 1, c: 2, 1: 0, 2: 1, 3: 2 }
const TOTAL_MS = TIME_PER_QUESTION * 1000

export default function Quiz({ questions, mode, onFinish, onExit, sfx }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selected, setSelected] = useState(null)
  const [status, setStatus] = useState('answering') // answering | revealed
  const [timeLeft, setTimeLeft] = useState(TOTAL_MS)
  const [confirmExit, setConfirmExit] = useState(false)
  const lockedRef = useRef(false)
  const headingRef = useRef(null)
  const nextRef = useRef(null)

  const q = questions[index]
  const cat = CATEGORIES[q.category]
  const isLast = index === questions.length - 1
  const timed = mode === 'timed'
  const current = answers[index]
  const score = answers.reduce(
    (sum, a, i) => (a.correct ? sum + (questions[i].bonus ? POINTS.bonus : POINTS.normal) : sum),
    0,
  )

  const resolve = useCallback(
    (choice) => {
      // Un único registro por pregunta: evita dobles respuestas (clic + tecla, o clic + fin del tiempo).
      if (lockedRef.current) return
      lockedRef.current = true
      const correct = choice === q.answer
      setSelected(choice)
      setStatus('revealed')
      setAnswers((prev) => {
        const next = prev.slice(0, index)
        next[index] = { id: q.id, selected: choice, correct, timedOut: choice === null }
        return next
      })
      sfx(correct ? 'correct' : 'wrong')
    },
    [index, q, sfx],
  )

  // Ref para que activar el sonido a mitad de pregunta no reinicie el temporizador.
  const resolveRef = useRef(resolve)
  useEffect(() => {
    resolveRef.current = resolve
  }, [resolve])

  // Cuenta regresiva: se reinicia en cada pregunta y se limpia al responder, cambiar o salir.
  useEffect(() => {
    if (!timed || status !== 'answering') return undefined
    const deadline = Date.now() + TOTAL_MS
    setTimeLeft(TOTAL_MS)
    const id = setInterval(() => {
      const left = Math.max(0, deadline - Date.now())
      setTimeLeft(left)
      if (left <= 0) {
        clearInterval(id)
        resolveRef.current(null)
      }
    }, 100)
    return () => clearInterval(id)
  }, [timed, status, index])

  // Foco: título al llegar una pregunta nueva, botón "Siguiente" al revelar.
  useEffect(() => {
    if (status === 'answering') headingRef.current?.focus({ preventScroll: true })
    else nextRef.current?.focus({ preventScroll: true })
  }, [status, index])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [index])

  // Atajos de teclado: A/B/C o 1/2/3.
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || confirmExit) return
      const choice = KEY_MAP[e.key.toLowerCase()]
      if (choice !== undefined && status === 'answering') {
        e.preventDefault()
        resolve(choice)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, resolve, confirmExit])

  const goNext = () => {
    if (status !== 'revealed') return
    if (isLast) {
      onFinish(answers)
      return
    }
    lockedRef.current = false
    setSelected(null)
    setTimeLeft(TOTAL_MS)
    setStatus('answering')
    setIndex((i) => i + 1)
  }

  const seconds = Math.ceil(timeLeft / 1000)
  const lowTime = timed && status === 'answering' && seconds <= 5
  const progress = ((index + (status === 'revealed' ? 1 : 0)) / questions.length) * 100

  let feedback = null
  if (status === 'revealed') {
    const correctText = `${LETTERS[q.answer]}: ${q.options[q.answer]}`
    if (current?.timedOut) feedback = { kind: 'timeout', icon: '⏰', title: '¡Se acabó el tiempo!', detail: `La respuesta correcta era ${correctText}.` }
    else if (current?.correct)
      feedback = {
        kind: 'correct',
        icon: '🎉',
        title: q.bonus ? `¡Correcto! +${POINTS.bonus} puntos` : `¡Correcto! +${POINTS.normal} puntos`,
        detail: null,
      }
    else feedback = { kind: 'wrong', icon: '💪', title: 'Casi… ¡no pasa nada!', detail: `La respuesta correcta era ${correctText}.` }
  }

  return (
    <main className={`quiz ${q.bonus ? 'quiz--bonus' : ''}`}>
      <Shapes variant={q.bonus ? 'bonus' : 'quiz'} />

      <header className="quiz__top">
        <div className="quiz__brand" aria-hidden="true">
          DAIS <span>QUIZZ</span>
        </div>
        <div className="quiz__score" aria-label={`Puntos: ${score}`}>
          <span aria-hidden="true">⭐</span> {score.toLocaleString('es')} pts
        </div>
        {confirmExit ? (
          <div className="quiz__exit-confirm" role="group" aria-label="Confirmar salida">
            <span>¿Salir?</span>
            <button type="button" className="btn btn--mini btn--danger" onClick={onExit}>
              Sí
            </button>
            <button type="button" className="btn btn--mini" onClick={() => setConfirmExit(false)} autoFocus>
              No
            </button>
          </div>
        ) : (
          <button type="button" className="btn btn--mini btn--ghost" onClick={() => setConfirmExit(true)}>
            <span aria-hidden="true">✕</span> Salir
          </button>
        )}
      </header>

      <div className="quiz__progress">
        <div className="quiz__progress-text">
          {q.bonus ? (
            <strong className="bonus-label">⭐ ¡Pregunta bonus! · {POINTS.bonus} pts</strong>
          ) : (
            <strong>
              Pregunta {index + 1} de {questions.length - 1}
            </strong>
          )}
          {timed && (
            <span className={`timer ${lowTime ? 'timer--low' : ''}`} aria-hidden="true">
              ⏱️ {seconds}s
            </span>
          )}
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-label="Progreso del reto"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={index + (status === 'revealed' ? 1 : 0)}
        >
          <div className="progress__fill" style={{ width: `${progress}%` }} />
        </div>
        {timed && (
          <div className="timebar" aria-hidden="true">
            <div
              className={`timebar__fill ${lowTime ? 'timebar__fill--low' : ''}`}
              style={{ width: `${(timeLeft / TOTAL_MS) * 100}%` }}
            />
          </div>
        )}
        {timed && status === 'answering' && (seconds === 10 || seconds === 5) && (
          <span className="sr-only" role="status">
            Quedan {seconds} segundos
          </span>
        )}
      </div>

      <section className="quiz__stage" key={q.id}>
        <div className="quiz__art" aria-hidden="true">
          <div className="art-blob" style={{ '--cat': cat.color }}>
            {q.image ? (
              <img
                className={`art-blob__img ${q.silhouette && status !== 'revealed' ? 'is-silhouette' : ''}`}
                src={q.image}
                alt=""
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="art-blob__emoji">{q.emoji}</span>
            )}
            <span className="art-blob__sat art-blob__sat--1">{cat.emoji}</span>
            <span className="art-blob__sat art-blob__sat--2">{q.bonus ? '⭐' : '✨'}</span>
          </div>
        </div>

        <div className="quiz__panel">
          <span className="chip" style={{ '--cat': cat.color }}>
            <span aria-hidden="true">{cat.emoji}</span> {cat.label}
          </span>
          <h2 className="question" ref={headingRef} tabIndex={-1}>
            {q.question}
          </h2>

          <ul className="options" aria-label="Opciones">
            {q.options.map((opt, i) => {
              const revealed = status === 'revealed'
              const isCorrect = revealed && i === q.answer
              const isWrong = revealed && i === selected && i !== q.answer
              const cls = ['option', isCorrect && 'is-correct', isWrong && 'is-wrong', revealed && !isCorrect && !isWrong && 'is-dim']
                .filter(Boolean)
                .join(' ')
              return (
                <li key={i}>
                  <button
                    type="button"
                    className={cls}
                    onClick={() => resolve(i)}
                    disabled={revealed}
                    aria-keyshortcuts={`${LETTERS[i]} ${i + 1}`}
                  >
                    <span className="option__letter" aria-hidden="true">
                      {LETTERS[i]}
                    </span>
                    <span className="option__text">
                      <span className="sr-only">Opción {LETTERS[i]}: </span>
                      {opt}
                    </span>
                    {isCorrect && (
                      <span className="option__tag option__tag--ok">
                        <span aria-hidden="true">✓</span> Correcta
                      </span>
                    )}
                    {isWrong && (
                      <span className="option__tag option__tag--bad">
                        <span aria-hidden="true">✗</span> Tu respuesta
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="feedback-slot" aria-live="polite">
            {feedback && (
              <div className={`feedback feedback--${feedback.kind}`}>
                <p className="feedback__title">
                  <span aria-hidden="true">{feedback.icon}</span> {feedback.title}
                </p>
                {feedback.detail && <p className="feedback__detail">{feedback.detail}</p>}
                <p className="feedback__explain">
                  <span aria-hidden="true">💡</span> {q.explanation}
                </p>
                <button type="button" className="btn btn--next" onClick={goNext} ref={nextRef}>
                  {isLast ? 'Ver resultados 🏁' : index === questions.length - 2 ? '¡Ir al bonus! ⭐' : 'Siguiente →'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
