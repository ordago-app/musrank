import rate from './rate'
import { Options, Rating } from './types'

type TwoTeamOptions = Omit<Options, 'rank' | 'score'> & {
  rank?: [number, number]
  score?: [number, number]
}

const ensureNoDraw = (rank?: [number, number], score?: [number, number]) => {
  if (rank && rank[0] === rank[1]) {
    throw new Error('rate2v2 does not allow draws: rank values must differ.')
  }
  if (score && score[0] === score[1]) {
    throw new Error('rate2v2 does not allow draws: score values must differ.')
  }
}

const rate2v2 = (teamA: Rating[], teamB: Rating[], options: TwoTeamOptions = {}) => {
  if (teamA.length !== 2 || teamB.length !== 2) {
    throw new Error('rate2v2 requires exactly two players per team.')
  }

  ensureNoDraw(options.rank, options.score)

  const [updatedA, updatedB] = rate([teamA, teamB], options)
  return [updatedA, updatedB]
}

export default rate2v2
