import type {
  WeaponType,
  WeaponData,
  ElixirType,
  ElixirData,
  WeaponRarity,
} from "../types/reward";

// Weapon configuration data
export const WEAPONS: Record<WeaponType, WeaponData> = {
  golden_staff: {
    id: "golden_staff",
    name: "金箍棒",
    description: "天命人的如意神兵",
    rarity: "common",
    baseDamage: 15,
    attackSpeed: 1000,
    level: 1,
    maxLevel: 5,
  },
  ruyi_staff: {
    id: "ruyi_staff",
    name: "如意金箍棒",
    description: "金箍棒的终极形态，威力无穷",
    rarity: "legendary",
    baseDamage: 50,
    attackSpeed: 800,
    level: 1,
    maxLevel: 5,
    recipe: {
      materials: ["golden_staff", "thunder_drum", "mace"],
      result: "ruyi_staff",
    },
  },
  fire_lance: {
    id: "fire_lance",
    name: "火尖枪",
    description: "烈焰缠绕的长枪，灼烧敌人",
    rarity: "rare",
    baseDamage: 20,
    attackSpeed: 1200,
    level: 1,
    maxLevel: 5,
  },
  wind_tamer: {
    id: "wind_tamer",
    name: "定风珠",
    description: "控制风暴的神珠，范围攻击",
    rarity: "epic",
    baseDamage: 25,
    attackSpeed: 2000,
    level: 1,
    maxLevel: 5,
  },
  violet_bell: {
    id: "violet_bell",
    name: "紫金铃",
    description: "发出致命音波的法宝",
    rarity: "epic",
    baseDamage: 30,
    attackSpeed: 1500,
    level: 1,
    maxLevel: 5,
  },
  fireproof_cloak: {
    id: "fireproof_cloak",
    name: "避火罩",
    description: "护体神光，抵御伤害",
    rarity: "rare",
    baseDamage: 10,
    attackSpeed: 3000,
    level: 1,
    maxLevel: 5,
  },
  twin_blades: {
    id: "twin_blades",
    name: "双刃刀",
    description: "虎先锋的双刀，快速连击",
    rarity: "rare",
    baseDamage: 18,
    attackSpeed: 800,
    level: 1,
    maxLevel: 5,
  },
  mace: {
    id: "mace",
    name: "降魔杵",
    description: "佛门重器，震慑妖魔",
    rarity: "epic",
    baseDamage: 35,
    attackSpeed: 1800,
    level: 1,
    maxLevel: 5,
  },
  bull_horns: {
    id: "bull_horns",
    name: "牛魔双角",
    description: "牛魔王的巨角，冲撞无敌",
    rarity: "epic",
    baseDamage: 40,
    attackSpeed: 2500,
    level: 1,
    maxLevel: 5,
  },
  thunder_drum: {
    id: "thunder_drum",
    name: "雷公凿",
    description: "引动雷霆之力",
    rarity: "rare",
    baseDamage: 22,
    attackSpeed: 1600,
    level: 1,
    maxLevel: 5,
  },
  ice_needle: {
    id: "ice_needle",
    name: "冰魄银针",
    description: "寒冰凝聚，冻结敌人",
    rarity: "rare",
    baseDamage: 16,
    attackSpeed: 900,
    level: 1,
    maxLevel: 5,
  },
  wind_fire_wheels: {
    id: "wind_fire_wheels",
    name: "风火轮",
    description: "脚踏风火，疾驰如电",
    rarity: "epic",
    baseDamage: 28,
    attackSpeed: 1000,
    level: 1,
    maxLevel: 5,
  },
  jade_purity_bottle: {
    id: "jade_purity_bottle",
    name: "玉净瓶",
    description: "观音净瓶，收妖降魔",
    rarity: "legendary",
    baseDamage: 32,
    attackSpeed: 2200,
    level: 1,
    maxLevel: 5,
  },
  golden_rope: {
    id: "golden_rope",
    name: "金绳索",
    description: "束缚敌人，困锁无双",
    rarity: "rare",
    baseDamage: 12,
    attackSpeed: 1400,
    level: 1,
    maxLevel: 5,
  },
  plantain_fan: {
    id: "plantain_fan",
    name: "芭蕉扇",
    description: "铁扇公主的法宝，狂风呼啸",
    rarity: "legendary",
    baseDamage: 45,
    attackSpeed: 3000,
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
    description: "死亡时满血复活一次",
    rarity: "legendary",
    effect: {
      type: "revive",
      value: 1,
    },
  },
};

