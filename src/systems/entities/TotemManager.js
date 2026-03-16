import Logger from '../../utils/Logger.js';
import poolingManager from '../../core/PoolingManager.js';
import CombatEntity from '../../entities/CombatEntity.js';
import TotemLogic from '../../entities/TotemEntity.js';
import SpiritTotem from '../../data/summons/joojoo/SpiritTotem.js';
import FireTotem from '../../data/summons/joojoo/FireTotem.js';
import HealingTotem from '../../data/summons/joojoo/HealingTotem.js';
import InstanceIDManager from '../../utils/InstanceIDManager.js';
import { STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 토템 매니저 (Totem Manager)
 * 역할: [토템의 생성, 풀링 관리 및 수명 관리 전담]
 * 
 * 설명: 주주가 사용하는 모든 토템은 이곳을 통해 생성되며, 
 * 가비지 컬렉션 부하를 줄이기 위해 풀링이 기본으로 적용됩니다.
 */
class TotemManager {
    constructor() {
        this.scene = null;
        this.totemTypes = {
            spirit: SpiritTotem,
            fire: FireTotem,
            healing: HealingTotem
        };
    }

    /**
     * 초기화: 토템 종류별 풀 등록
     */
    init(scene) {
        this.scene = scene;

        Object.keys(this.totemTypes).forEach(type => {
            const poolKey = `totem_${type}`;
            const data = this.totemTypes[type];

            poolingManager.registerPool(poolKey, () => {
                // 더미 로직으로 초기 엔티티 생성
                const dummyLogic = new TotemLogic({
                    id: `dummy_${poolKey}`,
                    name: `Dummy ${type}`,
                    type: 'summon',
                    baseStats: data.baseStats || {}
                });
                const entity = new CombatEntity(scene, 0, 0, dummyLogic, data.spriteKey);
                entity.poolType = poolKey;
                return entity;
            }, 10, true);
        });

        Logger.system("TotemManager: Pooling registered for spirit, fire, and healing totems.");
    }

    /**
     * 토템 스폰
     */
    spawnTotem(type, ownerEntity, x, y) {
        if (!this.scene) {
            Logger.error("TOTEM_MANAGER", "Cannot spawn totem: scene not initialized.");
            return null;
        }

        const data = this.totemTypes[type];
        if (!data) {
            Logger.error("TOTEM_MANAGER", `Unknown totem type: ${type}`);
            return null;
        }

        const poolKey = `totem_${type}`;
        const owner = ownerEntity.logic;

        // 1. 논리 객체 생성 (매번 새로 생성하여 독립적 스탯 유지)
        const totemId = InstanceIDManager.generate(type === 'spirit' ? 'spirit_totem' : (type === 'fire' ? 'fire_totem' : 'healing_totem'));
        
        // 2. [핵심] 주인의 마법 공격력 100% 전이
        let masterMAtk = owner.getTotalMAtk();
        
        // [안전장치] 만약 주인의 MAtk이 0이라면(초기화 지연 등), 레지스트리 데이터의 기본값 호출 시도
        if (masterMAtk <= 0) {
            masterMAtk = owner.stats.baseStats[STAT_KEYS.M_ATK] || 25;
            Logger.warn("TOTEM_MANAGER", `Joojoo's MAtk is 0. Using fallback: ${masterMAtk}`);
        }

        const baseStats = { ...data.baseStats };
        baseStats[STAT_KEYS.M_ATK] = masterMAtk; 
        
        // HP도 주인의 영향을 받게 할 수 있지만 현재는 데이터 파일 기준
        
        const logic = new TotemLogic({
            id: totemId,
            name: data.name,
            type: 'summon',
            className: data.className,
            baseStats: baseStats,
            master: owner // 주인 참조 (게이지 전이용)
        });

        // 3. 물리 엔티티 획득 (풀링)
        let combatEntity = poolingManager.get(poolKey);
        
        if (combatEntity) {
            combatEntity.init(x, y, logic, data.spriteKey);
        } else {
            combatEntity = new CombatEntity(this.scene, x, y, logic, data.spriteKey);
            combatEntity.poolType = poolKey;
        }

        // 4. 팀 설정 (주인과 동일)
        combatEntity.team = ownerEntity.team;

        // 5. 씬 관리 리스트 추가
        const isAlly = (combatEntity.team === 'mercenary' || combatEntity.team === 'ally');
        if (isAlly) {
            if (this.scene.allies && !this.scene.allies.includes(combatEntity)) this.scene.allies.push(combatEntity);
        } else {
            if (this.scene.enemies && !this.scene.enemies.includes(combatEntity)) this.scene.enemies.push(combatEntity);
        }

        // 6. [수명 관리] 수동 파괴 또는 타이머로 처리 (현재는 데이터에 duration이 있다면 연동 가능)
        const duration = 15000; // 기본 15초
        this.scene.time.delayedCall(duration, () => {
            if (combatEntity.active && combatEntity.logic.isAlive) {
                combatEntity.handleDeath(); 
            }
        });

        Logger.info("TOTEM", `Spawned pooled totem: ${logic.name} (Source: ${owner.name}, MAtk: ${masterMAtk})`);
        return combatEntity;
    }
}

const totemManager = new TotemManager();
export default totemManager;
