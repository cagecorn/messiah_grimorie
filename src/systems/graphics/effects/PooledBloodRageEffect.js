import Phaser from 'phaser';

/**
 * 블러드 레이지 이펙트 풀링 (PooledBloodRageEffect)
 * 역할: [스킬 발동 시 혈기가 샘솟는 버스트 연출]
 */
export default class PooledBloodRageEffect {
    constructor(scene) {
        this.scene = scene;
        this.sprite = scene.add.sprite(0, 0, 'blood_rage_effect');
        this.sprite.setVisible(false);
        
        // FX 레이어에 배치
        const depth = scene.layerManager ? scene.layerManager.getDepth('fx') : 1000;
        this.sprite.setDepth(depth);
    }

    /**
     * 이펙트 재생
     * @param {number} x 
     * @param {number} y 
     */
    show(x, y) {
        this.sprite.setPosition(x, y);
        this.sprite.setVisible(true);
        this.sprite.setAlpha(1);
        this.sprite.setScale(0.5); // 작게 시작

        // 버스트 연출: 커지면서 사라짐
        this.scene.tweens.add({
            targets: this.sprite,
            scale: 1.8,
            alpha: 0,
            duration: 600,
            ease: 'Back.easeOut',
            onComplete: () => {
                this.sprite.setVisible(false);
            }
        });
    }

    onAcquire() {
        // [Safety] 획득 시 투명화 및 정지
        this.sprite.setVisible(false);
    }

    onRelease() {
        // [Safety] 방출 시 모든 트윈 중단
        this.sprite.setVisible(false);
        if (this.scene && this.scene.tweens) {
            this.scene.tweens.killTweensOf(this.sprite);
        }
    }
}
