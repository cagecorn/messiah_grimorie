import Logger from '../../../utils/Logger.js';
import ultimateCutsceneManager from '../../../ui/UltimateCutsceneManager.js';
import transformationManager from '../TransformationManager.js';
import { ENTITY_CLASSES } from '../../../core/EntityConstants.js';
import BloodRageATK from '../effects/BloodRageATK.js';
import BloodRageAtkSpd from '../effects/BloodRageAtkSpd.js';
import BloodRageLifesteal from '../effects/BloodRageLifesteal.js';
import CriticalUp from '../effects/CriticalUp.js';
import MovementSpeedUp from '../effects/MovementSpeedUp.js';
import StaminaRegenUp from '../effects/StaminaRegenUp.js';

/**
 * 나나 궁극기: 피를 다오! 크하하하! (Give Me Blood!)
 * 역할: [바드 -> 로그 변신 + 광기 상태 돌입]
 */
class GiveMeBlood {
    constructor() {
        this.id = 'GiveMeBlood';
        this.name = 'Give Me Blood! Hahaha!';
        this.duration = 15000; // 15초 변신
    }

    execute(owner) {
        if (!owner || !owner.logic.isAlive) return;

        Logger.info("ULTIMATE", `[Nana] GIVE ME BLOOD! DARK MODE ACTIVATED.`);

        // 1. 컷씬 연출 (광기 어린 나나 일러스트가 나오면 완벽함)
        ultimateCutsceneManager.show('nana', 'Give Me Blood! Hahaha!');

        // 2. 변신 매니저 호출
        transformationManager.transform(owner, {
            class: ENTITY_CLASSES.ROGUE, // 로그로 클래스 변경 (AI와 평타가 바뀜)
            spriteKey: 'nana_ultimate_sprite', // 붉은 안광의 스프라이트로 변경
            duration: this.duration
        });

        // 3. 광기 버프 (총 6종 버프 강화)
        if (owner.logic.isAlive) {
            const target = owner.logic;
            BloodRageATK.apply(target, this.duration, 1.2);      // 공격력 +120% (강화)
            BloodRageAtkSpd.apply(target, this.duration, 0.6);   // 공격속도 +60%
            BloodRageLifesteal.apply(target, this.duration, 0.3); // 피해 흡혈 30%
            CriticalUp.apply(owner, 0.4, this.duration);         // 치명타 확률 +40%
            MovementSpeedUp.apply(owner, this.duration, 0.5);   // 이동속도 +50%
            StaminaRegenUp.apply(owner, this.duration, 0.8);    // 스태미나 회복 +80%
        }

        // 4. 시각 효과 (붉은 아우라 등)
        if (owner.scene.fxManager) {
            owner.scene.fxManager.showImpactEffect(owner, 'blood');
        }

        return true;
    }
}

const giveMeBlood = new GiveMeBlood();
export default giveMeBlood;
