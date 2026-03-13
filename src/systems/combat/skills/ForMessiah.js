import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import aoeManager from '../AOEManager.js';
import Airborne from '../effects/Airborne.js';
import phaserParticleManager from '../../graphics/PhaserParticleManager.js';
import ultimateCutsceneManager from '../../../ui/UltimateCutsceneManager.js';
import poolingManager from '../../../core/PoolingManager.js';
import Invincible from '../effects/Invincible.js';

/**
 * 아렌 궁극기: 메시아를 위하여! (For Messiah!)
 * 역할: [화면 밖 점프 -> 강하 충돌 -> 강력한 범위 피해 및 에어본]
 */
class ForMessiah {
    /**
     * 궁극기 실행
     * @param {CombatEntity} owner 시전자
     * @param {object} targetPos 목표 좌표 { x, y }
     */
    execute(owner, targetPos) {
        if (!owner || !targetPos) return;

        Logger.info("ULTIMATE", `[Aren] For Messiah!`);

        // [신규] 궁극기 컷씬 출력
        ultimateCutsceneManager.show('aren', 'For Messiah!');

        // [Robust Fix] 시전 전 기존 연출 트윈 제거 및 상태 초기화
        const scene = owner.scene;
        scene.tweens.killTweensOf([owner, owner.sprite]);
        
        // 0. 무적 상태 부여 (AI 행동 차단 및 데미지 무시 - [USER 요청])
        Invincible.apply(owner, 2200);

        const baseScale = owner.getEntityConfig().displayScale;
        owner.sprite.setPosition(0, 0); 
        owner.sprite.setAlpha(1);
        owner.sprite.setScale(baseScale);

        // 1. 게이지 초기화
        owner.ultimateProgress = 0;
        if (owner.hpBar) owner.hpBar.isDirty = true;

        // 2. [신규] 기 모으기 (Ready Phase)
        this.playReadyPhase(owner, targetPos);
    }

    /**
     * [신규] 기 모으기 애니메이션: 점프 전 긴장감 조성
     */
    playReadyPhase(owner, targetPos) {
        const scene = owner.scene;
        const baseScale = owner.getEntityConfig().displayScale;

        // 시각적 연출: 웅크리기 및 틴트 (ADD 느낌 강조)
        scene.tweens.add({
            targets: owner.sprite,
            scaleY: baseScale * 0.6,
            scaleX: baseScale * 1.3,
            duration: 300,
            ease: 'Cubic.out',
            onStart: () => {
                owner.sprite.setTint(0xffffff); // 하얗게 빛남
            },
            onComplete: () => {
                this.playJumpPhase(owner, targetPos);
            }
        });
    }

    /**
     * 점프 애니메이션: 화면 밖으로 사라짐
     */
    playJumpPhase(owner, targetPos) {
        const scene = owner.scene;
        const baseScale = owner.getEntityConfig().displayScale;

        // 시각적 연출: 떨림 및 틴트 해제
        scene.cameras.main.shake(200, 0.005);
        owner.sprite.clearTint();

        // 세로로 길게 늘리기 (왜곡)
        owner.sprite.scaleY = baseScale * 3.0;
        owner.sprite.scaleX = baseScale * 0.6;

        // 잔상 타이머
        const ghostTimer = scene.time.addEvent({
            delay: 30,
            repeat: 10,
            callback: () => this.createGhost(owner)
        });

        // 위로 솟구침 (화면 밖으로)
        scene.tweens.add({
            targets: owner,
            y: owner.y - 1200,
            alpha: 0,
            duration: 400,
            ease: 'Cubic.in',
            onComplete: () => {
                ghostTimer.remove();
                // 스케일 복구 (공중 대기 중)
                owner.sprite.setScale(baseScale);

                // 잠시 대기 후 강하
                scene.time.delayedCall(300, () => {
                    this.playImpactPhase(owner, targetPos);
                });
            }
        });
    }

