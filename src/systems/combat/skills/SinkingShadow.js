import Logger from '../../../utils/Logger.js';
import projectileManager from '../ProjectileManager.js';
import animationManager from '../../../systems/graphics/AnimationManager.js';
import fxManager from '../../../systems/graphics/FXManager.js';
import Airborne from '../effects/Airborne.js';
import combatManager from '../../CombatManager.js';

/**
 * 씽킹 섀도우 (Sinking Shadow)
 * 역할: [그림자 속으로 숨어 이동 후 광역 공격 및 에어본]
 */
export default {
    id: 'sinking_shadow',
    name: 'Sinking Shadow',
    description: '그림자 속으로 숨어 이동한 뒤, 적진 한가운데서 튀어나와 광역 피해를 입히고 적들을 공중으로 띄웁니다.',
    cooldown: 5000,
    manaCost: 30,

    /**
     * 스킬 실행
     */
    execute(attacker, targetPos) {
        Logger.info("SKILL", `${attacker.logic.name} uses Sinking Shadow!`);

        // 1. 그림자 투사체 발사 (이동 수단)
        const config = {
            speed: 600,
            onComplete: () => {
                this.onArrive(attacker);
            }
        };

        projectileManager.fire('shadow_dive', attacker, targetPos, config);
        return true;
    },

    /**
     * 목적지 도착 시 (튀어나오기 + 공격)
     */
    onArrive(attacker) {
        // 1. 광역 공격 판정
        const range = 120;
        const damageMult = 2.5;
        const airborneDuration = 1000;

        // 시각 효과 (폭발 등)
        fxManager.playEffect('explosion', attacker.x, attacker.y, { scale: 1.5 });
        
        // 주변 적 탐색 및 피해
        const enemies = (attacker.team === 'mercenary') ? 
            attacker.scene.enemies : attacker.scene.allies;

        enemies.forEach(enemy => {
            if (!enemy.active || !enemy.logic.isAlive) return;
            
            const dist = Phaser.Math.Distance.Between(attacker.x, attacker.y, enemy.x, enemy.y);
            if (dist <= range) {
                // 데미지 처리
                const damage = combatManager.calculateDamage(attacker, enemy, damageMult);
                combatManager.processDamage(attacker, enemy, damage);

                // 에어본 적용
                Airborne.apply(enemy, airborneDuration, 120, attacker);
            }
        });

        Logger.info("SKILL", `Sinking Shadow strike completed by ${attacker.logic.name}`);
    }
};
