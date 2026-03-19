import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import aoeManager from '../AOEManager.js';
import pooledSmiteEffect from '../../graphics/effects/PooledSmiteEffect.js';

/**
 * 스마이트 (Smite)
 * 역할: [하늘에서 벼락을 내리쳐 범위 적에게 큰 피해]
 */
class Smite {
    constructor() {
        this.radius = 200; // [BUFF] 120 -> 200 범위 확대
        this.multiplier = 2.0; // 마법 공격력 2.0 계수
        this.damageType = 'magic'; // [FIX] 아직 속성 시스템이 없으므로 마법 데미지로 처리
    }

    /**
     * 스킬 실행
     */
    execute(owner, targetPoint) {
        if (!owner || !targetPoint) {
            Logger.warn("SMITE", "Execute failed: owner or targetPoint is null");
            return false;
        }

        Logger.info("SKILL", `${owner.logic.name} cast Smite at (${Math.round(targetPoint.x)}, ${Math.round(targetPoint.y)})`);

        // 1. 시각 효과 (번개)
        try {
            pooledSmiteEffect.spawn(targetPoint.x, targetPoint.y);
            Logger.debug("SMITE", "Visual effect spawned.");
        } catch (e) {
            Logger.error("SMITE", `Visual effect failed: ${e.message}`);
        }

        // 2. 데미지 판정 (AOE)
        owner.scene.time.delayedCall(150, () => {
            Logger.debug("SMITE", "Executing delayed AOE damage...");
            aoeManager.applyAOEDamagingEffect(
                owner,
                targetPoint.x,
                targetPoint.y,
                this.radius,
                this.multiplier,
                this.damageType,
                null,
                true // 궁극기 판정
            );
        });

        return true;
    }
}

const smite = new Smite();
export default smite;
