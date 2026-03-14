import Logger from '../../../utils/Logger.js';
import projectileManager from '../ProjectileManager.js';

/**
 * 수면 방울 (Sleeping Bubble)
 * 역할: [세이렌 강화 스킬 - 광역 공격 및 수면]
 */
class SleepingBubble {
    execute(owner, target) {
        if (!owner || !target) return;

        Logger.info("SKILL", `${owner.logic.name} uses Sleeping Bubble!`);
        
        // 게이지 초기화
        owner.skillProgress = 0;
        if (owner.hpBar) owner.hpBar.isDirty = true;

        if (projectileManager.fire) {
            projectileManager.fire('aqua_burst', owner, target, {
                damageMultiplier: 1.5,
                isSleeping: true
            });
        }
    }
}

const sleepingBubble = new SleepingBubble();
export default sleepingBubble;
