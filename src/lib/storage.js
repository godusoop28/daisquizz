const RECORD_KEY = 'daisquizz:record'
const SOUND_KEY = 'daisquizz:sound'

export function loadRecord() {
  try {
    const raw = localStorage.getItem(RECORD_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveRecordIfBetter(result) {
  const current = loadRecord()
  const isNew = !current || result.score > current.score
  if (isNew) {
    try {
      localStorage.setItem(RECORD_KEY, JSON.stringify({ ...result, date: new Date().toISOString() }))
    } catch {
      /* almacenamiento no disponible */
    }
  }
  return { isNew, previous: current }
}

export function loadSoundPref() {
  try {
    return localStorage.getItem(SOUND_KEY) === 'on'
  } catch {
    return false
  }
}

export function saveSoundPref(on) {
  try {
    localStorage.setItem(SOUND_KEY, on ? 'on' : 'off')
  } catch {
    /* ignorar */
  }
}
