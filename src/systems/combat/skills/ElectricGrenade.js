import Logger from '../../../utils/Logger.js';
import projectileManager from '../ProjectileManager.js';
import ElectricGrenadeAI from './ElectricGrenadeAI.js';

/**
 * 레오나 스킬: 전기 수류탄 (Electric Grenade)
 * 역할: [가장 밀집된 지역에 수류탄 투척 + 범위 감전 피해]
 */
class ElectricGrenade {
    constructor() {
        this.id = 'ElectricGrenade';
        this.name = 'Electric Grenade';
        this.atkMultiplier = 1.8; // 물리 공격력 계수
        this.scalingStat = 'atk';
    }

    /**
     * 스킬 실행
     */
    execute(owner) {
        if (!owner) return;

        // 1. 밀집 지역 타겟팅
        const targetPoint = ElectricGrenadeAI.decideGrenadeTarget(owner);
        if (!targetPoint) return false;

        Logger.info("SKILL", `[Leona] Electric Grenade tossed at (${Math.round(targetPoint.x)}, ${Math.round(targetPoint.y)})!`);

        // 2. 투사체 발사 (electric_grenade)
        projectileManager.fire('electric_grenade', owner, targetPoint, {
            damageMultiplier: this.atkMultiplier,
            radius: 120,
            attribute: 'lightning',
            isUltimate: false
        });

        return true;
    }
}

const electricGrenade = new ElectricGrenade();
export default electricGrenade;
