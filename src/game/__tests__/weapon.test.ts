import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  Weapon,
  GoldenStaff,
  FireproofCloak,
  RuyiStaff,
  FireLance,
  WindTamer,
  VioletBell,
  TwinBlades,
  Mace,
  BullHorns,
  ThunderDrum,
  IceNeedle,
  WindFireWheels,
  JadePurityBottle,
  GoldenRope,
  PlantainFan,
  ThreePointedBlade,
  NineRingStaff,
  CrescentBlade,
  IronCudgel,
  SevenStarSword,
  GinsengFruit,
  HeavenEarthCircle,
  RedArmillarySash,
  PurpleGoldGourd,
  GoldenRopeImmortal,
  DemonRevealingMirror,
  SeaCalmingNeedle,
  EightTrigramsFurnace,
} from "../weapon";
import { WEAPONS } from "../../constant";
import type { Enemy } from "../enemy";

const mockProjectile = {
  setCircle: vi.fn(),
  setDisplaySize: vi.fn(),
  setVelocity: vi.fn(),
  setRotation: vi.fn(),
  active: true,
  destroy: vi.fn(),
  damage: 0,
  piercing: 0,
};

const mockProjectileGroup = {
  create: vi.fn(() => mockProjectile),
};

const mockScene = {
  textures: {
    exists: vi.fn(() => true),
  },
  physics: {
    add: {
      sprite: vi.fn(() => mockProjectile),
      group: vi.fn(() => mockProjectileGroup),
    },
  },
  getPlayerPosition: vi.fn(() => ({ x: 100, y: 100 })),
  time: {
    delayedCall: vi.fn(),
  },
  playPlayerFireSound: vi.fn(),
};

const mockPlayer = {
  sprite: {
    body: {
      velocity: { x: 0, y: 0 },
    },
  },
  collectRangeBonus: 0,
  critRate: 0,
  attack: 0,
};

// Create a test subclass to access protected methods
class TestWeapon extends Weapon {
  constructor(scene: any, player: any, isOrb: boolean = false) {
    // Weapon constructor expects a config object
    super(scene, player, {
      type: "golden_staff", // Use an existing weapon type
      isOrb: isOrb,
    });
    // Set up basic weapon properties for testing
    this.coolDown = 1000;
    this.piercing = 0;
  }

  applyUpgrade(): void {
    // Basic implementation for testing
    this.level++;
  }

