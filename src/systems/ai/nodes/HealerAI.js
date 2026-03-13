import Phaser from 'phaser';
import MassHealAI from './MassHealAI.js';
import SummonGuardianAngelAI from './SummonGuardianAngelAI.js';

/**
 * 힐러 AI 노드 (Healer AI Node)
 * 역할: [아군 회복 우선, 적군과 거리 유지(카이팅)]
 */
class HealerAI {
    /**
     * @param {CombatEntity} entity AI 주체 (세라)
     * @param {Blackboard} bb 데이터 저장소
     * @param {number} delta 
     */
    static execute(entity, bb, delta) {
        if (!entity.active || !entity.logic.isAlive) return;

        const scene = entity.scene;
        const allies = (entity.team === 'mercenary') ? scene.allies : scene.enemies;
        const enemies = (entity.team === 'mercenary') ? scene.enemies : scene.allies;

        // [USER 요청] 궁극기 우선 체크
        if (SummonGuardianAngelAI.update(entity, allies)) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // [USER 요청] 매스 힐 스킬 체크 (쿨타임 시 즉시 시전)
        // 스킬을 사용했다면 이번 프레임의 다른 행동은 건너뜁니다.
        if (MassHealAI.execute(entity, bb)) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 1. 타겟 결정 (힐이 필요한 아군 vs 공격할 적)
        const healTarget = this.findLowestHPAlly(allies);
        const enemyTarget = bb.get('target'); 
        
        // [USER 요청] 힐 우선순위
        let activeTarget = healTarget || enemyTarget;
        
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
                // [USER 요청] 적군과 거리가 가까울 경우 무조건 멀어지면서 행동
                const angle = Phaser.Math.Angle.Between(nearestEnemy.x, nearestEnemy.y, entity.x, entity.y);
                dx = Math.cos(angle);
                dy = Math.sin(angle);
                isEmergencyKiting = true;
                console.log(`[HealerAI] Sera is Emergency Kiting away from ${nearestEnemy.logic.name}`);
            }
        }

        // 4. 이동 및 행동 로직 수행
        if (isEmergencyKiting) {
            if (distToTarget <= rangeMax) {
                entity.attack(activeTarget);
            }
        } else {
            if (distToTarget > rangeMax) {
                const angle = Phaser.Math.Angle.Between(entity.x, entity.y, activeTarget.x, activeTarget.y);
                dx = Math.cos(angle) * 0.8;
                dy = Math.sin(angle) * 0.8;
            } else if (distToTarget < rangeMin && activeTarget === enemyTarget) {
                const angle = Phaser.Math.Angle.Between(activeTarget.x, activeTarget.y, entity.x, entity.y);
                dx = Math.cos(angle);
                dy = Math.sin(angle);
            } else {
                dx = 0;
                dy = 0;
                entity.attack(activeTarget);
            }
        }

        entity.moveDirection = { x: dx, y: dy };
    }

    static findLowestHPAlly(allies) {
        let lowest = null;
        let minRatio = 1.0; 
        allies.forEach(ally => {
            if (!ally.active || !ally.logic.isAlive) return;
            
            const hp = ally.logic.hp;
            const maxHp = ally.logic.getTotalMaxHp();
            
            // [USER 요청] 풀피가 아니면 힐 가능 대상.
            if (hp < maxHp) {
                const ratio = hp / maxHp;
                // 가장 체력 비율이 낮은 아군을 최우선으로 찾음
                // ratio가 1.0(풀피)보다 작고, 기존 minRatio보다 작을 때 교체
                if (ratio < minRatio) {
                    minRatio = ratio;
                    lowest = ally;
                }
            }
        });
        return lowest;
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

export default HealerAI;
