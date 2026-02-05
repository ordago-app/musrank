import { Options } from './types'

// --- Core Thurstone–Mosteller parameters ---
// Z: number of sigmas for ordinal confidence (higher = more conservative).
export const Z = 3
// MU: initial mean skill.
export const MU = 15
// SIGMA: How little do we know about a new player? Higher = more volatility.
export const SIGMA = MU / Z
// BETA_DIVISOR: How noisy is performance compared to skill?
export const BETA_DIVISOR = 2

// --- Uncertainty dynamics (controls how sigma changes with more games) ---
// TAU: How much uncertainty re-enters the system between matches? Smaller TAU → more stable ratings → difficult for “late bloomers” to catch up
export const TAU = MU / 300
// LIMIT_SIGMA: prevents sigma from increasing when tau is used.
export const LIMIT_SIGMA = true // DECIDE THIS!!

// --- Ordinal scaling (controls how ordinal changes with more games) ---
// Margin of victory could be included here
// EPSILON: numeric floor for stability in sqrt/divisions.
export const EPSILON = 0.0001
// ALPHA: ordinal scaling factor.
export const ALPHA = 1
// TARGET: ordinal baseline offset.
export const TARGET = 0

// --- Match-points extension (beta scaling by points-to-win) ---
// MATCH_POINTS_REF: reference points-to-win for scaling (optional).
export const MATCH_POINTS_REF = 3
// BETA0: baseline beta for match-points scaling (optional).
export const BETA0 = SIGMA / 2
// BETA_POWER: exponent for match-points scaling.
export const BETA_POWER = 0.5

export const TUNABLE_CONSTANTS = [
  'Z',
  'MU',
  'SIGMA',
  'BETA',
  'MATCH_POINTS_REF',
  'BETA0',
  'BETA_POWER',
  'TAU',
  'EPSILON',
  'ALPHA',
  'TARGET',
  'LIMIT_SIGMA',
] as const

const builder = (options: Options) => {
  // i'd love to know of a better way to do this
  const { z = Z, mu = MU, epsilon = EPSILON, alpha = ALPHA, target = TARGET } = options
  const {
    tau = mu / 300,
    sigma = mu / z,
    beta: betaOption,
    beta0 = BETA0,
    betaPower = BETA_POWER,
    matchPoints,
    matchPointsRef = matchPoints ?? MATCH_POINTS_REF,
    limitSigma = LIMIT_SIGMA,
  } = options
  let beta = betaOption ?? sigma / BETA_DIVISOR

  if (beta0 !== undefined) {
    if (matchPoints !== undefined && matchPoints > 0) {
      const ref = matchPointsRef ?? matchPoints
      beta = beta0 * Math.pow(ref / matchPoints, betaPower)
    } else {
      beta = beta0
    }
  }
  const betaSq = beta ** 2

  return {
    SIGMA: sigma,
    MU: mu,
    EPSILON: epsilon,
    TWOBETASQ: 2 * betaSq,
    BETA: beta,
    BETASQ: betaSq,
    Z: z,
    ALPHA: alpha,
    TARGET: target,
    TAU: tau,
    LIMIT_SIGMA: limitSigma,
  }
}

export default builder
