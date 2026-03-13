import Logger from '../../../utils/Logger.js';

/**
 * 넉백 효과 (Knockback Effect)
 * 역할: [피격 대상을 뒤로 밀쳐내며 무력화]
 */
class Knockback {
    /**
     * @param {CombatEntity} target 대상 유닛
     * @param {number} distance 밀려날 거리 (px)
     * @param {number} duration 지속 시간 (ms)
     * @param {CombatEntity} source 원인 제공자 (방향 계산용)
     */
    static apply(target, distance = 100, duration = 300, source = null) {
        if (!target || !target.active || !target.logic.isAlive) return;

        // 1. 상태 설정 (행동 불가)
        if (target.status) {
            target.status.applyEffect('knockback', duration);
        }

        const scene = target.scene;
        
        // 2. 방향 계산
        let dx = 0;
        let dy = 0;

        if (source) {
            const angle = Math.atan2(target.y - source.y, target.x - source.x);
            dx = Math.cos(angle) * distance;
            dy = Math.sin(angle) * distance;
        } else {
            // 원인이 없으면 현재 바라보는 반대 방향으로 임의 넉백 (기본값)
            dx = target.sprite.flipX ? -distance : distance;
        }

        // 3. 물리 연출 (Tween)
        // [Compatibility] Airborne 시스템과 겹쳐도 x, y 축만 건드리므로 zHeight 연출과 독립적임.
        scene.tweens.add({
            targets: target,
            x: target.x + dx,
            y: target.y + dy,
            duration: duration,
            ease: 'Cubic.out',
            onComplete: () => {
                Logger.info("CC", `${target.logic.name} finished knockback.`);
            }
        });

        // 살짝 비틀거리는 연출
        const tiltAngle = dx > 0 ? 10 : -10;
        scene.tweens.add({
            targets: target.sprite,
            angle: tiltAngle,
            duration: duration * 0.5,
            yoyo: true,
            ease: 'Quad.out'
        });
    }
}

export default Knockback;
