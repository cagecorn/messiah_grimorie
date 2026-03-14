import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import aoeManager from '../AOEManager.js';
import projectileManager from '../ProjectileManager.js';
import ultimateCutsceneManager from '../../../ui/UltimateCutsceneManager.js';
import Invincible from '../effects/Invincible.js';
import animationManager from '../../graphics/AnimationManager.js';

/**
 * 실비 궁극기: 죄송합니다!! (Silvi: I'm Sorry!!)
 * 역할: [방방 뛰기 (Jumping) -> 카메라 쉐이크 -> 사방으로 이모지(😭💦) 폭발]
 */
class ImSorry {
    execute(owner, targetPos) {
        if (!owner) return;

        Logger.info("ULTIMATE", `[Silvi] I'm Sorry!! (죄송합니다!!)`);

        // 1. 궁극기 컷씬
        ultimateCutsceneManager.show('silvi', '죄송합니다!!');

        // 2. 초기화 및 무적(Invincible) 부여
        const scene = owner.scene;
        
        // [신규] 기존 애니메이션/바빙 중단 및 트윈 정리
        animationManager.stopIdleBobbing(owner);
        scene.tweens.killTweensOf([owner, owner.sprite]);
        
        // [수정] 점프 시작 전 위치 강제 리셋 (기존 바빙 흔적 제거)
        if (owner.sprite) owner.sprite.setY(0);
        
        Invincible.apply(owner, 5000); // 5초간 무적 (연출 시간 4.5초보다 길게 설정)

        // 게이지 초기화
        owner.ultimateProgress = 0;
        if (owner.hpBar) owner.hpBar.isDirty = true;

        // 3. 방방 뛰는 모션 (Frantic Jumping)
        this.playFranticJumping(owner);
    }

    /**
     * 방방 뛰는 모션 + 사방으로 이모지 발사
     */
    playFranticJumping(owner) {
        const scene = owner.scene;
        const baseScale = owner.getEntityConfig().displayScale;

        // 카메라 쉐이크 시작
        scene.cameras.main.shake(2000, 0.008);

        // 뛰는 애니메이션 트윈 (반복)
        scene.tweens.add({
            targets: owner.sprite, // 스프라이트 자체를 띄움
            y: -60, // 스프라이트의 상대 좌표
            duration: 150,
            yoyo: true,
            repeat: 14, 
            ease: 'Sine.easeInOut',
            onUpdate: () => {
                // 뛰는 중간중간 이모지 발사 (확률 증가 및 리듬감부여)
                if (Math.random() < 0.3) {
                    this.spawnEmojiBurst(owner, 1);
                }
            },
            onComplete: () => {
                // 마지막으로 크게 한번 더 폭발
                this.spawnEmojiBurst(owner, 20);
                this.applyFinalAOE(owner);

                // 위치 및 스킬 원상 복구 (스프라이트의 y를 0으로, 스케일 원상복구)
                if (owner.sprite) {
                    owner.sprite.setY(0);
                    owner.sprite.setScale(baseScale);
                }
            }
        });

        // 스프라이트 스케일도 정신없이 흔들림
        scene.tweens.add({
            targets: owner.sprite,
            scaleX: baseScale * 1.3,
            scaleY: baseScale * 0.7,
            duration: 50,
            yoyo: true,
            repeat: 30,
            ease: 'Cubic.easeInOut'
        });
    }

    /**
     * 이모지 투사체 스폰
     */
    spawnEmojiBurst(owner, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            projectileManager.fire('im_sorry_emoji', owner, null, {
                angle: angle,
                speed: 100 + Math.random() * 250, // 더 느리게 퍼짐
                damageMultiplier: 0.4,
                lifespan: 2500 + Math.random() * 1500 // 더 멀리, 오래 남음
            });
        }
    }

    /**
     * 마지막 광역 공격 판정
     */
    applyFinalAOE(owner) {
        aoeManager.applyAOEDamagingEffect(
            owner,
            owner.x,
            owner.y,
            300,  // 넓은 반경
            1.5,  // 계수 1.5x (이모지들도 데미지를 주므로 적절히 조절)
            'physical',
            null,
            true  // isUltimate = true
        );
    }
}

const imSorry = new ImSorry();
export default imSorry;
