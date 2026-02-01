import util, { scoreToPerformance } from '../util'
import constants from '../constants'
import { w, v, vt, wt } from '../statistics'
import { Rating, Options, Model } from '../types'

const model: Model = (game: Rating[][], options: Options = {}) => {
  const { TWOBETASQ, EPSILON } = constants(options)
  const { teamRating, gamma } = util(options)
  const toPerformance = scoreToPerformance(options)
  const teamRatings = teamRating(game)
  const scores = options.score

  return teamRatings.map((iTeamRating, i) => {
    const [iMu, iSigmaSq, iTeam, iRank] = iTeamRating
    const [iOmega, iDelta] = teamRatings
      .filter((_, q) => i !== q)
      .reduce(
        ([omega, delta], [qMu, qSigmaSq, _qTeam, qRank], q) => {
          const ciq = Math.sqrt(iSigmaSq + qSigmaSq + TWOBETASQ)
          const deltaMu = (iMu - qMu) / ciq
          const sigSqToCiq = iSigmaSq / ciq
          const iGamma = gamma(ciq, teamRatings.length, ...iTeamRating)

          if (toPerformance && scores) {
            const gap = (scores[i] ?? 0) - (scores[q] ?? 0)
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