// Weapon crafting recipes
export const WEAPON_RECIPES: Record<
  string,
  { materials: WeaponType[]; result: WeaponType }
> = {
  ruyi_staff: {
    materials: ["golden_staff", "thunder_drum", "mace"],
    result: "ruyi_staff",
  },
  jade_purity_bottle: {
    materials: ["violet_bell", "wind_tamer", "fireproof_cloak"],
    result: "jade_purity_bottle",
  },
  plantain_fan: {
    materials: ["wind_tamer", "fire_lance", "bull_horns"],
    result: "plantain_fan",
  },
  wind_fire_wheels: {
    materials: ["fire_lance", "wind_tamer"],
    result: "wind_fire_wheels",
  },
};

// Rarity color mapping
export const RARITY_COLORS: Record<WeaponRarity, number> = {
  common: 0xcccccc,
  rare: 0x4169e1,
  epic: 0x9932cc,
  legendary: 0xffd700,
};

// Get weight by rarity
export function getRarityWeight(rarity: WeaponRarity): number {
  const weights: Record<WeaponRarity, number> = {
    common: 50,
    rare: 30,
    epic: 15,
    legendary: 5,
  };
  return weights[rarity];
}

// Randomly get weapons (considering rarity weight)
export function getRandomWeapons(count: number = 3): WeaponType[] {
  const allWeapons = Object.keys(WEAPONS) as WeaponType[];

  // Build weighted pool with unique weapons and their weights
  const weaponWeights: { weapon: WeaponType; weight: number }[] =
    allWeapons.map((weaponId) => ({
      weapon: weaponId,
      weight: getRarityWeight(WEAPONS[weaponId].rarity),
    }));

  const selected: WeaponType[] = [];
  const availableWeapons = [...weaponWeights];

  // Random selection with guaranteed uniqueness
  while (selected.length < count && availableWeapons.length > 0) {
    // Calculate total weight
    const totalWeight = availableWeapons.reduce(
      (sum, item) => sum + item.weight,
      0,
    );

    // Random weighted selection
    let random = Math.random() * totalWeight;
    let selectedIndex = -1;

    for (let i = 0; i < availableWeapons.length; i++) {
      random -= availableWeapons[i].weight;
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    if (selectedIndex >= 0) {
      selected.push(availableWeapons[selectedIndex].weapon);
      availableWeapons.splice(selectedIndex, 1); // Remove selected weapon to prevent duplicates
    }
  }

  return selected;
}

// Randomly get elixirs
export function getRandomElixirs(count: number = 3): ElixirType[] {
  const allElixirs = Object.keys(ELIXIRS) as ElixirType[];

  // Build weighted pool with unique elixirs and their weights
  const elixirWeights: { elixir: ElixirType; weight: number }[] =
    allElixirs.map((elixirId) => ({
      elixir: elixirId,
      weight: getRarityWeight(ELIXIRS[elixirId].rarity),
    }));

  const selected: ElixirType[] = [];
  const availableElixirs = [...elixirWeights];

  // Random selection with guaranteed uniqueness
  while (selected.length < count && availableElixirs.length > 0) {
    // Calculate total weight
    const totalWeight = availableElixirs.reduce(
      (sum, item) => sum + item.weight,
      0,
    );

    // Random weighted selection
    let random = Math.random() * totalWeight;
    let selectedIndex = -1;

    for (let i = 0; i < availableElixirs.length; i++) {
      random -= availableElixirs[i].weight;
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }

    if (selectedIndex >= 0) {
      selected.push(availableElixirs[selectedIndex].elixir);
      availableElixirs.splice(selectedIndex, 1); // Remove selected elixir to prevent duplicates
    }
  }

  return selected;
}

// Check if weapon can be crafted
export function canCraftWeapon(
  ownedWeapons: WeaponType[],
  recipeKey: string,
): boolean {
  const recipe = WEAPON_RECIPES[recipeKey];
  if (!recipe) return false;

  return recipe.materials.every((material) => ownedWeapons.includes(material));
}

// Get list of craftable weapons
export function getAvailableCrafts(ownedWeapons: WeaponType[]): WeaponType[] {
  const available: WeaponType[] = [];

  Object.entries(WEAPON_RECIPES).forEach(([key, recipe]) => {
    if (
      canCraftWeapon(ownedWeapons, key) &&
      !ownedWeapons.includes(recipe.result)
    ) {
      available.push(recipe.result);
    }
  });

  return available;
}

export const getWeaponImagePath = (id: WeaponType): string => {
  return `assets/weapons/${id}.svg`;
};
