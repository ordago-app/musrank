import { zip } from 'ramda'
import constants from './constants'
import { Rating, Options, Gamma, Team, Rank, ScoreToPerformance } from './types'

export type TeamMu = number

export type TeamSigmaSq = number

export type TeamRating = [TeamMu, TeamSigmaSq, Team, Rank]

export const sum = (a: number, b: number) => a + b

export const score = (q: number, i: number) => {
  if (q < i) {
    return 0.0
  }
  if (q > i) {
    return 1.0
  }
  // q === i
  return 0.5
}

export const rankings = (teams: Team[], rank: number[] = []) => {
  const teamScores = teams.map((_, i) => rank[i] || i)
  const outRank = new Array(teams.length)

  let s = 0
  for (let j = 0; j < teamScores.length; j += 1) {
    if (j > 0 && teamScores[j - 1] < teamScores[j]) {
      s = j
    }
    outRank[j] = s
  }
  return outRank
}

// this is basically shared code, precomputed for every model
const teamRating =
  (options: Options) =>
  (game: Team[]): TeamRating[] => {
    const rank = rankings(game, options.rank)
    return game.map((team, i) => [
      // mu[i]
      team.map(({ mu }) => mu).reduce(sum, 0),
      // sigma^2[i]
      team.map(({ sigma }) => sigma * sigma).reduce(sum, 0),
      // (original team data)
      team,
      // rank[i]
      rank[i],
    ])
  }

export const ladderPairs = <T>(ranks: T[]): T[][] => {
  const size = ranks.length
  const left = [undefined, ...ranks.slice(0, size - 1)]
  const right = [...ranks.slice(1), undefined]
  return zip(left, right).map(([l, r]) => {
    if (l !== undefined && r !== undefined) return [l, r]
    if (l !== undefined && r === undefined) return [l]
    if (l === undefined && r !== undefined) return [r]
    return [] // this should really only happen when size === 1
  })
}

const utilC = (options: Options) => {
  const { BETASQ } = constants(options)
  return (teamRatings: TeamRating[]) =>
    Math.sqrt(teamRatings.map(([_teamMu, teamSigmaSq, _team, _rank]) => teamSigmaSq + BETASQ).reduce(sum, 0))
}

export const utilSumQ = (teamRatings: TeamRating[], c: number) =>
  teamRatings.map(([_qMu, _qSigmaSq, _qTeam, qRank]) =>
    teamRatings
      .filter(([_iMu, _iSigmaSq, _iTeam, iRank]) => iRank >= qRank)
      .map(([iMu, _iSigmaSq, _iTeam, _iRank]) => Math.exp(iMu / c))
      .reduce(sum, 0)
  )

export const utilA = (teamRatings: TeamRating[]) =>
  teamRatings.map(
    ([_iMu, _iSigmaSq, _iTeam, iRank]) =>
      teamRatings.filter(([_qMu, _qSigmaSq, _qTeam, qRank]) => iRank === qRank).length
  )

export const gamma = (options: Options): Gamma =>
  options.gamma ??
  // default to iSigma / c
  ((c: number, _k: number, _mu: number, sigmaSq: number, _team: Rating[], _qRank: number) => Math.sqrt(sigmaSq) / c)

export const scoreToPerformance = (options: Options): ScoreToPerformance | undefined => {
  if (options.scoreToPerformance) return options.scoreToPerformance
  if (options.scoreTransform === undefined && options.scoreScale === undefined && options.scoreSaturation === undefined)
    return undefined

  const scale = options.scoreScale ?? 1
  const saturation = options.scoreSaturation ?? 0
  const tanh = (value: number) => {
    const e2 = Math.exp(2 * value)
    return (e2 - 1) / (e2 + 1)
  }
  const transform = options.scoreTransform ?? (saturation > 0 ? 'tanh' : 'linear')
  if (transform === 'tanh') {
    const g0 = saturation > 0 ? saturation : 1
    return (gap: number, _options: Options) => scale * tanh(gap / g0)
  }
  if (transform === 'log') {
    return (gap: number, _options: Options) => scale * Math.log(1 + gap)
  }
  if (transform === 'sqrt') {
    return (gap: number, _options: Options) => scale * Math.sqrt(gap)
  }
  return (gap: number, _options: Options) => scale * gap
}

export default (options: Options) => ({
  utilC: utilC(options),
  teamRating: teamRating(options),
  gamma: gamma(options),
})
