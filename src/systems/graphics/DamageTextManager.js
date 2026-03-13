import Logger from '../../utils/Logger.js';
import canvasOffscreenManager from '../../ui/CanvasOffscreenManager.js';
import poolingManager from '../../core/PoolingManager.js';
import layerManager from '../../ui/LayerManager.js';

/**
 * 데미지 텍스트 유닛 (Damage Text Unit)
 * 개별 텍스트 객체와 애니메이션을 담당
 */
class DamageText {
    constructor(scene) {
        this.scene = scene;
        this.width = 120; // 넉넉한 너비
        this.height = 40;
        this.resolution = 2; // 선명도 2배

        // 오프스크린 버퍼 생성
        this.buffer = canvasOffscreenManager.createBuffer(this.width, this.height);
        this.canvas = this.buffer.canvas;
        this.ctx = this.buffer.ctx;

        // Phaser 텍스처 등록
        this.textureKey = `dmg_text_${Math.random().toString(36).substr(2, 9)}`;
        this.texture = scene.textures.addCanvas(this.textureKey, this.canvas);

        // 스프라이트
        this.sprite = scene.add.image(0, 0, this.textureKey);
        this.sprite.setScale(this.buffer.displayScale);
        this.sprite.setVisible(false);
        this.sprite.setDepth(layerManager.getDepth('fx')); // fx 레이어

        this.poolType = 'damage_text';
        this.tween = null;
    }

    /**
     * 텍스트 출력 및 애니메이션 시작
     */
    show(x, y, amount, color = '#ffffff') {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // 1. 소수점 제거 및 렌더링
        ctx.clearRect(0, 0, w, h);
        
        // 텍스트 스타일 (Retro Pixel Font 느낌)
        ctx.font = `bold ${32 * this.resolution}px 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 그림자/외곽선 (선명도 보강)
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4 * this.resolution;
        ctx.lineWidth = 4 * this.resolution;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(Math.floor(amount), w / 2, h / 2);

        // 메인 글자
        ctx.fillStyle = color;
        ctx.shadowBlur = 0;
        ctx.fillText(Math.floor(amount), w / 2, h / 2);

        this.texture.refresh();

        // 2. 초기 위치 설정 및 표시
        this.sprite.setPosition(x, y);
        this.sprite.setAlpha(1);
        this.sprite.setScale(this.buffer.displayScale); // 스케일 리셋
        this.sprite.setVisible(true);

        // [애니메이션]: 위로 솟구치며 사라짐
        if (this.tween) this.tween.stop();
        
        this.tween = this.scene.tweens.add({
            targets: this.sprite,
            y: y - 60, // [상향] 조금 더 많이 올라감
            alpha: 0,
            duration: 800,
            ease: 'Cubic.out',
            onComplete: () => {
                poolingManager.release(this.poolType, this);
            }
        });
    }

    onAcquire() {
        this.sprite.setVisible(true);
        this.sprite.setAlpha(1);
    }

    onRelease() {
        this.sprite.setVisible(false);
        if (this.tween) {
            this.tween.stop();
            this.tween = null;
        }
    }
}

/**
 * 데미지 텍스트 매니저 (Damage Text Manager)
 * 역할: [전투 데미지 숫자의 고해상도 연출 및 풀링]
 */
class DamageTextManager {
    constructor() {
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;
        // [USER 요청] 풀링 등록 (데미지 텍스트는 많이 생성되므로 80개 정도로 확장)
        poolingManager.registerPool('damage_text', () => new DamageText(this.scene), 80);
        
        Logger.system("DamageTextManager: High-res text pooling initialized (80 units).");
    }

    /**
     * 데미지 텍스트 표시 요청
     */
    showDamage(x, y, amount, type = 'physical') {
        if (!this.scene) return;

        const text = poolingManager.get('damage_text');
        if (!text) return;
        
        // 타입별 색상 결정
        let color = '#ffffff';
        if (type === 'magic') color = '#a29bfe'; // 바이올렛
        if (type === 'critical') color = '#ff7675'; // 다홍색
        if (type === 'heal') color = '#55efc4'; // 민트색
        
        // [신규] 속성별 컬러 테마 적용
        if (type === 'fire') color = '#ff9f43'; // 오렌지 불꽃
        if (type === 'ice') color = '#00d2d3'; // 청록색 얼음
        if (type === 'lightning') color = '#feca57'; // 노란색 번개

        // 유닛 머리 위 살짝 랜덤 위치 (겹침 방지)
        const rx = x + (Math.random() - 0.5) * 40;
        const ry = y - 80;

        text.show(rx, ry, amount, color);
    }
}

const damageTextManager = new DamageTextManager();
export default damageTextManager;
