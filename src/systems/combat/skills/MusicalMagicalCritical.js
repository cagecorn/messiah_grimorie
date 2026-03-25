import Logger from '../../../utils/Logger.js';
import combatManager from '../../CombatManager.js';
import fxManager from '../../graphics/FXManager.js';

/**
 * 나나 스킬: 뮤지컬 매지컬 크리티컬 (Musical Magical Critical)
 * 역할: [광역 마법 피해 + 아군 치명타 확률 버프]
 */
class MusicalMagicalCritical {
    constructor() {
        this.id = 'MusicalMagicalCritical';
        this.name = 'Musical Magical Critical';
        this.mAtkMultiplier = 1.5;
        this.scalingStat = 'mAtk';
    }

    execute(owner) {
        if (!owner || !owner.logic.isAlive) return;

        Logger.info("SKILL", `[Nana] MUSICAL MAGICAL CRITICAL!`);

        // 1. 시각 효과 (음표 연출)
        if (owner.scene && owner.scene.fxManager) {
            owner.scene.fxManager.showInspirationEffect(owner);
        }

        // 2. 주변 적들에게 데미지 (박수 소리와 함께?) 
        // 여기서는 간단하게 모든 적 대상 (또는 범위를 넓게)
        const scene = owner.scene;
        if (scene && scene.enemies) {
            scene.enemies.forEach(enemy => {
                if (enemy.active && enemy.logic.isAlive) {
                    combatManager.processDamage(owner, enemy, this.mAtkMultiplier, 'magic', 'none');
                }
            });
        }

        // 3. 아군들에게 치명타 버프
        if (scene && scene.allies) {
            scene.allies.forEach(ally => {
                if (ally.active && ally.logic.isAlive && ally.logic.buffs) {
                    ally.logic.buffs.addBuff({
                        id: 'nana_crit_buff',
                        key: 'crit',
                        value: 0.2, // 20% 증가
                        type: 'add',
                        duration: 8000 // 8초
                    });
                    
                    // 버프 시각 피드백
                    if (scene.fxManager) scene.fxManager.showHealEffect(ally);
                }
            });
        }

        return true;
    }
}

const musicalMagicalCritical = new MusicalMagicalCritical();
export default musicalMagicalCritical;
