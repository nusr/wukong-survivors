import type {
  WeaponType,
  WeaponData,
  ElixirType,
  ElixirData,
  WeaponRarity,
} from "../types/";

// Weapon configuration data
export const WEAPONS: Record<WeaponType, WeaponData> = {
  // ===== 基础武器 =====
  golden_staff: {
    id: "golden_staff",
    name: "金箍棒",
    description: "天命人的如意神兵，可大可小，重达一万三千五百斤",
    rarity: "common",
    baseDamage: 15,
    attackSpeed: 1000,
    level: 1,
    maxLevel: 5,
  },

  // ===== 稀有武器 =====
  fire_lance: {
    id: "fire_lance",
    name: "火尖枪",
    description: "红孩儿的火焰长枪，烈焰缠绕，灼烧敌人",
    rarity: "rare",
    baseDamage: 20,
    attackSpeed: 1200,
    level: 1,
    maxLevel: 5,
  },
  fireproof_cloak: {
    id: "fireproof_cloak",
    name: "避火罩",
    description: "红孩儿的护体神光，抵御伤害并反弹火焰",
    rarity: "rare",
    baseDamage: 10,
    attackSpeed: 3000,
    level: 1,
    maxLevel: 5,
  },
  twin_blades: {
    id: "twin_blades",
    name: "双刃刀",
    description: "虎先锋的双刀，快速连击，势如猛虎",
    rarity: "rare",
    baseDamage: 18,
    attackSpeed: 800,
    level: 1,
    maxLevel: 5,
  },
  thunder_drum: {
    id: "thunder_drum",
    name: "雷公凿",
    description: "引动雷霆之力，天雷滚滚，震慑群妖",
    rarity: "rare",
    baseDamage: 22,
    attackSpeed: 1600,
    level: 1,
    maxLevel: 5,
  },
  ice_needle: {
    id: "ice_needle",
    name: "冰魄银针",
    description: "蜘蛛精的寒冰银针，千针万刺，冻结敌人",
    rarity: "rare",
    baseDamage: 16,
    attackSpeed: 900,
    level: 1,
    maxLevel: 5,
  },
  golden_rope: {
    id: "golden_rope",
    name: "金绳索",
    description: "束缚敌人的仙家法宝，困锁无双，无人可逃",
    rarity: "rare",
    baseDamage: 12,
    attackSpeed: 1400,
    level: 1,
    maxLevel: 5,
  },

  // ===== 史诗武器 =====
  wind_tamer: {
    id: "wind_tamer",
    name: "定风珠",
    description: "黄风大王的定风神珠，控制风暴，范围攻击",
    rarity: "epic",
    baseDamage: 25,
    attackSpeed: 2000,
    level: 1,
    maxLevel: 5,
  },
  violet_bell: {
    id: "violet_bell",
    name: "紫金铃",
    description: "黄眉大王的紫金铃，发出致命音波，震慑妖魔",
    rarity: "epic",
    baseDamage: 30,
    attackSpeed: 1500,
    level: 1,
    maxLevel: 5,
  },
  mace: {
    id: "mace",
    name: "降魔杵",
    description: "佛门重器，降妖除魔，一杵定乾坤",
    rarity: "epic",
    baseDamage: 35,
    attackSpeed: 1800,
    level: 1,
    maxLevel: 5,
  },
  bull_horns: {
    id: "bull_horns",
    name: "牛魔双角",
    description: "牛魔王的巨角，冲撞无敌，势不可挡",
    rarity: "epic",
    baseDamage: 40,
    attackSpeed: 2500,
    level: 1,
    maxLevel: 5,
  },
  wind_fire_wheels: {
    id: "wind_fire_wheels",
    name: "风火轮",
    description: "红孩儿的风火轮，脚踏风火，疾驰如电",
    rarity: "epic",
    baseDamage: 28,
    attackSpeed: 1000,
    level: 1,
    maxLevel: 5,
  },

  // ===== 传说武器 =====
  ruyi_staff: {
    id: "ruyi_staff",
    name: "如意金箍棒",
    description: "金箍棒的终极形态，定海神针，威力无穷",
    rarity: "legendary",
    baseDamage: 50,
    attackSpeed: 800,
    level: 1,
    maxLevel: 5,
  },
  jade_purity_bottle: {
    id: "jade_purity_bottle",
    name: "玉净瓶",
    description: "观音菩萨的玉净瓶，收妖降魔，净化万物",
    rarity: "legendary",
    baseDamage: 32,
    attackSpeed: 2200,
    level: 1,
    maxLevel: 5,
  },
  plantain_fan: {
    id: "plantain_fan",
    name: "芭蕉扇",
    description: "铁扇公主的法宝，一扇熄火，二扇生风，三扇下雨",
    rarity: "legendary",
    baseDamage: 45,
    attackSpeed: 3000,
    level: 1,
    maxLevel: 5,
  },

  // ===== 扩展武器 =====
  three_pointed_blade: {
    id: "three_pointed_blade",
    name: "三尖两刃刀",
    description: "二郎神的神兵，三尖锋利，刀刃如电",
    rarity: "legendary",
    baseDamage: 42,
    attackSpeed: 1100,
    level: 1,
    maxLevel: 5,
  },
  nine_ring_staff: {
    id: "nine_ring_staff",
    name: "九环锡杖",
    description: "唐僧的禅杖，九环鸣响，震慑妖魔",
    rarity: "epic",
    baseDamage: 30,
    attackSpeed: 1700,
    level: 1,
    maxLevel: 5,
  },
  crescent_blade: {
    id: "crescent_blade",
    name: "月牙铲",
    description: "沙僧的降妖宝杖，月牙如钩，破甲无双",
    rarity: "epic",
    baseDamage: 33,
    attackSpeed: 1500,
    level: 1,
    maxLevel: 5,
  },
  iron_cudgel: {
    id: "iron_cudgel",
    name: "混铁棍",
    description: "牛魔王的巨棍，重逾千斤，力拔山兮",
    rarity: "epic",
    baseDamage: 38,
    attackSpeed: 2200,
    level: 1,
    maxLevel: 5,
  },
  seven_star_sword: {
    id: "seven_star_sword",
    name: "七星剑",
    description: "道家仙剑，七星连珠，剑气纵横",
    rarity: "rare",
    baseDamage: 24,
    attackSpeed: 1300,
    level: 1,
    maxLevel: 5,
  },
  ginseng_fruit: {
    id: "ginseng_fruit",
    name: "人参果",
    description: "镇元大仙的仙果，闻一闻活三百六十岁，吃一个活四万七千年",
    rarity: "legendary",
    baseDamage: 15,
    attackSpeed: 5000,
    level: 1,
    maxLevel: 5,
  },

  // ===== 高级扩展武器 =====
  heaven_earth_circle: {
    id: "heaven_earth_circle",
    name: "乾坤圈",
    description: "哪吒的神器，金光万丈，飞出攻击后自动返回",
    rarity: "legendary",
    baseDamage: 40,
    attackSpeed: 1800,
    level: 1,
    maxLevel: 5,
  },
  red_armillary_sash: {
    id: "red_armillary_sash",
    name: "混天绫",
    description: "哪吒的法宝，长达七尺二寸，束缚和鞭打攻击",
    rarity: "epic",
    baseDamage: 28,
    attackSpeed: 1400,
    level: 1,
    maxLevel: 5,
  },
  purple_gold_gourd: {
    id: "purple_gold_gourd",
    name: "紫金葫芦",
    description: "金角银角的法宝，呼名答应，吸收敌人",
    rarity: "legendary",
    baseDamage: 35,
    attackSpeed: 3500,
    level: 1,
    maxLevel: 5,
  },
  golden_rope_immortal: {
    id: "golden_rope_immortal",
    name: "幌金绳",
    description: "太上老君的法宝，束缚更强版本，捆仙索",
    rarity: "epic",
    baseDamage: 26,
    attackSpeed: 1600,
    level: 1,
    maxLevel: 5,
  },
  demon_revealing_mirror: {
    id: "demon_revealing_mirror",
    name: "照妖镜",
    description: "识破敌人弱点，大幅增加暴击率和暴击伤害",
    rarity: "rare",
    baseDamage: 18,
    attackSpeed: 2500,
    level: 1,
    maxLevel: 5,
  },
  sea_calming_needle: {
    id: "sea_calming_needle",
    name: "定海神针",
    description: "金箍棒的另一形态，天河镇海之宝，范围更大威力更强",
    rarity: "legendary",
    baseDamage: 55,
    attackSpeed: 2000,
    level: 1,
    maxLevel: 5,
  },

  // ===== 未来扩展武器 =====
  eight_trigrams_furnace: {
    id: "eight_trigrams_furnace",
    name: "八卦炉",
    description: "太上老君的炼丹炉，八卦烈焰，持续灼烧敌人",
    rarity: "legendary",
    baseDamage: 32,
    attackSpeed: 2800,
    level: 1,
    maxLevel: 5,
  },
  dragon_staff: {
    id: "dragon_staff",
    name: "盘龙杖",
    description: "观音座下的神兵，召唤龙卷风暴，席卷群敌",
    rarity: "epic",
    baseDamage: 36,
    attackSpeed: 2300,
    level: 1,
    maxLevel: 5,
  },
  seven_treasure_tree: {
    id: "seven_treasure_tree",
    name: "七宝妙树",
    description: "准提道人的法宝，刷新万物，净化邪祟",
    rarity: "legendary",
    baseDamage: 38,
    attackSpeed: 3200,
    level: 1,
    maxLevel: 5,
  },
  immortal_slaying_blade: {
    id: "immortal_slaying_blade",
    name: "斩仙飞刀",
    description: "陆压道人的飞刀，锁定必杀，请宝贝转身",
    rarity: "legendary",
    baseDamage: 48,
    attackSpeed: 4000,
    level: 1,
    maxLevel: 5,
  },
  diamond_snare: {
    id: "diamond_snare",
    name: "金刚琢",
    description: "太上老君的法宝，破防神器，无坚不摧",
    rarity: "epic",
    baseDamage: 34,
    attackSpeed: 1900,
    level: 1,
    maxLevel: 5,
  },
  exquisite_pagoda: {
    id: "exquisite_pagoda",
    name: "玲珑宝塔",
    description: "托塔天王李靖的宝塔，镇压万魔，禁锢邪祟",
    rarity: "legendary",
    baseDamage: 40,
    attackSpeed: 3600,
    level: 1,
    maxLevel: 5,
  },

  // ===== 西游记师徒武器 =====
  nine_tooth_rake: {
    id: "nine_tooth_rake",
    name: "九齿钉耙",
    description: "猪八戒的上宝沁金钯，九齿神锋，能耙能筑",
    rarity: "epic",
    baseDamage: 35,
    attackSpeed: 1600,
    level: 1,
    maxLevel: 5,
  },
  dragon_scale_sword: {
    id: "dragon_scale_sword",
    name: "龙鳞剑",
    description: "白龙马的龙族神剑，剑气如虹，龙威凛然",
    rarity: "rare",
    baseDamage: 26,
    attackSpeed: 1200,
    level: 1,
    maxLevel: 5,
  },
};

