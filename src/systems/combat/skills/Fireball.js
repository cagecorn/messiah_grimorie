import Logger from '../../../utils/Logger.js';
import projectileManager from '../ProjectileManager.js';

/**
 * 멀린 스킬: 파이어볼 (Fireball - Meteor variant)
 * 역할: [하늘에서 거대 운석 소환 + 범위 데미지]
 */
class Fireball {
    constructor() {
        this.id = 'Fireball';
        this.name = 'Fireball';
        this.mAtkMultiplier = 1.8; // 마법 공격력 계수
        this.scalingStat = 'mAtk';
    }

    /**
     * 스킬 실행
     */
    execute(owner, target) {
        if (!owner || !target) return;

        const targetDisplayName = target.logic ? target.logic.name : `Point(${Math.round(target.x)}, ${Math.round(target.y)})`;
        Logger.info("SKILL", `[Merlin] Fireball casted on ${targetDisplayName}!`);

        // 투사체 발사 (MeteorProjectile)
        projectileManager.fire('meteor', owner, target, {
            damageMultiplier: this.mAtkMultiplier,
            scale: 2.5,
            radius: 180,
            attribute: 'fire',
            isUltimate: false
        });

        return true;
    }
}

const fireball = new Fireball();
export default fireball;
