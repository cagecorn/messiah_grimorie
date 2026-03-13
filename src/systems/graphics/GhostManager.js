import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import poolingManager from '../../core/PoolingManager.js';

/**
 * [구역 1] 풀링된 잔상 객체 (Pooled Ghost)
 */
class PooledGhost extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        // 더미 텍스처로 초기화 (발생 시 업데이트됨)
        super(scene, 0, 0, '__DEFAULT');
        this.scene = scene;
        this.setVisible(false);
    }

    /**
     * 원본 스프라이트의 상태를 복제하여 잔상 표시
     */
    show(source, lifeTime = 300, tint = 0xffffff, alpha = 0.5) {
        if (!source || !source.texture) return;

        // 텍스처 및 프레임 복제
        this.setTexture(source.texture.key, source.frame.name);
        
        // 위치 및 변형 복제
        // source가 Container일 수도 있고 Sprite일 수도 있으므로 world position 고려
        const worldPos = source.getWorldTransformMatrix();
        this.setPosition(worldPos.tx, worldPos.ty);
        
        this.setRotation(source.rotation);
        this.setScale(source.scaleX, source.scaleY);
        this.setFlipX(source.flipX);
        this.setOrigin(source.originX, source.originY);
        
        // 시각적 설정
        this.setTint(tint);
        this.setAlpha(alpha);
        this.setVisible(true);
        this.setDepth(source.depth - 0.01); // 원본보다 살짝 뒤에

        // 소멸 애니메이션 (트윈)
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: lifeTime,
            ease: 'Power1',
            onComplete: () => {
                poolingManager.release('ghost', this);
            }
        });
    }

    onAcquire() {
        // 풀에서 꺼낼 때 상태 초기화
        this.setVisible(true);
    }

    onRelease() {
        // 풀에 넣을 때 상태 초기화
        this.setVisible(false);
        this.scene.tweens.killTweensOf(this);
    }
}

/**
 * [구역 2] 잔상 매니저 (Ghost Manager)
 * 역할: [화려한 잔상 효과의 중앙 집중 관리 및 최적화]
 */
class GhostManager {
    constructor() {
        this.scene = null;
        this.isInitialized = false;
    }

    init(scene) {
        this.scene = scene;
        
        // 잔상 객체 풀 등록 (전투 중 수많은 잔상이 생길 수 있으므로 충분히 확보)
        poolingManager.registerPool('ghost', () => new PooledGhost(this.scene), 50);
        
        this.isInitialized = true;
        Logger.system("GhostManager: Afterimage pooling system initialized.");
    }

    /**
     * 특정 스프라이트/컨테이너의 잔상을 생성합니다.
     * @param {Phaser.GameObjects.GameObject} source 원본 객체
     * @param {Object} options 설정 (lifeTime, tint, alpha)
     */
    spawnGhost(source, options = {}) {
        if (!this.isInitialized || !source) return;

        const {
            lifeTime = 300,
            tint = 0xffffff,
            alpha = 0.4
        } = options;

        const ghost = poolingManager.get('ghost');
        if (ghost) {
            ghost.show(source, lifeTime, tint, alpha);
        }
    }
}

const ghostManager = new GhostManager();
export default ghostManager;
