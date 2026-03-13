import Logger from '../../../utils/Logger.js';

/**
 * 세라 스킬: 매스 힐 (Mass Heal)
 */
class MassHeal {
    constructor() {
        this.id = 'massheal';
        this.name = 'Mass Heal';
        this.healCoefficient = 1.5; // [USER 요청] 마법 공격력의 1.5배 (하드코딩 방지)
    }

    execute(owner) {
        if (!owner || !owner.scene) return;
        
        const scene = owner.scene;
        const allies = (owner.team === 'mercenary') ? scene.allies : scene.enemies;
        
        Logger.info("SKILL", `[${owner.logic.name}] Mass Heal casted!`);

        // 1. 시전자 중심의 광역 시각 효과 (초록 써클 퍼짐 + 회전)
        const fxManager = owner.combat.fxManager;
        if (fxManager && fxManager.showMassHealCircle) {
            fxManager.showMassHealCircle(owner);
        }

        // 2. 마법 공격력 기반 힐량 계산
        const healAmount = owner.logic.getTotalMAtk() * this.healCoefficient;

        // 3. 파티원 전원에게 힐 적용 및 이펙트 출력
        allies.forEach(ally => {
            if (ally.active && ally.logic.isAlive) {
                // FX 출력
                fxManager.showDamageText(ally.x, ally.y, Math.floor(healAmount), 'heal');
                fxManager.showHealEffect(ally);
                
                // 실제 힐 적용
                ally.heal(healAmount);
            }
        });

        // 디버깅 로그
        console.log(`[MassHeal] ${owner.logic.name} recovered ${allies.length} members for ${Math.floor(healAmount)} HP.`);
        
        // 스킬 쿨다운 리셋
        owner.skillProgress = 0;
    }
}

export default new MassHeal();
