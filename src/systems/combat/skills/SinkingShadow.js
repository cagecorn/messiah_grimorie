import Logger from '../../../utils/Logger.js';
import projectileManager from '../ProjectileManager.js';
import fxManager from '../../../systems/graphics/FXManager.js';
import Airborne from '../effects/Airborne.js';
import combatManager from '../../CombatManager.js';

// [3단계 노드 임포트]
import SinkingNode from '../../../systems/graphics/nodes/SinkingNode.js';
import ShadowDashNode from '../../../systems/graphics/nodes/ShadowDashNode.js';
import EmergingNode from '../../../systems/graphics/nodes/EmergingNode.js';

/**
 * 씽킹 섀도우 (Sinking Shadow) - 3단계 노드 리팩토링 버전
 */
export default {
    id: 'sinking_shadow',
    name: 'Sinking Shadow',
    description: '그림자 속으로 숨어 이동한 뒤, 적진 한가운데서 튀어나와 광역 피해를 입히고 적들을 공중으로 띄웁니다.',
    cooldown: 5000,
    manaCost: 30,

    execute(attacker, targetPos) {
        if (attacker.isBusy) return false;

        // 1. 투사체 생성 (이동 속도 0으로 초기화)
        const config = {
            speed: 600,
            onComplete: () => {
                // Phase 3: Emerging (그림자 대쉬 완료 시)
                EmergingNode.execute(attacker, projectile, () => {
                    this.applyImpact(attacker);
                });
            }
        };

        const projectile = projectileManager.fire('shadow_dive', attacker, targetPos, config);
        if (!projectile) return false;

        // Phase 1: Sinking
        SinkingNode.execute(attacker, projectile, () => {
            // Phase 2: Shadow Dash (가라앉기 완료 후 대쉬 시작)
            ShadowDashNode.execute(attacker, projectile);
        });

        return true;
    },

    /**
     * 최종 충격파 적용 (Emerging 완료 후 호출)
     */
    applyImpact(attacker) {
        const range = 120;
        const damageMult = 2.5;
        const airborneDuration = 1000;

        fxManager.playEffect('explosion', attacker.x, attacker.y, { scale: 1.5 });
        
        const enemies = (attacker.team === 'mercenary') ? 
            attacker.scene.enemies : attacker.scene.allies;

        enemies.forEach(enemy => {
            if (!enemy.active || !enemy.logic.isAlive) return;
            
            const dist = Phaser.Math.Distance.Between(attacker.x, attacker.y, enemy.x, enemy.y);
            if (dist <= range) {
                combatManager.processDamage(attacker, enemy, damageMult, 'physical');
                Airborne.apply(enemy, airborneDuration, 120, attacker);
            }
        });

        Logger.info("SKILL", `Sinking Shadow impact applied by ${attacker.logic.name}`);
    }
};
