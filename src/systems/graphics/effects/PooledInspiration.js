import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';

/**
 * 영감 버프 이펙트 풀링 (PooledInspiration)
 * 역할: [바드 "영감" 버프 대상 위에 출력되는 화려한 음악적 효과]
 */
export default class PooledInspiration {
    constructor(scene) {
        this.scene = scene;
        // 'inspiration_effect' 키는 AssetPathManager 등을 통해 로드된 이미지
        this.sprite = scene.add.image(0, 0, 'inspiration_effect');
        this.sprite.setVisible(false);
        this.sprite.setBlendMode(Phaser.BlendModes.ADD); // 화려함을 위해 ADD 모드
        this.tween = null;
    }

    /**
     * 효과 재생
     * @param {CombatEntity} target 버프 대상
     */
    show(target) {
        if (!this.scene || !target || !target.active) return;

        // 대상의 머리 위에서 생성
        this.sprite.setPosition(target.x, target.y - 60);
        this.sprite.setScale(0.2); // 작은 상태에서 시작
        this.sprite.setAlpha(0);
        this.sprite.setDepth(target.depth + 10); // 대상보다 항상 위에
        this.sprite.setVisible(true);

        if (this.tween) this.tween.stop();

        // [USER 요청] 화려한 연출: 커지면서 나타났다가 위로 흐르며 사라짐
        this.tween = this.scene.tweens.add({
            targets: this.sprite,
            scale: { from: 0.2, to: 1.2 },
            alpha: { from: 0.8, to: 0 },
            y: '-=60',
            angle: { from: -20, to: 20 }, // 살짝 흔들림 추가
            duration: 1200,
            ease: 'Back.out', // 팅기는 느낌
            onComplete: () => {
                poolingManager.release('inspiration_effect', this);
            }
        });
    }

    onAcquire() {
        this.sprite.setVisible(true);
    }

    onRelease() {
        this.sprite.setVisible(false);
        if (this.tween) {
            this.tween.stop();
            this.tween = null;
        }
    }
}
