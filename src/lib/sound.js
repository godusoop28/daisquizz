// Sonidos breves generados con Web Audio: no hay archivos externos.
// El AudioContext solo se crea tras un clic del usuario (al activar el sonido).
let ctx = null

export function unlockAudio() {
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return false
      ctx = new AC()
    }
    if (ctx.state === 'suspended') ctx.resume()
    return true
  } catch {
    return false
  }
}

function tone(freq, start, duration, type = 'sine', volume = 0.18) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start)
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start)
  gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start(ctx.currentTime + start)
  osc.stop(ctx.currentTime + start + duration + 0.05)
}

export function playSound(kind) {
  if (!ctx) return
  try {
    if (kind === 'correct') {
      tone(660, 0, 0.12, 'triangle')
      tone(880, 0.1, 0.12, 'triangle')
      tone(1320, 0.2, 0.2, 'triangle')
    } else if (kind === 'wrong') {
      tone(220, 0, 0.18, 'square', 0.08)
      tone(165, 0.16, 0.28, 'square', 0.08)
    } else if (kind === 'tap') {
      tone(520, 0, 0.08, 'sine', 0.12)
    }
  } catch {
    /* sin sonido si el navegador no lo permite */
  }
}
