import Logger from '../../../utils/Logger.js';
import projectileManager from '../ProjectileManager.js';

/**
 * 아이나 스킬: 아이스볼 (Ice Ball)
 * 역할: [적에게 마법 피해를 입히는 얼음 구체 발사]
 * 계수: 마법 공격력 1.8배
 */
class SkillIceBall {
    constructor() {
        this.id = 'skilliceball';
        this.name = 'Ice Ball';
        this.mAtkMultiplier = 1.8; // 마법 공격력 계수
        this.scalingStat = 'mAtk';
    }

    /**
     * 스킬 실행
     */
    execute(owner, target) {
        if (!owner || !target) return;

        const targetDisplayName = target.logic ? target.logic.name : `Point(${Math.round(target.x)}, ${Math.round(target.y)})`;
        Logger.info("SKILL", `[Aina] Ice Ball casted on ${targetDisplayName}!`);

        // 투사체 발사
        projectileManager.fire('ice_ball', owner, target, {
            damageMultiplier: this.mAtkMultiplier,
            speed: 850
        });

        return true;
    }
}

const skillIceBall = new SkillIceBall();
export default skillIceBall;
