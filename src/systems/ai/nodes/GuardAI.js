import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import { ENTITY_CLASSES } from '../../../core/EntityConstants.js';
import HolyAuraAI from './HolyAuraAI.js';

/**
 * 가드 AI 노드 (Guard AI Node)
 * 역할: [팀 내 위저드/힐러/바드 주변을 맴돌며 수호]
 */
class GuardAI {
    /**
     * AI 로직 실행
     */
    static execute(entity, bb, delta) {
        if (!entity.logic.isAlive) return;

        // [FIX] 분신의 오라 스킬 사용 (스킬 게이지가 찼을 경우)
        HolyAuraAI.update(entity);

        // 1. 행동 불가 상태 체크
        if ((entity.status && entity.status.isUnableToAct()) || entity.isBusy) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 2. 보호 대상(Protected Target) 검색
        let protectTarget = bb.get('protectTarget');
        
        // 대상이 없거나 죽었으면 새로 검색
        if (!protectTarget || !protectTarget.active || !protectTarget.logic.isAlive) {
            protectTarget = this.findVulnerableAlly(entity);
            bb.set('protectTarget', protectTarget);
        }

        // 3. 보호 대상이 없으면 기본 MeleeAI로 전환 (혹은 대기)
        if (!protectTarget) {
            entity.moveDirection = { x: 0, y: 0 };
            return;
        }

        // 4. 보호 대상과의 거리 조절 (약 50~100 사이 유지)
        const dist = Phaser.Math.Distance.Between(entity.x, entity.y, protectTarget.x, protectTarget.y);
        const minBuffer = 50;
        const maxBuffer = 120;
        const auraRadius = 180; // 오라 혜택을 확실히 줄 수 있는 거리

        if (dist > maxBuffer) {
            // 대상에게 접근
            const angle = Math.atan2(protectTarget.y - entity.y, protectTarget.x - entity.x);
            entity.moveDirection = {
                x: Math.cos(angle),
                y: Math.sin(angle)
            };
            bb.set('state', 'move');
        } else if (dist < minBuffer) {
            // 너무 가까우면 살짝 거리를 벌림 (겹침 방지)
            const angle = Math.atan2(entity.y - protectTarget.y, entity.x - protectTarget.x);
            entity.moveDirection = {
                x: Math.cos(angle),
                y: Math.sin(angle)
            };
            bb.set('state', 'move');
        } else {
            // 적당한 거리 유지 중: 주변 적 감시 및 공격
            entity.moveDirection = { x: 0, y: 0 };
            
            // 주변에 적이 있으면 공격 시도
            const nearestEnemy = this.findNearestEnemyInRange(entity, 150);
            if (nearestEnemy) {
                entity.attack(nearestEnemy);
                bb.set('state', 'attack');
            } else {
                bb.set('state', 'idle');
            }
        }
    }

    /**
     * 팀 내 취약한 직업군(위저드, 힐러, 바드) 검색
     */
    static findVulnerableAlly(entity) {
        const scene = entity.scene;
        const allies = scene.allies || [];
        
        // 우선 순위 직업군
        const vulnerableClasses = [
            ENTITY_CLASSES.WIZARD,
            ENTITY_CLASSES.HEALER,
            ENTITY_CLASSES.BARD
        ];

        // 1. 해당 직업군 중 가장 가까운 아군 탐색
        let bestTarget = null;
        let minDist = Infinity;

        allies.forEach(ally => {
            if (ally === entity || !ally.logic.isAlive) return;
            
            if (vulnerableClasses.includes(ally.logic.className)) {
                const d = Phaser.Math.Distance.Between(entity.x, entity.y, ally.x, ally.y);
                if (d < minDist) {
                    minDist = d;
                    bestTarget = ally;
                }
            }
        });

        return bestTarget;
    }

    static findNearestEnemyInRange(entity, range) {
        const scene = entity.scene;
        const enemies = scene.enemies || [];
        let nearest = null;
        let minDist = range;

        enemies.forEach(enemy => {
            if (!enemy.logic.isAlive) return;
            const d = Phaser.Math.Distance.Between(entity.x, entity.y, enemy.x, enemy.y);
            if (d < minDist) {
                minDist = d;
                nearest = enemy;
            }
        });

        return nearest;
    }
}

export default GuardAI;
