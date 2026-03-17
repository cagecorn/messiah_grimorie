import Phaser from 'phaser';
import ghostManager from '../GhostManager.js';
import phaserParticleManager from '../PhaserParticleManager.js';

/**
 * 대쉬 애니메이터 (Dash Animator)
 * 역할: [비행 유닛의 빠른 직선 이동 연출]
 */
class DashAnimator {
    constructor(manager) {
        this.manager = manager;
    }

    /**
     * 대쉬 연출 실행
     * @param {CombatEntity} entity 
     * @param {number} duration 지속 시간
     */
    playDash(entity, duration) {
        if (!entity || !entity.visual || !entity.visual.sprite) return;

        const sprite = entity.visual.sprite;

        // 1. 잔상(Ghost) 효과 시작
        ghostManager.startGhosting(entity, {
            duration: duration,
            interval: 50,
            alpha: 0.4,
            tint: 0x88ccff // 약간 푸른빛 대쉬 잔상
        });

        // 2. 바람/먼지 파티클 효과
        phaserParticleManager.spawnWhiteDust(entity.x, entity.y);

        // 3. 직선 이동 강조를 위한 약간의 스케일 변화 (길쭉하게)
        const originalScaleX = sprite.scaleX;
        const originalScaleY = sprite.scaleY;
        
        entity.scene.tweens.add({
            targets: sprite,
            scaleX: originalScaleX * 1.2,
            scaleY: originalScaleY * 0.8,
            y: -entity.zHeight, // [FIX] 대쉬 중에도 비행 고도 강제 유지 (바닥으로 꺼짐 방지)
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut'
        });

        // 4. 이동 방향에 따른 기울기 (선택 사항)
        // 현재는 상위 ActionComponent에서 물리 속도를 부여하므로 연출에만 집중
    }
}

export default DashAnimator;
