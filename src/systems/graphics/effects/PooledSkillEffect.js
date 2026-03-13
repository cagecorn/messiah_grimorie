import Phaser from 'phaser';

/**
 * 스킬 이펙트 풀링 (PooledSkillEffect)
 */
export default class PooledSkillEffect {
    constructor(scene, textureKey) {
        this.scene = scene;
        this.sprite = scene.add.image(0, 0, textureKey);
        this.sprite.setVisible(false);
        this.tween = null;
    }

    onAcquire() {
        this.sprite.setVisible(true);
        this.sprite.setAlpha(1);
        this.sprite.setScale(1);
    }

    onRelease() {
        this.sprite.setVisible(false);
        if (this.tween) {
            this.scene.tweens.killTweensOf(this.sprite);
            this.tween = null;
        }
    }
}
