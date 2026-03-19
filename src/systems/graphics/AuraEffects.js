import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import blurManager from '../../ui/BlurManager.js';
import poolingManager from '../../core/PoolingManager.js';
import layerManager from '../../ui/LayerManager.js';

/**
 * 오라 시각 효과 시스템 (Aura Effects System)
 * 역할: [유닛 발밑에 은은하게 퍼지는 오라 연출 및 최적화]
 * 
 * 🦖 [개발자 노트: 저강도/고효율 오라 연출법]
 * 1. Glow 필터 대신 단계적 그라데이션 원형을 사용.
 * 2. BlurManager의 postFX 블러를 적용하여 부드러운 외곽선 구현.
 * 3. Pooling과 Dirty Flag를 통해 이동 시에만 위치 갱신.
 */
class AuraSprite extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        this.scene = scene;
        
        // 오라를 구성하는 그래픽스 객체
        this.graphics = scene.add.graphics();
        this.add(this.graphics);
        
        this.target = null;
        this.color = 0xffffff;
        this.radius = 100;
        this.isDirty = true;
        
        // [FIX] 씬에 추가 및 레이어 할당
        scene.add.existing(this);
        layerManager.assignToLayer(this, 'fx');

        // 블러 적용 (최초 1회 혹은 상태 변경 시)
        blurManager.registerTarget(`aura_${this.uuid}`, this, 'canvas');
    }

    /**
     * 오라 초기화 및 표시
     */
    init(target, options = {}) {
        this.target = target;
        this.color = options.color || 0xffffff;
        this.radius = options.radius || 100;
        this.alpha = options.alpha || 0.4;
        
        this.drawAura();
        this.setVisible(true);
        this.setDepth(target.depth - 1); // 유닛보다 뒤, 그림자보다 위 (혹은 아래)
        
        // 블러 강도 설정 (프리셋: medium or high)
        blurManager.applyBlur(`aura_${this.uuid}`, options.blurSpeed || 'medium');
        
        this.isDirty = true;
    }

    /**
     * 단계적 그라데이션 원형 그리기
     */
    drawAura() {
        this.graphics.clear();
        
        const steps = 6;
        for (let i = steps; i > 0; i--) {
            const r = (this.radius / steps) * i;
            // [FIX] 불투명도 약간 상향 및 단계 조정
            const a = (1 - (i / (steps + 1))) * 0.5; 
            this.graphics.fillStyle(this.color, a);
            this.graphics.fillCircle(0, 0, r);
        }
    }

    update() {
        if (!this.active || !this.target || !this.target.active) {
            this.release();
            return;
        }

        // 유닛 위치 추적
        this.setPosition(this.target.x, this.target.y);
        
        // [FIX] 유닛 발밑에 항상 위치하도록 깊이 실시간 동기화
        if (this.target.depth) {
            this.setDepth(this.target.depth - 2); // 그림자(-1)보다 더 아래 배치
        }
    }

    release() {
        this.setVisible(false);
        this.target = null;
        poolingManager.release('aura_effect', this);
    }

    onAcquire() {
        this.setVisible(true);
    }

    onRelease() {
        this.setVisible(false);
        if (this.postFX) this.postFX.clear();
    }
}

class AuraEffects {
    constructor() {
        this.scene = null;
        this.activeAuras = new Set();
    }

    init(scene) {
        this.scene = scene;
        poolingManager.registerPool('aura_effect', () => {
            const aura = new AuraSprite(this.scene);
            aura.uuid = Phaser.Utils.String.UUID();
            return aura;
        }, 10);
    }

    /**
     * 특정 유닛에게 오라 효과를 부여합니다.
     */
    attachAura(target, options = {}) {
        if (!this.scene || !target) return null;

        const aura = poolingManager.get('aura_effect');
        if (aura) {
            aura.init(target, options);
            this.activeAuras.add(aura);
            return aura;
        }
        return null;
    }

    update() {
        for (const aura of this.activeAuras) {
            if (!aura.active) {
                this.activeAuras.delete(aura);
                continue;
            }
            aura.update();
        }
    }
}

const auraEffects = new AuraEffects();
export default auraEffects;
