import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import poolingManager from '../../core/PoolingManager.js';
import phaserParticleManager from './PhaserParticleManager.js';
import ghostManager from './GhostManager.js';

// [신규 모듈화된 애니메이터들]
import SupportAnimator from './animations/SupportAnimator.js';
import SpecialAnimator from './animations/SpecialAnimator.js';
import CombatAnimator from './animations/CombatAnimator.js';
import StateAnimator from './animations/StateAnimator.js';

// [이펙트 풀링 객체들]
import PooledHitEffect from './effects/PooledHitEffect.js';
import PooledSkillEffect from './effects/PooledSkillEffect.js';
import PooledHealingEffect from './effects/PooledHealingEffect.js';
import PooledMassHealCircle from './effects/PooledMassHealCircle.js';
import PooledSummonEffect from './effects/PooledSummonEffect.js';
import PooledExplosion from './effects/PooledExplosion.js';
import PooledInspiration from './effects/PooledInspiration.js';
import PooledSongOfProtection from './effects/PooledSongOfProtection.js';
import PooledShieldEffect from './effects/PooledShieldEffect.js';
import PooledAquaExplosion from './effects/PooledAquaExplosion.js';
import PooledFireExplosion from './effects/PooledFireExplosion.js';
import PooledStoneSkinEffect from './effects/PooledStoneSkinEffect.js';

/**
 * 애니메이션 매니저 (Animation Manager)
 * 역할: [유닛의 역동적인 연출 로직 담당 - 퍼사드 패턴]
 * 
 * 🦖 거대한 갓 오브젝트를 길들이는 꼼수 준수:
 * 1. 물리적 모듈화 (Specialized Animators 분리)
 * 2. 퍼사드(Facade): 외부에는 동일한 인터페이스 유지
 */
class AnimationManager {
    constructor() {
        this.scene = null;
        this.activePersistentEffects = new Set();
        
        // 도메인별 애니메이터 인스턴스
        this.support = new SupportAnimator(this);
        this.special = new SpecialAnimator(this);
        this.combat = new CombatAnimator(this);
        this.state = new StateAnimator(this);
    }

    //#region 🛠️ [초기화 세션]
    init(scene) {
        this.scene = scene;

        // [이펙트 풀 등록 통합 관리]
        poolingManager.registerPool('impact_effect', () => new PooledHitEffect(this.scene), 50, true);
        poolingManager.registerPool('charge_attack_fx', () => new PooledSkillEffect(this.scene, 'charge_attack'), 5, true);
        poolingManager.registerPool('for_messiah_pillar', () => new PooledSkillEffect(this.scene, 'for_messiah'), 3, true);
        poolingManager.registerPool('healing_effect', () => new PooledHealingEffect(this.scene), 60, true);
        poolingManager.registerPool('mass_heal_circle', () => new PooledMassHealCircle(this.scene), 20, true);
        poolingManager.registerPool('summon_guardian_angel_fx', () => new PooledSummonEffect(this.scene), 30, true);
        poolingManager.registerPool('explosion_fx', () => new PooledExplosion(this.scene), 20, true);
        poolingManager.registerPool('inspiration_effect', () => new PooledInspiration(this.scene), 20, true);
        poolingManager.registerPool('song_of_protection_fx', () => new PooledSongOfProtection(this.scene), 5, true);
        poolingManager.registerPool('shield_overlay_fx', () => new PooledShieldEffect(this.scene), 20, true);
        poolingManager.registerPool('aqua_explosion_fx', () => new PooledAquaExplosion(this.scene), 10, true);
        poolingManager.registerPool('fire_explosion_fx', () => new PooledFireExplosion(this.scene), 20, true);
        poolingManager.registerPool('stone_skin_overlay_fx', () => new PooledStoneSkinEffect(this.scene), 5, true);

        Logger.system("AnimationManager: Facade ready with Modular Animators.");
    }
    //#endregion

    //#region 🔌 [퍼사드 인터페이스 (위임)]
    // 💚 Support
    playHealingEffect(target) { this.support.playHealingEffect(target); }
    playMassHealEffect(owner) { this.support.playMassHealEffect(owner); }
    playInspirationEffect(target) { this.support.playInspirationEffect(target); }
    playSongOfProtectionEffect(owner) { this.support.playSongOfProtectionEffect(owner); }
    playShieldOverlay(target, duration) { this.support.playShieldOverlay(target, duration); }
    playStoneSkinOverlay(target, duration) { this.support.playStoneSkinOverlay(target, duration); }

    // 👼 Special
    playGuardianAngelSummonVFX(x, y) { this.special.playGuardianAngelSummonVFX(x, y); }
    playGuardianAngelUpgradeVFX(target, tint) { this.special.playGuardianAngelUpgradeVFX(target, tint); }
    playExplosion(x, y, scale) { this.special.playExplosion(x, y, scale); }
    playAquaExplosion(x, y) { this.special.playAquaExplosion(x, y); }
    playFireExplosion(x, y) { this.special.playFireExplosion(x, y); }

    // ⚔️ Combat
    playHitEffect(target, type) { this.combat.playHitEffect(target, type); }
    playSkillDash(entity, targetPos, onComplete) { this.combat.playSkillDash(entity, targetPos, onComplete); }
    playRollAnimation(entity, duration) { this.combat.playRollAnimation(entity, duration); }
    playDashAttack(entity, target, onHit) { this.combat.playDashAttack(entity, target, onHit); }

    // 💀 State
    playDeathAnimation(entity, onComplete) { this.state.playDeathAnimation(entity, onComplete); }
    playIdleBobbing(entity, className) { this.state.playIdleBobbing(entity, className); }
    stopIdleBobbing(entity) { this.state.stopIdleBobbing(entity); }
    //#endregion

    /**
     * 매 프레임 지속 효과 업데이트 (위치 추적 등)
     */
    update(delta) {
        if (this.activePersistentEffects.size === 0) return;
        this.activePersistentEffects.forEach(effect => {
            if (effect.active) {
                effect.update(delta);
            } else {
                this.activePersistentEffects.delete(effect);
            }
        });
    }
}

const animationManager = new AnimationManager();
export default animationManager;
