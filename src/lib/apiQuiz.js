// Genera un quiz nuevo en cada partida con datos en vivo de tres APIs públicas:
// PokeAPI, Dattebayo (Naruto) y Dragon Ball API.

const POKEAPI = 'https://pokeapi.co/api/v2'
const NARUTO_API = 'https://dattebayo-api.onrender.com'
const DRAGONBALL_API = 'https://dragonball-api.com/api'

// Dattebayo está en un plan gratuito que “duerme”: el primer pedido puede tardar.
const TIMEOUT_MS = 60000

const POKEMON_TYPES = {
  normal: 'Normal', fire: 'Fuego', water: 'Agua', grass: 'Planta', electric: 'Eléctrico', ice: 'Hielo',
  fighting: 'Lucha', poison: 'Veneno', ground: 'Tierra', flying: 'Volador', psychic: 'Psíquico', bug: 'Bicho',
  rock: 'Roca', ghost: 'Fantasma', dragon: 'Dragón', dark: 'Siniestro', steel: 'Acero', fairy: 'Hada',
}

const GENERATIONS = [151, 251, 386, 493, 649, 721, 809, 905, 1025]

const NARUTO_CLANS = new Set([
  'Uchiha', 'Senju', 'Uzumaki', 'Hyūga', 'Nara', 'Akimichi', 'Yamanaka', 'Aburame', 'Inuzuka',
  'Sarutobi', 'Hatake', 'Ōtsutsuki', 'Hōzuki', 'Shimura', 'Hoshigaki',
])

const DB_RACES = {
  Saiyan: 'Saiyajin', Namekian: 'Namekiano', Human: 'Humano', 'Frieza Race': 'Raza de Freezer',
  Android: 'Androide', Majin: 'Majin', God: 'Dios', Angel: 'Ángel', 'Jiren Race': 'Raza de Jiren',
}

const DB_AFFILIATIONS = {
  'Z Fighter': 'Guerreros Z', 'Army of Frieza': 'Ejército de Freezer', Freelancer: 'Independiente',
  Villain: 'Villano', 'Assistant of Beerus': 'Asistente de Beerus', 'Pride Troopers': 'Tropas del Orgullo',
  'Assistant of Vermoud': 'Asistente de Vermoud',
}

export class ApiError extends Error {
  constructor(source) {
    super(`No se pudo conectar con ${source}`)
    this.source = source
  }
}

async function getJson(url, source) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch {
    throw new ApiError(source)
  } finally {
    clearTimeout(timer)
  }
}

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

const randomInts = (count, min, max) => {
  const set = new Set()
  while (set.size < count) set.add(min + Math.floor(Math.random() * (max - min + 1)))
  return [...set]
}

// Toma dos distractores distintos de la respuesta (y entre sí) y baraja las opciones.
function buildOptions(correct, candidates) {
  const wrong = shuffle([...new Set(candidates)].filter((c) => c && c !== correct)).slice(0, 2)
  if (wrong.length < 2) return null
  const options = shuffle([correct, ...wrong])
  return { options, answer: options.indexOf(correct) }
}

const cleanName = (s) => s.replace(/\s*\(.*?\)\s*/g, ' ').trim()

/* ---------- Pokémon ---------- */

const pokeName = (name) =>
  name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

const pokeTypes = (p) => p.types.map((t) => POKEMON_TYPES[t.type.name] ?? t.type.name).join(' / ')
const pokeImage = (p) => p.sprites.other?.['official-artwork']?.front_default ?? p.sprites.front_default
const pokeGen = (id) => GENERATIONS.findIndex((last) => id <= last) + 1

