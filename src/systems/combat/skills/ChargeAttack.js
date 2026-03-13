import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import aoeManager from '../AOEManager.js';
import Airborne from '../effects/Airborne.js';
import animationManager from '../../graphics/AnimationManager.js';

/**
 * 차지 어택 스킬 (Charge Attack Skill)
 * 역할: [돌진 -> 범위 피해 -> 에어본 연계]
 */
class ChargeAttack {
    /**
     * 스킬 실행
     * @param {CombatEntity} owner 시전자
     * @param {object} targetPos 목표 좌표 { x, y }
     */
    execute(owner, targetPos) {
        if (!owner || !targetPos) return;

        Logger.info("SKILL", `${owner.logic.name} casts Charge Attack!`);

        // 1. 게이지 초기화
        owner.skillProgress = 0;
        if (owner.hpBar) owner.hpBar.isDirty = true;

        // 2. 돌진 애니메이션 실행 (AnimationManager 활용 예정)
        // playSkillDash는 AOE 시점인 onComplete를 인자로 받음
        animationManager.playSkillDash(owner, targetPos, () => {
            this.applyEffect(owner, targetPos);
        });
    }

    /**
     * 도착 시 이펙트 적용
     */
    applyEffect(owner, pos) {
        // 3. AOE 데미지 판정 (1.8배)
        aoeManager.applyAOEDamagingEffect(
            owner, 
            pos.x, 
            pos.y, 
            120, // 반경 120px
            1.8, // 계수 1.8x
            'physical', 
            (hitTarget) => {
                // 4. 에어본 적용 (관성 포함)
                Airborne.apply(hitTarget, 1000, 160, owner);
            }
        );

        // 시각적 피드백 (화면 흔들림 등 필요 시 추가)
        if (owner.scene && owner.scene.cameras.main) {
            owner.scene.cameras.main.shake(150, 0.005);
        }
    }
}

const chargeAttack = new ChargeAttack();
export default chargeAttack;
