# 🔥 EMBERDECK

**A deck-building dungeon crawler that lives in your browser.** No build step, no
dependencies, no install — open `index.html` and climb.

Made in one autonomous 8-hour session (2026-10-23 → 24) by
**Anakin**, a Hermes agent, while its human slept. Consider it a gift:
play it, fork it, break it.

> **Play now:** https://burzaca.github.io/emberdeck/

![class select placeholder — screenshot added by agent](_docs/shot-class.png)

## What it is

You are one of three deck-handlers climbing a three-act spire:

| Class | Fantasy | Signature |
|---|---|---|
| **Emberwright** | fire aggro | big hits, self-damage costs, Strength |
| **Verdant** | growth | heal, regen, thorns, poison |
| **Gravewarden** | control | vulnerable/frail, entangle, big slow hits |

Each run: a branching node map (fights, elites, rest camps, shops, events,
treasure), energy-based combat with intents you can read, card rewards and
upgrades, relics that bend the rules, potions, and three escalating bosses.
Die and the run is over — the mountain keeps your cards.

Every run is driven by a **seed** (shareable, reproducible). Leave the seed box
empty for a random one, or type a word for a deterministic map.

## Mechanics at a glance

- **Energy** (3/turn) pays for cards. **Block** absorbs damage, resets each turn.
- Enemies telegraph their next move (⚔ 🛡 ⬆ ⬇) — the whole game is reading intents.
- Statuses: Strength, Dexterity, Vulnerable, Frail, Poison, Regen, Thorns,
  Ritual, Metallicize, Entangle, Wrath. Hover any icon for a tooltip.
- Rewards: cards (upgraded copies start appearing in Act 2), gold, potions, relics.
- Rest sites: heal 30% or upgrade a card. Shops sell cards, potions, relics, and
  a card-removal service.

## Controls

- Click a node on the map to travel (only glowing nodes are reachable).
- Click an attack card → click a target. Skills/Powers play on click.
- `END TURN` passes to the enemy phase. Draw/discard piles are clickable.
- Works with touch. Portrait and landscape.

## Run it locally

```bash
git clone https://github.com/burzaca/emberdeck
cd emberdeck
python3 -m http.server 8080     # or: npx serve .
# open http://localhost:8080
```

(Any static server works; `index.html` even opens straight from disk in most browsers.)

## Development

```bash
npm test        # node:test suite — engine math, map connectivity, data validation
npm run sim     # headless auto-player: N full runs per class, win-rate report
```

Architecture — the engine is pure logic, the UI is a thin DOM layer:

```
src/engine/    rng (seeded), registry (data + hard validation), effects (verb
               interpreter + buffs), combat (turns, enemy AI), map (act DAG),
               run (meta-loop, rewards, shop, save/load)
src/data/      pure data: cards, enemies, relics, potions, events, classes
src/ui/        dom helpers, card renderer, main flow, styles
docs/          CONTENT_SCHEMA.md — the content contract (add cards like a pro)
scripts/       simulate.js — the automated playtester
tests/         engine + data test suite
```

Content is data, not code: every card is a list of verbs (`damage`, `block`,
`buff`, `draw`, …) interpreted by one engine. The validator in
`registry.js` rejects any content that references a verb, buff, or id that
doesn't exist — the test suite runs it on every `npm test`.

## Credits

Built by an AI agent (Hermes/"Anakin") for muha7a, in one night, with a hard
8-hour deadline. Card/enemy/relic content drafted by a second model
(GPT-4.1 via GitHub Copilot) under the agent's schema and validation.
Engine, UI, tests, and integration: the agent itself.

MIT licensed. Have fun. 🃏
