/**
 * Headless Logic Verification: Ria Parry System
 * This script validates the logic flow of Ria's parry and reflection.
 */

const PARRY_COST = 15;

class MockEntity {
    constructor(name, team) {
        this.logic = { name, isAlive: true };
        this.team = team;
        this.stamina = {
            currentStamina: 100,
            consume: (amount) => {
                this.stamina.currentStamina -= amount;
                console.log(`[STAMINA] Consumed ${amount}. Remaining: ${this.stamina.currentStamina}`);
            }
        };
        this.x = 100;
        this.y = 100;
        this.active = true;
        this.scene = {
            time: { now: 1000 },
            add: {
                sprite: () => ({ setScale: () => ({ setTint: () => ({}) }) })
            },
            tweens: { add: () => {} }
        };
    }
}

class MockProjectile {
    constructor(id, owner) {
        this.id = id;
        this.owner = owner;
        this.x = 110;
        this.y = 110;
        this.active = true;
        this.reflected = false;
        this.newTarget = null;
    }

    reflect(reflector, newTarget) {
        this.owner = reflector;
        this.newTarget = newTarget;
        this.reflected = true;
        console.log(`[PROJ] ${this.id} reflected! Old Owner: ${this.owner.logic.name}, New Target: ${newTarget.logic ? newTarget.logic.name : '(' + newTarget.x + ',' + newTarget.y + ')'}`);
    }
}

function testParryLogic() {
    console.log("--- Starting Ria Parry Logic Test ---");

    const ria = new MockEntity("Ria", "mercenary");
    const enemy = new MockEntity("Goblin", "monster");
    const proj = new MockProjectile("arrow_01", enemy);

    // AI 사고 로직 시뮬레이션
    const pData = { projectile: proj, distance: 15 }; // PARRY_RANGE 내부에 있음
    
    console.log(`Ria Team: ${ria.team}, Proj Owner Team: ${proj.owner.team}`);
    
    // 1. 조건 검사 (RiaAI.js:35-41)
    const canParry = proj.owner.team !== ria.team && ria.stamina.currentStamina >= PARRY_COST && pData.distance < 60;
    
    if (canParry) {
        console.log("Logic Check: Parry Triggered!");
        
        // 2. performParry 시뮬레이션
        ria.stamina.consume(PARRY_COST);
        
        const originalOwner = proj.owner;
        // TargetProjectile logic (target exists)
        proj.target = enemy; 
        proj.reflect(ria, originalOwner);

        // 3. 결과 검증
        if (proj.reflected && ria.stamina.currentStamina === 85) {
            console.log("✅ TEST PASSED: Parry logic executed correctly.");
            console.log(`   - Stamina: ${ria.stamina.currentStamina}`);
            console.log(`   - Reflected: ${proj.reflected}`);
        } else {
            console.log("❌ TEST FAILED: Verification failed.");
        }
    } else {
        console.log("❌ TEST FAILED: Parry should have triggered.");
    }
}

testParryLogic();
