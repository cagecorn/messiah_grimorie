import Phaser from 'phaser';

/**
 * 바드 AI 노드 (Bard AI Node)
 * 역할: [아군 영감 버프 우선, 적군과 거리 유지(카이팅)]
 */
class BardAI {
    /**
     * @param {CombatEntity} entity AI 주체
     * @param {Blackboard} bb 데이터 저장소
     * @param {number} delta 
     */
    static execute(entity, bb, delta) {
        if (!entity.active || !entity.logic.isAlive) return;

        const scene = entity.scene;
        const allies = (entity.team === 'mercenary') ? scene.allies : scene.enemies;
        const enemies = (entity.team === 'mercenary') ? scene.enemies : scene.allies;

        // 1. 타겟 결정 (버프가 필요한 아군 vs 공격할 적)
        const buffTarget = this.findUninspiredAlly(entity, allies);
        const enemyTarget = bb.get('target'); 

        // [USER 요청] 버프 우선순위
        let activeTarget = buffTarget || enemyTarget;
        
        if (!activeTarget) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 2. 거리 및 스탯 정보
        const distToTarget = Phaser.Math.Distance.Between(entity.x, entity.y, activeTarget.x, activeTarget.y);
        const stats = entity.logic.stats;
        const rangeMin = stats.get('rangeMin') || 150;
        const rangeMax = stats.get('rangeMax') || 400;

        // 3. 적군과의 거리 체크 (카이팅 감지)
        const nearestEnemy = this.findNearestEnemy(entity, enemies);
        let dx = 0;
        let dy = 0;
        let isEmergencyKiting = false;

        if (nearestEnemy) {
            const distToEnemy = Phaser.Math.Distance.Between(entity.x, entity.y, nearestEnemy.x, nearestEnemy.y);
            if (distToEnemy < rangeMin) {
                // 적군과 거리가 가까울 경우 무조건 멀어지면서 행동
                const angle = Phaser.Math.Angle.Between(nearestEnemy.x, nearestEnemy.y, entity.x, entity.y);
                dx = Math.cos(angle);
                dy = Math.sin(angle);
                isEmergencyKiting = true;
            }
        }

        // 4. 이동 및 행동 로직 수행
        if (isEmergencyKiting) {
            // 멀어지면서 사거리 내에 타겟이 있다면 공격/버프 병행
            if (distToTarget <= rangeMax) {
                entity.attack(activeTarget);
            }
        } else {
            if (distToTarget > rangeMax) {
                // 타겟을 향해 이동
                const angle = Phaser.Math.Angle.Between(entity.x, entity.y, activeTarget.x, activeTarget.y);
                dx = Math.cos(angle) * 0.8;
                dy = Math.sin(angle) * 0.8;
            } else if (distToTarget < rangeMin && activeTarget === enemyTarget) {
                // 적군일 경우 너무 가까우면 뒤로 물러남
                const angle = Phaser.Math.Angle.Between(activeTarget.x, activeTarget.y, entity.x, entity.y);
                dx = Math.cos(angle);
                dy = Math.sin(angle);
            } else {
                // 사거리 안쪽이면 정지 후 행동
                dx = 0;
                dy = 0;
                entity.attack(activeTarget);
            }
        }

        entity.moveDirection = { x: dx, y: dy };
    }

    static findUninspiredAlly(owner, allies) {
        let candidate = null;
        allies.forEach(ally => {
            if (!ally.active || !ally.logic.isAlive) return;
            // 본인 제외
            if (ally.logic.id === owner.logic.id) return;
            
            // 이미 영감 버프가 활성화되어 있는지 체크
            const hasInspiration = ally.logic.buffs && 
                                  ally.logic.buffs.activeBuffs.some(b => b.id === 'inspiration');
            
            if (!hasInspiration) {
                candidate = ally;
            }
        });
        return candidate;
    }

    static findNearestEnemy(entity, enemies) {
        let nearest = null;
        let minDist = Infinity;
        enemies.forEach(enemy => {
            if (!enemy.active || !enemy.logic.isAlive) return;
            const dist = Phaser.Math.Distance.Between(entity.x, entity.y, enemy.x, enemy.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = enemy;
            }
        });
        return nearest;
    }
}

export default BardAI;
