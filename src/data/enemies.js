export const enemies = [
// --- Act 1: Cinder/Ruin Theme ---
// Normal
{
  id: 'e_cinder_imp', name: 'Cinder Imp', art: '😈', hp: [18, 22], act: 1, tier: 'normal',
  moves: [
    { id: 'scorch_claw', intent:'attack', dmg: 8, weight: 3 },
    { id: 'ash_shroud', intent:'block', block: 7, weight: 2 },
    { id: 'ember_hex', intent:'debuff', debuff: { buff:'vulnerable', n:2 }, weight: 2 }
  ],
  opener: 'scorch_claw',
  flavor: 'A shrieking knot of coals with cruel claws.'
},
{
  id: 'e_ruin_rat', name: 'Ruin Rat', art: '🐀', hp: [15, 19], act: 1, tier: 'normal',
  moves: [
    { id: 'gnaw', intent:'attack', dmg: 6, weight: 4 },
    { id: 'dodge', intent:'block', block: 6, weight: 2 },
    { id: 'contaminate', intent:'debuff', debuff: { buff:'poison', n:3 }, weight: 2 }
  ],
  flavor: 'Drawn to flame, nibbling at the ruins of the old world.'
},
{
  id: 'e_scorched_husk', name: 'Scorched Husk', art: '🧟', hp: [20, 25], act: 1, tier: 'normal',
  moves: [
    { id: 'molten_fist', intent:'attack', dmg: 10, weight: 3 },
    { id: 'ignite', intent:'buff', buff:{ buff:'strength', n:1 }, weight: 2 },
    { id: 'harden_hide', intent:'block', block: 9, weight: 1 }
  ],
  flavor: 'Once living—now little more than embers and memory.'
},
{
  id: 'e_ash_specter', name: 'Ash Specter', art: '👻', hp: [17, 22], act: 1, tier: 'normal',
  moves: [
    { id: 'smothering_touch', intent:'attack', dmg: 7, weight: 3 },
    { id: 'fading_form', intent:'block', block: 8, weight: 2 },
    { id: 'lament', intent:'debuff', debuff:{ buff:'frail', n:2 }, weight: 2 }
  ],
  flavor: 'Ghost of those lost to the fire, fading in and out.'
},
{
  id: 'e_fire_slinger', name: 'Fire Slinger', art: '🏹', hp: [20, 26], act: 1, tier: 'normal',
  moves: [
    { id: 'flame_barrage', intent:'attack', dmg: 6, hits: 2, weight: 2 },
    { id: 'rekindle', intent:'buff', buff:{ buff:'strength', n:2 }, weight: 1 },
    { id: 'ember_shield', intent:'block', block: 8, weight: 1 }
  ],
  flavor: 'Throws whirling embers with careless glee.'
},
{
  id: 'e_ruin_thug', name: 'Ruin Thug', art: '🪓', hp: [23, 28], act: 1, tier: 'normal',
  moves: [
    { id: 'club_smash', intent:'attack', dmg: 11, weight: 3 },
    { id: 'menace', intent:'debuff', debuff:{ buff:'vulnerable', n:1 }, weight: 2 },
    { id: 'taunt', intent:'block', block: 7, weight: 1 }
  ],
  flavor: 'A brute scavenger hungry for scraps and violence.'
},
{
  id: 'e_coal_snail', name: 'Coal Snail', art: '🐌', hp: [21, 26], act: 1, tier: 'normal',
  moves: [
    { id: 'blazing_graze', intent:'attack', dmg: 8, weight: 3 },
    { id: 'charred_shell', intent:'block', block: 10, weight: 2 }
  ],
  flavor: 'Steel-hard shell sizzles with inner heat.'
},
{
  id: 'e_burned_acolyte', name: 'Burned Acolyte', art: '🕯', hp: [19, 23], act: 1, tier: 'normal',
  moves: [
    { id: 'brand', intent:'attack_debuff', dmg: 7, debuff: { buff:'poison', n:2 }, weight: 2 },
    { id: 'infernal_prayer', intent:'buff', buff: { buff:'strength', n:1 }, weight: 1 }
  ],
  flavor: 'Still prays to the flame, even as it burns from within.'
},
// Elites
{
  id: 'e_cinder_tyrant', name: 'Cinder Tyrant', art: '👑', hp: [38, 42], act: 1, tier: 'elite',
  moves: [
    { id: 'magma_crash', intent:'attack', dmg: 13, weight: 3 },
    { id: 'searing_rage', intent:'strength_up', n: 2, weight: 2 },
    { id: 'molten_roar', intent:'debuff', debuff: { buff:'frail', n:2 }, weight: 1 }
  ],
  opener: 'magma_crash',
  flavor: 'A giant crowned in cinders, ruling the ruins through fear.'
},
{
  id: 'e_ruin_guardian', name: 'Ruin Guardian', art: '🗿', hp: [39, 44], act: 1, tier: 'elite',
  moves: [
    { id: 'slam', intent:'attack', dmg: 11, hits: 2, weight: 2 },
    { id: 'ancient_barrier', intent:'block', block: 17, weight: 1 },
    { id: 'warden_curse', intent:'debuff', debuff: { buff:'vulnerable', n:2 }, weight: 1 }
  ],
  flavor: 'It will let no spark pass unpunished.'
},
// --- Act 2: Frost/Depth Theme ---
// Normal
{
  id: 'e_frostling', name: 'Frostling', art: '❄️', hp: [28, 33], act: 2, tier: 'normal',
  moves: [
    { id: 'icicle_shard', intent:'attack', dmg: 12, weight: 3 },
    { id: 'cold_skin', intent:'block', block: 11, weight: 2 },
    { id: 'shiver', intent:'debuff', debuff: { buff:'frail', n:2 }, weight: 1 }
  ],
  flavor: 'Born of hoar and hunger, it chills the air around it.'
},
{
  id: 'e_ice_gnawer', name: 'Ice Gnawer', art: '🧊', hp: [35, 39], act: 2, tier: 'normal',
  moves: [
    { id: 'brittle_chomp', intent:'attack', dmg: 13, weight: 3 },
    { id: 'numbling_bite', intent:'debuff', debuff: { buff:'vulnerable', n:2 }, weight: 2 },
    { id: 'crystalize', intent:'block', block: 10, weight: 1 }
  ],
  flavor: 'Its fangs leave numb, blue wounds.'
},
{
  id: 'e_frigid_owl', name: 'Frigid Owl', art: '🦉', hp: [30, 35], act: 2, tier: 'normal',
  moves: [
    { id: 'polar_screech', intent:'attack', dmg: 9, hits:2, weight: 2 },
    { id: 'watchful_posture', intent:'block', block: 13, weight: 2 },
    { id: 'ominous_gaze', intent:'debuff', debuff: { buff:'frail', n:1 }, weight: 2 }
  ],
  flavor: 'Eyes as cold as the depths below.'
},
{
  id: 'e_frozen_serf', name: 'Frozen Serf', art: '🥶', hp: [34, 41], act: 2, tier: 'normal',
  moves: [
    { id: 'frost_club', intent:'attack', dmg: 13, weight: 2 },
    { id: 'grovel', intent:'block', block: 15, weight: 2 }
  ],
  flavor: 'A slavering brute caught forever in the frost.'
},
{
  id: 'e_rime_hag', name: 'Rime Hag', art: '🧙', hp: [33, 39], act: 2, tier: 'normal',
  moves: [
    { id: 'curse_breath', intent:'debuff', debuff: { buff:'poison', n:4 }, weight: 2 },
    { id: 'frost_touch', intent:'attack_debuff', dmg: 10, debuff: { buff:'frail', n:1 }, weight: 2 },
    { id: 'midwinter_chant', intent:'buff', buff: { buff:'strength', n:2 }, weight: 1 }
  ],
  flavor: 'Freezing curse-songs drift from its lips.'
},
{
  id: 'e_ice_serpent', name: 'Ice Serpent', art: '🐍', hp: [36, 43], act: 2, tier: 'normal',
  moves: [
    { id: 'snow_fang', intent:'attack', dmg: 12, weight: 3 },
    { id: 'frosted_scales', intent:'block', block: 14, weight: 2 },
    { id: 'chill_aura', intent:'debuff', debuff: { buff:'frail', n:2 }, weight: 1 }
  ],
  flavor: 'Its scales glint with permafrost.'
},
{
  id: 'e_depths_bandit', name: 'Depths Bandit', art: '🗡️', hp: [31, 36], act: 2, tier: 'normal',
  moves: [
    { id: 'dagger_flurry', intent:'attack', dmg: 10, hits: 2, weight: 2 },
    { id: 'steely_focus', intent:'buff', buff: { buff:'strength', n:1 }, weight: 2 },
    { id: 'nimble_vault', intent:'block', block: 13, weight: 2 }
  ],
  flavor: 'Swift hands, colder heart.'
},
{
  id: 'e_ice_wight', name: 'Ice Wight', art: '⚰️', hp: [37, 43], act: 2, tier: 'normal',
  moves: [
    { id: 'void_chill', intent:'attack', dmg: 13, weight: 2 },
    { id: 'dissipate', intent:'block', block: 16, weight: 1 }
  ],
  flavor: 'Shrouded in rags of frostbitten dusk.'
},
// Elites
{
  id: 'e_frost_guardian', name: 'Frost Guardian', art: '🛡️', hp: [52, 58], act: 2, tier: 'elite',
  moves: [
    { id: 'icy_blast', intent:'attack', dmg: 18, weight: 2 },
    { id: 'eternal_defense', intent:'block', block: 26, weight: 2 },
    { id: 'winters_grip', intent:'debuff', debuff: { buff:'frail', n:2 }, weight: 1 }
  ],
  opener: 'icy_blast',
  flavor: 'A sentry locked in ancient ice, unmoved by mercy.'
},
{
  id: 'e_depths_alpha', name: 'Depths Alpha', art: '🐺', hp: [48, 54], act: 2, tier: 'elite',
  moves: [
    { id: 'ravage_leap', intent:'attack', dmg: 16, hits:2, weight: 2 },
    { id: 'glacial_cunning', intent:'strength_up', n: 2, weight: 2 },
    { id: 'howl', intent:'buff', buff: { buff:'strength', n:2 }, weight: 1 }
  ],
  flavor: 'The strongest predator beneath the ice.'
},
// --- Act 3: Void/Doom Theme ---
// Normal
{
  id: 'e_void_shade', name: 'Void Shade', art: '🌑', hp: [55, 62], act: 3, tier: 'normal',
  moves: [
    { id: 'corrupt_strike', intent:'attack', dmg: 20, weight: 3 },
    { id: 'warp', intent:'block', block: 17, weight: 2 },
    { id: 'mind_shudder', intent:'debuff', debuff: { buff:'vulnerable', n:2 }, weight: 1 }
  ],
  flavor: 'Nothing but ruin in its waking.'
},
{
  id: 'e_abysmal_spawn', name: 'Abysmal Spawn', art: '🐙', hp: [50, 58], act: 3, tier: 'normal',
  moves: [
    { id: 'drip_venom', intent:'attack_debuff', dmg: 16, debuff:{ buff:'poison', n:4 }, weight: 2 },
    { id: 'malignant_growth', intent:'buff', buff:{ buff:'strength', n:3 }, weight: 1 },
    { id: 'nightmare_fumes', intent:'debuff', debuff:{ buff:'frail', n:2 }, weight: 1 }
  ],
  flavor: 'Its body drips with noxious shadow.'
},
{
  id: 'e_gloom_stalker', name: 'Gloom Stalker', art: '🌫️', hp: [61, 69], act: 3, tier: 'normal',
  moves: [
    { id: 'ambush', intent:'attack', dmg: 22, weight: 2 },
    { id: 'devouring_cloak', intent:'block', block: 22, weight: 2 }
  ],
  flavor: 'Hunts in utter silence, unseen even by the void.'
},
{
  id: 'e_null_wisp', name: 'Null Wisp', art: '💫', hp: [47, 54], act: 3, tier: 'normal',
  moves: [
    { id: 'drain', intent:'attack', dmg: 14, hits:2, weight: 2 },
    { id: 'unravel', intent:'block', block: 16, weight: 2 }
  ],
  flavor: 'Barely more than a whisper in black.'
},
{
  id: 'e_dread_knight', name: 'Dread Knight', art: '⚔️', hp: [71, 79], act: 3, tier: 'normal',
  moves: [
    { id: 'edge_of_night', intent:'attack', dmg: 24, weight: 3 },
    { id: 'void_mail', intent:'block', block: 23, weight: 2 },
    { id: 'withering_command', intent:'debuff', debuff: { buff:'frail', n:2 }, weight: 1 }
  ],
  flavor: 'Armor scabbed with ancient darkness.'
},
{
  id: 'e_ephemeral_eye', name: 'Ephemeral Eye', art: '👁️', hp: [45, 52], act: 3, tier: 'normal',
  moves: [
    { id: 'gaze', intent:'debuff', debuff:{ buff:'vulnerable', n: 3 }, weight: 2 },
    { id: 'shred_mind', intent:'attack_debuff', dmg: 18, debuff: { buff:'frail', n:2 }, weight: 2 },
    { id: 'veil', intent:'block', block: 20, weight: 1 }
  ],
  flavor: 'Stares through time and self.'
},
{
  id: 'e_warped_cultist', name: 'Warped Cultist', art: '🔮', hp: [56, 62], act: 3, tier: 'normal',
  moves: [
    { id: 'hexed_edge', intent:'attack', dmg: 17, weight: 2 },
    { id: 'voidward_canticle', intent:'buff', buff: { buff:'strength', n:2 }, weight: 2 }
  ],
  flavor: 'Twisted by void’s devotion.'
},
{
  id: 'e_doom_carver', name: 'Doom Carver', art: '🩸', hp: [64, 73], act: 3, tier: 'normal',
  moves: [
    { id: 'obliterate', intent:'attack', dmg: 23, weight: 3 },
    { id: 'nightshield', intent:'block', block: 27, weight: 2 },
    { id: 'curse_etch', intent:'debuff', debuff:{ buff:'poison', n:5 }, weight: 1 }
  ],
  flavor: 'Sculpts ruin into the flesh of the world.'
},
// Elites
{
  id: 'e_void_sentinel', name: 'Void Sentinel', art: '🕳️', hp: [79, 86], act: 3, tier: 'elite',
  moves: [
    { id: 'cosmic_cut', intent:'attack', dmg: 24, weight: 2 },
    { id: 'event_horizon', intent:'block', block: 32, weight: 1 },
    { id: 'entropy_wave', intent:'debuff', debuff: { buff:'frail', n:3 }, weight: 1 }
  ],
  opener: 'cosmic_cut',
  flavor: 'Eyes shimmer with starlit oblivion.'
},
{
  id: 'e_dread_mauler', name: 'Dread Mauler', art: '👹', hp: [78, 84], act: 3, tier: 'elite',
  moves: [
    { id: 'slaughter', intent:'attack', dmg: 19, hits: 2, weight: 2 },
    { id: 'growl_of_ruin', intent:'strength_up', n: 3, weight: 2 },
    { id: 'feast', intent:'buff', buff: { buff:'strength', n:2 }, weight: 1 }
  ],
  flavor: 'Hungers for the end of all things.'
},
// --- Bosses (9 total)—IDs: b1_a/b1_b/b1_c (Act 1), b2_a/b2_b/b2_c (Act 2), b3_a/b3_b/b3_c (Act 3)
// Act 1 Bosses
{
  id: 'b1_a', name: 'Ashen Revenant', art: '👺', hp: [80, 88], act: 1, tier: 'boss',
  moves: [
    { id: 'spectral_blaze', intent:'attack', dmg: 12, hits: 2, weight: 2 },
    { id: 'curse_brand', intent:'debuff', debuff: { buff:'frail', n:2 }, weight: 1 },
    { id: 'eternal_rage', intent:'strength_up', n: 3, weight: 2 },
    { id: 'howl_of_smoke', intent:'block', block: 18, weight: 1 }
  ],
  opener: 'spectral_blaze',
  no_repeat: true,
  flavor: 'Once a hero. Now only fire, ash and fury.'
},
{
  id: 'b1_b', name: 'Cinder Colossus', art: '🌋', hp: [84, 92], act: 1, tier: 'boss',
  moves: [
    { id: 'crush', intent:'attack', dmg: 22, weight: 3 },
    { id: 'ember_quake', intent:'attack_debuff', dmg: 11, debuff: { buff:'poison', n:4 }, weight: 1 },
    { id: 'burning_rampage', intent:'strength_up', n: 4, weight: 2 }
  ],
  no_repeat: true,
  flavor: 'Each step cracks the world a little further.'
},
{
  id: 'b1_c', name: 'Fivefold Flame', art: '🔥', hp: [78, 86], act: 1, tier: 'boss',
  moves: [
    { id: 'split_burst', intent:'attack', dmg: 8, hits: 3, weight: 2 },
    { id: 'triumphant_chant', intent:'buff', buff: { buff:'strength', n:2 }, weight: 1 },
    { id: 'wild_ritual', intent:'ritual', n: 3, weight: 2 },
    { id: 'ashen_wave', intent:'attack_debuff', dmg: 10, debuff: { buff:'vulnerable', n: 2 }, weight: 1 }
  ],
  opener: 'split_burst',
  no_repeat: true,
  flavor: 'Ever-burning, ever-dividing—one flame becomes many.'
},
// Act 2 Bosses
{
  id: 'b2_a', name: 'Winter Sovereign', art: '☃️', hp: [155, 165], act: 2, tier: 'boss',
  moves: [
    { id: 'frostlash', intent:'attack', dmg: 18, hits: 2, weight: 2 },
    { id: 'glacial_blessing', intent:'block', block: 30, weight: 1 },
    { id: 'absolute_zero', intent:'attack_debuff', dmg: 17, debuff: { buff:'frail', n:2 }, weight: 1 },
    { id: 'blizzard_ritual', intent:'ritual', n: 3, weight: 2 }
  ],
  opener: 'frostlash',
  no_repeat: true,
  flavor: 'The cold has a will, and now a throne.'
},
{
  id: 'b2_b', name: 'Fathom Host', art: '🌊', hp: [150, 158], act: 2, tier: 'boss',
  moves: [
    { id: 'wave_crush', intent:'attack_debuff', dmg: 20, debuff: { buff:'poison', n: 6 }, weight: 1 },
    { id: 'maelstrom', intent:'attack', dmg: 18, hits: 2, weight: 2 },
    { id: 'engorge', intent:'buff', buff:{ buff:'strength', n: 4 }, weight: 1 },
    { id: 'unfathomed_power', intent:'strength_up', n: 4, weight: 2 }
  ],
  no_repeat: true,
  flavor: 'The abyss itself adopted a host.'
},
{
  id: 'b2_c', name: 'Icebound Saint', art: '😇', hp: [158, 168], act: 2, tier: 'boss',
  moves: [
    { id: 'rime_purge', intent:'attack', dmg: 24, weight: 2 },
    { id: 'glorious_frost', intent:'block', block: 34, weight: 1 },
    { id: 'blizzard_prayer', intent:'buff', buff: { buff:'strength', n:3 }, weight: 1 },
    { id: 'frozen_ritual', intent:'ritual', n: 3, weight: 2 }
  ],
  opener: 'rime_purge',
  no_repeat: true,
  flavor: 'Prays for peace. Brings only endless winter.'
},
// Act 3 Bosses
{
  id: 'b3_a', name: 'Null Monarch', art: '🕳️', hp: [215, 230], act: 3, tier: 'boss',
  moves: [
    { id: 'obliviating_ray', intent:'attack', dmg: 18, hits:2, weight: 2 },
    { id: 'singularity', intent:'attack_debuff', dmg: 18, debuff: { buff:'vulnerable', n:2 }, weight: 1 },
    { id: 'void_reign', intent:'strength_up', n: 4, weight: 2 },
    { id: 'nihility_wave', intent:'block', block: 40, weight: 1 }
  ],
  opener: 'obliviating_ray',
  no_repeat: true,
  flavor: 'The idea of a king, no longer bound to flesh.'
},
{
  id: 'b3_b', name: 'Desolate Lord', art: '💀', hp: [205, 218], act: 3, tier: 'boss',
  moves: [
    { id: 'ruin_cleave', intent:'attack', dmg: 26, weight: 2 },
    { id: 'hollowing', intent:'attack_debuff', dmg: 13, debuff: { buff:'poison', n:8 }, weight: 1 },
    { id: 'endless_dread', intent:'ritual', n: 3, weight: 2 },
    { id: 'final_command', intent:'buff', buff: { buff:'strength', n: 3 }, weight: 1 }
  ],
  no_repeat: true,
  flavor: 'Despair wears a face for you alone.'
},
{
  id: 'b3_c', name: 'The Sundered Choir', art: '🎭', hp: [195, 208], act: 3, tier: 'boss',
  moves: [
    { id: 'choral_wrath', intent:'attack', dmg: 14, hits: 3, weight: 2 },
    { id: 'discord', intent:'debuff', debuff: { buff:'frail', n:3 }, weight: 1 },
    { id: 'inevitable_finale', intent:'block', block: 45, weight: 1 },
    { id: 'last_song', intent:'ritual', n: 3, weight: 2 }
  ],
  opener: 'choral_wrath',
  no_repeat: true,
  flavor: 'All voices—one calamity.'
}
];
