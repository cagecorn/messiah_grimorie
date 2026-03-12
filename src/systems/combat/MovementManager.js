import Logger from '../../utils/Logger.js';

/**
 * 이동 매니저 (Movement Manager)
 * 역할: [물리 이동 공식 및 충돌 제어]
 * 
 * 설명: 모든 전투 유닛의 위치 이동을 담당합니다.
 * BaseEntity의 'speed' 스텟을 기반으로 실제 Phaser 물리 속도(Velocity)를 계산합니다.
 */
class MovementManager {
    constructor() {
        Logger.system("MovementManager: Initialized.");
    }

    /**
     * 유닛들의 물리적 위치 업데이트
     * @param {Array<CombatEntity>} entities 
     * @param {number} delta 
     */
    update(entities, delta) {
        entities.forEach(entity => {
            if (!entity.logic.isAlive) {
                entity.stop();
                return;
            }

            // AI에 의해 설정된 목표 방향이 있는지 확인
            const moveDir = entity.moveDirection; // { x, y } normalized
            if (moveDir && (moveDir.x !== 0 || moveDir.y !== 0)) {
                this.moveToDirection(entity, moveDir.x, moveDir.y);
            } else {
                entity.stop();
            }
        });
    }

    /**
     * 특정 방향으로 엔티티 이동
     */
    moveToDirection(entity, dx, dy) {
        // [스탯 연동] BaseEntity의 최종 속도 값 가져오기
        const speed = entity.logic.getTotalSpeed();
        
        // 실제 물리 속도 설정
        const vx = dx * speed;
        const vy = dy * speed;
        
        entity.setVelocity(vx, vy);
    }

    /**
     * 대상(Target)을 향한 방향 벡터 계산 후 이동
     */
    moveTowards(entity, targetX, targetY) {
        const dx = targetX - entity.x;
        const dy = targetY - entity.y;
        
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) { // 작은 오차 범위
            const nx = dx / dist;
            const ny = dy / dist;
            this.moveToDirection(entity, nx, ny);
        } else {
            entity.stop();
        }
    }
}

const movementManager = new MovementManager();
export default movementManager;
