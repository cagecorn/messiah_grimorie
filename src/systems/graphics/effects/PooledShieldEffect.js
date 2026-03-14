import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';

/**
 * 쉴드 보호막 시각 효과 풀링 (PooledShieldEffect)
 * 역할: [보호막을 받은 유닛 위에 은은하게 겹쳐지는 방어 효과]
 */
export default class PooledShieldEffect {
    constructor(scene) {
        this.scene = scene;
        this.sprite = scene.add.image(0, 0, 'shield_effect');
        this.sprite.setVisible(false);
        this.sprite.setBlendMode(Phaser.BlendModes.ADD);
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
        this.sprite.setPosition(target.x, target.y - 40);
        this.sprite.setScale(0.8);
        this.sprite.setAlpha(0);
        this.sprite.setDepth(target.depth + 2); // 유닛 바로 위
        this.sprite.setVisible(true);
        this.active = true;

        if (this.tween) this.tween.stop();

        // 은은하게 깜빡이는 연출 (Loop)
        this.tween = this.scene.tweens.add({
            targets: this.sprite,
            alpha: { from: 0.2, to: 0.6 },
            scale: { from: 0.8, to: 0.9 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 지속 시간 종료 시 자동 해제
        this.scene.time.delayedCall(duration, () => {
            if (this.active) {
                poolingManager.release('shield_overlay_fx', this);
            }
        });
    }

    update() {
        if (!this.active) return;

        if (!this.target || !this.target.active || !this.target.logic.isAlive) {
            poolingManager.release('shield_overlay_fx', this);
            return;
        }

        // 대상 위치 추적
        this.sprite.setPosition(this.target.x, this.target.y - 40);
        this.sprite.setDepth(this.target.depth + 2);
        
        // 쉴드가 0이 되면 해제
        if (this.target.logic.shield <= 0) {
            poolingManager.release('shield_overlay_fx', this);
        }
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
