import Logger from '../../../utils/Logger.js';
import ultimateCutsceneManager from '../../../ui/UltimateCutsceneManager.js';
import transformationManager from '../TransformationManager.js';
import { ENTITY_CLASSES } from '../../../core/EntityConstants.js';

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

        // 3. 광기 버프 (공격력 및 공격속도 대폭 증가)
        if (owner.logic.buffs) {
            owner.logic.buffs.addBuff({
                id: 'nana_madness',
                key: 'atk',
                value: 40, // 공격력 +40
                type: 'add',
                duration: this.duration
            });
            
            owner.logic.buffs.addBuff({
                id: 'nana_atk_speed',
                key: 'atkSpd',
                value: 0.5, // 공속 +0.5
                type: 'add',
                duration: this.duration
            });
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
