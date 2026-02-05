import { rating } from '../..'
import rate from '../../rate'
import { thurstoneMostellerFull, thurstoneMostellerPart } from '..'

// numbers in this test suite come from rank-1.02 on a 3-way
// these differ in that it uses an epsilon of 0.1

describe('models#index', () => {
  const r = rating()
  it('runs TM full', () => {
    expect.assertions(6)
    const [[a], [b], [c]] = rate([[r], [r], [r]], {
      model: thurstoneMostellerFull,
      epsilon: 0.1,
    })
    expect(a.mu).toBeCloseTo(33.461437)
    expect(b.mu).toBeCloseTo(25.0)
    expect(c.mu).toBeCloseTo(16.538563)
    expect(a.sigma).toBeCloseTo(6.856959)
    expect(b.sigma).toBeCloseTo(6.856959)
    expect(c.sigma).toBeCloseTo(6.856959)
  })
  it('runs TM partial', () => {
    expect.assertions(6)
    const [[a], [b], [c]] = rate([[r], [r], [r]], {
      model: thurstoneMostellerPart,
      epsilon: 0.1,
      gamma: () => 1, // this is how it is in the source from Weng-Lin... mistake?
    })
    expect(a.mu).toBeCloseTo(27.108981)
    expect(b.mu).toBeCloseTo(25.0)
    expect(c.mu).toBeCloseTo(22.891019)
    expect(a.sigma).toBeCloseTo(8.0633358)
    expect(b.sigma).toBeCloseTo(7.784024)
    expect(c.sigma).toBeCloseTo(8.063358)
  })
})
