import Phaser from 'phaser';
import combatManager from '../../CombatManager.js';
import coordinateManager from '../../combat/CoordinateManager.js';

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

    // 2. 가장 밀집된 지역 타겟팅 (CoordinateManager 활용)
    const targetPoint = coordinateManager.getBestAOETarget(enemies, 120);
    return enemies.find(e => e.x === targetPoint.x && e.y === targetPoint.y) || enemies[0];
};
