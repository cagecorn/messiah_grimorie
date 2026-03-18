import poolingManager from '../../../core/PoolingManager.js';

/**
 * 스페셜 애니메이터 (Special Animator)
 * 역할: [소환, 폭발, 궁극기 등 특수 연출 전담]
 */
class SpecialAnimator {
    constructor(animationManager) {
        this.am = animationManager;
    }

    get scene() { return this.am.scene; }

    /**
     * 수호천사 소환
     */
    playGuardianAngelSummonVFX(x, y) {
        if (!this.scene) return;
        const verticalOffset = -80;
        for (let i = 0; i < 6; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                const fx = poolingManager.get('summon_guardian_angel_fx');
                if (fx) fx.show(x, y + verticalOffset, { scale: 3.0, alpha: 0.7, duration: 1500 });
            });
        }
    }

    /**
     * 수호천사 강화
     */
    playGuardianAngelUpgradeVFX(target, tint) {
        if (!this.scene || !target || !target.active) return;
        const verticalOffset = -100;
        for (let i = 0; i < 4; i++) {
            this.scene.time.delayedCall(i * 80, () => {
                if (!target || !target.active) return;
                const fx = poolingManager.get('summon_guardian_angel_fx');
                if (fx) fx.show(target.x, target.y + verticalOffset, { scale: 4.5, alpha: 0.8, duration: 1000, tint: tint });
            });
        }
    }

    /**
     * 거대 폭발 (메테오 등)
     */
    playExplosion(x, y, scale = 1.0) {
        if (!this.scene) return;
        const fx = poolingManager.get('explosion_fx');
        if (fx) fx.show(x, y, { scale: scale });
    }

    /**
     * 아쿠아 익스플로전 (사이렌)
     */
    playAquaExplosion(x, y) {
        if (!this.scene) return;
        for (let i = 0; i < 3; i++) {
            this.scene.time.delayedCall(i * 100, () => {
                const effect = poolingManager.get('aqua_explosion_fx');
                if (effect) effect.show(x, y);
            });
        }
    }

    /**
     * 파이어 익스플로전 (고블린 위자드 등)
     */
    playFireExplosion(x, y) {
        if (!this.scene) return;
        for (let i = 0; i < 4; i++) {
            this.scene.time.delayedCall(i * 80, () => {
                const effect = poolingManager.get('fire_explosion_fx');
                if (effect) effect.show(x, y, { scale: 1.2 + (i * 0.2) });
            });
        }
    }

    /**
     * 아이스 익스플로전 (아이나)
     */
    playIceExplosion(x, y) {
        if (!this.scene) return;
        // 얼음 파편이 튀는 느낌을 위해 3단계 레이어로 구성
        for (let i = 0; i < 3; i++) {
            this.scene.time.delayedCall(i * 90, () => {
                const effect = poolingManager.get('ice_explosion_fx');
                if (effect) effect.show(x, y, { 
                    scale: 1.0 + (i * 0.3),
                    duration: 400 + (i * 100)
                });
            });
        }
    }

    /**
     * 낙하 충격 이펙트 (몬스터 던지기)
     */
    playFallingImpact(x, y) {
        if (!this.scene) return;
        this.am.playFallingImpact(x, y);
    }
}

export default SpecialAnimator;
