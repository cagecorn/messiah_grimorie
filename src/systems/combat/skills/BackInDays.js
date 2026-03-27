import Logger from '../../../utils/Logger.js';
import transformationManager from '../../TransformationManager.js';
import BloodRageATK from '../effects/BloodRageATK.js';
import BloodRageAtkSpd from '../effects/BloodRageAtkSpd.js';
import MovementSpeedUp from '../effects/MovementSpeedUp.js';

/**
 * 왕년엔 말이야... (Back In the Days)
 * 역할: [니클의 궁극기 - 전성기 시절의 외형과 힘을 일시적으로 복구]
 * 효과: 
 * 1. 스프라이트 변경 (nickle_ultimate_sprite)
 * 2. 공격력, 공격속도, 이동속도 대폭 증가
 * 3. 투사체 발사 수 증가 (RapidFire 메커니즘 활용)
 */
class BackInDays {
    constructor() {
        this.id = 'BackInDays';
        this.name = 'Back In the Days';
        this.duration = 15000; // 15초
    }

    execute(owner) {
        if (!owner || !owner.active) return false;

        Logger.info("ULTIMATE", `[Nickle] BACK IN THE DAYS activated!`);

        // 1. 변신 실행 (TransformationManager 활용)
        transformationManager.transform(owner, {
            spriteKey: 'nickle_ultimate_sprite',
            duration: this.duration
        });

        // 2. 버프 적용 (기존 효과 클래스 활용)
        BloodRageATK.apply(owner, this.duration, 0.8);      // 공격력 80% 증가
        BloodRageAtkSpd.apply(owner, this.duration, 0.5);   // 공격 속도 50% 증가
        MovementSpeedUp.apply(owner, this.duration, 50);    // 이동 속도 50 고정치 증가

        // 3. 투사체 숫자 증가 버프 (CombatManager에서 체크할 특수 ID)
        if (owner.logic.buffs) {
            owner.logic.buffs.addBuff({
                id: 'rapid_fire', // 기존 rapid_fire 로직 재활용
                key: 'none',
                value: 0,
                type: 'add',
                duration: this.duration
            });
        }

        // 시각적 피드백: 화면 흔들림 또는 슬로우 모션 등 (필요 시 추가)
        if (owner.scene && owner.scene.cameras) {
            owner.scene.cameras.main.shake(200, 0.01);
        }

        return true;
    }
}

const backInDays = new BackInDays();
export default backInDays;
