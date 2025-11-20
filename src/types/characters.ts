import type { WeaponType } from "./reward";
import type { MapType } from "./types";
// 黑神话悟空角色类型（妖王级、大王级、首领级）
export type CharacterType =
  // 主角
  | "destined_one" // 天命人（主角）

  // 第一回 - 黑风山
  | "black_bear_guai" // 黑熊精（妖王）
  | "lingxuzi" // 灵虚子（大王）
  | "wandering_wight" // 赤发鬼（首领）

  // 第二回 - 黄风岭
  | "yellow_wind_sage" // 黄风大王（妖王）
  | "tiger_vanguard" // 虎先锋（大王）
  | "stone_vanguard" // 石先锋（大王）
  | "king_of_flowing_sand" // 沙大王（首领）

  // 第三回 - 小西天
  | "yellow_brow_king" // 黄眉大王（妖王）
  | "hundred_eyed" // 百眼魔君（妖王）
  | "mad_tiger" // 疯虎（大王）
  | "kang_jin_loong" // 亢金星君（首领）

  // 第四回 - 盘丝洞
  | "spider_celestial" // 紫蛛（妖王）
  | "hundred_eyed_daoist" // 百眼道人（妖王）
  | "elder_jinchi" // 金池长老（大王）
  | "hundred_eyed_daoist_master" // 多目金蜈蚣（首领）

  // 第五回 - 火焰山
  | "bull_king" // 牛魔王（妖王）
  | "red_boy" // 红孩儿（大王）
  | "rakshasa" // 罗刹女（大王）
  | "yaksha_king" // 夜叉王（首领）

  // 第六回 - 须弥山
  | "erlang_shen" // 二郎神（妖王）
  | "great_sage_heaven" // 齐天大圣（妖王）
  | "golden_cicada" // 金蝉子（大王）
  | "stone_monkey"; // 石猴（首领）

// 敌人类型（小怪、头目）
export type EnemyType =
  // 第一回 - 黑风山
  | "wolf_minion" // 狼妖（小怪）
  | "ghost_minion" // 阴兵（小怪）
  | "bear_elite" // 熊罴精（头目）
  | "snake_elite" // 蛇将军（头目）

  // 第二回 - 黄风岭
  | "rat_minion" // 鼠妖（小怪）
  | "sand_minion" // 沙怪（小怪）
  | "tiger_elite" // 虎力士（头目）
  | "wind_elite" // 风妖统领（头目）

  // 第三回 - 小西天
  | "monk_minion" // 妖僧（小怪）
  | "spider_minion" // 小蜘蛛精（小怪）
  | "centipede_elite" // 蜈蚣统领（头目）
  | "scorpion_elite" // 蝎子精（头目）

  // 第四回 - 盘丝洞
  | "spider_woman_minion" // 蜘蛛女妖（小怪）
  | "centipede_minion" // 小蜈蚣（小怪）
  | "violet_spider_elite" // 紫蜘蛛（头目）
  | "poison_centipede_elite" // 毒蜈蚣（头目）

  // 第五回 - 火焰山
  | "fire_demon_minion" // 火妖（小怪）
  | "bull_soldier_minion" // 牛兵（小怪）
  | "fire_general_elite" // 火将军（头目）
  | "bull_captain_elite" // 牛魔统领（头目）

  // 第六回 - 须弥山
  | "celestial_guard_minion" // 天兵（小怪）
  | "thunder_minion" // 雷妖（小怪）
  | "celestial_general_elite" // 天将（头目）
  | "dragon_guardian_elite"; // 龙卫（头目）

export type EnemyRank = "minion" | "elite";

export type CharacterRankType = "hero" | "king" | "lord" | "boss"; // 主角/妖王/大王/首领

export type UnlockType = "default" | "chapter" | "kills" | "time" | "gold";

export interface CharacterData {
  id: CharacterType;
  name: string;
  rank: CharacterRankType;
  unlocked: boolean;
  unlockCondition: {
    type: UnlockType;
    value: number;
  };
  stats: {
    baseHealth: number;
    baseSpeed: number;
    baseDamage: number;
    baseArmor: number;
    baseLuck: number;
  };
  startingWeapon: WeaponType;
  color: string; // 角色主题色
}

export interface EnemyData {
  id: EnemyType;
  name: string;
  chapter: MapType;
  rank: EnemyRank;
  health: number;
  damage: number;
  speed: number;
  xpValue: number;
  goldValue: number; // 击杀掉落金币
  color: string; // 敌人主题色
}
