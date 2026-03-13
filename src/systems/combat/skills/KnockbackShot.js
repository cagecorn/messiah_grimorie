import Logger from '../../../utils/Logger.js';
import projectileManager from '../ProjectileManager.js';
import soundManager from '../../SoundManager.js';

/**
 * 엘라 스킬: 넉백 샷 (Knockback Shot)
 * 역할: [관통형 투사체 발사 + 광역 넉백 + 물리 데미지]
 */
class KnockbackShot {
    constructor() {
        this.id = 'knockback_shot';
        this.name = 'Knockback Shot';
        this.description = 'Fires a penetrating arrow that knocks back all enemies in its path.';
        this.cooldown = 8000; // 8초
        this.damageMultiplier = 1.5;
    }

    /**
     * 스킬 실행
     * @param {CombatEntity} owner 시전자
     * @param {CombatEntity} target 타겟 (방향용)
     */
    execute(owner, target) {
        if (!owner || !target) return;

        Logger.info("SKILL", `[Ella] Knockback Shot!`);

        // 1. 사운드 재생
        soundManager.playSound('arrow_1');

        // 2. 투사체 발사 (Router 활용)
        // 넉백샷 투사체는 내부적으로 update()에서 관통 충돌을 체크함
        projectileManager.fire('knockback_shot', owner, target, {
            damageMultiplier: this.damageMultiplier,
            speed: 900 // 약간 더 빠른 속도
        });
    }
}

const knockbackShot = new KnockbackShot();
export default knockbackShot;
