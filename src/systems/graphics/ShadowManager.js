import measurementManager from '../../core/MeasurementManager.js';
import Logger from '../../utils/Logger.js';
import layerManager from '../../ui/LayerManager.js';
import poolingManager from '../../core/PoolingManager.js';
import EventBus, { EVENTS } from '../../core/EventBus.js';

/**
 * 풀링용 그림자 객체 (Pooled Shadow)
 */
class PooledShadow {
    constructor(scene) {
        this.scene = scene;
        this.graphics = scene.add.graphics();
        this.graphics.setVisible(false);
        this.graphics.setDepth(layerManager.getDepth('shadow'));
    }

    onAcquire() {
        this.graphics.setVisible(true);
        this.graphics.clear();
    }

    onRelease() {
        this.graphics.setVisible(false);
        this.graphics.clear();
    }
}

/**
 * 그림자 매니저 (Shadow Manager)
 * 역할: [유닛의 입체감 부여 및 고도 시각화]
 * 
 * 설명: 모든 전투 유닛의 발밑에 이동형 타원 그림자를 생성하고, 
 * 유닛의 '높이(zHeight)' 변화에 따라 그림자의 크기와 투명도를 실시간으로 조절합니다.
 */
class ShadowManager {
    constructor() {
        this.scene = null;
        this.shadows = new Map(); // EntityID -> PooledShadow
    }

    /**
     * 초기화 및 풀 등록
     */
    init(scene) {
        this.scene = scene;
        
        // [SCENE-SPECIFIC] 씬이 바뀔 때마다 팩토리 함수가 최신 씬을 참조하도록 풀 재등록
        // 전투 중 유닛 수에 맞춰 약 50개 정도 초기 확보
        poolingManager.registerPool('shadow', () => new PooledShadow(this.scene), 50, true);
        
        if (this.isInitialized) {
            Logger.system("ShadowManager: Re-linked to new scene instance.");
            return;
        }

        // [신규] 사망 이벤트 감시 - 엔티티가 파괴되기 전에 그림자를 확실히 제거하기 위한 Fail-safe
        EventBus.on(EVENTS.ENTITY_DIED, (entity) => {
            const entityId = entity.id;
            if (!entityId) return;

            const hasShadow = this.shadows.has(entityId);
            if (hasShadow) {
                Logger.debug("SHADOW_DEBUG", `ENTITY_DIED received for ${entityId}. Triggering removeShadow.`);
                this.removeShadow(entity);
            }
        });

        // [신규] 주기적 누수 감시 (5초마다 현재 살아있는 그림자 수 출력)
        if (this.leakCheckId) clearInterval(this.leakCheckId);
        this.leakCheckId = setInterval(() => {
            if (this.shadows.size > 0) {
                Logger.info("SHADOW_LEAK_CHECK", `Current active shadows in manager: ${this.shadows.size}`);
                // 상태 파악을 위해 ID 목록 출력 (너무 많으면 생략)
                if (this.shadows.size < 20) {
                    const ids = Array.from(this.shadows.keys());
                    Logger.debug("SHADOW_LEAK_CHECK", `Active IDs: ${ids.join(', ')}`);
                }
            }
        }, 5000);

        this.isInitialized = true;
        Logger.system("ShadowManager: Shadow pooling initialized with ENTITY_DIED listener and Leak Checker.");
    }

    /**
     * 유닛을 위한 그림자 생성
     * @param {Phaser.Scene} scene 
     * @param {CombatEntity} entity 
     */
    createShadow(scene, entity) {
        if (!entity || !entity.id || !this.scene) return;
        
        const entityId = entity.id;
        
        // [FIX] 중복 생성 방지: 이미 그림자가 있다면 먼저 제거하여 고아 객체 생성 차단
        if (this.shadows.has(entityId)) {
            Logger.debug("SHADOW_DEBUG", `Duplicate shadow request for ${entityId}. Removing old one.`);
            this.removeShadow(entity);
        }

        // 풀에서 그림자 객체 획득
        const pooledShadow = poolingManager.get('shadow');
        if (!pooledShadow) {
            Logger.error("SHADOW_ERROR", "Failed to acquire shadow from pool.");
            return;
        }

        const graphics = pooledShadow.graphics;
        const config = measurementManager.graphics.shadow;
        
        this.updateShadowVisuals(graphics, entity, config);
        graphics.setDepth(layerManager.getDepth('shadow'));
        
        this.shadows.set(entityId, pooledShadow);
        Logger.debug("SHADOW_DEBUG", `Shadow created for ${entityId}. Current count: ${this.shadows.size}`);
        return graphics;
    }

    /**
     * 유닛의 위치와 고도에 맞춰 그림자 업데이트
     */
    update(entities) {
        const config = measurementManager.graphics.shadow;
        
        entities.forEach(entity => {
            const pooledShadow = this.shadows.get(entity.id);
            if (!pooledShadow) return;

            if (!entity.active) {
                this.removeShadow(entity);
                return;
            }

            const shadow = pooledShadow.graphics;

            // [USER 요청] 그림자는 항상 지면 좌표(entity.x, entity.y)를 따르며, 
            // 스프라이트의 바빙(bobbing)이나 고도(zHeight)에 의한 Y 오프셋을 무시합니다.
            // 단, 대쉬 공격 등 스프라이트 자체가 X축으로 이동하는 경우(vx)는 따라갑니다.
            shadow.clear();
            this.updateShadowVisuals(shadow, entity, config);
            
            const vx = entity.sprite ? entity.sprite.x : 0;
            // vy는 무시 (그림자가 공중에 뜨지 않도록)
            shadow.setPosition(entity.x + vx, entity.y);

            // 레이어 고정
            shadow.setDepth(layerManager.getDepth('shadow'));
        });
    }

    /**
     * 고도(zHeight)에 따른 시각적 감쇠 계산 및 그리기
     */
    updateShadowVisuals(graphics, entity, config) {
        const z = entity.zHeight || 0;
        const ratio = Math.min(z / config.maxEffectHeight, 1.0);
        
        // 고도가 높을수록 작아지고 연해짐
        const currentScale = Math.max(0, 1.0 - (ratio * (1.0 - config.scaleAtMaxHeight)));
        const currentAlpha = Math.max(0, config.baseAlpha - (ratio * (config.baseAlpha - config.alphaAtMaxHeight)));
        
        const w = config.baseWidth * currentScale;
        const h = config.baseHeight * currentScale;

        // Phaser Graphics: fillEllipse(x, y, width, height)에서 (x, y)는 타원의 '중앙(Center)'입니다.
        // 이전에 -w/2를 했던 것이 오히려 그림자를 왼쪽으로 치우치게 만든 원인이었습니다.
        graphics.fillStyle(config.color, currentAlpha);
        graphics.fillEllipse(config.offsetX, config.offsetY, w, h);
    }

    /**
     * 특정 유닛의 그림자 제거 (풀 반납)
     */
    removeShadow(entity) {
        const entityId = entity.id;
        if (!entityId) return;

        const pooledShadow = this.shadows.get(entityId);
        if (pooledShadow) {
            poolingManager.release('shadow', pooledShadow);
            this.shadows.delete(entityId);
            Logger.debug("SHADOW_DEBUG", `Shadow removed for ${entityId}. Remaining: ${this.shadows.size}`);
        }
    }

    /**
     * 모든 그림자 제거
     */
    cleanup() {
        this.shadows.forEach((pooledShadow, id) => {
            poolingManager.release('shadow', pooledShadow);
        });
        this.shadows.clear();
    }
}

const shadowManager = new ShadowManager();
export default shadowManager;
