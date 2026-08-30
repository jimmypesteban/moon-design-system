// Level-tier avatar frame artwork. 50 levels group into 5 visual tiers of 10
// (1-10 bronze, 11-20 violet, 21-30 gold, 31-40 green, 41-50 pink with
// stars) — only 5 unique frame images exist, not 50; `LevelAvatarFrame`
// picks one by `Math.ceil(level / 10)`. The center is transparent so any
// real avatar composites underneath.

export { default as levelFrameTier1 } from '../assets/level-frames/tier1.svg';
export { default as levelFrameTier2 } from '../assets/level-frames/tier2.svg';
export { default as levelFrameTier3 } from '../assets/level-frames/tier3.svg';
export { default as levelFrameTier4 } from '../assets/level-frames/tier4.svg';
export { default as levelFrameTier5 } from '../assets/level-frames/tier5.svg';
