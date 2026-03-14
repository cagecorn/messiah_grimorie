import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';

/**
 * 수호의 노래 캐스팅 이펙트 풀링 (PooledSongOfProtection)
 * 역할: [바드 "수호의 노래" 시전 시 맵으로 퍼져나가는 화려한 파동 효과]
 */
export default class PooledSongOfProtection {
    constructor(scene) {
        this.scene = scene;
        this.sprite = scene.add.image(0, 0, 'song_of_protection');
        this.sprite.setVisible(false);
        this.sprite.setBlendMode(Phaser.BlendModes.ADD);
        this.tweens = [];
    }

    /**
     * 효과 재생 (여러 장을 중첩하여 확산 연출)
     * @param {CombatEntity} owner 시전자
     */
    show(owner) {
        if (!this.scene || !owner || !owner.active) return;

        // 시전자 위치에서 시작
        this.sprite.setPosition(owner.x, owner.y - 40);
        this.sprite.setScale(0.1);
        this.sprite.setAlpha(0.8);
        this.sprite.setDepth(owner.depth - 5); // 유닛들 아래쪽 바닥 근처 느낌
        this.sprite.setVisible(true);

        this.clearTweens();

        // [USER 요청] 여러 장을 겹쳐서 퍼지게 (AnimationManager에서 루프를 돌려 호출하는 방식 선호)
        // 하지만 단일 객체 내에서도 어느정도 연출 가능
        // AnimationManager.playSongOfProtectionEffect 에서 여러 번 호출할 것임.
        
        const tween = this.scene.tweens.add({
            targets: this.sprite,
            scale: { from: 0.1, to: 4.0 }, // 크게 확산
            alpha: { from: 0.8, to: 0 },
            duration: 1500,
            ease: 'Quad.out',
            onComplete: () => {
                poolingManager.release('song_of_protection_fx', this);
            }
        });
        
        this.tweens.push(tween);
    }

    onAcquire() {
        this.sprite.setVisible(true);
    }

    onRelease() {
        this.sprite.setVisible(false);
        this.clearTweens();
    }

    clearTweens() {
        this.tweens.forEach(t => {
            if (t) t.stop();
        });
        this.tweens = [];
    }
}
