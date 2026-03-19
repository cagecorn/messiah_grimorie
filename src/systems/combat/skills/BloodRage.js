import Logger from '../../../utils/Logger.js';
import BloodRageATK from '../effects/BloodRageATK.js';
import BloodRageAtkSpd from '../effects/BloodRageAtkSpd.js';
import BloodRageLifesteal from '../effects/BloodRageLifesteal.js';
import fxManager from '../../graphics/FXManager.js';

/**
 * 스킬: 블러드 레이지 (Blood Rage)
 * 역할: [킹 전용 자가 강화 스킬]
 */
class BloodRage {
    constructor() {
        this.id = 'BloodRage';
        this.cooldown = 15000; // 15초
    }

    /**
     * 스킬 실행
     */
    execute(attacker) {
        if (!attacker || !attacker.logic.isAlive) return;

        Logger.info("SKILL", `${attacker.logic.name} activates BLOOD RAGE!`);

        const duration = 8000; // 8초 지속

        // 1. 3중 버프 적용 (확장성 고려 개별 클래스 호출)
        BloodRageATK.apply(attacker, duration, 1.0);       // 공증 100%
        BloodRageAtkSpd.apply(attacker, duration, 0.5);    // 공속 50%
        BloodRageLifesteal.apply(attacker, duration, 0.5); // 피해흡혈 50% [FIX]

        // 2. 시각 효과 출력
        if (fxManager.showSkillEffect) {
            fxManager.showSkillEffect(attacker, 'blood_rage');
        }
    }
}

const bloodRage = new BloodRage();
export default bloodRage;
