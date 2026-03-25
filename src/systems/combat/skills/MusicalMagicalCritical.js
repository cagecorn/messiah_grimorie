import Logger from '../../../utils/Logger.js';
import combatManager from '../../CombatManager.js';
import MusicalMagicalCriticalAI from './MusicalMagicalCriticalAI.js';
import pooledMusicalMagicalCriticalEffect from '../../graphics/effects/PooledMusicalMagicalCriticalEffect.js';
import CriticalUp from '../effects/CriticalUp.js';
import Phaser from 'phaser';

/**
 * 나나 스킬: 뮤지컬 매지컬 크리티컬 (Musical Magical Critical) - 리뉴얼 버전
 * 역할: [광역 마법 피해 + 아군 치명타 확률 버프]
 * AI: 적군 혹은 아군이 가장 밀집된 지역을 자동 조준
 */
class MusicalMagicalCritical {
    constructor() {
        this.id = 'MusicalMagicalCritical';
        this.name = 'Musical Magical Critical';
        this.mAtkMultiplier = 1.6; // 약간 상향
        this.scalingStat = 'mAtk';
        this.radius = 180;
    }

    execute(owner) {
        if (!owner || !owner.logic.isAlive) return;

        // 1. 최적의 타격 지점 결정 (AI 로직 활용)
        const targetPoint = MusicalMagicalCriticalAI.decideTarget(owner, this.radius);
        if (!targetPoint) return false;

        Logger.info("SKILL", `[Nana] MUSICAL MAGICAL CRITICAL cast on (${Math.round(targetPoint.x)}, ${Math.round(targetPoint.y)})!`);

        // 2. 시각 효과 (Pooled Effect 사용)
        pooledMusicalMagicalCriticalEffect.spawn(targetPoint.x, targetPoint.y);

        // 3. 범위 내 적군에게 데미지 적용
        const scene = owner.scene;
        const enemies = (owner.team === 'mercenary' || owner.team === 'ally') ? scene.enemies : scene.allies;
        const allies = (owner.team === 'mercenary' || owner.team === 'ally') ? scene.allies : scene.enemies;

        enemies.forEach(enemy => {
            if (enemy.active && enemy.logic.isAlive) {
                const dist = Phaser.Math.Distance.Between(targetPoint.x, targetPoint.y, enemy.x, enemy.y);
                if (dist <= this.radius) {
                    combatManager.processDamage(owner, enemy, this.mAtkMultiplier, 'magic', 'none');
                }
            }
        });

        // 4. 범위 내 아군에게 치명타 버프 적용
        allies.forEach(ally => {
            if (ally.active && ally.logic.isAlive) {
                const dist = Phaser.Math.Distance.Between(targetPoint.x, targetPoint.y, ally.x, ally.y);
                if (dist <= this.radius) {
                    // CriticalUp 스태틱 메서드를 통한 버프 부여
                    CriticalUp.apply(ally, 0.2, 10000); // 10초간 20% 증가
                }
            }
        });

        return true;
    }
}

const musicalMagicalCritical = new MusicalMagicalCritical();
export default musicalMagicalCritical;
