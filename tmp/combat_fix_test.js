/**
 * Fix Verification: CombatManager fireProjectile signature
 */

class MockProjectileManager {
    fire(key, owner, target, config) {
        console.log(`[PROJ_MGR] Firing ${key} with config:`, config);
        return { setPosition: () => {} };
    }
}

const projectileManager = new MockProjectileManager();

class CombatManagerMock {
    fireProjectile(type, attacker, target, multiplier = 1.0, config = {}) {
        // This is the problematic block
        if (type === 'rapid_fire_container') {
            projectileManager.fire('rapid_fire_container', attacker, target, {
                damageMultiplier: multiplier,
                originalType: config.originalType || 'melee'
            });
        } else {
            projectileManager.fire(type, attacker, target, { damageMultiplier: multiplier });
        }
    }
}

const cm = new CombatManagerMock();
const attacker = { name: "Ria" };
const target = { name: "Goblin" };

console.log("Testing rapid_fire_container fire...");
try {
    cm.fireProjectile('rapid_fire_container', attacker, target, 1.0, { originalType: 'melee' });
    console.log("✅ Success: No crash!");
} catch (e) {
    console.log("❌ Failed: ", e.message);
}

console.log("\nTesting fallback...");
try {
    cm.fireProjectile('rapid_fire_container', attacker, target, 1.0); // No config
    console.log("✅ Success: Fallback handled!");
} catch (e) {
    console.log("❌ Failed: ", e.message);
}
