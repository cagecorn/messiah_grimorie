import AuraSkill from './AuraSkill.js';
import Logger from '../../../utils/Logger.js';
import phaserParticleManager from '../../graphics/PhaserParticleManager.js';
import combatManager from '../../CombatManager.js';

/**
 * 홀리 오라 (Holy Aura)
 * 역할: [주변 아군에게 마법 공격력 비례 지속 치유 제공]
 */
class HolyAura extends AuraSkill {
    constructor() {
        super({
            id: 'HolyAura',
            radius: 200,
            interval: 1000, // 1초마다 틱
            color: 0x00ffaa // 청록색 계열의 신성한 오라 색상
        });
        this.healMultiplier = 0.5; // 마법 공격력의 50%만큼 틱당 회복
    }

    /**
     * [FIX] 마법 공격력에 따른 오라 범위 확장 로직
     */
    updateDynamicRadius(owner) {
        if (!owner || !owner.logic) return;
        
        const baseRadius = 200;
        const mAtk = owner.logic.getTotalMAtk();
        
        // 마법 공격력 10당 5px 증가 (최대 450px)
        const bonusRadius = Math.min(250, mAtk * 0.5);
        this.radius = baseRadius + bonusRadius;

        // 시각 효과(AuraSprite)에도 반지름 동기화
        const ownerId = owner.logic.id;
        const auraData = this.activeAuras.get(ownerId);
        if (auraData && auraData.auraSprite) {
            if (auraData.auraSprite.radius !== this.radius) {
                auraData.auraSprite.radius = this.radius;
                auraData.auraSprite.drawAura(); // 다시 그리기
            }
        }
    }

    /**
     * 오라 효과 적용: 주변 아군 치유
     */
    applyAuraEffect(owner, targets) {
        if (!owner || !owner.logic) return;

        const healAmount = owner.logic.getTotalMAtk() * this.healMultiplier;
        
        // 필터링: 아군만 치유
        const allies = targets.filter(t => t.team === owner.team);

        if (allies.length > 0) {
            allies.forEach(ally => {
                if (ally.logic && ally.logic.isAlive) {
                    // [FIX] 컴뱃 매니저를 통해 힐 처리 (수치 팝업 및 게이지 충전 연동)
                    combatManager.processHeal(owner, ally, this.healMultiplier);
                    
                    // 치유 이펙트 (파티클 매니저 활용)
                    if (phaserParticleManager.spawnHealBurst) {
                        phaserParticleManager.spawnHealBurst(ally.x, ally.y);
                    }
                }
            });
            // Logger.debug("SKILL", `${owner.logic.name}'s Holy Aura healed ${allies.length} allies.`);
        }
    }
}

const holyAura = new HolyAura();
export default holyAura;
