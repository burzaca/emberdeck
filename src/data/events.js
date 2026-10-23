// Events — choices with teeth. Every event has a safe 'Leave'.
export const events = [
  { id: 'ev_cold_forge', name: 'The Cold Forge', act: [1], weight: 3,
    text: 'A forge cold for years waits in the dark. The anvil still hums if you strike it.',
    options: [
      { label: 'Stoke it with your own blood (lose 5 HP, upgrade a random card)', effects: [{ t: 'self_damage', n: 5 }, { t: 'upgrade_random' }] },
      { label: 'Leave', effects: [] },
    ] },
  { id: 'ev_ember_shrine', name: 'Shrine of Small Fires', act: [1], weight: 3,
    text: 'A shrine of candle stubs. The wax has melted into a shape like a heart.',
    options: [
      { label: 'Pray (heal 8 HP)', effects: [{ t: 'heal', n: 8 }] },
      { label: 'Take the heart of wax (gain a common relic, lose 6 HP)', effects: [{ t: 'self_damage', n: 6 }, { t: 'gain_relic', rarity: 'common' }] },
      { label: 'Leave', effects: [] },
    ] },
  { id: 'ev_scribe', name: 'The Wandering Scribe', act: [1, 2], weight: 2,
    text: 'A hooded scribe offers to cut a card out of your deck — "a heavy card is a slow blade," they say.',
    options: [
      { label: 'Accept (pay 30 gold, remove a card)', effects: [{ t: 'lose_gold', n: 30 }, { t: 'remove_card' }] },
      { label: 'Decline', effects: [] },
    ] },
  { id: 'ev_bonfire', name: 'The Bonfire That Watches', act: [2], weight: 3,
    text: 'A fire sits in the middle of the path, polite as a guest. It offers to warm you. It expects something back.',
    options: [
      { label: 'Let it warm you (heal 15 HP, gain a Bind curse)', effects: [{ t: 'heal', n: 15 }, { t: 'add_card', card: 'c_curse_bind', to: 'draw' }] },
      { label: 'Leave', effects: [] },
    ] },
  { id: 'ev_deep_vein', name: 'The Deep Vein', act: [2], weight: 3,
    text: 'A seam of ore glitters wetly. Something deeper glitters back.',
    options: [
      { label: 'Take the loose change (+45 gold)', effects: [{ t: 'gain_gold', n: 45 }] },
      { label: 'Dig deeper (gain an uncommon relic, lose 10% HP)', effects: [{ t: 'hp_loss_pct', pct: 0.1 }, { t: 'gain_relic', rarity: 'uncommon' }] },
      { label: 'Leave', effects: [] },
    ] },
  { id: 'ev_haunted_library', name: 'The Haunted Library', act: [2], weight: 2,
    text: 'Books read themselves here. One shelf is entirely your own handwriting, future tense.',
    options: [
      { label: 'Study your future self (upgrade a random card, gain a Stone)', effects: [{ t: 'upgrade_random' }, { t: 'add_card', card: 'c_stone', to: 'draw' }] },
      { label: 'Leave', effects: [] },
    ] },
  { id: 'ev_road_ambush', name: 'Highwayman of the Spire', act: [2, 3], weight: 2,
    text: 'A bandit with excellent manners blocks the stair. Toll or trouble, they offer, both negotiable.',
    options: [
      { label: 'Pay the toll (lose 40 gold)', effects: [{ t: 'lose_gold', n: 40 }] },
      { label: 'Push through (lose 10 HP, take their purse: +30 gold)', effects: [{ t: 'self_damage', n: 10 }, { t: 'gain_gold', n: 30 }] },
      { label: 'Leave', effects: [] },
    ] },
  { id: 'ev_forge_master', name: 'The Last Forge-Master', act: [3], weight: 3,
    text: 'An ancient smith, patient as mountains, offers one true strike of the hammer.',
    options: [
      { label: 'Two true strikes (upgrade two random cards, lose 8 HP)', effects: [{ t: 'self_damage', n: 8 }, { t: 'upgrade_random' }, { t: 'upgrade_random' }] },
      { label: 'One true strike (upgrade a random card)', effects: [{ t: 'upgrade_random' }] },
      { label: 'Leave', effects: [] },
    ] },
  { id: 'ev_soul_lantern', name: 'The Soul Lantern', act: [3], weight: 3,
    text: 'A lantern burns with a light that is not fire. It wants a little of yours.',
    options: [
      { label: 'Feed it (lose 15% HP, gain a rare relic)', effects: [{ t: 'hp_loss_pct', pct: 0.15 }, { t: 'gain_relic', rarity: 'rare' }] },
      { label: 'Leave', effects: [] },
    ] },
  { id: 'ev_mirror_pool', name: 'The Mirror Pool', act: [2, 3], weight: 2,
    text: 'Still water shows you walking out of the spire. It would be so easy to believe it.',
    options: [
      { label: 'Drink (heal 20 HP, gain a Bind curse)', effects: [{ t: 'heal', n: 20 }, { t: 'add_card', card: 'c_curse_bind', to: 'draw' }] },
      { label: 'Leave', effects: [] },
    ] },
];