// Elixir configuration data
// Effects are implemented in Player and GameScene classes
export const ELIXIRS: Record<ElixirType, ElixirData> = {
  peach_of_immortality: {
    id: "peach_of_immortality",
    name: "蟠桃",
    description: "增加20点最大生命值",
    rarity: "epic",
    effect: {
      type: "health",
      value: 20,
    },
  },
  golden_elixir: {
    id: "golden_elixir",
    name: "金丹",
    description: "提升10%攻击力",
    rarity: "rare",
    effect: {
      type: "damage",
      value: 0.1,
    },
  },
  jade_dew: {
    id: "jade_dew",
    name: "玉露",
    description: "恢复50%生命值",
    rarity: "common",
    effect: {
      type: "health",
      value: 0.5,
    },
  },
  tiger_bone_wine: {
    id: "tiger_bone_wine",
    name: "虎骨酒",
    description: "增加5点护甲",
    rarity: "rare",
    effect: {
      type: "armor",
      value: 5,
    },
  },
  phoenix_feather: {
    id: "phoenix_feather",
    name: "凤凰羽",
    description: "增加10点移动速度",
    rarity: "rare",
    effect: {
      type: "speed",
      value: 10,
    },
  },
  dragon_scale: {
    id: "dragon_scale",
    name: "龙鳞",
    description: "增加8点防御",
    rarity: "epic",
    effect: {
      type: "armor",
      value: 8,
    },
  },
  spirit_mushroom: {
    id: "spirit_mushroom",
    name: "灵芝",
    description: "增加20%经验获取",
    rarity: "rare",
    effect: {
      type: "exp",
      value: 0.2,
    },
  },
  soul_bead: {
    id: "soul_bead",
    name: "舍利子",
    description: "增加10%暴击率",
    rarity: "epic",
    effect: {
      type: "crit",
      value: 0.1,
    },
  },
  inner_elixir: {
    id: "inner_elixir",
    name: "内丹",
    description: "全属性提升5%",
    rarity: "legendary",
    effect: {
      type: "all",
      value: 0.05,
    },
  },
  resurrection_pill: {
    id: "resurrection_pill",
    name: "还魂丹",
    description: "死亡时自动复活一次",
    rarity: "legendary",
    effect: {
      type: "revive",
      value: 1,
    },
  },
  universe_bag: {
    id: "universe_bag",
    name: "乾坤袋",
    description: "显著增加金币和宝石的磁吸范围",
    rarity: "epic",
    effect: {
      type: "magnet",
      value: 1.5, // 50%磁吸范围加成
    },
  },
};

