import Logger from '../../../utils/Logger.js';
import projectileManager from '../ProjectileManager.js';
import FireBurstAI from './FireBurstAI.js';

/**
 * 파이어 버스트 (Fire Burst)
 * 역할: [광역 마법 공격 스킬 - 화염 버젼]
 */
class FireBurst {
    constructor() {
        this.scalingStat = 'mAtk';
    }

    execute(owner) {
        if (!owner) return;

        // AI를 통해 최적의 타겟 지점(적) 선정
        const target = FireBurstAI.decideFireBurstTarget(owner);
        if (!target) {
            Logger.info("SKILL", `${owner.logic.name} wants to use Fire Burst but no target found.`);
            return;
        }

        Logger.info("SKILL", `${owner.logic.name} uses Fire Burst!`);
        
        // 게이지 초기화
        owner.skillProgress = 0;
        if (owner.hpBar) owner.hpBar.isDirty = true;

        // 투사체 발사 (Non-Target)
        if (projectileManager.fire) {
            projectileManager.fire('fire_burst', owner, target, {
                damageMultiplier: 2.0, // 아쿠아버스트보다 강력함
                speed: 650
            });
        }
    }
}

const fireBurst = new FireBurst();
export default fireBurst;
