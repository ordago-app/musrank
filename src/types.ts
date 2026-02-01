export type Rating = {
  mu: number
  sigma: number
}

export type Team = Rating[]

export type Rank = number

export type Gamma = (c: number, k: number, mu: number, sigmaSq: number, team: Rating[], qRank: number) => number

export type ScoreTransform = 'linear' | 'log' | 'sqrt' | 'tanh'

export type ScoreToPerformance = (gap: number, options: Options) => number

export type Model = (teams: Team[], options?: Options) => Team[]

export type Options = {
  z?: number
  mu?: number
  sigma?: number
  epsilon?: number
  gamma?: Gamma
  beta?: number
  beta0?: number
  betaPower?: number
  matchLength?: number
  matchRef?: number
  model?: Model
  rank?: Rank[]
  score?: number[]
  scoreTransform?: ScoreTransform
  scoreScale?: number
  scoreSaturation?: number
  scoreToPerformance?: ScoreToPerformance
  weight?: number[][]
  tau?: number
  alpha?: number
  target?: number
  preventSigmaIncrease?: boolean // deprecated, use limitSigma, this will go away someday
  limitSigma?: boolean
}