async function pokemonQuestions() {
  const ids = [...randomInts(8, 1, 493), ...randomInts(3, 494, 1025)]
  const all = await Promise.all(ids.map((id) => getJson(`${POKEAPI}/pokemon/${id}`, 'PokeAPI')))
  const mons = all.map((p) => ({ id: p.id, name: pokeName(p.species?.name ?? p.name), types: pokeTypes(p), image: pokeImage(p) }))
  const classic = mons.slice(0, 8)
  const modern = mons.slice(8)
  const names = classic.map((m) => m.name)
  const qs = []

  for (const m of classic.slice(0, 2)) {
    const o = buildOptions(m.name, names)
    if (o)
      qs.push({
        kind: 'who', category: 'pokemon', emoji: '❓', image: m.image, silhouette: true,
        question: '¿Quién es ese Pokémon?', ...o,
        explanation: `¡Es ${m.name}! Su número en la Pokédex Nacional es el ${m.id}.`,
      })
  }

  const typePool = [...mons.map((m) => m.types), ...Object.values(POKEMON_TYPES)]
  for (const m of classic.slice(2, 4)) {
    const o = buildOptions(m.types, typePool)
    if (o)
      qs.push({
        kind: 'type', category: 'pokemon', emoji: '🔥', image: m.image,
        question: `¿De qué tipo es ${m.name}?`, ...o,
        explanation: `${m.name} es de tipo ${m.types}.`,
      })
  }

  const g = classic[4]
  const gen = pokeGen(g.id)
  const genLabel = (n) => `Generación ${n}`
  const genOpts = buildOptions(genLabel(gen), GENERATIONS.map((_, i) => genLabel(i + 1)))
  qs.push({
    kind: 'gen', category: 'pokemon', emoji: '📅', image: g.image,
    question: `¿En qué generación debutó ${g.name}?`, ...genOpts,
    explanation: `${g.name} (n.º ${g.id}) apareció por primera vez en la generación ${gen}.`,
  })

  // Bonus: silueta de un Pokémon de la quinta generación en adelante.
  const b = modern[0]
  const bonus = {
    kind: 'who', category: 'pokemon', emoji: '❓', image: b.image, silhouette: true, bonus: true,
    question: '¿Quién es ese Pokémon? (generación 5 en adelante)',
    ...buildOptions(b.name, modern.map((m) => m.name)),
    explanation: `¡Es ${b.name}, el n.º ${b.id} de la Pokédex, de la generación ${pokeGen(b.id)}!`,
  }

  return { qs: qs.slice(0, 5), bonus }
}

/* ---------- Naruto ---------- */

function narutoClan(c) {
  const raw = c.personal?.clan
  const first = Array.isArray(raw) ? raw[0] : typeof raw === 'string' ? raw.split(',')[0] : null
  if (!first) return null
  const clan = cleanName(first).replace(/\s*Clan$/, '')
  return NARUTO_CLANS.has(clan) ? clan : null
}