// Weapon crafting recipes (based on Journey to the West setting)
export const WEAPON_RECIPES: Record<
  string,
  { materials: WeaponType[]; result: WeaponType }
> = {
  // Ruyi Golden Cudgel: Golden Staff + Thunder Drum + Demon Mace (Heavenly weapon, requires fusion of powerful weapons)
  ruyi_staff: {
    materials: ["golden_staff", "thunder_drum", "mace"],
    result: "ruyi_staff",
  },
  // Jade Purity Bottle: Violet Bell + Wind Tamer + Fireproof Cloak (Guanyin's treasure, requires multiple divine artifacts)
  jade_purity_bottle: {
    materials: ["violet_bell", "wind_tamer", "fireproof_cloak"],
    result: "jade_purity_bottle",
  },
  // Plantain Fan: Wind Tamer + Fire Lance + Bull Horns (related to Iron Fan Princess and Bull Demon King)
  plantain_fan: {
    materials: ["wind_tamer", "fire_lance", "bull_horns"],
    result: "plantain_fan",
  },
  // Wind Fire Wheels: Fire Lance + Wind Tamer (Nezha/Red Boy's wind and fire power)
  wind_fire_wheels: {
    materials: ["fire_lance", "wind_tamer"],
    result: "wind_fire_wheels",
  },
  // Violet Bell: Golden Rope + Thunder Drum (Yellow Eyebrow King's treasure, requires binding and sonic power)
  violet_bell: {
    materials: ["golden_rope", "thunder_drum"],
    result: "violet_bell",
  },
  // Bull Horns: Demon Mace + Fire Lance (Bull Demon King's strength and fire)
  bull_horns: {
    materials: ["mace", "fire_lance"],
    result: "bull_horns",
  },
  // Ice Needle: Golden Rope + Twin Blades (fast and precise attacks)
  ice_needle: {
    materials: ["golden_rope", "twin_blades"],
    result: "ice_needle",
  },
  // Thunder Drum: Twin Blades + Golden Rope (fast attacks + thunder power)
  thunder_drum: {
    materials: ["twin_blades", "golden_rope"],
    result: "thunder_drum",
  },
  // Three Pointed Blade: Twin Blades + Golden Staff (weapon fusion)
  three_pointed_blade: {
    materials: ["twin_blades", "golden_staff"],
    result: "three_pointed_blade",
  },
  // Nine Ring Staff: Demon Mace + Golden Rope (Buddhist artifact)
  nine_ring_staff: {
    materials: ["mace", "golden_rope"],
    result: "nine_ring_staff",
  },
  // Crescent Blade: Demon Mace + Twin Blades (armor-piercing weapon)
  crescent_blade: {
    materials: ["mace", "twin_blades"],
    result: "crescent_blade",
  },
  // Iron Cudgel: Bull Horns + Demon Mace (strength-based weapon)
  iron_cudgel: {
    materials: ["bull_horns", "mace"],
    result: "iron_cudgel",
  },
  // Seven Star Sword: Golden Rope + Ice Needle (Taoist sword energy, precise and fast)
  seven_star_sword: {
    materials: ["golden_rope", "ice_needle"],
    result: "seven_star_sword",
  },
  // Heaven Earth Circle: Golden Staff + Fire Lance (Nezha's divine weapon)
  heaven_earth_circle: {
    materials: ["golden_staff", "fire_lance"],
    result: "heaven_earth_circle",
  },
  // Red Armillary Sash: Golden Rope + Wind Fire Wheels (Nezha's treasure)
  red_armillary_sash: {
    materials: ["golden_rope", "wind_fire_wheels"],
    result: "red_armillary_sash",
  },
  // Purple Gold Gourd: Jade Purity Bottle + Golden Rope (absorbing treasure)
  purple_gold_gourd: {
    materials: ["jade_purity_bottle", "golden_rope"],
    result: "purple_gold_gourd",
  },
  // Golden Rope Immortal: Golden Rope + Nine Ring Staff (Taishang Laojun's treasure)
  golden_rope_immortal: {
    materials: ["golden_rope", "nine_ring_staff"],
    result: "golden_rope_immortal",
  },
  // Demon Revealing Mirror: Seven Star Sword + Ice Needle (reveals weaknesses)
  demon_revealing_mirror: {
    materials: ["seven_star_sword", "ice_needle"],
    result: "demon_revealing_mirror",
  },
  // Sea Calming Needle: Ruyi Golden Cudgel + Bull Horns (ultimate form)
  sea_calming_needle: {
    materials: ["ruyi_staff", "bull_horns"],
    result: "sea_calming_needle",
  },
  // Eight Trigrams Furnace: Violet Bell + Fire Lance + Demon Mace (Taishang Laojun's alchemy furnace)
  eight_trigrams_furnace: {
    materials: ["violet_bell", "fire_lance", "mace"],
    result: "eight_trigrams_furnace",
  },
  // Dragon Staff: Demon Mace + Wind Tamer (Guanyin's weapon, tornado storm)
  dragon_staff: {
    materials: ["mace", "wind_tamer"],
    result: "dragon_staff",
  },
  // Seven Treasure Tree: Jade Purity Bottle + Violet Bell + Wind Tamer (Zhunti Taoist's treasure)
  seven_treasure_tree: {
    materials: ["jade_purity_bottle", "violet_bell", "wind_tamer"],
    result: "seven_treasure_tree",
  },
  // Immortal Slaying Blade: Three Pointed Blade + Ruyi Golden Cudgel (Luya Taoist's divine weapon)
  immortal_slaying_blade: {
    materials: ["three_pointed_blade", "ruyi_staff"],
    result: "immortal_slaying_blade",
  },
  // Diamond Snare: Bull Horns + Thunder Drum (Taishang Laojun's armor-breaking artifact)
  diamond_snare: {
    materials: ["bull_horns", "thunder_drum"],
    result: "diamond_snare",
  },
  // Exquisite Pagoda: Jade Purity Bottle + Demon Mace + Nine Ring Staff (Pagoda Bearer Li Jing's suppression treasure)
  exquisite_pagoda: {
    materials: ["jade_purity_bottle", "mace", "nine_ring_staff"],
    result: "exquisite_pagoda",
  },
  // Nine Tooth Rake: Demon Mace + Three Pointed Blade (Pigsy's divine weapon)
  nine_tooth_rake: {
    materials: ["mace", "three_pointed_blade"],
    result: "nine_tooth_rake",
  },
  // Dragon Scale Sword: Ice Needle + Twin Blades (White Dragon Horse's dragon sword energy)
  dragon_scale_sword: {
    materials: ["ice_needle", "twin_blades"],
    result: "dragon_scale_sword",
  },
};

// Rarity color mapping
export const RARITY_COLORS: Record<WeaponRarity, number> = {
  common: 0xcccccc,
  rare: 0x4169e1,
  epic: 0x9932cc,
  legendary: 0xffd700,
};
export const RARITY_SIZE: Record<WeaponRarity, number> = {
  common: 24,
  rare: 28,
  epic: 32,
  legendary: 36,
};

export const GEM_MAP = {
  gemLow: "gem-low",
  gemMedium: "gem-medium",
  gemHigh: "gem-high",
  coin: "coin",
};

export const COLLECT_RANGE_BONUS = 0.5;
