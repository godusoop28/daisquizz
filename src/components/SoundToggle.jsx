export default function SoundToggle({ on, onToggle }) {
  return (
    <button
      type="button"
      className="sound-toggle"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={on ? 'Desactivar sonido' : 'Activar sonido'}
      title={on ? 'Sonido activado' : 'Sonido desactivado'}
    >
      <span aria-hidden="true">{on ? '🔊' : '🔇'}</span>
      <span className="sound-toggle__text">{on ? 'Sonido' : 'Silencio'}</span>
    </button>
  )
}
