import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import BabaoConfig from '../../../data/summons/Babao.js';
import summonManager from '../../entities/SummonManager.js';
import BaseEntity from '../../../entities/BaseEntity.js';
import animationManager from '../../graphics/AnimationManager.js';

/**
 * 바오 고유 능력: 바바오 소환 (Summon Babao)
 * 역할: [바오의 동생 바바오를 전장에 소환]
 */
class SummonBabao {
    constructor() {
        this.id = 'SummonBabao';
        this.activeSummons = new Map(); // ownerID -> Babao CombatEntity
    }

    execute(owner) {
        if (!owner) return;

        const ownerId = owner.logic.id;
        let summon = this.activeSummons.get(ownerId);

        // 이미 소환되어 있거나 살아있다면 스킵
        if (summon && summon.active && summon.logic.isAlive) {
            return;
        }

        this.summon(owner);
    }

    summon(owner) {
        const scene = owner.scene;
        Logger.info("SKILL", `[Bao] Summoning little brother Babao!`);

        // 1. 스탯 계산 (바오의 MAtk 기반)
        const mAtk = owner.logic.getTotalMAtk();
        const scaledStats = { ...BabaoConfig.baseStats };
        
        // 스케일링 공식 (예시: MAtk에 비례하여 체력과 공격력 증가)
        scaledStats.maxHp = Math.floor(mAtk * 12 + 100);
        scaledStats.hp = scaledStats.maxHp;
        scaledStats.atk = Math.floor(mAtk * 2.0 + 20);
        scaledStats.def = Math.floor(mAtk * 0.8 + 15);
        scaledStats.mDef = Math.floor(mAtk * 0.6 + 10);

        // 2. 논리 객체 생성
        const summonLogic = new BaseEntity({
            id: `summon_babao_${owner.logic.id}_${Date.now()}`,
            baseId: 'babao',
            name: 'Babao',
            type: 'summon',
            className: BabaoConfig.className,
            isSpecial: true,
            level: owner.logic.level || 1, 
            baseStats: scaledStats
        });

        // 3. 물리 엔티티 생성
        // 바오 주변에 소환
        const spawnX = owner.x + (owner.team === 'mercenary' ? 80 : -80);
        const spawnY = owner.y + Phaser.Math.Between(-30, 30);
        const spriteKey = 'babao_sprite';

        const summon = summonManager.spawnSummon(scene, summonLogic, owner.team, spawnX, spawnY, spriteKey);
        
        if (summon) {
            // 4. 소환 이펙트 (범용 효과 혹은 전용 효과)
            if (animationManager.playStoneExplosion) {
                animationManager.playStoneExplosion(spawnX, spawnY);
            }
            
            // 5. 관리 목록에 등록
            this.activeSummons.set(owner.logic.id, summon);
            
            Logger.system(`Babao summoned for ${owner.logic.name}.`);
        }
    }
}

const summonBabao = new SummonBabao();
export default summonBabao;
