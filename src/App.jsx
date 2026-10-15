import { useCallback, useState } from 'react'
import Home from './components/Home.jsx'
import Quiz from './components/Quiz.jsx'
import Results from './components/Results.jsx'
import Review from './components/Review.jsx'
import SoundToggle from './components/SoundToggle.jsx'
import { ALL_QUESTIONS, POINTS } from './data/questions.js'
import { buildAnimeQuiz } from './lib/apiQuiz.js'
import { loadSoundPref, saveRecordIfBetter, saveSoundPref } from './lib/storage.js'
import { playSound, unlockAudio } from './lib/sound.js'

const TITLES = { classic: 'reto de cultura general', anime: 'reto Pokémon, Naruto y Dragon Ball' }

export default function App() {
  const [screen, setScreen] = useState('home') // home | quiz | results | review
  const [mode, setMode] = useState('timed') // timed | relaxed
  const [variant, setVariant] = useState('classic') // classic | anime
  const [questions, setQuestions] = useState(ALL_QUESTIONS)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [answers, setAnswers] = useState([])
  const [runId, setRunId] = useState(0)
  const [soundOn, setSoundOn] = useState(loadSoundPref)
  const [recordInfo, setRecordInfo] = useState(null)

  const sfx = useCallback(
    (kind) => {
      if (soundOn) playSound(kind)
    },
    [soundOn],
  )

  const toggleSound = () => {
    const next = !soundOn
    if (next) unlockAudio()
    setSoundOn(next)
    saveSoundPref(next)
    if (next) setTimeout(() => playSound('tap'), 30)
  }

  const begin = (nextVariant, nextQuestions) => {
    setVariant(nextVariant)
    setQuestions(nextQuestions)
    setAnswers([])
    setRunId((n) => n + 1)
    setScreen('quiz')
  }

  const start = (nextVariant = variant) => {
    if (soundOn) unlockAudio()
    if (nextVariant === 'classic') return begin('classic', ALL_QUESTIONS)
    // El quiz anime se genera de nuevo en cada partida con datos de las APIs.
    setLoading(true)
    setLoadError(null)
    setScreen('home')
    buildAnimeQuiz()
      .then((qs) => begin('anime', qs))
      .catch((err) => setLoadError(err.message ?? 'No se pudo cargar el quiz'))
      .finally(() => setLoading(false))
  }

  const finish = (finalAnswers) => {
    const result = summarize(finalAnswers, questions)
    setRecordInfo(saveRecordIfBetter({ ...result, mode }, variant))
    setAnswers(finalAnswers)
    setScreen('results')
  }

  const { score, correct: correctCount } = summarize(answers, questions)

  return (
    <div className={`app app--${screen}`}>
      <SoundToggle on={soundOn} onToggle={toggleSound} />
      {screen === 'home' && (
        <Home
          mode={mode}
          onModeChange={setMode}
          onStart={() => start('classic')}
          onStartAnime={() => start('anime')}
          loading={loading}
          loadError={loadError}
        />
      )}
      {screen === 'quiz' && (
        <Quiz key={runId} questions={questions} mode={mode} onFinish={finish} sfx={sfx} onExit={() => setScreen('home')} />
      )}
      {screen === 'results' && (
        <Results
          questions={questions}
          title={TITLES[variant]}
          score={score}
          correct={correctCount}
          answers={answers}
          mode={mode}
          recordInfo={recordInfo}
          onReplay={() => start()}
          onReview={() => setScreen('review')}
          onHome={() => setScreen('home')}
        />
      )}
      {screen === 'review' && (
        <Review questions={questions} answers={answers} onBack={() => setScreen('results')} onReplay={() => start()} />
      )}
    </div>
  )
}

function summarize(answers, questions) {
  let score = 0
  let correct = 0
  for (const a of answers) {
    if (!a.correct) continue
    const q = questions.find((x) => x.id === a.id)
    score += q?.bonus ? POINTS.bonus : POINTS.normal
    correct += 1
  }
  return { score, correct }
}
