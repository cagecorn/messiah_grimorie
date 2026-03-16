import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import aoeManager from '../AOEManager.js';
import Airborne from '../effects/Airborne.js';
import phaserParticleManager from '../../graphics/PhaserParticleManager.js';
import projectileManager from '../ProjectileManager.js';

/**
 * 차지 어택 스킬 (Charge Attack Skill)
 * 역할: [돌진 -> 범위 피해 -> 에어본 연계]
 * 
 * [변경사항]: 유닛 자신을 투사체(HeroDashProjectile)로 만들어 
 * 경로상의 모든 적에게 1차 피해를 입히도록 리팩토링됨.
 */
class ChargeAttack {
    constructor() {
        this.scalingStat = 'atk';
    }
    /**
     * 스킬 실행
     * @param {CombatEntity} owner 시전자
     * @param {object} targetPos 목표 좌표 { x, y }
     */
    execute(owner, targetPos) {
        if (!owner || !targetPos) return;

        Logger.info("SKILL", `${owner.logic.name} casts Charge Attack! (Projectile Mode)`);
        owner.isBusy = true; // [추가] 시전 시작

        // 1. 게이지 초기화
        owner.skillProgress = 0;
        if (owner.hpBar) owner.hpBar.isDirty = true;

        // 2. [변경] 유닛-투사체 시스템 가동
        // - hero_dash 투사체가 아렌을 태우고 날아감
        // - 경로상의 모든 적에게 1.0배 데미지 (관통)
        // - 목적지 도착 시 applyEffect 실행
        projectileManager.fire('hero_dash', owner, targetPos, {
            speed: 1500,
            damageMultiplier: 1.0, 
            damageType: 'physical',
            effectKey: 'charge_attack',
            airborneOnHit: true, // 경로상 적들 에어본 추가
            onComplete: () => {
                this.applyEffect(owner, targetPos);
                owner.isBusy = false; // [추가] 시전 종료 (차지 어택은 즉시 해제)
            }
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

        // 시각적 피드백 (화면 흔들림 + 먼지 효과)
        if (phaserParticleManager.spawnWhiteDust) {
            phaserParticleManager.spawnWhiteDust(pos.x, pos.y);
        }

        if (owner.scene && owner.scene.cameras.main) {
            // owner.scene.cameras.main.shake(150, 0.005); // [USER 요청] 카메라 쉐이크 비활성화
        }
    }
}

const chargeAttack = new ChargeAttack();
export default chargeAttack;
