import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';

/**
 * 스톤 스킨 시각 효과 풀링 (PooledStoneSkinEffect)
 * 역할: [실비의 몸 위에 암석 느낌의 이펙트를 오버랩]
 */
export default class PooledStoneSkinEffect {
    constructor(scene) {
        this.scene = scene;
        this.sprite = scene.add.image(0, 0, 'stone_skin_effect');
        this.sprite.setVisible(false);
        this.sprite.setBlendMode(Phaser.BlendModes.SCREEN); // 밝은 부분 강조
        this.target = null;
        this.tween = null;
        this.active = false;
    }

    /**
     * 효과 재생
     * @param {CombatEntity} target 대상 유닛
     * @param {number} duration 지속 시간
     */
    show(target, duration = 5000) {
        if (!this.scene || !target || !target.active) return;

        this.target = target;
        this.sprite.setPosition(target.x, target.y);
        
        // 타겟의 크기에 맞춤
        const targetScale = target.getEntityConfig().displayScale || 1.0;
        this.sprite.setScale(targetScale * 1.1);
        this.sprite.setAlpha(0);
        this.sprite.setDepth(target.depth + 1); // 유닛 바로 위
        this.sprite.setVisible(true);
        this.active = true;

        if (this.tween) this.tween.stop();

        // 번쩍이는 연출
        this.tween = this.scene.tweens.add({
            targets: this.sprite,
            alpha: { from: 0.1, to: 0.5 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 지속 시간 종료 시 자동 해제
        this.scene.time.delayedCall(duration, () => {
            if (this.active) {
                poolingManager.release('stone_skin_overlay_fx', this);
            }
        });
    }

    update() {
        if (!this.active) return;

        if (!this.target || !this.target.active || !this.target.logic.isAlive) {
            poolingManager.release('stone_skin_overlay_fx', this);
            return;
        }

        // 대상 위치 추적
        this.sprite.setPosition(this.target.x, this.target.y);
        this.sprite.setDepth(this.target.depth + 1);
    }

    onAcquire() {
        this.sprite.setVisible(true);
        this.active = true;
    }

    onRelease() {
        this.sprite.setVisible(false);
        this.active = false;
        if (this.tween) {
            this.tween.stop();
            this.tween = null;
        }
        this.target = null;
    }
}
