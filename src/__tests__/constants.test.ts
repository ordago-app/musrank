import constants from '../constants'

describe('constants', () => {
  describe('z', () => {
    it('defaults to 2', () => {
      expect.assertions(1)
      const env = constants({})
      expect(env).toMatchObject({
        Z: 2,
      })
    })
    it('accepts z override', () => {
      expect.assertions(1)
      const env = constants({ z: 2 })
      expect(env).toMatchObject({
        BETA: 6.25,
        BETASQ: 39.0625,
        Z: 2,
      })
    })
  })

  describe('mu', () => {
    it('defaults to 10', () => {
      expect.assertions(1)
      const env = constants({})
      expect(env).toMatchObject({
        MU: 10,
      })
    })
    it('accepts mu override', () => {
      expect.assertions(1)
      const env = constants({ mu: 300 })
      expect(env).toMatchObject({
        BETA: 75,
        BETASQ: 5625,
        TAU: 1,
        Z: 2,
      })
    })
  })

  describe('tau', () => {
    it('is included in default export', () => {
      expect.assertions(1)
      expect(constants({}).TAU).toBeCloseTo(0.03333333)
    })
    it('accepts tau override', () => {
      expect.assertions(1)
      const env = constants({ tau: 0.0042 })
      expect(env).toMatchObject({
        TAU: 0.0042,
      })
    })
  })

  describe('sigma', () => {
    it('defaults to 5', () => {
      const env = constants({})
      expect(env.SIGMA).toBeCloseTo(5)
    })
    it('accepts sigma override', () => {
      expect.assertions(1)
      const env = constants({ sigma: 7 })
      expect(env).toMatchObject({
        BETA: 3.5,
        BETASQ: 12.25,
      })
    })
  })

  describe('epsilon', () => {
    it('defaults to 0.0001', () => {
      expect.assertions(1)
      const env = constants({})
      expect(env).toMatchObject({
        EPSILON: 0.0001,
      })
    })
    it('accepts epsilon override', () => {
      expect.assertions(1)
      const env = constants({ epsilon: 0.001 })
      expect(env).toMatchObject({
        EPSILON: 0.001,
      })
    })
  })

  describe('beta', () => {
    it('defaults to 2.5', () => {
      expect.assertions(1)
      const env = constants({})
      expect(env.BETA).toBeCloseTo(2.5)
    })
    it('accepts beta override', () => {
      expect.assertions(1)
      const env = constants({ beta: 100 })
      expect(env).toMatchObject({
        BETA: 100,
        BETASQ: 10000,
      })
    })
  })

  describe('betaSq', () => {
    it('defaults to 6.25', () => {
      expect.assertions(1)
      const env = constants({})
      expect(env.BETASQ).toBeCloseTo(6.25)
    })
  })

  describe('limitSigma', () => {
    it('defaults to not limiting sigma', () => {
      expect.assertions(1)
      const { LIMIT_SIGMA } = constants({})
      expect(LIMIT_SIGMA).toBeFalsy()
    })
    it('accepts limitSigma flag', () => {
      expect.assertions(1)
      const env = constants({ limitSigma: true })
      expect(env).toMatchObject({
        LIMIT_SIGMA: true,
      })
    })
  })
})