    /**
     * 강하 페이즈: 목표 지점에 충돌
     */
    playImpactPhase(owner, targetPos) {
        const scene = owner.scene;

        // 강하 시작 지점 설정 (목표 지점 위쪽 하늘)
        owner.x = targetPos.x;
        owner.y = targetPos.y - 1200;
        owner.alpha = 1;

        // [FIX] 베이스 스케일 참조
        const baseScale = owner.getEntityConfig().displayScale;
        owner.sprite.scaleY = baseScale * 4.0;
        owner.sprite.scaleX = baseScale * 0.5;

        // 잔상 타이머
        const ghostTimer = scene.time.addEvent({
            delay: 15,
            repeat: 20,
            callback: () => this.createGhost(owner)
        });

        // 급강하
        scene.tweens.add({
            targets: owner,
            y: targetPos.y,
            duration: 200,
            ease: 'Quint.in',
            onComplete: () => {
                ghostTimer.remove();
                // 확실하게 베이스 스케일 및 위치 복구
                owner.sprite.setScale(baseScale);
                owner.sprite.setPosition(0, 0); 
                this.applyImpactEffect(owner, targetPos);
            }
        });
    }

    /**
     * 충돌 효과 및 데미지 적용
     */
    applyImpactEffect(owner, pos) {
        const scene = owner.scene;

        // 1. 화면 효과
        scene.cameras.main.shake(400, 0.015);

        // 2. [변경] 거대한 빛의 기둥 연출 (Persistence 강화) - 풀링 적용
        const pooledPillar = poolingManager.get('for_messiah_pillar');
        const pillar = pooledPillar.sprite;
        
        pillar.setPosition(pos.x, pos.y);
        pillar.setOrigin(0.5, 0.9);
        pillar.setBlendMode(Phaser.BlendModes.ADD);
        pillar.setDepth(owner.depth - 1);
        pillar.setScale(0.5, 0);
        pillar.setAlpha(1);

        scene.tweens.add({
            targets: pillar,
            scaleY: 2.0,
            scaleX: 1.2,
            duration: 150,
            ease: 'Expo.out',
            onComplete: () => {
                scene.tweens.add({
                    targets: pillar,
                    alpha: 0,
                    scaleX: 1.8, // 더 넓게 퍼짐
                    duration: 1000, // [상향] 1초간 잔상 유지
                    ease: 'Cubic.out',
                    onComplete: () => poolingManager.release('for_messiah_pillar', pooledPillar)
                });
            }
        });

        // 3. 파티클 효과 (흰색 먼지 - 더 풍성하게 상향)
        if (phaserParticleManager.spawnWhiteDust) {
            phaserParticleManager.spawnWhiteDust(pos.x, pos.y);
            // 사방으로 퍼지는 느낌을 위해 약간의 오프셋을 준 추가 스폰
            scene.time.delayedCall(50, () => phaserParticleManager.spawnWhiteDust(pos.x - 40, pos.y));
            scene.time.delayedCall(100, () => phaserParticleManager.spawnWhiteDust(pos.x + 40, pos.y));
            scene.time.delayedCall(150, () => phaserParticleManager.spawnWhiteDust(pos.x, pos.y));
        }

        // 4. 범위 데미지 (3배 계수, 물리)
        aoeManager.applyAOEDamagingEffect(
            owner,
            pos.x,
            pos.y,
            250, // 넓은 반경
            3.0, // 계수 3.0x
            'physical',
            (hitTarget) => {
                // 에어본 적용
                Airborne.apply(hitTarget, 1200, 250, owner);
            },
            true // isUltimate = true
        );

        Logger.info("ULTIMATE", `[Aren] For Messiah! applied to surroundings!`);
    }

    /**
     * 잔상 생성 유틸리티
     */
    createGhost(owner) {
        if (!owner.active || !owner.sprite) return;
        const scene = owner.scene;
        const ghost = scene.add.sprite(owner.x + owner.sprite.x, owner.y + owner.sprite.y, owner.sprite.texture.key);
        ghost.setFlipX(owner.sprite.flipX);
        ghost.setScale(owner.sprite.scaleX, owner.sprite.scaleY);
        ghost.setAlpha(0.6);
        ghost.setTint(0xffffff); // 궁극기는 하얀색 섬광 느낌
        scene.tweens.add({
            targets: ghost,
            alpha: 0,
            duration: 400,
            onComplete: () => ghost.destroy()
        });
    }
}

const forMessiah = new ForMessiah();
export default forMessiah;
