import Logger from '../../utils/Logger.js';
import CombatEntity from '../../entities/CombatEntity.js';
import IceStormCloud from '../../entities/summons/IceStormCloud.js';

/**
 * 소환물 매니저 (Summon Manager)
 * 역할: [전투 중 임시 소환되는 유닛 관리]
 */
class SummonManager {
    constructor() {
        this.activeSummons = new Map(); // EntityID -> CombatEntity
        this.registry = {
            'ice_storm_cloud': IceStormCloud
        };
    }

    /**
     * [신규] 소환물 스폰 (세이렌 등)
     * 역할: 논리 객체와 물리(Phaser) 객체를 한꺼번에 생성하고 관리 리스트에 추기
     */
    spawnSummon(scene, logicEntity, team, x, y, spriteKey) {
        if (!scene) return null;

        const EntityClass = this.registry[logicEntity.baseId] || CombatEntity;
        const combatEntity = new EntityClass(scene, x, y, logicEntity, spriteKey);
        combatEntity.team = team;

        // 씬의 유닛 목록에 추가 (팀 판정 하드코딩 방지: mercenary/ally는 아군, 그 외는 적군)
        const isAlly = (team === 'mercenary' || team === 'ally');
        
        if (isAlly) {
            if (scene.allies) scene.allies.push(combatEntity);
        } else {
            if (scene.enemies) scene.enemies.push(combatEntity);
        }

        this.activeSummons.set(logicEntity.id, combatEntity);

        Logger.info("SUMMON", `Spawned summon: ${logicEntity.name} (Team: ${team})`);
        return combatEntity;
    }

    removeSummon(logicId) {
        const entity = this.activeSummons.get(logicId);
        if (entity) {
            entity.destroy(); // Phaser 엔티티 파괴 (logicEntity 포함)
            this.activeSummons.delete(logicId);
            Logger.info("SUMMON", `Summon ${logicId} removed.`);
        }
    }
}

const summonManager = new SummonManager();
export default summonManager;
