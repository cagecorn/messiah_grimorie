import Phaser from 'phaser';

/**
 * 엔티티 이동 컴포넌트 (Entity Movement Component)
 * 역할: [물리 엔진 제어, 고도(Altitude), 깊이 정렬 전담]
 */
export default class EntityMovementComponent {
    constructor(entity, measurementManager) {
        this.entity = entity;
        this.body = entity.body;
        this.sprite = entity.sprite;
        this.measurementManager = measurementManager;
        this.zHeight = 0;
    }

    /**
     * 속도 설정 및 스프라이트 방향 제어
     */
    setVelocity(vx, vy) {
        if (!this.body) return;

        // 행동 불가 상태 체크
        if (this.entity.status && this.entity.status.isUnableToAct()) {
            this.body.setVelocity(0, 0);
            return;
        }

        this.body.setVelocity(vx, vy);

        // 방향 제어
        if (vx > 0) {
            this.sprite.setFlipX(true);
        } else if (vx < 0) {
            this.sprite.setFlipX(false);
        }
    }

    /**
     * 정지
     */
    stop() {
        if (this.body) this.body.setVelocity(0, 0);
    }

    /**
     * 고도 설정 (시각적 오프셋 적용)
     */
    setHeight(h) {
        this.zHeight = h;
        this.sprite.setY(-h);
    }

    /**
     * 깊이 정렬 업데이트
     */
    updateDepth(baseDepth) {
        const worldHeight = this.measurementManager.world.height;
        const yBias = this.entity.y / worldHeight;
        this.entity.setDepth(baseDepth + yBias);
    }
}
