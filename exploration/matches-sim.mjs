import { rate as rate2v2, rating, predictWin } from '../dist/index.js'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const constantsPath = resolve(__dirname, 'constants.json')
const parameterSets = JSON.parse(readFileSync(constantsPath, 'utf8'))

const baselinePlayer = rating()
const baseMu = baselinePlayer.mu
const baseSigma = baselinePlayer.sigma
const gameCounts = [1, 10, 100]

const scenarios = [
  { name: 'Balanced teams', teamAOverrides: [], teamBOverrides: [] },
  {
    name: 'Mixed skill teams',
    teamAOverrides: [
      { mu: baseMu + 6, sigma: baseSigma * 0.9 },
      { mu: baseMu + 2, sigma: baseSigma },
    ],
    teamBOverrides: [
      { mu: baseMu - 1, sigma: baseSigma * 1.1 },
      { mu: baseMu - 4, sigma: baseSigma * 1.2 },
    ],
  },
]

const makeTeam = (overrides = []) => {
  if (!overrides.length) {
    return [rating(), rating()]
  }
  return overrides.map((override) => rating(override))
}

const summarizeTeam = (team) => {
  const mu = team.reduce((sum, player) => sum + player.mu, 0) / team.length
  const sigma = team.reduce((sum, player) => sum + player.sigma, 0) / team.length
  return {
    avgMu: mu,
    avgSigma: sigma,
    deltaMu: mu - baseMu,
    deltaSigma: sigma - baseSigma,
  }
}

const runScenario = (scenario, options, targetGame) => {
  const initialTeamA = makeTeam(scenario.teamAOverrides)
  const initialTeamB = makeTeam(scenario.teamBOverrides)
  let teamA = initialTeamA
  let teamB = initialTeamB

  for (let i = 1; i < targetGame; i += 1) {
    const [probA] = predictWin([teamA, teamB], options)
    const rank = Math.random() < probA ? [1, 2] : [2, 1]
    const [updatedA, updatedB] = rate2v2(teamA, teamB, {
      ...options,
      rank,
    })
    teamA = updatedA
    teamB = updatedB
  }

  const preGameTeamA = teamA
  const preGameTeamB = teamB
  const [probA] = predictWin([preGameTeamA, preGameTeamB], options)
  const rank = Math.random() < probA ? [1, 2] : [2, 1]
  const [postGameA, postGameB] = rate2v2(preGameTeamA, preGameTeamB, {
    ...options,
    rank,
  })

  return {
    scenario: scenario.name,
    initialTeamA,
    initialTeamB,
    preGameTeamA,
    preGameTeamB,
    postGameA,
    postGameB,
  }
}

const rows = []
for (const set of parameterSets) {
  const name = set?.name ?? 'custom'
  const options = set?.options ?? {}
  for (const scenario of scenarios) {
    for (const games of gameCounts) {
      const result = runScenario(scenario, options, games)
      const [t1p1Start, t1p2Start] = result.preGameTeamA
      const [t2p1Start, t2p2Start] = result.preGameTeamB
      const [t1p1End, t1p2End] = result.postGameA
      const [t2p1End, t2p2End] = result.postGameB
      rows.push({
        scenario: result.scenario,
        config: JSON.stringify(options),
        games,
        t1p1: Number(t1p1Start.mu.toFixed(6)),
        t1p2: Number(t1p2Start.mu.toFixed(6)),
        t2p1: Number(t2p1Start.mu.toFixed(6)),
        t2p2: Number(t2p2Start.mu.toFixed(6)),
        t1p1Delta: Number((t1p1End.mu - t1p1Start.mu).toFixed(6)),
        t1p2Delta: Number((t1p2End.mu - t1p2Start.mu).toFixed(6)),
        t2p1Delta: Number((t2p1End.mu - t2p1Start.mu).toFixed(6)),
        t2p2Delta: Number((t2p2End.mu - t2p2Start.mu).toFixed(6)),
      })
    }
  }
}
const args = process.argv.slice(2)
const csvFileArg = args.find((arg) => arg.startsWith('--csv='))
const csvPath = csvFileArg ? csvFileArg.split('=')[1] : null
const wantsCsv = args.includes('--csv') || Boolean(csvPath)

const toCsv = (data) => {
  const header = [
    'scenario',
    'config',
    'games',
    't1p1',
    't1p2',
    't2p1',
    't2p2',
    't1p1Delta',
    't1p2Delta',
    't2p1Delta',
    't2p2Delta',
  ]
  const lines = [header.join(',')]
  for (const row of data) {
    const values = header.map((key) => {
      const value = row[key]
      const safe = typeof value === 'string' ? value.replace(/"/g, '""') : value
      return `"${safe}"`
    })
    lines.push(values.join(','))
  }
  return lines.join('\n')
}

console.table(rows)

if (wantsCsv) {
  const csv = toCsv(rows)
  if (csvPath) {
    const { writeFileSync } = await import('node:fs')
    writeFileSync(csvPath, csv, 'utf8')
    console.log(`CSV written to ${csvPath}`)
  } else {
    console.log(csv)
  }
}
