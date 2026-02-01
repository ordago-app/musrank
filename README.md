
# Musrank

[![Version](https://img.shields.io/npm/v/musrank)](https://www.npmjs.com/package/musrank)
[![tests](https://github.com/ordago-app/musrank/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/ordago-app/musrank/actions/workflows/tests.yml)
[![Coverage Status](https://coveralls.io/repos/github/ordago-app/musrank/badge.svg?branch=main&force=reload)](https://coveralls.io/github/ordago-app/musrank?branch=main)
![Downloads](https://img.shields.io/npm/dt/musrank)
![License](https://img.shields.io/npm/l/musrank)

MusRank is a skill-rating system for Mus that separates **match length noise** from **score margin signal**. It keeps the Weng-Lin / TrueSkill-style core, but replaces the observation model so Mus outcomes behave the way they feel in real play.

## Installation

```bash
npm install --save musrank
```

## Quick start

```js
import { rating, rate } from 'musrank'

const a1 = rating()
const a2 = rating()
const b1 = rating()
const b2 = rating()

const [[a1p, a2p], [b1p, b2p]] = rate(
  [[a1, a2], [b1, b2]],
  {
    // Mus match context
    juegos: 10,     // L (points to win)
    scoreGap: 3,    // g (point difference)
  }
)
```

## The model: three layers of uncertainty

### Layer 1 — Hand-level randomness (β₀)

Each hand has:

- card randomness
- bidding variance

We model this base noise as **β₀**. Larger β₀ means outcomes are blurrier; smaller β₀ means skill dominates.

### Layer 2 — Match aggregation (β(L))

Mus is played to **L juegos** (points). More games average out randomness, so the match-level noise shrinks with L.

Conceptually:

```
beta(L) = beta0 / sqrt(L)
```

Or with a reference match length:

```
beta(L) = beta0 * (Lref / L) ^ alpha
```

Where **L is the number of juegos**. Short matches are noisy; long matches are reliable.

**Example (intuition):** if beta(10) = 1.0

- L = 2 → beta(2) ≈ 2.24 (chaotic, weak evidence)
- L = 4 → beta(4) ≈ 1.58 (still swingy)
- L = 20 → beta(20) ≈ 0.71 (stable, decisive)

### Layer 3 — Margin → performance (f(g))

The observed score gap `g` is in points, but the rating model uses performance units. We define a **measurement mapping**:

```
d = f(g)
```

Key idea: **small gaps are noisy, large gaps saturate information**. Good conceptual choices are:

```
d = c * tanh(g / g0)
d = c * log(1 + g)
d = c * sqrt(g)
```

Where:

- `c` sets the performance scale (how big a decisive win is)
- `g0` controls saturation (when additional points stop adding much information)

## What “more β” vs “less β” means

- **More β** → more chaos. Upsets are common, a win provides weak evidence.
- **Less β** → more determinism. Upsets are rare, a win is strong evidence.

In Mus terms: **short matches → high β**, **long matches → low β**.

## How does `d` affect rating change? Is it linear?

No. `d` does **not** multiply Elo. It changes the **likelihood**, and the update is Bayesian and **nonlinear**.

Think of it like this:

- `f(g)` defines the **signal** (what you observed)
- `beta(L)` defines the **noise** (how much to trust it)

So the same gap gives:

- a **small update** in a short match (high β)
- a **large update** in a long match (low β)

Large margins saturate naturally, so blowouts do **not** produce runaway updates. This is exactly the behavior Mus needs.

## Defaults you’ll choose later

These are the three core knobs:

1. **β₀** — base hand randomness
2. **σ₀** — prior uncertainty for new players
3. **f(g)** — score gap → performance mapping

Rule of thumb: start with `sigma0 ≈ 1–2 × beta(10)` so new players can move meaningfully after a few matches.

## Why this approach fits Mus

- Short matches are noisy by nature — β(L) encodes that.
- Score gaps add information but saturate — f(g) encodes that.
- Ratings update fast for new players, slowly for established ones — σ₀ encodes that.

That separation keeps the math principled and lets Mus behave like Mus.

