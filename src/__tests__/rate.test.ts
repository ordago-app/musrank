import { rate, rating } from '..'
import thurstoneMostellerFull from '../models/thurstone-mosteller-full'

describe('rate', () => {
  const a1 = rating({ mu: 29.182, sigma: 4.782 })
  const b1 = rating({ mu: 27.174, sigma: 4.922 })
  const c1 = rating({ mu: 16.672, sigma: 6.217 })
  const d1 = rating()
  const e1 = rating()
  const f1 = rating()
  const w1 = rating({ mu: 15, sigma: 25 / 3.0 })
  const x1 = rating({ mu: 20, sigma: 25 / 3.0 })
  const y1 = rating({ mu: 25, sigma: 25 / 3.0 })
  const z1 = rating({ mu: 30, sigma: 25 / 3.0 })

  it('rate defaults to Thurstone-Mosteller full', () => {
    expect.assertions(1)
    const [[a2], [b2], [c2], [d2]] = rate([[a1], [b1], [c1], [d1]])
    expect([[a2], [b2], [c2], [d2]]).toStrictEqual([
      [{ mu: 32.486796964752294, sigma: 4.3777704130260116 }],
      [{ mu: 27.50365223914957, sigma: 4.439639481033075 }],
      [{ mu: 19.02638314298227, sigma: 5.316854971297541 }],
      [{ mu: 9.78886691324358, sigma: 4.444994542843567 }],
    ])
  })

  it('rate defaults to Thurstone-Mosteller full with tau', () => {
    expect.assertions(1)
    const a1 = rating({ mu: 29.182, sigma: 4.782 })
    const b1 = rating({ mu: 27.174, sigma: 4.922 })
    const c1 = rating({ mu: 16.672, sigma: 6.217 })
    const d1 = rating()

    const [[a2], [b2], [c2], [d2]] = rate([[a1], [b1], [c1], [d1]], { tau: 0.01 })

    expect([[a2], [b2], [c2], [d2]]).toStrictEqual([
      [{ mu: 32.486809592506816, sigma: 4.377778415425312 }],
      [{ mu: 27.503654673117328, sigma: 4.43964696768637 }],
      [{ mu: 19.026383971689544, sigma: 5.316860086641376 }],
      [{ mu: 9.788856927852024, sigma: 4.444998132425435 }],
    ])
  })

  it('rate defaults to Thurstone-Mosteller full with tau and prevent_sigma_increase', () => {
    expect.assertions(2)
    const a1 = rating({ mu: 6.672, sigma: 0.0001 })
    const b1 = rating({ mu: 29.182, sigma: 4.782 })

    const [[a2], [b2]] = rate([[a1], [b1]], { tau: 0.01, preventSigmaIncrease: true })

    expect(a2.sigma).toBeLessThanOrEqual(a1.sigma)
    expect([[a2], [b2]]).toStrictEqual([
      [{ mu: 6.672042853260298, sigma: 0.0001 }],
      [{ mu: 19.383457417440766, sigma: 4.189951822398248 }],
    ])
  })

  it('rate defaults to Thurstone-Mosteller full for teams', () => {
    const a1 = rating({ mu: 29.182, sigma: 4.782 })
    const b1 = rating({ mu: 27.174, sigma: 4.922 })
    const c1 = rating({ mu: 16.672, sigma: 6.217 })
    const d1 = rating()

    const [[a2, b2], [c2, d2]] = rate([
      [a1, b1],
      [c1, d1],
    ])

    expect([a2, b2, c2, d2]).toStrictEqual([
      { mu: 29.620020804959164, sigma: 4.731418094694093 },
      { mu: 27.63804362862758, sigma: 4.866826659422295 },
      { mu: 15.931649574814996, sigma: 6.047175047517385 },
      { mu: 23.66981176206495, sigma: 7.919659505783864 },
    ])
  })

  it('rate defaults to Thurstone-Mosteller full for teams with tau', () => {
    const a1 = rating({ mu: 29.182, sigma: 4.782 })
    const b1 = rating({ mu: 27.174, sigma: 4.922 })
    const c1 = rating({ mu: 16.672, sigma: 6.217 })
    const d1 = rating()

    const [[a2, b2], [c2, d2]] = rate(
      [
        [a1, b1],
        [c1, d1],
      ],
      { tau: 0.01 }
    )

    expect([a2, b2, c2, d2]).toStrictEqual([
      { mu: 29.620022912613546, sigma: 4.731428222255712 },
      { mu: 27.638045747699532, sigma: 4.866836480075812 },
      { mu: 15.9316473345129, sigma: 6.047182646923513 },
      { mu: 23.66980926297036, sigma: 7.919665144352448 },
    ])
  })

  it('rate defaults to Thurstone-Mosteller full for teams with tau and prevent_sigma_increase', () => {
    const a1 = rating({ mu: 9.182, sigma: 0.0001 })
    const b1 = rating({ mu: 27.174, sigma: 4.922 })
    const c1 = rating({ mu: 16.672, sigma: 6.217 })
    const d1 = rating()

    const [[a2, b2], [c2, d2]] = rate(
      [
        [a1, b1],
        [c1, d1],
      ],
      { tau: 0.01, preventSigmaIncrease: true }
    )

    expect(a2.sigma).toBeLessThanOrEqual(a1.sigma)

    expect([a2, b2, c2, d2]).toStrictEqual([
      { mu: 9.182008332694988, sigma: 0.0001 },
      { mu: 29.192492170486062, sigma: 4.8236118204756915 },
      { mu: 13.451636348156313, sigma: 5.787501820111957 },
      { mu: 19.21397652869793, sigma: 7.266380551070351 },
    ])
  })

  it('reverses rank', () => {
    expect.assertions(1)
    const [[loser], [winner]] = rate([[rating()], [rating()]], {
      rank: [2, 1],
    })
    expect([winner, loser]).toStrictEqual([
      { mu: 29.20524620886059, sigma: 7.632833464033909 },
      { mu: 20.79475379113941, sigma: 7.632833464033909 },
    ])
  })

  it('keeps rank', () => {
    expect.assertions(1)
    const [[loser], [winner]] = rate([[rating()], [rating()]], {
      rank: [1, 2],
    })
    expect([winner, loser]).toStrictEqual([
      { mu: 20.79475379113941, sigma: 7.632833464033909 },
      { mu: 29.20524620886059, sigma: 7.632833464033909 },
    ])
  })

  it('accepts a misordered rank ordering', () => {
    expect.assertions(1)
    const [[a], [b], [c], [d]] = rate([[d1], [d1], [d1], [d1]], {
      rank: [2, 1, 4, 3],
    })
    expect([a, b, c, d]).toStrictEqual([
      { mu: 29.20524620886059, sigma: 5.99095578185474 },
      { mu: 37.61573862658177, sigma: 5.99095578185474 },
      { mu: 12.38426137341823, sigma: 5.99095578185474 },
      { mu: 20.79475379113941, sigma: 5.99095578185474 },
    ])
  })

  it('accepts a rate ordering', () => {
    expect.assertions(1)
    const [[w2], [x2], [y2], [z2]] = rate([[w1], [x1], [y1], [z1]], {
      rank: [1, 3, 4, 2],
    })
    expect([w2, x2, y2, z2]).toStrictEqual([
      { mu: 36.22354829083865, sigma: 5.392210330909183 },
      { mu: 17.96861741590117, sigma: 6.058705459358724 },
      { mu: 9.384500238797685, sigma: 5.816247046104276 },
      { mu: 26.423334054462494, sigma: 6.1453034154298845 },
    ])
  })

  it('accepts teams in rating order', () => {
    expect.assertions(1)
    const [[a2, d2], [b2, e2], [c2, f2]] = rate(
      [
        [a1, d1],
        [b1, e1],
        [c1, f1],
      ],
      {
        rank: [3, 1, 2],
      }
    )
    expect([a2, b2, c2, d2, e2, f2]).toStrictEqual([
      { mu: 25.760829241958636, sigma: 4.556793004768385 },
      { mu: 29.279942076509506, sigma: 4.7276784948763 },
      { mu: 19.094633587626873, sigma: 5.772576386720645 },
      { mu: 14.610536643942673, sigma: 7.074501427262503 },
      { mu: 31.036715530887392, sigma: 7.350958149411673 },
      { mu: 29.352747825169935, sigma: 7.227965921441846 },
    ])
  })

  it('allows ties', () => {
    expect.assertions(1)
    const a = rating({ mu: 10, sigma: 8 })
    const b = rating({ mu: 5, sigma: 10 })
    const c = rating({ mu: 0, sigma: 12 })
    const [[x], [y], [z]] = rate([[a], [b], [c]], {
      rank: [1, 2, 2],
    })
    expect([x, y, z]).toStrictEqual([
      { mu: 14.466901682929192, sigma: 7.309475064989195 },
      { mu: -0.9553732570007618, sigma: 7.66793278749967 },
      { mu: -1.474791296509586, sigma: 7.700570345110398 },
    ])
  })

  it('allows ties with reorder', () => {
    expect.assertions(1)
    const a = rating({ mu: 10, sigma: 8 })
    const b = rating({ mu: 5, sigma: 10 })
    const c = rating({ mu: 0, sigma: 12 })
    const [[y3], [z3], [x3]] = rate([[b], [c], [a]], {
      rank: [2, 2, 1],
    })
    const [[x2], [y2], [z2]] = rate([[a], [b], [c]], {
      rank: [1, 2, 2],
    })
    expect([x2, y2, z2]).toStrictEqual([x3, y3, z3])
  })

  it('four-way-tie with newbies', () => {
    expect.assertions(1)
    const [[a], [b], [c], [d]] = rate([[rating()], [rating()], [rating()], [rating()]], {
      rank: [1, 1, 1, 1],
    })
    expect([a, b, c, d]).toStrictEqual([
      { mu: 25.00012, sigma: 4.059279063539745 },
      { mu: 25.00012, sigma: 4.059279063539745 },
      { mu: 25.00012, sigma: 4.059279063539745 },
      { mu: 25.00012, sigma: 4.059279063539745 },
    ])
  })

  it('fixes orders of ties', () => {
    expect.assertions(1)
    const [[w2], [x2], [y2], [z2]] = rate([[w1], [x1], [y1], [z1]], {
      rank: [2, 4, 2, 1],
    })
    expect([w2, x2, y2, z2]).toStrictEqual([
      { mu: 23.295143213636926, sigma: 5.796048337014361 },
      { mu: 9.39271644720373, sigma: 6.293864606087043 },
      { mu: 21.00004, sigma: 5.71824839759255 },
      { mu: 36.31210033915934, sigma: 6.805746317721251 },
    ])
  })

  it('runs a model with ties for first', () => {
    expect.assertions(1)
    const [[w2], [x2], [y2], [z2]] = rate([[e1], [e1], [e1], [e1]], {
      model: thurstoneMostellerFull,
      score: [100, 84, 100, 72],
    })
    expect([w2, x2, y2, z2]).toStrictEqual([
      { mu: 33.41053241772118, sigma: 5.4240467327131805 },
      { mu: 20.79475379113941, sigma: 5.99095578185474 },
      { mu: 33.41053241772118, sigma: 5.4240467327131805 },
      { mu: 12.38426137341823, sigma: 5.99095578185474 },
    ])
  })

  it('accepts a score instead of rank', () => {
    expect.assertions(1)
    const [[x2], [y2], [z2]] = rate([[e1], [e1], [e1]], {
      score: [1, 1, 1],
    })
    expect([x2, y2, z2]).toStrictEqual([
      { mu: 25.00008, sigma: 5.842372163080926 },
      { mu: 25.00008, sigma: 5.842372163080926 },
      { mu: 25.00008, sigma: 5.842372163080926 },
    ])
  })

  it('supports score transforms', () => {
    expect.assertions(6)
    const base = { model: thurstoneMostellerFull, score: [10, 5], scoreScale: 1 }
    const [[logWinner], [logLoser]] = rate([[rating()], [rating()]], {
      ...base,
      scoreTransform: 'log',
    })
    const [[sqrtWinner], [sqrtLoser]] = rate([[rating()], [rating()]], {
      ...base,
      scoreTransform: 'sqrt',
    })
    const [[tanhWinner], [tanhLoser]] = rate([[rating()], [rating()]], {
      ...base,
      scoreTransform: 'tanh',
      scoreSaturation: 6,
    })

    expect(logWinner.mu).toBeCloseTo(25)
    expect(logLoser.mu).toBeCloseTo(24.283296212, 6)
    expect(sqrtWinner.mu).toBeCloseTo(25)
    expect(sqrtLoser.mu).toBeCloseTo(24.105572809, 6)
    expect(tanhWinner.mu).toBeCloseTo(25)
    expect(tanhLoser.mu).toBeCloseTo(24.727095284, 6)
  })

  it('accepts weights for partial play', () => {
    expect.assertions(1)
    expect(() =>
      rate(
        [
          [a1, b1],
          [c1, d1],
        ],
        {
          // This is here to demonstrate how to send these in, although
          // the default Thurstone-Mosteller doesn't care.
          // TODO: example with a custom model which takes this into account.
          weight: [
            [0.9, 1],
            [1, 0.6],
          ],
        }
      )
    ).not.toThrow()
  })

  it('accepts a tau term', () => {
    expect.assertions(1)
    const a = rating({ mu: 25, sigma: 3 })
    const b = rating({ mu: 25, sigma: 3 })
    const [[winner], [loser]] = rate([[a], [b]], {
      tau: 0.3,
    })

    expect([winner, loser]).toStrictEqual([
      { mu: 25.997175818035053, sigma: 2.945814935785893 },
      { mu: 24.002824181964947, sigma: 2.945814935785893 },
    ])
  })

  it('prevents sigma from rising', () => {
    expect.assertions(1)
    const a = rating({ mu: 40, sigma: 3 })
    const b = rating({ mu: -20, sigma: 3 })
    const [[winner], [loser]] = rate([[a], [b]], {
      tau: 0.3,
      limitSigma: true,
    })

    expect([winner, loser]).toStrictEqual([
      { mu: 40, sigma: 3 },
      { mu: -20, sigma: 3 },
    ])
  })

  it('prevents sigma rising with old syntax', () => {
    expect.assertions(1)
    const a = rating({ mu: 40, sigma: 3 })
    const b = rating({ mu: -20, sigma: 3 })
    const [[winner], [loser]] = rate([[a], [b]], {
      tau: 0.3,
      preventSigmaIncrease: true,
    })

    expect([winner, loser]).toStrictEqual([
      { mu: 40, sigma: 3 },
      { mu: -20, sigma: 3 },
    ])
  })
})