async function narutoQuestions() {
  const data = await getJson(`${NARUTO_API}/characters?page=1&limit=1500`, 'la API de Naruto')
  // La API devuelve primero a los personajes más conocidos; nos quedamos con los principales.
  const pool = data.characters
    .filter((c) => c.images?.length && c.jutsu?.length > 10)
    .slice(0, 45)
    .map((c) => ({ ...c, name: cleanName(c.name) }))
  const names = pool.map((c) => c.name)
  const qs = []

  for (const c of shuffle(pool).slice(0, 2)) {
    const o = buildOptions(c.name, names)
    if (o)
      qs.push({
        kind: 'who', category: 'naruto', emoji: '🍥', image: c.images[0],
        question: '¿Quién es este personaje de Naruto?', ...o,
        explanation: `Es ${c.name}.`,
      })
  }

  const withClan = pool.filter((c) => narutoClan(c) && !qs.some((q) => q.options[q.answer] === c.name))
  if (withClan.length) {
    const c = pick(withClan)
    const clan = narutoClan(c)
    const o = buildOptions(clan, [...NARUTO_CLANS])
    qs.push({
      kind: 'clan', category: 'naruto', emoji: '🏯', image: c.images[0],
      question: `¿A qué clan pertenece ${c.name}?`, ...o,
      explanation: `${c.name} pertenece al clan ${clan}.`,
    })
  }

  const withFather = pool.filter((c) => c.family?.father && c.name.length > 2)
  const fathers = withFather.map((c) => cleanName(c.family.father))
  if (withFather.length >= 3) {
    const c = pick(withFather)
    const father = cleanName(c.family.father)
    const o = buildOptions(father, fathers)
    if (o)
      qs.push({
        kind: 'father', category: 'naruto', emoji: '👨‍👦', image: c.images[0],
        question: `¿Quién es el padre de ${c.name}?`, ...o,
        explanation: `El padre de ${c.name} es ${father}.`,
      })
  }

  const usable = (j) => !/\(|only/i.test(j) && j.length <= 40
  const main = pick(pool.slice(0, 15))
  const own = new Set(main.jutsu)
  const jutsu = pick(main.jutsu.filter(usable))
  const others = pool.flatMap((c) => c.jutsu).filter((j) => usable(j) && !own.has(j))
  const jo = buildOptions(jutsu, others)
  if (jo)
    qs.push({
      kind: 'jutsu', category: 'naruto', emoji: '🌀', image: main.images[0],
      question: `¿Cuál de estas técnicas usa ${main.name}?`, ...jo,
      explanation: `${main.name} usa “${jutsu}”, una de sus ${main.jutsu.length} técnicas registradas.`,
    })

  return { qs: qs.slice(0, 5) }
}

/* ---------- Dragon Ball ---------- */

async function dragonBallQuestions() {
  const data = await getJson(`${DRAGONBALL_API}/characters?limit=100`, 'la API de Dragon Ball')
  const pool = data.items.map((c) => ({ ...c, name: c.name.trim() }))
  const names = pool.map((c) => c.name)
  const qs = []
  const picks = shuffle(pool)

  for (const c of picks.slice(0, 2)) {
    const o = buildOptions(c.name, names)
    if (o)
      qs.push({
        kind: 'who', category: 'dragonball', emoji: '🐉', image: c.image,
        question: '¿Quién es este personaje de Dragon Ball?', ...o,
        explanation: `Es ${c.name}. Su ki máximo es de ${c.maxKi}.`,
      })
  }

  const withRace = picks.slice(2).filter((c) => DB_RACES[c.race])
  for (const c of withRace.slice(0, 2)) {
    const race = DB_RACES[c.race]
    const o = buildOptions(race, Object.values(DB_RACES))
    qs.push({
      kind: 'race', category: 'dragonball', emoji: '🧬', image: c.image,
      question: `¿De qué raza es ${c.name}?`, ...o,
      explanation: `${c.name} es de raza ${race}.`,
    })
  }

  const withAff = picks.slice(4).filter((c) => DB_AFFILIATIONS[c.affiliation])
  if (withAff.length) {
    const c = withAff[0]
    const aff = DB_AFFILIATIONS[c.affiliation]
    const o = buildOptions(aff, Object.values(DB_AFFILIATIONS))
    qs.push({
      kind: 'affiliation', category: 'dragonball', emoji: '🛡️', image: c.image,
      question: `¿A qué bando pertenece ${c.name}?`, ...o,
      explanation: `${c.name} pertenece a: ${aff}.`,
    })
  }

  return { qs: qs.slice(0, 5) }
}

/* ---------- Quiz completo ---------- */

export async function buildAnimeQuiz() {
  const [poke, naruto, db] = await Promise.all([pokemonQuestions(), narutoQuestions(), dragonBallQuestions()])
  const run = Date.now().toString(36)
  const main = shuffle([...poke.qs, ...naruto.qs, ...db.qs])
  return [...main, poke.bonus].map((q, i) => ({ ...q, id: `api-${run}-${i}-${q.category}-${q.kind}` }))
}
