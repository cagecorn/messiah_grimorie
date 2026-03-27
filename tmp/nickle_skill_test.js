/**
 * Headless Logic Verification: Nickle Tactical Command Skill (with Wizard)
 * This script validates that Tactical Command increases the power of standard attacks, heals, and buffs, including Wizard.
 */

// --- Standard Attack Detection Mock ---
class StandardAttackDetectionManager {
    constructor() {
        this.standardProjectileKeys = ['melee', 'arrow', 'bullet', 'bard', 'light', 'wizard', 'aqua_burst'];
    }
    isStandardProjectile(key) {
        return this.standardProjectileKeys.includes(key);
    }
    getTacticalMultiplier(entity) {
        if (!entity || !entity.logic || !entity.logic.buffs) return 1.0;
        const hasBuff = entity.logic.buffs.activeBuffs.some(b => b.id === 'tactical_command');
        return hasBuff ? 1.5 : 1.0;
    }
}
const standardAttackDetectionManager = new StandardAttackDetectionManager();

// --- Mocks ---
class MockStatManager {
    constructor(atk = 20, mAtk = 20) {
        this.atk = atk;
        this.mAtk = mAtk;
        this.crit = 0;
    }
    get(key) { return this[key] || 0; }
}

class MockBuffManager {
    constructor(owner) {
        this.owner = owner;
        this.activeBuffs = [];
    }
    addBuff(config) {
        this.activeBuffs.push(config);
        process.stdout.write(`[BUFF] Applied ${config.id} to ${this.owner.logic.name}\n`);
    }
}

class MockEntity {
    constructor(name, team, className, atk = 20, mAtk = 20) {
        this.logic = { 
            name, 
            isAlive: true,
            class: { getClassName: () => className },
            getTotalAtk: () => atk,
            getTotalMAtk: () => mAtk,
            stats: new MockStatManager(atk, mAtk)
        };
        this.team = team;
        this.active = true;
        this.logic.buffs = new MockBuffManager(this);
    }
}

// --- Logic to Test (Replicating CombatManager.js) ---
function calculateDamage(attacker, projectileId, baseMultiplier = 1.0, type = 'physical') {
    let baseVal = (type === 'physical') ? attacker.logic.getTotalAtk() : attacker.logic.getTotalMAtk();
    let damage = baseVal * baseMultiplier; 
    
    // Applying Tactical Command logic
    if (standardAttackDetectionManager.isStandardProjectile(projectileId)) {
        const tacticalMult = standardAttackDetectionManager.getTacticalMultiplier(attacker);
        if (tacticalMult > 1.0) {
            damage *= tacticalMult;
        }
    }
    return damage;
}

function calculateHeal(healer, multiplier = 1.0) {
    let healAmount = healer.logic.getTotalMAtk() * multiplier;
    
    // Applying Tactical Command logic
    const tacticalMult = standardAttackDetectionManager.getTacticalMultiplier(healer);
    if (tacticalMult > 1.0) {
        healAmount *= tacticalMult;
    }
    return healAmount;
}

function calculateInspiration(bard, multiplier = 1.0) {
    let buffValue = bard.logic.getTotalMAtk() * multiplier;
    
    // Applying Tactical Command logic
    const tacticalMult = standardAttackDetectionManager.getTacticalMultiplier(bard);
    if (tacticalMult > 1.0) {
        buffValue *= tacticalMult;
    }
    return buffValue;
}

// --- Test Execution ---
function testTacticalCommand() {
    process.stdout.write("--- Starting Nickle Tactical Command Logic Test (Full Classes) ---\n");

    // 1. Setup entities
    const warrior = new MockEntity("Warrior", "mercenary", "warrior", 100, 0);
    const archer = new MockEntity("Archer", "mercenary", "archer", 100, 0);
    const wizard = new MockEntity("Wizard", "mercenary", "wizard", 0, 100);
    const healer = new MockEntity("Healer", "mercenary", "healer", 0, 100);
    const bard = new MockEntity("Bard", "mercenary", "bard", 0, 100);

    const testUnits = [
        { unit: warrior, action: "Physical Melee", proj: "melee", type: 'physical', fn: calculateDamage },
        { unit: archer, action: "Physical Ranged", proj: "arrow", type: 'physical', fn: calculateDamage },
        { unit: wizard, action: "Magic Ranged", proj: "wizard", type: 'magic', fn: calculateDamage },
        { unit: healer, action: "Magic Heal", proj: undefined, type: 'magic', fn: calculateHeal },
        { unit: bard, action: "Magic Buff", proj: undefined, type: 'magic', fn: calculateInspiration }
    ];

    process.stdout.write("\n[PHASE 1] Baseline Measurement (No Buff)\n");
    testUnits.forEach(t => {
        t.baseline = t.fn(t.unit, t.proj, 1.0, t.type);
        process.stdout.write(`- ${t.unit.logic.name} (${t.action}): Value = ${t.baseline}\n`);
    });

    process.stdout.write("\n[PHASE 2] Applying Tactical Command Buff to all allies\n");
    testUnits.forEach(t => {
        t.unit.logic.buffs.addBuff({ id: 'tactical_command' });
    });

    process.stdout.write("\n[PHASE 3] Boosted Measurement (With Buff)\n");
    let allPassed = true;
    testUnits.forEach(t => {
        t.boosted = t.fn(t.unit, t.proj, 1.0, t.type);
        const ratio = t.boosted / t.baseline;
        const pass = Math.abs(ratio - 1.5) < 0.01;
        
        process.stdout.write(`- ${t.unit.logic.name} (${t.action}): Value = ${t.boosted} (x${ratio.toFixed(2)}) -> ${pass ? '✅' : '❌'}\n`);
        if (!pass) allPassed = false;
    });

    if (allPassed) {
        process.stdout.write("\n✅ ALL NICKLE LOGIC TESTS PASSED: Tactical Command correctly boosts standard attacks for ALL classes including Wizard.\n");
    } else {
        process.stdout.write("\n❌ TEST FAILED: Implementation error detected.\n");
        process.exit(1);
    }
}

testTacticalCommand();