  protected fire(enemies: Enemy[]): void {
    this.testFireWeapon(enemies);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public testFireWeapon(_enemies: Enemy[]) {}

  public testCreateProjectile(angle: number) {
    return this.createProjectile(angle);
  }

  public testGetEnemiesInRange(enemies: Enemy[], range: number) {
    return this.getEnemiesInRange(enemies, range);
  }

  public testGetPlayerAngle() {
    return this.getPlayerAngle();
  }
}

describe("Weapon Base Class", () => {
  // Test base functionality through a concrete implementation
  let goldenStaff: GoldenStaff;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    goldenStaff = new GoldenStaff(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(goldenStaff.level).toBe(1);
    expect(goldenStaff.damage).toBe(WEAPONS["golden_staff"].baseDamage);
    expect(goldenStaff.coolDown).toBe(WEAPONS["golden_staff"].attackSpeed);
    expect(goldenStaff.type).toBe("golden_staff");
    expect(goldenStaff.projectiles).toBeDefined();
    expect(goldenStaff.isOrb).toBe(false);
  });

  it("should create projectiles correctly", () => {
    const testWeapon = new TestWeapon(mockScene as any, mockPlayer as any);

    const projectile = testWeapon.testCreateProjectile(0);

    expect(projectile.setCircle).toHaveBeenCalled();
    expect(projectile.setDisplaySize).toHaveBeenCalled();
    expect(projectile.damage).toBe(testWeapon.damage);
    expect(projectile.piercing).toBe(testWeapon.piercing);
  });

  it("should upgrade damage correctly", () => {
    const initialDamage = goldenStaff.damage;
    goldenStaff.upgrade();

    expect(goldenStaff.level).toBe(2);
    expect(goldenStaff.damage).toBeGreaterThan(initialDamage);
  });

  it("should not upgrade beyond max level", () => {
    goldenStaff.level = goldenStaff.maxLevel;
    const initialLevel = goldenStaff.level;
    const initialDamage = goldenStaff.damage;

    goldenStaff.upgrade();

    expect(goldenStaff.level).toBe(initialLevel);
    expect(goldenStaff.damage).toBe(initialDamage);
  });

  it("should calculate player angle based on velocity", () => {
    const testWeapon = new TestWeapon(mockScene as any, mockPlayer as any);

    // Set player velocity
    mockPlayer.sprite.body.velocity = { x: 100, y: 0 };
    let angle = testWeapon.testGetPlayerAngle();
    expect(angle).toBe(0);

    mockPlayer.sprite.body.velocity = { x: 0, y: 100 };
    angle = testWeapon.testGetPlayerAngle();
    expect(angle).toBe(Math.PI / 2);

    mockPlayer.sprite.body.velocity = { x: -100, y: 0 };
    angle = testWeapon.testGetPlayerAngle();
    expect(angle).toBe(Math.PI);

    mockPlayer.sprite.body.velocity = { x: 0, y: 0 };
    angle = testWeapon.testGetPlayerAngle();
    expect(angle).toBe(0);
  });

  it("should find enemies in range", () => {
    const testWeapon = new TestWeapon(mockScene as any, mockPlayer as any);
    const playerPos = mockScene.getPlayerPosition();

    const enemies: Enemy[] = [
      { sprite: { x: playerPos.x + 50, y: playerPos.y } } as Enemy,
      { sprite: { x: playerPos.x + 150, y: playerPos.y } } as Enemy,
      { sprite: { x: playerPos.x + 250, y: playerPos.y } } as Enemy,
    ];

    const enemiesInRange = testWeapon.testGetEnemiesInRange(enemies, 200);
    expect(enemiesInRange).toHaveLength(2);

    const allEnemiesInRange = testWeapon.testGetEnemiesInRange(enemies, 300);
    expect(allEnemiesInRange).toHaveLength(3);
  });

  it("should update weapon and call fire when cooldown expires", () => {
    const testWeapon = new TestWeapon(mockScene as any, mockPlayer as any);
    const fireSpy = vi.spyOn(testWeapon, "testFireWeapon");

    // Set cooldown to 0 for testing
    testWeapon.coolDown = 0;
    (testWeapon as any).lastFired = 0;

    const playerPos = mockScene.getPlayerPosition();
    const enemies: Enemy[] = [
      { sprite: { x: playerPos.x + 50, y: playerPos.y } } as Enemy,
    ];

    // Call update - should fire since cooldown is 0
    testWeapon.update(100, enemies);

    expect(fireSpy).toHaveBeenCalledWith(enemies);
    expect((testWeapon as any).lastFired).toBe(100);
  });

  it("should not fire if cooldown has not expired", () => {
    const testWeapon = new TestWeapon(mockScene as any, mockPlayer as any);
    const fireSpy = vi.spyOn(testWeapon, "testFireWeapon");

    // Set cooldown to 1000 and lastFired to 500
    testWeapon.coolDown = 1000;
    (testWeapon as any).lastFired = 500;

    const playerPos = mockScene.getPlayerPosition();
    const enemies: Enemy[] = [
      { sprite: { x: playerPos.x + 50, y: playerPos.y } } as Enemy,
    ];

    // Call update at 1000 - should not fire (needs 1500)
    testWeapon.update(1000, enemies);

    expect(fireSpy).not.toHaveBeenCalled();
  });

  it("should update orb positions when isOrb is true", () => {
    const testWeapon = new TestWeapon(
      mockScene as any,
      mockPlayer as any,
      true,
    );
    testWeapon.rotationSpeed = 100;
    testWeapon.rotationRadius = 50;

    // Create a mock orb sprite
    const mockOrbSprite = { x: 0, y: 0 } as any;
    (testWeapon as any).orbs = [{ sprite: mockOrbSprite, offset: 0 }];

    // Call update
    const initialX = mockOrbSprite.x;
    const initialY = mockOrbSprite.y;
    testWeapon.update(100, []);

    // Orb position should have changed
    expect(mockOrbSprite.x).not.toBe(initialX);
    expect(mockOrbSprite.y).not.toBe(initialY);
  });

  it("should update orb rotation and position when no enemies are present", () => {
    // Create an orb weapon for testing
    const testWeapon = new TestWeapon(
      mockScene as any,
      mockPlayer as any,
      true,
    );
    const fireSpy = vi.spyOn(testWeapon, "testFireWeapon");

    // Set up orb properties
    testWeapon.orbs = [{ sprite: mockProjectile as any, offset: 0 }];
    testWeapon.rotationRadius = 80;
    testWeapon.rotationSpeed = 2;
    const initialRotationAngle = testWeapon.rotationAngle;

    // Call update with no enemies
    testWeapon.update(100, []);

    // Orb weapons should update rotation angle
    expect(testWeapon.rotationAngle).toBeGreaterThan(initialRotationAngle);
    // Fire method should not be called for orb weapons (they have their own logic)
    expect(fireSpy).not.toHaveBeenCalled();
  });
});

