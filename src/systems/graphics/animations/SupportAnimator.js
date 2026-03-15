import poolingManager from '../../../core/PoolingManager.js';
import phaserParticleManager from '../PhaserParticleManager.js';

/**
 * 서포트 애니메이터 (Support Animator)
 * 역할: [힐링, 버프, 실드 등 아군 지원 연출 전담]
 */
class SupportAnimator {
    constructor(animationManager) {
        this.am = animationManager;
    }

    get scene() { return this.am.scene; }

    /**
     * 힐러 평타 힐링 이펙트
     */
    playHealingEffect(target) {
        if (!this.scene || !target || !target.active) return;
        
        for (let i = 0; i < 6; i++) {
            this.scene.time.delayedCall(i * 50, () => {
                if (!target || !target.active) return;
                const effect = poolingManager.get('healing_effect');
                if (effect) effect.show(target);
            });
        }

        if (phaserParticleManager.spawnHealBurst) {
            phaserParticleManager.spawnHealBurst(target.x, target.y - 20);
        }
    }

    /**
     * 매스 힐 써클 효과
     */
    playMassHealEffect(owner) {
        if (!this.scene || !owner || !owner.active) return;

        const layers = [
            { scale: 1.0, alpha: 0.6, rotateSpeed: 360, startAngle: 0 },
            { scale: 1.2, alpha: 0.4, rotateSpeed: -480, startAngle: 45 },
            { scale: 0.8, alpha: 0.3, rotateSpeed: 720, startAngle: 90 }
        ];

        layers.forEach(cfg => {
            const fx = poolingManager.get('mass_heal_circle');
            if (fx) fx.show(owner, cfg);
        });
    }

    /**
     * 바드 영감 버프
     */
    playInspirationEffect(target) {
        if (!this.scene || !target || !target.active) return;
        const effect = poolingManager.get('inspiration_effect');
        if (effect) effect.show(target);
    }

    /**
     * 바드 수호의 노래
     */
    playSongOfProtectionEffect(owner) {
        if (!this.scene || !owner || !owner.active) return;
        
        for (let i = 0; i < 4; i++) {
            this.scene.time.delayedCall(i * 200, () => {
                if (!owner || !owner.active) return;
                const fx = poolingManager.get('song_of_protection_fx');
                if (fx) fx.show(owner);
            });
        }
    }

    /**
     * 쉴드/보호막 오버레이
     */
    playShieldOverlay(target, duration) {
        if (!this.scene || !target || !target.active) return;
        const effect = poolingManager.get('shield_overlay_fx');
        if (effect) {
            effect.show(target, duration);
            this.am.activePersistentEffects.add(effect);
        }
    }

    /**
     * 스톤 스킨 오버레이
     */
    playStoneSkinOverlay(target, duration) {
        if (!this.scene || !target || !target.active) return;
        const effect = poolingManager.get('stone_skin_overlay_fx');
        if (effect) {
            effect.show(target, duration);
            this.am.activePersistentEffects.add(effect);
        }
    }
}

export default SupportAnimator;
