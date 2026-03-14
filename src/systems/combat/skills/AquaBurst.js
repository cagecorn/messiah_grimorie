import Logger from '../../../utils/Logger.js';
import projectileManager from '../ProjectileManager.js';

/**
 * 아쿠아 버스트 (Aqua Burst)
 * 역할: [세이렌 전용 스킬 - 광역 마법 공격]
 */
class AquaBurst {
    constructor() {
        this.scalingStat = 'mAtk';
    }
    execute(owner, target) {
        if (!owner || !target) return;

        Logger.info("SKILL", `${owner.logic.name} uses Aqua Burst!`);
        
        // 게이지 초기화
        owner.skillProgress = 0;
        if (owner.hpBar) owner.hpBar.isDirty = true;

        // 투사체 발사 (projectileManager 활용 또는 직접 생성)
        // 여기서는 직접 projectileManager.fire('aqua_burst', ...) 호출 가정
        if (projectileManager.fire) {
            projectileManager.fire('aqua_burst', owner, target, {
                damageMultiplier: 1.5,
                isSleeping: false
            });
        }
    }
}

const aquaBurst = new AquaBurst();
export default aquaBurst;
