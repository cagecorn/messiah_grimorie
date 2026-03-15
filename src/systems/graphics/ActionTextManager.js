import Logger from '../../utils/Logger.js';
import canvasOffscreenManager from '../../ui/CanvasOffscreenManager.js';
import poolingManager from '../../core/PoolingManager.js';
import layerManager from '../../ui/LayerManager.js';

/**
 * 액션 텍스트 유닛 (Action Text Unit)
 * 역할: [유닛을 따라다니는 고해상도 상태 메시지 렌더링]
 */
class ActionText {
    constructor(scene) {
        this.scene = scene;
        this.width = 120; 
        this.height = 40;
        this.upscale = 2;

        // 오프스크린 버퍼 할당
        this.buffer = canvasOffscreenManager.createBuffer(this.width, this.height);
        this.canvas = this.buffer.canvas;
        this.ctx = this.buffer.ctx;

        // Phaser 텍스처 등록
        this.textureKey = `action_text_${Math.random().toString(36).substr(2, 9)}`;
        this.texture = scene.textures.addCanvas(this.textureKey, this.canvas);

        // 이미지 객체 생성
        this.sprite = scene.add.image(0, 0, this.textureKey);
        this.sprite.setScale(this.buffer.displayScale);
        this.sprite.setVisible(false);
        this.sprite.setDepth(layerManager.getDepth('world_ui') + 10); // HUD보다 위

        this.targetEntity = null;
        this.tween = null;
        this.yOffset = -80; // 기본 머리 위 높이
        this.alpha = 1;
    }

    /**
     * 특정 엔티티 위에 텍스트 표시
     */
    show(entity, text, color = '#ffffff') {
        this.targetEntity = entity;
        this.renderText(text, color);
        
        this.sprite.setVisible(true);
        this.sprite.setAlpha(1);
        this.alpha = 1;
        this.yOffset = -80;

        // 위치 초기화
        this.updatePosition();

        // [애니메이션]: 톡 튀어오르며 서서히 사라짐
        if (this.tween) this.tween.stop();
        
        this.tween = this.scene.tweens.add({
            targets: this,
            yOffset: -130, // 위로 솟구침
            alpha: 0,
            duration: 800,
            ease: 'Back.out',
            onUpdate: () => {
                if (this.sprite) this.sprite.setAlpha(this.alpha);
            },
            onComplete: () => {
                poolingManager.release('action_text', this);
            }
        });
    }

    /**
     * 캔버스에 텍스트 그리기
     */
    renderText(text, color) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.clearRect(0, 0, w, h);
        
        // 고해상도 폰트 설정 (이탤릭 적용 및 데미지 텍스트와 차별화)
        ctx.font = `italic bold ${32 * this.upscale}px 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 글로우 효과 (강렬함 추가)
        ctx.shadowColor = color;
        ctx.shadowBlur = 8 * this.upscale;

        // 외곽선 (가독성 확보)
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 6 * this.upscale;
        ctx.strokeText(text, w / 2, h / 2);

        // 메인 텍스트
        ctx.fillStyle = color;
        ctx.shadowBlur = 0; // 텍스트 자체에는 그림자 제거해서 선명하게
        ctx.fillText(text, w / 2, h / 2);

        this.texture.refresh();
    }

    /**
     * 프레임별 위치 추적 (유닛을 따라다님)
     */
    updatePosition() {
        if (!this.targetEntity || !this.targetEntity.active) return;
        
        // 유닛의 중심점 + 오프셋
        this.sprite.setPosition(this.targetEntity.x, this.targetEntity.y + this.yOffset);
    }

    onAcquire() {
        this.sprite.setVisible(true);
    }

    onRelease() {
        this.sprite.setVisible(false);
        this.targetEntity = null;
        if (this.tween) {
            this.tween.stop();
            this.tween = null;
        }
    }

    destroy() {
        this.sprite.destroy();
        this.texture.destroy();
    }
}

/**
 * 액션 텍스트 매니저 (Action Text Manager)
 * 역할: [Dodge!, Level Up! 등 비데미지성 상태 텍스트 관리]
 */
class ActionTextManager {
    constructor() {
        this.activeTexts = new Set();
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;
        // 풀 등록
        poolingManager.registerPool('action_text', () => new ActionText(this.scene), 20, true);
        Logger.system("ActionTextManager: Evasion/Status text pooling system ready.");
    }

    /**
     * 텍스트 표시 요청
     */
    show(entity, text, color = '#ffffff') {
        if (!this.scene || !entity) return;

        const actionText = poolingManager.get('action_text');
        if (actionText) {
            actionText.show(entity, text, color);
            this.activeTexts.add(actionText);
        }
    }

    /**
     * 풀링용 업데이트 (위치 추적)
     */
    update(delta) {
        this.activeTexts.forEach(at => {
            if (at.targetEntity && at.sprite.visible) {
                at.updatePosition();
            } else {
                this.activeTexts.delete(at);
            }
        });
    }
}

const actionTextManager = new ActionTextManager();
export default actionTextManager;
