import type { CharacterData, CharacterType } from "../types";

// Wukong character configuration (organized by chapter)
export const CHARACTERS_DATA: Record<CharacterType, CharacterData> = {
  // ===== Protagonist =====
  destined_one: {
    id: "destined_one",
    name: "天命人",
    rank: "hero",
    unlocked: true,
    unlockCondition: { type: "default", value: 0 },
    stats: {
      baseHealth: 100,
      baseSpeed: 150,
      baseDamage: 10,
      baseArmor: 5,
      baseLuck: 5,
    },
    startingWeapon: "golden_staff",
    color: "#FFD700",
  },

  // ===== Chapter 1 - Black Wind Mountain =====
  black_bear_guai: {
    id: "black_bear_guai",
    name: "黑熊精",
    rank: "king",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 1 },
    stats: {
      baseHealth: 150,
      baseSpeed: 120,
      baseDamage: 15,
      baseArmor: 12,
      baseLuck: 3,
    },
    startingWeapon: "fireproof_cloak",
    color: "#1a1a1a",
  },

  lingxuzi: {
    id: "lingxuzi",
    name: "灵虚子",
    rank: "lord",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 1 },
    stats: {
      baseHealth: 110,
      baseSpeed: 140,
      baseDamage: 12,
      baseArmor: 7,
      baseLuck: 8,
    },
    startingWeapon: "jade_purity_bottle",
    color: "#87CEEB",
  },

  wandering_wight: {
    id: "wandering_wight",
    name: "赤发鬼",
    rank: "boss",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 1 },
    stats: {
      baseHealth: 200,
      baseSpeed: 110,
      baseDamage: 25,
      baseArmor: 10,
      baseLuck: 5,
    },
    startingWeapon: "fire_lance",
    color: "#8B0000",
  },

  // ===== Chapter 2 - Yellow Wind Ridge =====
  yellow_wind_sage: {
    id: "yellow_wind_sage",
    name: "黄风大王",
    rank: "king",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 2 },
    stats: {
      baseHealth: 90,
      baseSpeed: 140,
      baseDamage: 20,
      baseArmor: 5,
      baseLuck: 10,
    },
    startingWeapon: "wind_tamer",
    color: "#DAA520",
  },

  tiger_vanguard: {
    id: "tiger_vanguard",
    name: "虎先锋",
    rank: "lord",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 2 },
    stats: {
      baseHealth: 120,
      baseSpeed: 160,
      baseDamage: 18,
      baseArmor: 8,
      baseLuck: 5,
    },
    startingWeapon: "twin_blades",
    color: "#FF8C00",
  },

  stone_vanguard: {
    id: "stone_vanguard",
    name: "石先锋",
    rank: "lord",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 2 },
    stats: {
      baseHealth: 140,
      baseSpeed: 100,
      baseDamage: 16,
      baseArmor: 15,
      baseLuck: 2,
    },
    startingWeapon: "golden_rope",
    color: "#808080",
  },

  king_of_flowing_sand: {
    id: "king_of_flowing_sand",
    name: "沙大王",
    rank: "boss",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 2 },
    stats: {
      baseHealth: 220,
      baseSpeed: 115,
      baseDamage: 28,
      baseArmor: 12,
      baseLuck: 6,
    },
    startingWeapon: "golden_rope",
    color: "#CD853F",
  },

  // ===== Chapter 3 - Little Western Heaven =====
  yellow_brow_king: {
    id: "yellow_brow_king",
    name: "黄眉大王",
    rank: "king",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 3 },
    stats: {
      baseHealth: 110,
      baseSpeed: 145,
      baseDamage: 22,
      baseArmor: 10,
      baseLuck: 12,
    },
    startingWeapon: "mace",
    color: "#F4A460",
  },

  hundred_eyed: {
    id: "hundred_eyed",
    name: "百眼魔君",
    rank: "king",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 3 },
    stats: {
      baseHealth: 80,
      baseSpeed: 130,
      baseDamage: 25,
      baseArmor: 3,
      baseLuck: 20,
    },
    startingWeapon: "violet_bell",
    color: "#9370DB",
  },

  mad_tiger: {
    id: "mad_tiger",
    name: "疯虎",
    rank: "lord",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 3 },
    stats: {
      baseHealth: 130,
      baseSpeed: 170,
      baseDamage: 20,
      baseArmor: 6,
      baseLuck: 4,
    },
    startingWeapon: "thunder_drum",
    color: "#FF4500",
  },

  kang_jin_loong: {
    id: "kang_jin_loong",
    name: "亢金星君",
    rank: "boss",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 3 },
    stats: {
      baseHealth: 250,
      baseSpeed: 120,
      baseDamage: 32,
      baseArmor: 14,
      baseLuck: 8,
    },
    startingWeapon: "violet_bell",
    color: "#FFD700",
  },

  // ===== Chapter 4 - Silk Cave =====
  spider_celestial: {
    id: "spider_celestial",
    name: "紫蛛",
    rank: "king",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 4 },
    stats: {
      baseHealth: 95,
      baseSpeed: 155,
      baseDamage: 18,
      baseArmor: 7,
      baseLuck: 15,
    },
    startingWeapon: "ice_needle",
    color: "#800080",
  },

  hundred_eyed_daoist: {
    id: "hundred_eyed_daoist",
    name: "百眼道人",
    rank: "king",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 4 },
    stats: {
      baseHealth: 85,
      baseSpeed: 135,
      baseDamage: 24,
      baseArmor: 4,
      baseLuck: 18,
    },
    startingWeapon: "golden_rope",
    color: "#4B0082",
  },

  elder_jinchi: {
    id: "elder_jinchi",
    name: "金池长老",
    rank: "lord",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 4 },
    stats: {
      baseHealth: 100,
      baseSpeed: 125,
      baseDamage: 14,
      baseArmor: 9,
      baseLuck: 10,
    },
    startingWeapon: "fire_lance",
    color: "#FFD700",
  },

  hundred_eyed_daoist_master: {
    id: "hundred_eyed_daoist_master",
    name: "多目金蜈蚣",
    rank: "boss",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 4 },
    stats: {
      baseHealth: 280,
      baseSpeed: 125,
      baseDamage: 35,
      baseArmor: 15,
      baseLuck: 10,
    },
    startingWeapon: "golden_rope",
    color: "#FFD700",
  },

  // ===== Chapter 5 - Flaming Mountains =====
  bull_king: {
    id: "bull_king",
    name: "牛魔王",
    rank: "king",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 5 },
    stats: {
      baseHealth: 180,
      baseSpeed: 110,
      baseDamage: 30,
      baseArmor: 15,
      baseLuck: 5,
    },
    startingWeapon: "bull_horns",
    color: "#8B4513",
  },

  red_boy: {
    id: "red_boy",
    name: "红孩儿",
    rank: "lord",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 5 },
    stats: {
      baseHealth: 90,
      baseSpeed: 150,
      baseDamage: 22,
      baseArmor: 6,
      baseLuck: 8,
    },
    startingWeapon: "fire_lance",
    color: "#DC143C",
  },

  rakshasa: {
    id: "rakshasa",
    name: "罗刹女",
    rank: "lord",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 5 },
    stats: {
      baseHealth: 85,
      baseSpeed: 145,
      baseDamage: 19,
      baseArmor: 7,
      baseLuck: 12,
    },
    startingWeapon: "plantain_fan",
    color: "#FF1493",
  },

  yaksha_king: {
    id: "yaksha_king",
    name: "夜叉王",
    rank: "boss",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 5 },
    stats: {
      baseHealth: 310,
      baseSpeed: 130,
      baseDamage: 38,
      baseArmor: 16,
      baseLuck: 7,
    },
    startingWeapon: "fire_lance",
    color: "#8B0000",
  },

  // ===== Chapter 6 - Mount Sumeru =====
  erlang_shen: {
    id: "erlang_shen",
    name: "二郎神",
    rank: "king",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 6 },
    stats: {
      baseHealth: 160,
      baseSpeed: 155,
      baseDamage: 28,
      baseArmor: 12,
      baseLuck: 8,
    },
    startingWeapon: "thunder_drum",
    color: "#4169E1",
  },

  great_sage_heaven: {
    id: "great_sage_heaven",
    name: "齐天大圣",
    rank: "king",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 6 },
    stats: {
      baseHealth: 200,
      baseSpeed: 170,
      baseDamage: 35,
      baseArmor: 10,
      baseLuck: 15,
    },
    startingWeapon: "ruyi_staff",
    color: "#FFD700",
  },

  golden_cicada: {
    id: "golden_cicada",
    name: "金蝉子",
    rank: "lord",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 6 },
    stats: {
      baseHealth: 120,
      baseSpeed: 140,
      baseDamage: 20,
      baseArmor: 8,
      baseLuck: 25,
    },
    startingWeapon: "jade_purity_bottle",
    color: "#FFD700",
  },

  stone_monkey: {
    id: "stone_monkey",
    name: "石猴",
    rank: "boss",
    unlocked: false,
    unlockCondition: { type: "chapter", value: 6 },
    stats: {
      baseHealth: 350,
      baseSpeed: 140,
      baseDamage: 42,
      baseArmor: 18,
      baseLuck: 10,
    },
    startingWeapon: "ruyi_staff",
    color: "#A9A9A9",
  },
} as const;

export const getCharacterImagePath = (id: CharacterType): string => {
  return `assets/characters/${id}.svg`;
};
