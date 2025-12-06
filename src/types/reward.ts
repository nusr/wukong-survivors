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
  | "plantain_fan" // 芭蕉扇
  | "three_pointed_blade" // 三尖两刃刀
  | "nine_ring_staff" // 九环锡杖
  | "crescent_blade" // 月牙铲
  | "iron_cudgel" // 混铁棍
  | "seven_star_sword" // 七星剑
  | "ginseng_fruit" // 人参果
  | "heaven_earth_circle" // 乾坤圈
  | "red_armillary_sash" // 混天绫
  | "purple_gold_gourd" // 紫金葫芦
  | "golden_rope_immortal" // 幌金绳
  | "demon_revealing_mirror" // 照妖镜
  | "sea_calming_needle" // 定海神针
  | "eight_trigrams_furnace" // 八卦炉
  | "dragon_staff" // 盘龙杖
  | "seven_treasure_tree" // 七宝妙树
  | "immortal_slaying_blade" // 斩仙飞刀
  | "diamond_snare" // 金刚琢
  | "exquisite_pagoda" // 玲珑宝塔
  | "nine_tooth_rake" // 九齿钉耙
  | "dragon_scale_sword"; // 龙鳞剑

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
  | "resurrection_pill" // 还魂丹：死亡时复活一次
  | "universe_bag"; // 乾坤袋：增加磁吸范围

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
      | "revive"
      | "magnet"; // 磁吸范围
    value: number;
  };
}

// 选择项类型
export type RewardType = "weapon" | "elixir";

export interface RewardOption {
  type: RewardType;
  data: WeaponData | ElixirData;
}
