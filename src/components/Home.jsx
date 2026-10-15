import { FloatingEmojis, Shapes } from './Decorations.jsx'
import { MAX_SCORE, POINTS, QUESTIONS, TIME_PER_QUESTION } from '../data/questions.js'
import { loadRecord } from '../lib/storage.js'

const MODES = [
  { id: 'timed', icon: '⏱️', title: 'Con tiempo', text: `${TIME_PER_QUESTION} segundos por pregunta` },
  { id: 'relaxed', icon: '🧘', title: 'Sin tiempo', text: 'Para jugar tranquilo' },
]

export default function Home({ mode, onModeChange, onStart, onStartAnime, loading, loadError }) {
  const record = loadRecord()

  return (
    <main className="home">
      <Shapes variant="home" />
      <FloatingEmojis />

      <div className="home__content">
        <p className="home__badge">
          <span aria-hidden="true">⭐</span> {QUESTIONS.length} preguntas + 1 bonus
        </p>
        <h1 className="home__title">
          <span className="home__title-main">DAIS</span>
          <span className="home__title-accent">
            QUIZZ <span className="home__brain" aria-hidden="true">🧠</span>
          </span>
        </h1>
        <p className="home__subtitle">Dais, ¿qué tanto sabes de cultura general?</p>

        <fieldset className="mode-picker">
          <legend>Elige tu modalidad</legend>
          <div className="mode-picker__options">
            {MODES.map((m) => (
              <label key={m.id} className={`mode-card ${mode === m.id ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="mode"
                  value={m.id}
                  checked={mode === m.id}
                  onChange={() => onModeChange(m.id)}
                />
                <span className="mode-card__icon" aria-hidden="true">
                  {m.icon}
                </span>
                <span className="mode-card__body">
                  <strong>{m.title}</strong>
                  <span>{m.text}</span>
                </span>
                <span className="mode-card__check" aria-hidden="true">
                  ✓
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="home__actions">
          <button type="button" className="btn btn--start" onClick={onStart} disabled={loading}>
            ¡Comenzar el reto! <span aria-hidden="true">🚀</span>
          </button>
          <button type="button" className="btn btn--anime" onClick={onStartAnime} disabled={loading}>
            {loading ? (
              'Conectando con las APIs…'
            ) : (
              <>
                Modo anime <span aria-hidden="true">⚡🍥🐉</span>
              </>
            )}
          </button>
        </div>
        <p className="home__hint">
          El modo anime crea preguntas nuevas en cada partida con datos en vivo de PokeAPI, la API de Naruto y la de
          Dragon Ball.
        </p>
        {loadError && (
          <p className="home__error" role="alert">
            {loadError}. Inténtalo de nuevo en unos segundos.
          </p>
        )}

        <p className="home__rules">
          <strong>Reglas:</strong> {POINTS.normal} puntos por acierto y {POINTS.bonus} si aciertas la pregunta
          bonus final. Máximo: {MAX_SCORE.toLocaleString('es')} puntos.
        </p>
        <p className="home__hint">
          En computadora puedes responder con <kbd>A</kbd> <kbd>B</kbd> <kbd>C</kbd> o <kbd>1</kbd> <kbd>2</kbd>{' '}
          <kbd>3</kbd>.
        </p>
        {record && (
          <p className="home__record">
            <span aria-hidden="true">🏆</span> Tu récord: <strong>{record.score.toLocaleString('es')} pts</strong> (
            {record.correct}/{QUESTIONS.length + 1} aciertos)
          </p>
        )}
      </div>
    </main>
  )
}
