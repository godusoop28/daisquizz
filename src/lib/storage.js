const RECORD_KEY = 'daisquizz:record'
const SOUND_KEY = 'daisquizz:sound'

const recordKey = (variant) => (variant === 'classic' ? RECORD_KEY : `${RECORD_KEY}:${variant}`)

export function loadRecord(variant = 'classic') {
  try {
    const raw = localStorage.getItem(recordKey(variant))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveRecordIfBetter(result, variant = 'classic') {
  const current = loadRecord(variant)
  const isNew = !current || result.score > current.score
  if (isNew) {
    try {
      localStorage.setItem(recordKey(variant), JSON.stringify({ ...result, date: new Date().toISOString() }))
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
