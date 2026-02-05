import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { rate as rate2v2, rating, predictWin } from '../dist/index.js'

const args = process.argv.slice(2)
const __dirname = dirname(fileURLToPath(import.meta.url))

const numberArg = (name, fallback) => {
  const prefix = `--${name}=`
  const raw = args.find((arg) => arg.startsWith(prefix))
  if (!raw) {
    return fallback
  }
  const value = Number(raw.slice(prefix.length))
  return Number.isFinite(value) ? value : fallback
}

const listArg = (name, fallback) => {
  const prefix = `--${name}=`
  const raw = args.find((arg) => arg.startsWith(prefix))
  if (!raw) {
    return fallback
  }
  const values = raw
    .slice(prefix.length)
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0)
  return values.length ? values : fallback
}

const constantsPathArg = args.find((arg) => arg.startsWith('--constants='))
const constantsPath = constantsPathArg
  ? resolve(process.cwd(), constantsPathArg.split('=')[1])
  : resolve(__dirname, 'constants.json')
const playersList = listArg('players', [1000, 10000, 20000])
const avgGamesList = listArg('avg-games', [10, 100, 1000, 10000])
const seedBase = numberArg('seed', null)
const useSynergy = !args.includes('--no-synergy')

if (!existsSync(constantsPath)) {
  console.error(`Constants file not found: ${constantsPath}`)
  process.exit(1)
}

const constantsSets = JSON.parse(readFileSync(constantsPath, 'utf8'))
if (!Array.isArray(constantsSets)) {
  throw new Error('constants.json must be an array of { name, options } entries.')
}

const mulberry32 = (seed) => {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const pickDistinct = (count, max, rng) => {
  const picks = new Set()
  while (picks.size < count) {
    picks.add(Math.floor(rng() * max))
  }
  return Array.from(picks)
}

const sortResults = (rows) => {
  const muRows = rows.filter((row) => row.metric === 'mu')
  const sigmaRows = rows.filter((row) => row.metric === 'sigma')
  return [...muRows, ...sigmaRows]
}

const summarize = (values, label) => {
  const sorted = [...values].sort((a, b) => a - b)
  const n = sorted.length
  const mean = sorted.reduce((sum, value) => sum + value, 0) / n
  const variance = sorted.reduce((sum, value) => sum + (value - mean) ** 2, 0) / n
  const stddev = Math.sqrt(variance)

  const percentile = (p) => {
    if (n === 0) return 0
    const idx = (p / 100) * (n - 1)
    const lower = Math.floor(idx)
    const upper = Math.ceil(idx)
    if (lower === upper) return sorted[lower]
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower)
  }

  return {
    metric: label,
    mean: Number(mean.toFixed(4)),
    stddev: Number(stddev.toFixed(4)),
    min: Number(sorted[0].toFixed(4)),
    p05: Number(percentile(5).toFixed(4)),
    p25: Number(percentile(25).toFixed(4)),
    p50: Number(percentile(50).toFixed(4)),
    p75: Number(percentile(75).toFixed(4)),
    p95: Number(percentile(95).toFixed(4)),
    p99: Number(percentile(99).toFixed(4)),
    max: Number(sorted[n - 1].toFixed(4)),
  }
}

const simulate = (playersCount, avgGames, options, rng) => {
  const players = Array.from({ length: playersCount }, () => rating({}, options))
  const totalGames = Math.round((playersCount * avgGames) / 4)
  const ratingIndex = new WeakMap()
  players.forEach((player, index) => ratingIndex.set(player, index))

  const synergyStore = new Map()
  const getTeamKey = (team) =>
    team
      .map((player) => ratingIndex.get(player))
      .filter((value) => value !== undefined)
      .sort((a, b) => a - b)
      .join('-')

  const synergyOptions = useSynergy
    ? {
        synergy: (team) => synergyStore.get(getTeamKey(team)),
        synergyInit: () => rating({}, options),
        onSynergyUpdate: (team, synergy) => {
          synergyStore.set(getTeamKey(team), synergy)
        },
      }
    : {}

  for (let i = 0; i < totalGames; i += 1) {
    const [a1, a2, b1, b2] = pickDistinct(4, playersCount, rng)
    const teamA = [players[a1], players[a2]]
    const teamB = [players[b1], players[b2]]
    const [probA] = predictWin([teamA, teamB], options)
    const rank = rng() < probA ? [1, 2] : [2, 1]
    const [updatedA, updatedB] = rate2v2(teamA, teamB, { ...options, ...synergyOptions, rank })

    players[a1] = updatedA[0]
    players[a2] = updatedA[1]
    players[b1] = updatedB[0]
    players[b2] = updatedB[1]
    ratingIndex.set(players[a1], a1)
    ratingIndex.set(players[a2], a2)
    ratingIndex.set(players[b1], b1)
    ratingIndex.set(players[b2], b2)
  }

  return {
    totalGames,
    muStats: summarize(
      players.map((player) => player.mu),
      'mu'
    ),
    sigmaStats: summarize(
      players.map((player) => player.sigma),
      'sigma'
    ),
  }
}

const results = []
let runIndex = 0

for (const [setIndex, entry] of constantsSets.entries()) {
  const name = entry?.name ?? `set-${setIndex + 1}`
  const options = entry?.options ?? {}

  for (const playersCount of playersList) {
    for (const avgGames of avgGamesList) {
      runIndex += 1
      const seed = seedBase === null ? null : seedBase + runIndex
      const rng = seed === null ? Math.random : mulberry32(seed)
      const { totalGames, muStats, sigmaStats } = simulate(playersCount, avgGames, options, rng)

      const baseRow = {
        constants: name,
        players: playersCount,
        avgGames,
        totalGames,
        seed: seed ?? 'random',
      }

      results.push({ ...baseRow, ...muStats })
      results.push({ ...baseRow, ...sigmaStats })
    }
  }
}

const csvFileArg = args.find((arg) => arg.startsWith('--csv='))
const csvPath = csvFileArg ? csvFileArg.split('=')[1] : null
const wantsCsv = args.includes('--csv') || Boolean(csvPath)

const toCsv = (rows) => {
  const header = [
    'constants',
    'players',
    'avgGames',
    'totalGames',
    'seed',
    'metric',
    'mean',
    'stddev',
    'min',
    'p05',
    'p25',
    'p50',
    'p75',
    'p95',
    'p99',
    'max',
  ]
  const lines = [header.join(',')]
  for (const row of rows) {
    const values = header.map((key) => {
      const value = row[key]
      const safe = typeof value === 'string' ? value.replace(/"/g, '""') : value
      return `"${safe}"`
    })
    lines.push(values.join(','))
  }
  return lines.join('\n')
}

console.log('Simulation settings')
console.table([
  {
    constantsFile: constantsPath,
    players: playersList.join(', '),
    avgGames: avgGamesList.join(', '),
    seed: seedBase ?? 'random',
    synergy: useSynergy,
  },
])

const orderedResults = sortResults(results)

console.log('Distribution summary')
console.table(orderedResults)

if (wantsCsv) {
  const csv = toCsv(orderedResults)
  if (csvPath) {
    writeFileSync(csvPath, csv, 'utf8')
    console.log(`CSV written to ${csvPath}`)
  } else {
    console.log(csv)
  }
}
