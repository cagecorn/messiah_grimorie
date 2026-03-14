import Phaser from 'phaser';
import combatManager from '../../CombatManager.js';

/**
 * 아쿠아 버스트 AI (Aqua Burst AI)
 * 역할: [적들이 밀집된 지역을 타겟팅]
 */
export const decideAquaBurstTarget = (owner) => {
    // 1. 모든 적 유닛 검색
    const enemies = [];
    combatManager.units.forEach(unit => {
        if (unit.active && unit.logic.isAlive && unit.team !== owner.team) {
            enemies.push(unit);
        }
    });

    if (enemies.length === 0) return null;

    // 2. 가장 밀집된 지역 타겟팅 (단순화: 주변에 적이 가장 많은 적 선택)
    let bestTarget = enemies[0];
    let maxCount = -1;

    enemies.forEach(candidate => {
        let count = 0;
        enemies.forEach(other => {
            const dist = Phaser.Math.Distance.Between(candidate.x, candidate.y, other.x, other.y);
            if (dist < 100) count++;
        });

        if (count > maxCount) {
            maxCount = count;
            bestTarget = candidate;
        }
    });

    return bestTarget;
};
