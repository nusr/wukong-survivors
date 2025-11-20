// 武器和丹药类型定义

// 武器类型（黑神话悟空）
export type WeaponType =
  | "golden_staff" // 金箍棒
  | "ruyi_staff" // 如意金箍棒（合成后）
  | "fire_lance" // 火尖枪
  | "wind_tamer" // 定风珠
  | "violet_bell" // 紫金铃
  | "fireproof_cloak" // 避火罩
  | "twin_blades" // 双刃刀
  | "mace" // 降魔杵
  | "bull_horns" // 牛魔双角
  | "thunder_drum" // 雷公凿
  | "ice_needle" // 冰魄银针
  | "wind_fire_wheels" // 风火轮
  | "jade_purity_bottle" // 玉净瓶
  | "golden_rope" // 金绳索
  | "plantain_fan"; // 芭蕉扇

// 丹药类型（黑神话悟空）
export type ElixirType =
  | "peach_of_immortality" // 蟠桃：增加最大生命值
  | "golden_elixir" // 金丹：提升攻击力
  | "jade_dew" // 玉露：恢复生命值
  | "tiger_bone_wine" // 虎骨酒：增加护甲
  | "phoenix_feather" // 凤凰羽：增加移动速度
  | "dragon_scale" // 龙鳞：增加防御
  | "spirit_mushroom" // 灵芝：增加经验获取
  | "soul_bead" // 舍利子：增加暴击率
  | "inner_elixir" // 内丹：全属性提升
  | "resurrection_pill"; // 还魂丹：死亡时复活一次

// 武器品质
export type WeaponRarity = "common" | "rare" | "epic" | "legendary";

// 武器接口
export interface WeaponData {
  id: WeaponType;
  name: string;
  description: string;
  rarity: WeaponRarity;
  baseDamage: number;
  attackSpeed: number; // 攻击间隔（毫秒）
  level: number;
  maxLevel: number;
  // 合成配方（可选）
  recipe?: {
    materials: WeaponType[];
    result: WeaponType;
  };
}

// 丹药接口
export interface ElixirData {
  id: ElixirType;
  name: string;
  description: string;
  rarity: WeaponRarity;
  effect: {
    type:
      | "health"
      | "damage"
      | "armor"
      | "speed"
      | "exp"
      | "crit"
      | "all"
      | "revive";
    value: number;
  };
}

// 选择项类型
export type RewardType = "weapon" | "elixir";

export interface RewardOption {
  type: RewardType;
  data: WeaponData | ElixirData;
}

// 游戏内存档中添加的字段
export interface GameProgress {
  currentWeapons: WeaponType[]; // 当前拥有的武器
  elixirEffects: {
    // 丹药效果累积
    healthBonus: number;
    damageBonus: number;
    armorBonus: number;
    speedBonus: number;
    expBonus: number;
    critBonus: number;
    hasRevive: boolean;
  };
  killsSinceLastReward: number; // 距离上次奖励的击杀数
  totalRewardCount: number; // 总共获得的奖励次数
}
