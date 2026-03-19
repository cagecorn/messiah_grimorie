import measurementManager from '../../core/MeasurementManager.js';
import Logger from '../../utils/Logger.js';
import layerManager from '../../ui/LayerManager.js';
import poolingManager from '../../core/PoolingManager.js';
import EventBus, { EVENTS } from '../../core/EventBus.js';
import shadowInstanceManager from './ShadowInstanceManager.js';

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
        poolingManager.registerPool('shadow', () => new PooledShadow(this.scene), 50, true);
        
        // [신규] 주기적 누수 감시 (5초마다 현재 살아있는 그림자 수 출력)
        // 씬이 재시작되더라도 감시기는 항상 최신 씬 상태를 반영해야 하므로 매번 초기화
        if (this.leakCheckId) clearInterval(this.leakCheckId);
        this.leakCheckId = setInterval(() => {
            if (this.shadows.size > 0) {
                // 씬에 존재하는 모든 엔티티의 ID 수집
                const sceneEntityIds = new Set();
                if (this.scene) {
                    if (this.scene.allies) this.scene.allies.forEach(e => sceneEntityIds.add(e.id));
                    if (this.scene.enemies) this.scene.enemies.forEach(e => sceneEntityIds.add(e.id));
                }

                // [LOGGING] 누수 여부와 상관없이 현재 상태 출력 (디버깅용)
                Logger.info("SHADOW_LEAK_CHECK", `Active shadows count: ${this.shadows.size} vs Scene entities: ${sceneEntityIds.size}`);
                
                if (this.shadows.size > sceneEntityIds.size) {
                    const orphanIds = [];
                    this.shadows.forEach((data, id) => {
                        if (!sceneEntityIds.has(id)) orphanIds.push(id);
                    });

                    if (orphanIds.length > 0) {
                        Logger.warn("SHADOW_LEAK", `Detected ${orphanIds.length} orphan shadows: ${orphanIds.slice(0, 10).join(', ')}...`);
                    }
                }
            }
        }, 5000);

        if (this.isInitialized) {
            Logger.system("ShadowManager: Re-linked to new scene instance & Refreshed Leak Checker.");
            return;
        }

        // [GLOBAL] 이벤트 리스너는 싱글톤 생명주기 동안 딱 한 번만 등록
        EventBus.on(EVENTS.ENTITY_DIED, (entity) => {
            this.removeShadow(entity);
        });

        this.isInitialized = true;
        Logger.system("ShadowManager: Shadow pooling initialized with ENTITY_DIED listener.");
    }

    /**
     * 유닛을 위한 그림자 생성
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
        
        // [신규] 그림자 인스턴스 등록
        const instanceId = shadowInstanceManager.register(entity, pooledShadow);

        // [REFAC] 엔티티 참조도 함께 저장하여 자동 청소(GC) 및 업데이트에 활용
        this.shadows.set(entityId, { 
            poolItem: pooledShadow, 
            entity: entity,
            instanceId: instanceId,
            createdFrame: this.scene.time.now 
        });

        Logger.debug("SHADOW_DEBUG", `Shadow created for ${entityId}. Current count: ${this.shadows.size}`);
        return graphics;
    }

    /**
     * 그림자 업데이트 루프 (Map-Driven 방식)
     * 인자로 전달받는 entities 목록에 없더라도 매니저 소유의 그림자를 전수 조사하여 누수를 방지합니다.
     */
    update() {
        if (!this.scene || this.shadows.size === 0) return;
        
        const config = measurementManager.graphics.shadow;
        
        // 맵의 모든 항목을 순회하며 업데이트 및 유효성 검사 수행
        this.shadows.forEach((data, id) => {
            try {
                const { poolItem, entity } = data;
                const shadow = poolItem.graphics;

                // [DEFENSIVE] 그래픽 객체가 파괴되었거나 유효하지 않은 경우 (씬 전환 등)
                if (!shadow || !shadow.scene || shadow.scene !== this.scene) {
                    Logger.warn("SHADOW_GC", `Invalid graphics detected for [${id}]. Pruning.`);
                    this.shadows.delete(id);
                    return;
                }

                // [LEAK PREVENTION] 엔티티가 비활성이거나, 씬에서 사라졌거나, 다른 ID로 재사용된 경우 즉시 제거
                const isOrphan = !entity || !entity.active || !entity.scene;
                const isDead = entity.logic && !entity.logic.isAlive;
                const isIdMismatched = entity && entity.id !== id;
                const isCarried = entity.isBeingCarried;

                if (isOrphan || isDead || isIdMismatched) {
                    Logger.info("SHADOW_GC", `Cleaning shadow for [${id}]: Orphan=${isOrphan}, Dead=${isDead}, Mismatch=${isIdMismatched}`);
                    shadowInstanceManager.unregister(id);
                    poolingManager.release('shadow', poolItem);
                    this.shadows.delete(id);
                    return;
                }

                // [FIX] 탑승 중인 유닛(isBeingCarried) 처리: 그림자가 공중에 남겨지지 않고 본체를 따라가도록 월드 좌표 동기화
                if (isCarried) {
                    const worldMatrix = entity.getWorldTransformMatrix ? entity.getWorldTransformMatrix() : null;
                    if (worldMatrix) {
                        shadow.setVisible(true);
                        shadow.clear();
                        this.updateShadowVisuals(shadow, entity, config);
                        
                        // 컨테이너/탑승 상태이므로 월드 기준 tx, ty 사용
                        shadow.setPosition(worldMatrix.tx, worldMatrix.ty);
                        shadow.setDepth(layerManager.getDepth('shadow'));
                        return;
                    } else {
                        shadow.setVisible(false);
                        return;
                    }
                }

                // 정상 상태 시 가시성 확보 및 시각적 업데이트 수행
                shadow.setVisible(true);
                shadow.clear();
                this.updateShadowVisuals(shadow, entity, config);
                
                const vx = entity.sprite ? entity.sprite.x : 0;
                shadow.setPosition(entity.x + vx, entity.y);
                shadow.setDepth(layerManager.getDepth('shadow'));

            } catch (error) {
                Logger.error("SHADOW_UPDATE_ERROR", `Failed to update shadow for [${id}]: ${error.message}`);
                this.shadows.delete(id);
            }
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
        if (!entity) return;
        const entityId = entity.id;
        if (!entityId) return;

        const data = this.shadows.get(entityId);
        if (data) {
            shadowInstanceManager.unregister(entityId);
            poolingManager.release('shadow', data.poolItem);
            this.shadows.delete(entityId);
            Logger.debug("SHADOW_DEBUG", `Shadow removed for ${entityId}. Remaining: ${this.shadows.size}`);
        }
    }

    /**
     * 모든 그림자 제거
     */
    cleanup() {
        this.shadows.forEach((data, id) => {
            poolingManager.release('shadow', data.poolItem);
        });
        this.shadows.clear();
    }
}

const shadowManager = new ShadowManager();
export default shadowManager;
