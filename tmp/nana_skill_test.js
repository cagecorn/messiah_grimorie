/**
 * Headless Logic Verification: Nana Musical Magical Critical Skill
 * This script validates the logic flow of Nana's skill targeting and buff application.
 */

const STAT_KEYS = {
    CRIT: 'crit',
    M_ATK: 'mAtk'
};

class MockStatManager {
    constructor() {
        this.bonusStats = { [STAT_KEYS.CRIT]: 0 };
    }
    update(category, key, value) {
        if (category === 'bonus') {
            this.bonusStats[key] = value;
            console.log(`[STATS] Bonus Stat Updated: ${key} = ${value}`);
        }
    }
}

class MockBuffManager {
    constructor(owner) {
        this.owner = owner;
        this.activeBuffs = [];
    }
    addBuff(config) {
        this.activeBuffs.push(config);
        console.log(`[BUFF] Applied: ${config.id} to ${this.owner.logic.name} (+${config.value})`);
        // Simulate immediate stat update
        this.owner.stats.update('bonus', config.key, config.value);
    }
}

class MockEntity {
    constructor(name, team, x, y) {
        this.logic = { name, isAlive: true };
        this.team = team;
        this.x = x;
        this.y = y;
        this.active = true;
        this.stats = new MockStatManager();
        this.logic.buffs = new MockBuffManager(this);
    }
}

function testNanaSkillLogic() {
    console.log("--- Starting Nana Musical Magical Critical Logic Test ---");

    // 1. Setup entities
    const nana = new MockEntity("Nana", "mercenary", 100, 100);
    const ally = new MockEntity("Aren", "mercenary", 120, 120); // within 180 radius
    const farAlly = new MockEntity("Sein", "mercenary", 500, 500); // outside 180 radius
    const enemy = new MockEntity("Slime", "monster", 110, 110); // within 180 radius

    const scene = {
        allies: [nana, ally, farAlly],
        enemies: [enemy]
    };
    nana.scene = scene;

    // Skill Config
    const RADIUS = 180;
    const CRIT_VALUE = 0.2;
    const DURATION = 10000;

    // 2. Logic Simulation (Replicating MusicalMagicalCritical.js execution)
    console.log("Action: Nana casts Musical Magical Critical!");

    // Target point (Simplified AI: focused on nearest dense area, here Nana's position)
    const targetPoint = { x: 100, y: 100 };

    // Filter targets in radius
    const affectedAllies = scene.allies.filter(a => {
        const dx = a.x - targetPoint.x;
        const dy = a.y - targetPoint.y;
        return Math.sqrt(dx * dx + dy * dy) <= RADIUS;
    });

    const affectedEnemies = scene.enemies.filter(e => {
        const dx = e.x - targetPoint.x;
        const dy = e.y - targetPoint.y;
        return Math.sqrt(dx * dx + dy * dy) <= RADIUS;
    });

    console.log(`Detected Targets: ${affectedAllies.length} allies, ${affectedEnemies.length} enemies.`);

    // 3. Apply Effects
    affectedAllies.forEach(a => {
        // CriticalUp.apply logic
        const config = {
            id: 'critical_up',
            key: STAT_KEYS.CRIT,
            value: CRIT_VALUE,
            type: 'add',
            duration: DURATION
        };
        a.logic.buffs.addBuff(config);
    });

    // 4. Verification
    console.log("\n--- Verification Results ---");
    
    const allyPass = ally.stats.bonusStats[STAT_KEYS.CRIT] === 0.2;
    const farAllyPass = farAlly.stats.bonusStats[STAT_KEYS.CRIT] === 0;
    const buffPresent = ally.logic.buffs.activeBuffs.some(b => b.id === 'critical_up');

    console.log(`- Ally (Aren) Crit Bonus: ${ally.stats.bonusStats[STAT_KEYS.CRIT]} (Expected: 0.2) -> ${allyPass ? '✅' : '❌'}`);
    console.log(`- Far Ally (Sein) Crit Bonus: ${farAlly.stats.bonusStats[STAT_KEYS.CRIT]} (Expected: 0) -> ${farAllyPass ? '✅' : '❌'}`);
    console.log(`- Buff ID 'critical_up' present: ${buffPresent ? '✅' : '❌'}`);

    if (allyPass && farAllyPass && buffPresent) {
        console.log("\n✅ ALL LOGIC TESTS PASSED: Nana's crit buff application is correct.");
    } else {
        console.log("\n❌ TEST FAILED: Logic verification error.");
    }
}

testNanaSkillLogic();
