import { zip } from 'ramda'
import util, { ladderPairs, scoreToPerformance } from '../util'
import { w, v, vt, wt } from '../statistics'
import constants from '../constants'
import { Rating, Options, Model } from '../types'

const model: Model = (game: Rating[][], options: Options = {}) => {
  const { TWOBETASQ, EPSILON } = constants(options)
  const { teamRating, gamma } = util(options)
  const toPerformance = scoreToPerformance(options)
  const teamRatings = teamRating(game)
  const scores = options.score
  const indexedTeamRatings = teamRatings.map((teamRating, index) => [teamRating, index] as const)
  const adjacentTeams = ladderPairs(indexedTeamRatings)

  return zip(indexedTeamRatings, adjacentTeams).map(([iIndexed, iAdjacents]) => {
    const [iTeamRating, iIndex] = iIndexed
    const [iMu, iSigmaSq, iTeam, iRank] = iTeamRating
    const [iOmega, iDelta] = iAdjacents.reduce(
      ([omega, delta], [qTeamRating, qIndex]) => {
        const [qMu, qSigmaSq, _qTeam, qRank] = qTeamRating
        const ciq = 2 * Math.sqrt(iSigmaSq + qSigmaSq + TWOBETASQ)
        const deltaMu = (iMu - qMu) / ciq
        const sigSqToCiq = iSigmaSq / ciq
        const iGamma = gamma(ciq, teamRatings.length, iMu, iSigmaSq, iTeam, iRank)

        if (toPerformance && scores) {
          const gap = (scores[iIndex] ?? 0) - (scores[qIndex] ?? 0)
          const gapSign = gap === 0 ? 0 : gap > 0 ? 1 : -1
          const performanceGap = gapSign === 0 ? 0 : toPerformance(Math.abs(gap), options) * gapSign
          const residual = performanceGap - (iMu - qMu)
          const vMargin = residual / ciq
          return [omega + sigSqToCiq * vMargin, delta + (iGamma * sigSqToCiq) / ciq]
        }

        if (qRank === iRank) {
          return [
            omega + sigSqToCiq * vt(deltaMu, EPSILON / ciq),
            delta + ((iGamma * sigSqToCiq) / ciq) * wt(deltaMu, EPSILON / ciq),
          ]
        }

        const sign = qRank > iRank ? 1 : -1
        return [
          omega + sign * sigSqToCiq * v(sign * deltaMu, EPSILON / ciq),
          delta + ((iGamma * sigSqToCiq) / ciq) * w(sign * deltaMu, EPSILON / ciq),
        ]
      },
      [0, 0]
    )

    return iTeam.map(({ mu, sigma }) => {
      const sigmaSq = sigma * sigma
      return {
        mu: mu + (sigmaSq / iSigmaSq) * iOmega,
        sigma: sigma * Math.sqrt(Math.max(1 - (sigmaSq / iSigmaSq) * iDelta, EPSILON)),
      }
    })
  })
}

export default model
