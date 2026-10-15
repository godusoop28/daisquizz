import { useCallback, useState } from 'react'
import Home from './components/Home.jsx'
import Quiz from './components/Quiz.jsx'
import Results from './components/Results.jsx'
import Review from './components/Review.jsx'
import SoundToggle from './components/SoundToggle.jsx'
import { ALL_QUESTIONS, POINTS } from './data/questions.js'
import { loadSoundPref, saveRecordIfBetter, saveSoundPref } from './lib/storage.js'
import { playSound, unlockAudio } from './lib/sound.js'

export default function App() {
  const [screen, setScreen] = useState('home') // home | quiz | results | review
  const [mode, setMode] = useState('timed') // timed | relaxed
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

  const start = () => {
    if (soundOn) unlockAudio()
    setAnswers([])
    setRunId((n) => n + 1)
    setScreen('quiz')
  }

  const finish = (finalAnswers) => {
    const result = summarize(finalAnswers)
    setRecordInfo(saveRecordIfBetter({ ...result, mode }))
    setAnswers(finalAnswers)
    setScreen('results')
  }

  const { score, correct: correctCount } = summarize(answers)

  return (
    <div className={`app app--${screen}`}>
      <SoundToggle on={soundOn} onToggle={toggleSound} />
      {screen === 'home' && <Home mode={mode} onModeChange={setMode} onStart={start} />}
      {screen === 'quiz' && <Quiz key={runId} mode={mode} onFinish={finish} sfx={sfx} onExit={() => setScreen('home')} />}
      {screen === 'results' && (
        <Results
          score={score}
          correct={correctCount}
          answers={answers}
          mode={mode}
          recordInfo={recordInfo}
          onReplay={start}
          onReview={() => setScreen('review')}
          onHome={() => setScreen('home')}
        />
      )}
      {screen === 'review' && <Review answers={answers} onBack={() => setScreen('results')} onReplay={start} />}
    </div>
  )
}

function summarize(answers) {
  let score = 0
  let correct = 0
  for (const a of answers) {
    if (!a.correct) continue
    const q = ALL_QUESTIONS.find((x) => x.id === a.id)
    score += q.bonus ? POINTS.bonus : POINTS.normal
    correct += 1
  }
  return { score, correct }
}