describe("PlantainFan Weapon", () => {
  let plantainFan: PlantainFan;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    plantainFan = new PlantainFan(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(plantainFan.type).toBe("plantain_fan");
    expect(plantainFan.level).toBe(1);
    expect(plantainFan.damage).toBeGreaterThan(0);
    expect(plantainFan.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = plantainFan.level;
    const initialDamage = plantainFan.damage;
    const initialCoolDown = plantainFan.coolDown;

    plantainFan.upgrade();

    expect(plantainFan.level).toBe(initialLevel + 1);
    expect(plantainFan.damage).toBeGreaterThan(initialDamage);
    expect(plantainFan.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("ThreePointedBlade Weapon", () => {
  let threePointedBlade: ThreePointedBlade;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    threePointedBlade = new ThreePointedBlade(
      mockScene as any,
      mockPlayer as any,
    );
  });

  it("should initialize with correct properties", () => {
    expect(threePointedBlade.type).toBe("three_pointed_blade");
    expect(threePointedBlade.level).toBe(1);
    expect(threePointedBlade.damage).toBeGreaterThan(0);
    expect(threePointedBlade.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = threePointedBlade.level;
    const initialDamage = threePointedBlade.damage;
    const initialCoolDown = threePointedBlade.coolDown;

    threePointedBlade.upgrade();

    expect(threePointedBlade.level).toBe(initialLevel + 1);
    expect(threePointedBlade.damage).toBeGreaterThan(initialDamage);
    expect(threePointedBlade.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("NineRingStaff Weapon", () => {
  let nineRingStaff: NineRingStaff;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    nineRingStaff = new NineRingStaff(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(nineRingStaff.type).toBe("nine_ring_staff");
    expect(nineRingStaff.level).toBe(1);
    expect(nineRingStaff.damage).toBeGreaterThan(0);
    expect(nineRingStaff.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = nineRingStaff.level;
    const initialDamage = nineRingStaff.damage;
    const initialCoolDown = nineRingStaff.coolDown;

    nineRingStaff.upgrade();

    expect(nineRingStaff.level).toBe(initialLevel + 1);
    expect(nineRingStaff.damage).toBeGreaterThan(initialDamage);
    expect(nineRingStaff.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("CrescentBlade Weapon", () => {
  let crescentBlade: CrescentBlade;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    crescentBlade = new CrescentBlade(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(crescentBlade.type).toBe("crescent_blade");
    expect(crescentBlade.level).toBe(1);
    expect(crescentBlade.damage).toBeGreaterThan(0);
    expect(crescentBlade.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = crescentBlade.level;
    const initialDamage = crescentBlade.damage;
    const initialCoolDown = crescentBlade.coolDown;

    crescentBlade.upgrade();

    expect(crescentBlade.level).toBe(initialLevel + 1);
    expect(crescentBlade.damage).toBeGreaterThan(initialDamage);
    expect(crescentBlade.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("IceNeedle Weapon", () => {
  let iceNeedle: IceNeedle;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    iceNeedle = new IceNeedle(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(iceNeedle.type).toBe("ice_needle");
    expect(iceNeedle.level).toBe(1);
    expect(iceNeedle.damage).toBeGreaterThan(0);
    expect(iceNeedle.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = iceNeedle.level;
    const initialDamage = iceNeedle.damage;
    const initialCoolDown = iceNeedle.coolDown;

    iceNeedle.upgrade();

    expect(iceNeedle.level).toBe(initialLevel + 1);
    expect(iceNeedle.damage).toBeGreaterThan(initialDamage);
    expect(iceNeedle.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("WindFireWheels Weapon", () => {
  let windFireWheels: WindFireWheels;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    windFireWheels = new WindFireWheels(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(windFireWheels.type).toBe("wind_fire_wheels");
    expect(windFireWheels.level).toBe(1);
    expect(windFireWheels.damage).toBeGreaterThan(0);
    expect(windFireWheels.isOrb).toBe(true);
  });

  it("should upgrade correctly", () => {
    const initialLevel = windFireWheels.level;
    const initialDamage = windFireWheels.damage;
    const initialCoolDown = windFireWheels.coolDown;

    windFireWheels.upgrade();

    expect(windFireWheels.level).toBe(initialLevel + 1);
    expect(windFireWheels.damage).toBeGreaterThan(initialDamage);
    expect(windFireWheels.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("JadePurityBottle Weapon", () => {
  let jadePurityBottle: JadePurityBottle;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    jadePurityBottle = new JadePurityBottle(
      mockScene as any,
      mockPlayer as any,
    );
  });

  it("should initialize with correct properties", () => {
    expect(jadePurityBottle.type).toBe("jade_purity_bottle");
    expect(jadePurityBottle.level).toBe(1);
    expect(jadePurityBottle.damage).toBeGreaterThan(0);
    expect(jadePurityBottle.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = jadePurityBottle.level;
    const initialDamage = jadePurityBottle.damage;
    const initialCoolDown = jadePurityBottle.coolDown;

    jadePurityBottle.upgrade();

    expect(jadePurityBottle.level).toBe(initialLevel + 1);
    expect(jadePurityBottle.damage).toBeGreaterThan(initialDamage);
    expect(jadePurityBottle.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("GoldenRope Weapon", () => {
  let goldenRope: GoldenRope;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    goldenRope = new GoldenRope(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(goldenRope.type).toBe("golden_rope");
    expect(goldenRope.level).toBe(1);
    expect(goldenRope.damage).toBeGreaterThan(0);
    expect(goldenRope.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = goldenRope.level;
    const initialDamage = goldenRope.damage;
    const initialCoolDown = goldenRope.coolDown;

    goldenRope.upgrade();

    expect(goldenRope.level).toBe(initialLevel + 1);
    expect(goldenRope.damage).toBeGreaterThan(initialDamage);
    expect(goldenRope.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("VioletBell Weapon", () => {
  let violetBell: VioletBell;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    violetBell = new VioletBell(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(violetBell.type).toBe("violet_bell");
    expect(violetBell.level).toBe(1);
    expect(violetBell.damage).toBe(WEAPONS["violet_bell"].baseDamage);
    expect(violetBell.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = violetBell.level;
    const initialDamage = violetBell.damage;
    const initialCoolDown = violetBell.coolDown;

    violetBell.upgrade();

    expect(violetBell.level).toBe(initialLevel + 1);
    expect(violetBell.damage).toBeGreaterThan(initialDamage);
    expect(violetBell.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("TwinBlades Weapon", () => {
  let twinBlades: TwinBlades;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    twinBlades = new TwinBlades(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(twinBlades.type).toBe("twin_blades");
    expect(twinBlades.level).toBe(1);
    expect(twinBlades.damage).toBe(WEAPONS["twin_blades"].baseDamage);
    expect(twinBlades.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = twinBlades.level;
    const initialDamage = twinBlades.damage;
    const initialCoolDown = twinBlades.coolDown;

    twinBlades.upgrade();

    expect(twinBlades.level).toBe(initialLevel + 1);
    expect(twinBlades.damage).toBeGreaterThan(initialDamage);
    expect(twinBlades.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("Mace Weapon", () => {
  let mace: Mace;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    mace = new Mace(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(mace.type).toBe("mace");
    expect(mace.level).toBe(1);
    expect(mace.damage).toBe(WEAPONS["mace"].baseDamage);
    expect(mace.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = mace.level;
    const initialDamage = mace.damage;
    const initialCoolDown = mace.coolDown;

    mace.upgrade();

    expect(mace.level).toBe(initialLevel + 1);
    expect(mace.damage).toBeGreaterThan(initialDamage);
    expect(mace.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("BullHorns Weapon", () => {
  let bullHorns: BullHorns;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    bullHorns = new BullHorns(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(bullHorns.type).toBe("bull_horns");
    expect(bullHorns.level).toBe(1);
    expect(bullHorns.damage).toBe(WEAPONS["bull_horns"].baseDamage);
    expect(bullHorns.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = bullHorns.level;
    const initialDamage = bullHorns.damage;
    const initialCoolDown = bullHorns.coolDown;

    bullHorns.upgrade();

    expect(bullHorns.level).toBe(initialLevel + 1);
    expect(bullHorns.damage).toBeGreaterThan(initialDamage);
    expect(bullHorns.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("ThunderDrum Weapon", () => {
  let thunderDrum: ThunderDrum;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    thunderDrum = new ThunderDrum(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(thunderDrum.type).toBe("thunder_drum");
    expect(thunderDrum.level).toBe(1);
    expect(thunderDrum.damage).toBe(WEAPONS["thunder_drum"].baseDamage);
    expect(thunderDrum.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = thunderDrum.level;
    const initialDamage = thunderDrum.damage;
    const initialCoolDown = thunderDrum.coolDown;

    thunderDrum.upgrade();

    expect(thunderDrum.level).toBe(initialLevel + 1);
    expect(thunderDrum.damage).toBeGreaterThan(initialDamage);
    expect(thunderDrum.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("GoldenStaff Weapon", () => {
  let goldenStaff: GoldenStaff;
  let enemies: Enemy[];
  let sortedEnemies: Enemy[];

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    goldenStaff = new GoldenStaff(mockScene as any, mockPlayer as any);

    enemies = [
      { sprite: { x: 100, y: 200 } } as Enemy,
      { sprite: { x: 100, y: 300 } } as Enemy,
    ];

    sortedEnemies = enemies.slice().reverse();
  });

  it("should initialize with correct properties", () => {
    expect(goldenStaff.type).toBe("golden_staff");
    expect(goldenStaff.piercing).toBe(1);
    expect(goldenStaff.coolDown).toBe(WEAPONS["golden_staff"].attackSpeed);
  });

  it("should fire at sorted enemies", () => {
    // Test through public update method which internally calls fire
    const time = 1000;

    // @ts-expect-error just for test
    const fireSpy = vi.spyOn(goldenStaff, "fire");

    // Set lastFired to 0 so it can fire immediately
    (goldenStaff as any).lastFired = 0;

    goldenStaff.update(time, sortedEnemies);

    expect(fireSpy).toHaveBeenCalledWith(sortedEnemies);
  });

  it("should apply upgrades correctly", () => {
    const initialCoolDown = goldenStaff.coolDown;

    // Level 2
    goldenStaff.upgrade();
    expect(goldenStaff.coolDown).toBeLessThan(initialCoolDown);
    expect(goldenStaff.piercing).toBe(1);

    // Level 3
    goldenStaff.upgrade();
    expect(goldenStaff.piercing).toBe(2);

    // Level 5
    goldenStaff.level = 4;
    goldenStaff.upgrade();
    expect(goldenStaff.piercing).toBe(3);
  });

  it("should cap cool down at 300ms", () => {
    goldenStaff.coolDown = 400;
    goldenStaff.upgrade();
    expect(goldenStaff.coolDown).toBe(300);

    // Try to upgrade again, should stay at 300ms
    goldenStaff.upgrade();
    expect(goldenStaff.coolDown).toBe(300);
  });
});

describe("FireproofCloak Weapon", () => {
  let fireproofCloak: FireproofCloak;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    fireproofCloak = new FireproofCloak(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(fireproofCloak.type).toBe("fireproof_cloak");
    expect(fireproofCloak.isOrb).toBe(true);
    expect(fireproofCloak.projectileCount).toBe(1);
    expect(fireproofCloak.rotationRadius).toBe(80);
    expect(fireproofCloak.rotationSpeed).toBe(2);
  });

  it("should create orbs on initialization", () => {
    expect(mockScene.physics.add.sprite).toHaveBeenCalled();
    expect(fireproofCloak.orbs).toHaveLength(1);
  });

  it("should apply upgrades correctly", () => {
    // Level 2
    fireproofCloak.upgrade();
    expect(fireproofCloak.projectileCount).toBe(2);

    // Level 3
    fireproofCloak.upgrade();
    expect(fireproofCloak.rotationRadius).toBe(100);

    // Level 4
    fireproofCloak.upgrade();
    expect(fireproofCloak.projectileCount).toBe(3);

    // Level 5
    fireproofCloak.upgrade();
    expect(fireproofCloak.rotationSpeed).toBe(3);
  });

  it("should update orb positions when rotating", () => {
    const mockOrbSprite = { x: 0, y: 0 };
    fireproofCloak.orbs = [{ sprite: mockOrbSprite as any, offset: 0 }];

    const initialAngle = fireproofCloak.rotationAngle;

    fireproofCloak.update(1000, []);

    expect(fireproofCloak.rotationAngle).toBeGreaterThan(initialAngle);
  });
});

describe("RuyiStaff Weapon", () => {
  let ruyiStaff: RuyiStaff;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    ruyiStaff = new RuyiStaff(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(ruyiStaff.type).toBe("ruyi_staff");
    expect(ruyiStaff.piercing).toBe(3);
    expect(ruyiStaff.projectileCount).toBe(1);
  });

  it("should apply upgrades correctly", () => {
    const initialCoolDown = ruyiStaff.coolDown;

    // Level 2
    ruyiStaff.upgrade();
    expect(ruyiStaff.coolDown).toBeLessThan(initialCoolDown);

    // Level 3
    ruyiStaff.upgrade();
    expect(ruyiStaff.projectileCount).toBe(2);

    // Level 5
    ruyiStaff.level = 4;
    ruyiStaff.upgrade();
    expect(ruyiStaff.piercing).toBe(5);
  });

  it("should cap cool down at 500ms", () => {
    ruyiStaff.coolDown = 600;
    ruyiStaff.upgrade();
    // Check that it decreased but don't check for exact value since it depends on implementation
    expect(ruyiStaff.coolDown).toBeLessThan(600);
    expect(ruyiStaff.coolDown).toBeGreaterThanOrEqual(500);
  });
});

describe("FireLance Weapon", () => {
  let fireLance: FireLance;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    fireLance = new FireLance(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(fireLance.type).toBe("fire_lance");
    expect(fireLance.piercing).toBe(2);
    expect(fireLance.projectileSpeed).toBeDefined();
  });

  it("should apply upgrades correctly", () => {
    const initialCoolDown = fireLance.coolDown;
    const initialSpeed = fireLance.projectileSpeed;

    // Level 2
    fireLance.upgrade();
    expect(fireLance.coolDown).toBeLessThan(initialCoolDown);

    // Level 3
    fireLance.upgrade();
    expect(fireLance.piercing).toBe(3);

    // Level 5
    fireLance.level = 4;
    fireLance.upgrade();
    expect(fireLance.projectileSpeed).toBe(600);
    expect(fireLance.projectileSpeed).toBeGreaterThan(initialSpeed);
  });

  it("should cap cool down at 600ms", () => {
    fireLance.coolDown = 700;
    fireLance.upgrade();
    expect(fireLance.coolDown).toBe(600);
  });
});

describe("WindTamer Weapon", () => {
  let windTamer: WindTamer;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    windTamer = new WindTamer(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(windTamer.type).toBe("wind_tamer");
    expect(windTamer.isOrb).toBe(true);
    expect(windTamer.projectileCount).toBe(1);
    expect(windTamer.rotationSpeed).toBe(2);
    expect(windTamer.rotationRadius).toBe(60);
  });

  it("should create orbs on initialization", () => {
    expect(mockScene.physics.add.sprite).toHaveBeenCalled();
    expect(windTamer.orbs).toHaveLength(1);
  });

  it("should apply upgrades correctly", () => {
    // Level 2
    windTamer.upgrade();
    expect(windTamer.rotationSpeed).toBe(3);

    // Level 3
    windTamer.upgrade();
    expect(windTamer.rotationRadius).toBe(80);

    // Level 4
    windTamer.upgrade();
    expect(windTamer.rotationSpeed).toBe(4);

    // Level 5
    windTamer.upgrade();
    expect(windTamer.projectileCount).toBe(2);
    expect(windTamer.orbs).toHaveLength(2);
  });
});

describe("IronCudgel Weapon", () => {
  let ironCudgel: IronCudgel;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    ironCudgel = new IronCudgel(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(ironCudgel.type).toBe("iron_cudgel");
    expect(ironCudgel.level).toBe(1);
    expect(ironCudgel.damage).toBeGreaterThan(0);
    expect(ironCudgel.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = ironCudgel.level;
    const initialDamage = ironCudgel.damage;
    const initialCoolDown = ironCudgel.coolDown;

    ironCudgel.upgrade();

    expect(ironCudgel.level).toBe(initialLevel + 1);
    expect(ironCudgel.damage).toBeGreaterThan(initialDamage);
    expect(ironCudgel.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("SevenStarSword Weapon", () => {
  let sevenStarSword: SevenStarSword;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    sevenStarSword = new SevenStarSword(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(sevenStarSword.type).toBe("seven_star_sword");
    expect(sevenStarSword.level).toBe(1);
    expect(sevenStarSword.damage).toBeGreaterThan(0);
    expect(sevenStarSword.isOrb).toBe(true);
  });

  it("should upgrade correctly", () => {
    const initialLevel = sevenStarSword.level;
    const initialDamage = sevenStarSword.damage;

    sevenStarSword.upgrade();

    expect(sevenStarSword.level).toBe(initialLevel + 1);
    expect(sevenStarSword.damage).toBeGreaterThan(initialDamage);
  });
});

describe("GinsengFruit Weapon", () => {
  let ginsengFruit: GinsengFruit;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    ginsengFruit = new GinsengFruit(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(ginsengFruit.type).toBe("ginseng_fruit");
    expect(ginsengFruit.level).toBe(1);
    expect(ginsengFruit.damage).toBeGreaterThan(0);
    expect(ginsengFruit.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = ginsengFruit.level;
    const initialDamage = ginsengFruit.damage;
    const initialCoolDown = ginsengFruit.coolDown;

    ginsengFruit.upgrade();

    expect(ginsengFruit.level).toBe(initialLevel + 1);
    expect(ginsengFruit.damage).toBeGreaterThan(initialDamage);
    expect(ginsengFruit.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("HeavenEarthCircle Weapon", () => {
  let heavenEarthCircle: HeavenEarthCircle;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    heavenEarthCircle = new HeavenEarthCircle(
      mockScene as any,
      mockPlayer as any,
    );
  });

  it("should initialize with correct properties", () => {
    expect(heavenEarthCircle.type).toBe("heaven_earth_circle");
    expect(heavenEarthCircle.level).toBe(1);
    expect(heavenEarthCircle.damage).toBeGreaterThan(0);
    expect(heavenEarthCircle.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = heavenEarthCircle.level;
    const initialDamage = heavenEarthCircle.damage;
    const initialCoolDown = heavenEarthCircle.coolDown;

    heavenEarthCircle.upgrade();

    expect(heavenEarthCircle.level).toBe(initialLevel + 1);
    expect(heavenEarthCircle.damage).toBeGreaterThan(initialDamage);
    expect(heavenEarthCircle.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("RedArmillarySash Weapon", () => {
  let redArmillarySash: RedArmillarySash;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    redArmillarySash = new RedArmillarySash(
      mockScene as any,
      mockPlayer as any,
    );
  });

  it("should initialize with correct properties", () => {
    expect(redArmillarySash.type).toBe("red_armillary_sash");
    expect(redArmillarySash.level).toBe(1);
    expect(redArmillarySash.damage).toBeGreaterThan(0);
    expect(redArmillarySash.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = redArmillarySash.level;
    const initialDamage = redArmillarySash.damage;
    const initialCoolDown = redArmillarySash.coolDown;

    redArmillarySash.upgrade();

    expect(redArmillarySash.level).toBe(initialLevel + 1);
    expect(redArmillarySash.damage).toBeGreaterThan(initialDamage);
    expect(redArmillarySash.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("PurpleGoldGourd Weapon", () => {
  let purpleGoldGourd: PurpleGoldGourd;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    purpleGoldGourd = new PurpleGoldGourd(mockScene as any, mockPlayer as any);
  });

  it("should initialize with correct properties", () => {
    expect(purpleGoldGourd.type).toBe("purple_gold_gourd");
    expect(purpleGoldGourd.level).toBe(1);
    expect(purpleGoldGourd.damage).toBeGreaterThan(0);
    expect(purpleGoldGourd.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = purpleGoldGourd.level;
    const initialDamage = purpleGoldGourd.damage;
    const initialCoolDown = purpleGoldGourd.coolDown;

    purpleGoldGourd.upgrade();

    expect(purpleGoldGourd.level).toBe(initialLevel + 1);
    expect(purpleGoldGourd.damage).toBeGreaterThan(initialDamage);
    expect(purpleGoldGourd.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("GoldenRopeImmortal Weapon", () => {
  let goldenRopeImmortal: GoldenRopeImmortal;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    goldenRopeImmortal = new GoldenRopeImmortal(
      mockScene as any,
      mockPlayer as any,
    );
  });

  it("should initialize with correct properties", () => {
    expect(goldenRopeImmortal.type).toBe("golden_rope_immortal");
    expect(goldenRopeImmortal.level).toBe(1);
    expect(goldenRopeImmortal.damage).toBeGreaterThan(0);
    expect(goldenRopeImmortal.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = goldenRopeImmortal.level;
    const initialDamage = goldenRopeImmortal.damage;
    const initialCoolDown = goldenRopeImmortal.coolDown;

    goldenRopeImmortal.upgrade();

    expect(goldenRopeImmortal.level).toBe(initialLevel + 1);
    expect(goldenRopeImmortal.damage).toBeGreaterThan(initialDamage);
    expect(goldenRopeImmortal.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("DemonRevealingMirror Weapon", () => {
  let demonRevealingMirror: DemonRevealingMirror;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    demonRevealingMirror = new DemonRevealingMirror(
      mockScene as any,
      mockPlayer as any,
    );
  });

  it("should initialize with correct properties", () => {
    expect(demonRevealingMirror.type).toBe("demon_revealing_mirror");
    expect(demonRevealingMirror.level).toBe(1);
    expect(demonRevealingMirror.damage).toBeGreaterThan(0);
    expect(demonRevealingMirror.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = demonRevealingMirror.level;
    const initialDamage = demonRevealingMirror.damage;
    const initialCoolDown = demonRevealingMirror.coolDown;

    demonRevealingMirror.upgrade();

    expect(demonRevealingMirror.level).toBe(initialLevel + 1);
    expect(demonRevealingMirror.damage).toBeGreaterThan(initialDamage);
    expect(demonRevealingMirror.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("SeaCalmingNeedle Weapon", () => {
  let seaCalmingNeedle: SeaCalmingNeedle;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    seaCalmingNeedle = new SeaCalmingNeedle(
      mockScene as any,
      mockPlayer as any,
    );
  });

  it("should initialize with correct properties", () => {
    expect(seaCalmingNeedle.type).toBe("sea_calming_needle");
    expect(seaCalmingNeedle.level).toBe(1);
    expect(seaCalmingNeedle.damage).toBeGreaterThan(0);
    expect(seaCalmingNeedle.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = seaCalmingNeedle.level;
    const initialDamage = seaCalmingNeedle.damage;
    const initialCoolDown = seaCalmingNeedle.coolDown;

    seaCalmingNeedle.upgrade();

    expect(seaCalmingNeedle.level).toBe(initialLevel + 1);
    expect(seaCalmingNeedle.damage).toBeGreaterThan(initialDamage);
    expect(seaCalmingNeedle.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});

describe("EightTrigramsFurnace Weapon", () => {
  let eightTrigramsFurnace: EightTrigramsFurnace;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    eightTrigramsFurnace = new EightTrigramsFurnace(
      mockScene as any,
      mockPlayer as any,
    );
  });

  it("should initialize with correct properties", () => {
    expect(eightTrigramsFurnace.type).toBe("eight_trigrams_furnace");
    expect(eightTrigramsFurnace.level).toBe(1);
    expect(eightTrigramsFurnace.maxLevel).toBe(8);
    expect(eightTrigramsFurnace.damage).toBeGreaterThan(0);
    expect(eightTrigramsFurnace.isOrb).toBe(false);
  });

  it("should upgrade correctly", () => {
    const initialLevel = eightTrigramsFurnace.level;
    const initialDamage = eightTrigramsFurnace.damage;
    const initialCoolDown = eightTrigramsFurnace.coolDown;

    eightTrigramsFurnace.upgrade();

    expect(eightTrigramsFurnace.level).toBe(initialLevel + 1);
    expect(eightTrigramsFurnace.damage).toBeGreaterThan(initialDamage);
    expect(eightTrigramsFurnace.coolDown).toBeLessThanOrEqual(initialCoolDown);
  });
});
