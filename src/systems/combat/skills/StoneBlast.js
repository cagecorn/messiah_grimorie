import Logger from '../../../utils/Logger.js';
import projectileManager from '../ProjectileManager.js';

/**
 * 바오 스킬: 스톤 블래스트 (Stone Blast)
 * 역할: [염력으로 거대 바위 투척 + 범위 데미지]
 */
class StoneBlast {
    constructor() {
        this.id = 'StoneBlast';
        this.name = 'Stone Blast';
        this.mAtkMultiplier = 1.6; // 마법 공격력 1.6배 (유저 요청)
        this.scalingStat = 'mAtk';
    }

    /**
     * 스킬 실행
     */
    execute(owner, target) {
        if (!owner || !target) return;

        const targetDisplayName = target.logic ? target.logic.name : `Point(${Math.round(target.x)}, ${Math.round(target.y)})`;
        Logger.info("SKILL", `[Bao] Stone Blast casted on ${targetDisplayName}!`);

        // 투사체 발사 (RockProjectile)
        projectileManager.fire('stone_blast', owner, target, {
            damageMultiplier: this.mAtkMultiplier,
            scale: 2.0,     // 스킬 바위는 평타보다 더 큼
            radius: 120,    // AOE 반경
            isUltimate: false
        });

        return true;
    }
}

const stoneBlast = new StoneBlast();
export default stoneBlast;
