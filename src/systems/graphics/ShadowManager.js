import measurementManager from '../../core/MeasurementManager.js';
import Logger from '../../utils/Logger.js';
import layerManager from '../../ui/LayerManager.js';
import poolingManager from '../../core/PoolingManager.js';

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
        // 전투 중 유닛 수에 맞춰 약 50개 정도 초기 확보
        poolingManager.registerPool('shadow', () => new PooledShadow(this.scene), 50);
        Logger.system("ShadowManager: Shadow pooling initialized (50 units).");
    }

    /**
     * 유닛을 위한 그림자 생성
     * @param {Phaser.Scene} scene 
     * @param {CombatEntity} entity 
     */
    createShadow(scene, entity) {
        const config = measurementManager.graphics.shadow;
        
        // 풀에서 그림자 객체 획득
        const pooledShadow = poolingManager.get('shadow');
        const graphics = pooledShadow.graphics;
        
        this.updateShadowVisuals(graphics, entity, config);
        graphics.setDepth(layerManager.getDepth('shadow'));
        
        this.shadows.set(entity.id, pooledShadow);
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

            // 그림자는 항상 지면 좌표(entity.x, entity.y)를 따르되, 
            // 애니메이션 중인 경우 스프라이트의 오프셋을 반영합니다.
            shadow.clear();
            this.updateShadowVisuals(shadow, entity, config);
            
            // 스프라이트가 로컬 (0, 0)에서 벗어난 만큼 그림자도 이동
            const vx = entity.sprite ? entity.sprite.x : 0;
            const vy = entity.sprite ? entity.sprite.y : 0;
            shadow.setPosition(entity.x + vx, entity.y + vy);

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
        const pooledShadow = this.shadows.get(entity.id);
        if (pooledShadow) {
            poolingManager.release('shadow', pooledShadow);
            this.shadows.delete(entity.id);
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
