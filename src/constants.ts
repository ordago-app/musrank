import { Options } from './types'

const builder = (options: Options) => {
  // i'd love to know of a better way to do this
  const { z = 3, mu = 25, preventSigmaIncrease = false, epsilon = 0.0001, alpha = 1, target = 0 } = options
  const {
    tau = mu / 300,
    sigma = mu / z,
    beta: betaOption,
    beta0,
    betaPower = 0.5,
    matchLength,
    matchRef = matchLength,
    limitSigma = preventSigmaIncrease,
  } = options
  let beta = betaOption ?? sigma / 2

  if (beta0 !== undefined) {
    if (matchLength !== undefined && matchLength > 0) {
      const ref = matchRef ?? matchLength
      beta = beta0 * Math.pow(ref / matchLength, betaPower)
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
