import type { EnemyData, EnemyType, EnemyRank } from "../types/characters";

// Wukong enemy configuration (organized by chapter and rank)
export const ENEMIES_DATA: Record<EnemyType, EnemyData> = {
  // ===== Chapter 1 - Black Wind Mountain =====
  // Minions
  wolf_minion: {
    id: "wolf_minion",
    name: "狼妖",
    chapter: "chapter1",
    rank: "minion",
    health: 30,
    damage: 5,
    speed: 120,
    xpValue: 10,
    goldValue: 5,
    color: "#696969",
  },

  ghost_minion: {
    id: "ghost_minion",
    name: "阴兵",
    chapter: "chapter1",
    rank: "minion",
    health: 25,
    damage: 6,
    speed: 100,
    xpValue: 10,
    goldValue: 5,
    color: "#2F4F4F",
  },

  // Elites
  bear_elite: {
    id: "bear_elite",
    name: "熊罴精",
    chapter: "chapter1",
    rank: "elite",
    health: 150,
    damage: 15,
    speed: 80,
    xpValue: 50,
    goldValue: 30,
    color: "#4B3621",
  },

  snake_elite: {
    id: "snake_elite",
    name: "蛇将军",
    chapter: "chapter1",
    rank: "elite",
    health: 120,
    damage: 20,
    speed: 110,
    xpValue: 50,
    goldValue: 30,
    color: "#228B22",
  },

  // ===== Chapter 2 - Yellow Wind Ridge =====
  // Minions
  rat_minion: {
    id: "rat_minion",
    name: "鼠妖",
    chapter: "chapter2",
    rank: "minion",
    health: 40,
    damage: 8,
    speed: 140,
    xpValue: 15,
    goldValue: 8,
    color: "#A9A9A9",
  },

  sand_minion: {
    id: "sand_minion",
    name: "沙怪",
    chapter: "chapter2",
    rank: "minion",
    health: 35,
    damage: 7,
    speed: 90,
    xpValue: 15,
    goldValue: 8,
    color: "#DEB887",
  },

  // Elites
  tiger_elite: {
    id: "tiger_elite",
    name: "虎力士",
    chapter: "chapter2",
    rank: "elite",
    health: 180,
    damage: 22,
    speed: 130,
    xpValue: 70,
    goldValue: 40,
    color: "#FF6347",
  },

  wind_elite: {
    id: "wind_elite",
    name: "风妖统领",
    chapter: "chapter2",
    rank: "elite",
    health: 140,
    damage: 25,
    speed: 150,
    xpValue: 70,
    goldValue: 40,
    color: "#87CEEB",
  },

  // ===== Chapter 3 - Little Western Heaven =====
  // Minions
  monk_minion: {
    id: "monk_minion",
    name: "妖僧",
    chapter: "chapter3",
    rank: "minion",
    health: 50,
    damage: 10,
    speed: 100,
    xpValue: 20,
    goldValue: 10,
    color: "#D2691E",
  },

  spider_minion: {
    id: "spider_minion",
    name: "小蜘蛛精",
    chapter: "chapter3",
    rank: "minion",
    health: 45,
    damage: 12,
    speed: 130,
    xpValue: 20,
    goldValue: 10,
    color: "#8B008B",
  },

  // Elites
  centipede_elite: {
    id: "centipede_elite",
    name: "蜈蚣统领",
    chapter: "chapter3",
    rank: "elite",
    health: 200,
    damage: 28,
    speed: 110,
    xpValue: 90,
    goldValue: 50,
    color: "#B8860B",
  },

  scorpion_elite: {
    id: "scorpion_elite",
    name: "蝎子精",
    chapter: "chapter3",
    rank: "elite",
    health: 160,
    damage: 32,
    speed: 140,
    xpValue: 90,
    goldValue: 50,
    color: "#DC143C",
  },

  // ===== Chapter 4 - Silk Cave =====
  // Minions
  spider_woman_minion: {
    id: "spider_woman_minion",
    name: "蜘蛛女妖",
    chapter: "chapter4",
    rank: "minion",
    health: 55,
    damage: 14,
    speed: 120,
    xpValue: 25,
    goldValue: 12,
    color: "#9370DB",
  },

  centipede_minion: {
    id: "centipede_minion",
    name: "小蜈蚣",
    chapter: "chapter4",
    rank: "minion",
    health: 60,
    damage: 11,
    speed: 100,
    xpValue: 25,
    goldValue: 12,
    color: "#556B2F",
  },

  // Elites
  violet_spider_elite: {
    id: "violet_spider_elite",
    name: "紫蜘蛛",
    chapter: "chapter4",
    rank: "elite",
    health: 220,
    damage: 30,
    speed: 140,
    xpValue: 110,
    goldValue: 60,
    color: "#9400D3",
  },

  poison_centipede_elite: {
    id: "poison_centipede_elite",
    name: "毒蜈蚣",
    chapter: "chapter4",
    rank: "elite",
    health: 250,
    damage: 26,
    speed: 90,
    xpValue: 110,
    goldValue: 60,
    color: "#006400",
  },

  // ===== Chapter 5 - Flaming Mountains =====
  // Minions
  fire_demon_minion: {
    id: "fire_demon_minion",
    name: "火妖",
    chapter: "chapter5",
    rank: "minion",
    health: 65,
    damage: 16,
    speed: 110,
    xpValue: 30,
    goldValue: 15,
    color: "#FF4500",
  },

  bull_soldier_minion: {
    id: "bull_soldier_minion",
    name: "牛兵",
    chapter: "chapter5",
    rank: "minion",
    health: 70,
    damage: 15,
    speed: 90,
    xpValue: 30,
    goldValue: 15,
    color: "#8B4513",
  },

  // Elites
  fire_general_elite: {
    id: "fire_general_elite",
    name: "火将军",
    chapter: "chapter5",
    rank: "elite",
    health: 280,
    damage: 35,
    speed: 120,
    xpValue: 130,
    goldValue: 70,
    color: "#FF8C00",
  },

  bull_captain_elite: {
    id: "bull_captain_elite",
    name: "牛魔统领",
    chapter: "chapter5",
    rank: "elite",
    health: 320,
    damage: 32,
    speed: 100,
    xpValue: 130,
    goldValue: 70,
    color: "#A0522D",
  },

  // ===== Chapter 6 - Mount Sumeru =====
  // Minions
  celestial_guard_minion: {
    id: "celestial_guard_minion",
    name: "天兵",
    chapter: "chapter6",
    rank: "minion",
    health: 80,
    damage: 18,
    speed: 120,
    xpValue: 35,
    goldValue: 18,
    color: "#4169E1",
  },

  thunder_minion: {
    id: "thunder_minion",
    name: "雷妖",
    chapter: "chapter6",
    rank: "minion",
    health: 75,
    damage: 20,
    speed: 130,
    xpValue: 35,
    goldValue: 18,
    color: "#9370DB",
  },

  // Elites
  celestial_general_elite: {
    id: "celestial_general_elite",
    name: "天将",
    chapter: "chapter6",
    rank: "elite",
    health: 350,
    damage: 40,
    speed: 130,
    xpValue: 150,
    goldValue: 80,
    color: "#4682B4",
  },

  dragon_guardian_elite: {
    id: "dragon_guardian_elite",
    name: "龙卫",
    chapter: "chapter6",
    rank: "elite",
    health: 380,
    damage: 38,
    speed: 140,
    xpValue: 150,
    goldValue: 80,
    color: "#00CED1",
  },
};

export const ENEMY_SIZE: Record<EnemyRank, number> = {
  minion: 32,
  elite: 40,
};
