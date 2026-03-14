import Logger from '../../../utils/Logger.js';
import animationManager from '../../graphics/AnimationManager.js';
import soundManager from '../../SoundManager.js';
import { BONUS_STATS } from '../../../core/TechnicalConstants.js';

/**
 * 스톤 스킨 (Stone Skin)
 * 역할: [시전자 자신에게 일시적으로 데미지 감소 버프 부여]
 */
class StoneSkin {
    /**
     * 스킬 실행
     * @param {CombatEntity} owner 시전자
     */
    execute(owner) {
        if (!owner || !owner.active) return;

        Logger.info("SKILL", `[Silvi] Stone Skin activated!`);

        // 1. 데미지 감소 버프 적용 (25% 감소 = 0.25)
        // TechnicalConstants의 BONUS_STATS.DR 사용
        const drValue = 0.25; 
        const duration = 5000; // 5초

        if (owner.buffs) {
            owner.buffs.addBuff({
                id: 'stoneskin',
                key: BONUS_STATS.DR,
                value: drValue,
                type: 'add',
                duration: duration
            });
        }

        // 2. 시각 효과 연출 (오버랩 풀링 VFX - AnimationManager 위임)
        animationManager.playStoneSkinOverlay(owner, duration);

        // 3. SE 재생
        soundManager.playStoneSkin();
    }
}

const stoneSkin = new StoneSkin();
export default stoneSkin;
