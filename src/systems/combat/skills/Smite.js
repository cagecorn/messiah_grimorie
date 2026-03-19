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
        this.radius = 120;
        this.multiplier = 2.0; // 마법 공격력 2.0 계수
        this.damageType = 'lightning';
    }

    /**
     * 스킬 실행
     */
    execute(owner, targetPoint) {
        if (!owner || !targetPoint) return false;

        Logger.info("SKILL", `${owner.logic.name} cast Smite at (${Math.round(targetPoint.x)}, ${Math.round(targetPoint.y)})`);

        // 1. 시각 효과 (번개)
        pooledSmiteEffect.spawn(targetPoint.x, targetPoint.y);

        // 2. 데미지 판정 (AOE)
        // 약간의 딜레이 후 데미지 적용 (번개가 떨어지는 타이밍에 맞춤)
        owner.scene.time.delayedCall(150, () => {
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
