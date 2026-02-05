
# Musrank

[![Version](https://img.shields.io/npm/v/musrank)](https://www.npmjs.com/package/musrank)
[![tests](https://github.com/ordago-app/musrank/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/ordago-app/musrank/actions/workflows/tests.yml)
[![Coverage Status](https://coveralls.io/repos/github/ordago-app/musrank/badge.svg?branch=main&force=reload)](https://coveralls.io/github/ordago-app/musrank?branch=main)
![Downloads](https://img.shields.io/npm/dt/musrank)
![License](https://img.shields.io/npm/l/musrank)

MusRank is a skill-rating system for Mus that focuses on **match length noise** with a Weng-Lin / TrueSkill-style core. Outcomes are treated as win/loss only (no margin-of-victory signal).

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

const [[a1p, a2p], [b1p, b2p]] = rate([a1, a2], [b1, b2], {
  rank: [1, 2],
})
```

## 2v2 parameter exploration

Run a local sweep (2v2 only, no draws) and print a table with the result, parameter config, and Elo-style mu change:

```bash
npm run build
node exploration/matches-sim.mjs
```

The script runs two scenarios (A wins, B wins) for several parameter sets and prints a console table with:

- `result`: scenario (A wins / B wins)
- `params`: named parameter preset (tau values or beta scaling)
- `config`: JSON of the preset options
- `eloChangeA` / `eloChangeB`: average mu change per team

## The model: two layers of uncertainty

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

## What “more β” vs “less β” means

- **More β** → more chaos. Upsets are common, a win provides weak evidence.
- **Less β** → more determinism. Upsets are rare, a win is strong evidence.

In Mus terms: **short matches → high β**, **long matches → low β**.

Think of it like this:

- `beta(L)` defines the **noise** (how much to trust a win/loss result)

So the same result gives:

- a **small update** in a short match (high β)
- a **large update** in a long match (low β)

## Defaults you’ll choose later

These are the two core knobs:

1. **β₀** — base hand randomness
2. **σ₀** — prior uncertainty for new players

Rule of thumb: start with `sigma0 ≈ 1–2 × beta(10)` so new players can move meaningfully after a few matches.

## Why this approach fits Mus

- Short matches are noisy by nature — β(L) encodes that.
- Ratings update fast for new players, slowly for established ones — σ₀ encodes that.

That separation keeps the math principled and lets Mus behave like Mus.

