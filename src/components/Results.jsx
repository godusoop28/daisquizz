import { useEffect, useRef, useState } from 'react'
import Confetti from './Confetti.jsx'
import { Shapes } from './Decorations.jsx'
import { ALL_QUESTIONS, MAX_SCORE, POINTS } from '../data/questions.js'

const TOTAL = ALL_QUESTIONS.length

function verdict(pct) {
  if (pct === 100) return { emoji: '👑', text: '¡Perfección absoluta! Eres una enciclopedia andante.' }
  if (pct >= 85) return { emoji: '🧠', text: '¡Nivel genio! Deberías tener tu propio concurso de trivia.' }
  if (pct >= 70) return { emoji: '🌟', text: '¡Excelente! Se nota que te interesa un poco de todo.' }
  if (pct >= 50) return { emoji: '💪', text: '¡Muy bien! Más de la mitad: tu cerebro está en forma.' }
  if (pct >= 30) return { emoji: '🤓', text: '¡Buen intento! Hoy te llevas un montón de datos nuevos.' }
  return { emoji: '😄', text: '¡Lo importante es jugar! La revancha te está esperando.' }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}

function recordText(info) {
  if (!info) return null
  if (info.isNew) {
    return info.previous
      ? `¡Nuevo récord! Antes tenías ${info.previous.score.toLocaleString('es')} puntos.`
      : '¡Primer récord guardado en este dispositivo!'
  }
  return `Tu récord sigue siendo ${info.previous.score.toLocaleString('es')} puntos.`
}

export default function Results({ score, correct, answers, mode, recordInfo, onReplay, onReview, onHome }) {
  const pct = Math.round((correct / TOTAL) * 100)
  const v = verdict(pct)
  const bonus = answers[TOTAL - 1]
  const timedOut = answers.filter((a) => a.timedOut).length
  const [copyState, setCopyState] = useState('idle') // idle | ok | error
  const titleRef = useRef(null)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    titleRef.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (copyState === 'idle') return undefined
    const t = setTimeout(() => setCopyState('idle'), 2500)
    return () => clearTimeout(t)
  }, [copyState])

  const share = async () => {
    const lines = [
      '🧠 DAIS QUIZZ: reto de cultura general',
      `⭐ ${score.toLocaleString('es')} de ${MAX_SCORE.toLocaleString('es')} puntos`,
      `✅ ${correct}/${TOTAL} aciertos (${pct} %)`,
      `${bonus?.correct ? '🏅 ¡Bonus acertado!' : '🎯 Bonus fallado'} · Modo ${mode === 'timed' ? 'con tiempo ⏱️' : 'sin tiempo 🧘'}`,
      '¿Te atreves a superarlo?',
    ]
    if (window.location.protocol.startsWith('http')) lines.push(window.location.origin)
    setCopyState((await copyText(lines.join('\n'))) ? 'ok' : 'error')
  }

  const copyLabel = copyState === 'ok' ? '¡Resumen copiado!' : copyState === 'error' ? 'No se pudo copiar' : 'Copiar resultado'

  return (
    <main className="results">
      <Shapes variant="home" />
      {pct >= 70 && <Confetti />}

      <div className="results__card">
        <div className="results__emoji" aria-hidden="true">
          {v.emoji}
        </div>
        <h1 className="results__title" ref={titleRef} tabIndex={-1}>
          ¡Reto completado, Dais!
        </h1>
        <p className="results__verdict">{v.text}</p>

        <dl className="stats">
          <div className="stat stat--score">
            <dt>Puntaje</dt>
            <dd>{score.toLocaleString('es')}</dd>
          </div>
          <div className="stat">
            <dt>Aciertos</dt>
            <dd>
              {correct}/{TOTAL}
            </dd>
          </div>
          <div className="stat">
            <dt>Porcentaje</dt>
            <dd>{pct} %</dd>
          </div>
        </dl>

        <ul className="results__notes">
          <li>
            <span aria-hidden="true">{bonus?.correct ? '🏅' : '🎯'}</span>{' '}
            {bonus?.correct
              ? `¡Acertaste la pregunta bonus! (+${POINTS.bonus})`
              : 'La pregunta bonus se resistió esta vez.'}
          </li>
          {timedOut > 0 && (
            <li>
              <span aria-hidden="true">⏰</span> {timedOut}{' '}
              {timedOut === 1 ? 'pregunta se quedó' : 'preguntas se quedaron'} sin responder a tiempo.
            </li>
          )}
          {recordInfo && (
            <li>
              <span aria-hidden="true">🏆</span> {recordText(recordInfo)}
            </li>
          )}
        </ul>

        <div className="results__actions">
          <button type="button" className="btn btn--start" onClick={onReplay}>
            <span aria-hidden="true">🔁</span> Volver a jugar
          </button>
          <button type="button" className="btn btn--secondary" onClick={onReview}>
            <span aria-hidden="true">📝</span> Revisar respuestas
          </button>
          <button type="button" className="btn btn--secondary" onClick={share}>
            <span aria-hidden="true">{copyState === 'ok' ? '✅' : '📋'}</span> {copyLabel}
          </button>
          <button type="button" className="btn btn--link" onClick={onHome}>
            Ir al inicio
          </button>
        </div>
        <p className="sr-only" role="status">
          {copyState === 'idle' ? '' : copyLabel}
        </p>
      </div>
    </main>
  )
}
