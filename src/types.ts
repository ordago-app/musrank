export type Rating = {
  mu: number
  sigma: number
}

export type Team = Rating[]

export type Rank = number

export type Gamma = (c: number, k: number, mu: number, sigmaSq: number, team: Rating[], qRank: number) => number

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
  matchPoints?: number
  matchPointsRef?: number
  model?: Model
  rank?: Rank[]
  score?: number[]
  synergy?: (team: Team) => Rating | undefined
  synergyInit?: (team: Team) => Rating
  onSynergyUpdate?: (team: Team, synergy: Rating) => void
  weight?: number[][]
  tau?: number
  alpha?: number
  target?: number
  limitSigma?: boolean
}
