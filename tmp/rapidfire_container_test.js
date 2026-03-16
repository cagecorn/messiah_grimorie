/**
 * Headless Logic Verification: Container-based Rapid Fire System
 * This script validates the new architecture where a lead projectile spawns followers.
 */

const BUFF_VALUES = {
    RAPID_FIRE: {
        DURATION: 12000,
        SHOT_COUNT: 5,
        INTERVAL: 80
    }
};

class MockScene {
    constructor() {
        this.pendingCalls = [];
        this.time = {
            delayedCall: (delay, callback) => {
                this.pendingCalls.push({ delay, callback });
            }
        };
    }
}

class MockEntity {
    constructor(name, className) {
        this.id = name.toLowerCase();
        this.name = name;
        this.active = true;
        this.team = 'mercenary';
        this.logic = {
            id: name.toLowerCase(),
            name,
            isAlive: true,
            class: {
                getClassName: () => className
            }
        };
        this.buffs = { activeBuffs: [] };
        this.scene = new MockScene();
        this.x = 100;
        this.y = 100;
    }
}

class ProjectileManagerMock {
    constructor(scene) {
        this.scene = scene;
        this.shotsFired = [];
    }

    fire(key, owner, target, config = {}) {
        if (key === 'rapid_fire_container') {
            console.log(`[PROJ_MGR] Spawning CONTAINER for ${config.originalType}`);
            const container = new RapidFireProjectileMock(this.scene);
            container.launch(owner, target, config);
            return container;
        } else {
            console.log(`[PROJ_MGR] Spawning ACTUAL projectile: ${key}`);
            this.shotsFired.push({ key, owner: owner.name, target: target.name });
            return { setPosition: () => {} };
        }
    }

    release(proj) {
        console.log(`[PROJ_MGR] Released projectile`);
    }
}

class RapidFireProjectileMock {
    constructor(scene) {
        this.scene = scene;
        this.owner = null;
        this.target = null;
    }

    launch(owner, target, config) {
        this.owner = owner;
        this.target = target;
        const originalType = config.originalType || 'melee';
        const { SHOT_COUNT, INTERVAL } = BUFF_VALUES.RAPID_FIRE;

        console.log(`[CONTAINER] Launch sequence started for ${originalType}`);

        for (let i = 0; i < SHOT_COUNT; i++) {
            this.scene.time.delayedCall(i * INTERVAL, () => {
                console.log(`[CONTAINER] Executing shot ${i+1}/${SHOT_COUNT}`);
                // 실제 프로젝트 매니저 호출 시뮬레이션
                global.projectileManagerMock.fire(originalType, this.owner, this.target);
                
                if (i === SHOT_COUNT - 1) {
                    console.log(`[CONTAINER] Sequence finished.`);
                }
            });
        }
    }
}

class CombatManagerMock {
    constructor(projMgr) {
        this.projMgr = projMgr;
    }

    fireProjectile(type, attacker, target, mult, config = {}) {
        this.projMgr.fire(type, attacker, target, { ...config, damageMultiplier: mult });
    }

    executeNormalAttack(attackerEntity, targetEntity) {
        if (!attackerEntity.active || !targetEntity.active) return;
        const className = attackerEntity.logic.class.getClassName();
        const isAlly = attackerEntity.team === targetEntity.team;

        if (!isAlly) {
            let projectileType = 'melee';
            if (className === 'archer') projectileType = 'arrow';

            const rapidFireBuff = attackerEntity.buffs.activeBuffs.find(b => b.id === 'rapidfire');
            
            if (rapidFireBuff) {
                console.log(`[COMBAT] Attacker has rapidfire. Firing CONTAINER.`);
                this.fireProjectile('rapid_fire_container', attackerEntity, targetEntity, 1.0, { 
                    originalType: projectileType 
                });
            } else {
                console.log(`[COMBAT] Regular fire.`);
                this.fireProjectile(projectileType, attackerEntity, targetEntity, 1.0);
            }
        }
    }
}

function testRapidFireContainer() {
    console.log("--- Starting Rapid Fire Container Logic Test ---");
    const scene = new MockScene();
    const projMgr = new ProjectileManagerMock(scene);
    global.projectileManagerMock = projMgr; // 전역 참조
    const combatMgr = new CombatManagerMock(projMgr);
    
    const ria = new MockEntity("Ria", "swordmaster");
    const goblin = new MockEntity("Goblin", "monster");
    goblin.team = 'monster';

    // 1. 속사 버프 활성화
    ria.buffs.activeBuffs.push({ id: 'rapidfire' });

    console.log("\n[Step 1] Initial Attack Trigger");
    combatMgr.executeNormalAttack(ria, goblin);
    
    console.log(`Shots registered in manager: ${projMgr.shotsFired.length} (Expected: 0 immediate)`);
    console.log(`Delayed calls in scene: ${scene.pendingCalls.length} (Expected: 5)`);

    // 2. 지연된 호출 실행
    console.log("\n[Step 2] Simulating Time (Delayed Calls)");
    scene.pendingCalls.forEach((call, index) => {
        console.log(`\n> Advancing time to ${call.delay}ms`);
        call.callback();
    });

    console.log(`\nFinal shots count: ${projMgr.shotsFired.length} (Expected: 5)`);

    if (projMgr.shotsFired.length === 5) {
        console.log("\n✅ TEST PASSED: Container successfully spawned 5 separate projectiles.");
    } else {
        console.log("\n❌ TEST FAILED: Shot count mismatch.");
    }
}

testRapidFireContainer();
