import Logger from '../../utils/Logger.js';
import healthBarManager from './HealthBarManager.js';
import damageTextManager from './DamageTextManager.js';
import animationManager from './AnimationManager.js';
import shadowManager from './ShadowManager.js';
import phaserParticleManager from './PhaserParticleManager.js';

/**
 * FX 매니저 (FX Manager)
 * 역할: [전문화된 시각 효과 유닛들을 총괄하는 컨트롤 타워]
 * 
 * 설명: HP바, 데미지 텍스트, 상태 아이콘 등 전장에서 발생하는 
 * 모든 '동적 연출 요소를 풀링하고 업데이트합니다.
 */
class FXManager {
    constructor() {
        this.isInitialized = false;
        this.scene = null;
    }

    /**
     * 매니저 초기화 및 하위 매니저 연동
     */
    init(scene) {
        this.scene = scene;
        
        // 1. 하위 매니저 초기화
        healthBarManager.init(scene);
        damageTextManager.init(scene);
        shadowManager.init(scene);
        
        this.isInitialized = true;
        Logger.system("FXManager: Central Command Tower initialized.");
    }

    /**
     * 데미지 텍스트 출력 요청
     */
    showDamageText(x, y, amount, type) {
        if (!this.isInitialized) return;
        damageTextManager.showDamage(x, y, amount, type);
    }

    /**
     * 피격 이펙트 출력 요청
     */
    showImpactEffect(target, type) {
        if (!this.isInitialized) return;
        animationManager.playHitEffect(target, type);
    }

    /**
     * 회복 이펙트 출력 요청 (신규)
     */
    showHealEffect(target) {
        if (!this.isInitialized) return;
        animationManager.playHealingEffect(target);
    }

    /**
     * 바드 영감 효과 출력 요청 (신규)
     */
    showInspirationEffect(target) {
        if (!this.isInitialized) return;
        animationManager.playInspirationEffect(target);
    }

    /**
     * 바드 수호의 노래 효과 출력 요청 (신규)
     */
    showSongOfProtectionEffect(owner) {
        if (!this.isInitialized) return;
        animationManager.playSongOfProtectionEffect(owner);
    }

    /**
     * 쉴드 보호막 오버레이 출력 요청 (신규)
     */
    showShieldOverlay(target, duration) {
        if (!this.isInitialized) return;
        animationManager.playShieldOverlay(target, duration);
    }

    /**
     * 아쿠아 폭발 효과 출력 (소환수 세이렌 스킬용)
     */
    showAquaExplosion(x, y) {
        if (!this.isInitialized) return;
        animationManager.playAquaExplosion(x, y);
    }

    /**
     * 수면 상태 시각 효과 (ZZZ 파티클)
     */
    showSleepEffect(target, duration) {
        if (!this.isInitialized || !target) return;
        phaserParticleManager.startSleepEffect(target.x, target.y - 60, duration);
    }

    /**
     * 광역 힐 시각 효과 출력 (세라 중심 써클)
     */
    showMassHealCircle(owner) {
        if (!this.isInitialized) return;
        animationManager.playMassHealEffect(owner);
    }

    /**
     * [신규] 유닛 피격 시 빨갛게 번쩍이는 효과
     * @param {CombatEntity} target 
     */
    flashRed(target) {
        if (!this.isInitialized || !target || !target.sprite) return;

        // 이미 틴트 중이라면 중복 방지 (선택 사항)
        target.sprite.setTint(0xff0000); // 완전한 빨강
        
        this.scene.time.delayedCall(100, () => {
            if (target && target.sprite) {
                target.sprite.clearTint();
            }
        });
    }

    /**
     * 엔티티에 시각적 요소 부착
     */
    attachHUD(entity) {
        if (!this.isInitialized) return;
        
        // [중요] 기존 HUD가 있다면 먼저 제거하여 중복 생성 방지
        if (entity.hpBar) {
            this.detachHUD(entity);
        }
        
        // HP바 생성 및 부착
        const hpBar = healthBarManager.createBar(entity);
        entity.hpBar = hpBar;
    }

    /**
     * 엔티티에서 시각적 요소 제거
     */
    detachHUD(entity) {
        if (entity.hpBar) {
            healthBarManager.releaseBar(entity.hpBar);
            entity.hpBar = null;
        }
    }

    /**
     * 전체 FX 시스템 업데이트
     */
    update(time, delta) {
        if (!this.isInitialized) return;
        
        // HP바 업데이트 (위치 + 렌더링)
        healthBarManager.update(delta);

        // 지속성 시각 효과 업데이트 (쉴드 오버레이 추적 등)
        animationManager.update(delta);
    }
}

const fxManager = new FXManager();
export default fxManager;
