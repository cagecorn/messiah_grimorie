/**
 * Headless Logic Verification: Rapid Fire System
 * This script validates the multi-shot logic in CombatManager.
 */

const BUFF_VALUES = {
    RAPID_FIRE: {
        DURATION: 12000,
        SHOT_COUNT: 5,
        INTERVAL: 80
    }
};

class MockEntity {
    constructor(name, className) {
        this.name = name;
        this.active = true;
        this.team = 'mercenary';
        this.logic = {
            name,
            isAlive: true,
            class: {
                getClassName: () => className
            }
        };
        this.buffs = {
            activeBuffs: []
        };
        this.scene = {
            time: {
                delayedCall: (delay, callback) => {
                    console.log(`[TIME] Delayed call registered for ${delay}ms`);
                    // 시뮬레이션을 위해 즉시 실행 가능하도록 저장하거나 나중에 수동 호출
                    this.scene.pendingCalls.push({ delay, callback });
                }
            },
            pendingCalls: []
        };
    }
}

class CombatManagerMock {
    constructor() {
        this.shotsFired = [];
    }

    fireProjectile(type, attacker, target, mult) {
        console.log(`[FIRE] ${type} projectile from ${attacker.name} to ${target.name} (Multiplier: ${mult})`);
        this.shotsFired.push({ type, attacker: attacker.name, target: target.name });
    }

    executeNormalAttack(attackerEntity, targetEntity) {
        if (!attackerEntity.active || !targetEntity.active) return;
        if (!attackerEntity.logic.isAlive || !targetEntity.logic.isAlive) return;

        const isAlly = attackerEntity.team === targetEntity.team;
        const className = attackerEntity.logic.class.getClassName();

        if (!isAlly) {
            let projectileType = 'melee';
            if (className === 'healer') projectileType = 'light';
            else if (className === 'wizard') projectileType = 'wizard';
            else if (className === 'archer') projectileType = 'arrow';

            // 첫 번째 발사
            this.fireProjectile(projectileType, attackerEntity, targetEntity, 1.0);

            // [신규] 리아 궁극기: 속사(Rapid Fire) 대응 (모든 클래스 적용)
            const rapidFireBuff = attackerEntity.buffs && attackerEntity.buffs.activeBuffs.find(b => b.id === 'rapidfire' || b.id === 'rapid_fire');
            if (rapidFireBuff) {
                const { SHOT_COUNT, INTERVAL } = BUFF_VALUES.RAPID_FIRE;
                for (let i = 1; i < SHOT_COUNT; i++) {
                    attackerEntity.scene.time.delayedCall(i * INTERVAL, () => {
                        if (attackerEntity.active && targetEntity.active && attackerEntity.logic.isAlive && targetEntity.logic.isAlive) {
                            const currentClass = attackerEntity.logic.class.getClassName();
                            let currentType = 'melee';
                            if (currentClass === 'healer') currentType = 'light';
                            else if (currentClass === 'wizard') currentType = 'wizard';
                            else if (currentClass === 'archer') currentType = 'arrow';

                            this.fireProjectile(currentType, attackerEntity, targetEntity, 1.0);
                        }
                    });
                }
            }
        }
    }
}

function testRapidFire() {
    console.log("--- Starting Rapid Fire Logic Test ---");
    const manager = new CombatManagerMock();
    const ria = new MockEntity("Ria", "swordmaster");
    const goblin = new MockEntity("Goblin", "monster");
    goblin.team = 'monster';

    // 1. 버프가 없을 때 테스트
    console.log("\n[Test 1] Regular Attack (No Buff)");
    manager.executeNormalAttack(ria, goblin);
    console.log(`Shots fired: ${manager.shotsFired.length} (Expected: 1)`);

    // 2. 속사 버프 활성화 후 테스트
    console.log("\n[Test 2] Rapid Fire Attack (With Buff)");
    ria.buffs.activeBuffs.push({ id: 'rapidfire' });
    manager.shotsFired = []; // 초기화
    manager.executeNormalAttack(ria, goblin);

    console.log(`Immediate shots fired: ${manager.shotsFired.length} (Expected: 1)`);
    console.log(`Delayed calls pending: ${ria.scene.pendingCalls.length} (Expected: 4)`);

    // 지연된 호출 실행
    console.log("\n[Simulating Delayed Calls]");
    ria.scene.pendingCalls.forEach(call => call.callback());

    console.log(`Total shots fired: ${manager.shotsFired.length} (Expected: 5)`);

    if (manager.shotsFired.length === 5) {
        console.log("\n✅ TEST PASSED: Rapid fire logic executed correctly.");
    } else {
        console.log("\n❌ TEST FAILED: Shoot count mismatch.");
    }
}

testRapidFire();
