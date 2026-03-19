import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import ultimateCutsceneManager from '../../../ui/UltimateCutsceneManager.js';
import BoonCloneConfig from '../../../data/summons/BoonClone.js';
import summonManager from '../../entities/SummonManager.js';
import BaseEntity from '../../../entities/BaseEntity.js';
import smite from './Smite.js';
import SmiteAI from '../../ai/nodes/SmiteAI.js';
import localizationManager from '../../../core/LocalizationManager.js';

/**
 * 분 궁극기: 너의 존재를 증명하라! (Prove Your Existence!)
 * 역할: [분신 소환 또는 스마이트 공격]
 */
class ProveYourExistence {
    constructor() {
        this.activeClones = new Map(); // ownerID -> Clone CombatEntity
    }

    execute(owner, targetPoint) {
        if (!owner) return false;

        const ownerId = owner.logic.id;
        let existingClone = this.activeClones.get(ownerId);

        // [FIX] 사망한 클론은 맵에서 제거하여 상태 꼬임 방지
        if (existingClone && (!existingClone.active || !existingClone.logic.isAlive)) {
            this.activeClones.delete(ownerId);
            existingClone = null;
            owner.isUltActive = false; // [Safety] 게이지 충전 재개 보장
        }

        // 분신이 살아있는지 체크
        if (existingClone) {
            // [상태 2] 스마이트 공격
            return this.executeSmite(owner, targetPoint);
        } else {
            // [상태 1] 분신 소환
            return this.executeSummon(owner);
        }
    }

    /**
     * 분신 소환
     */
    executeSummon(owner) {
        // 컷씬 출력
        ultimateCutsceneManager.show('boon', localizationManager.t('ult_boon_name'));

        const scene = owner.scene;
        
        // 본체 스탯 상속 (마법 공격력 특화)
        const scaledStats = { 
            ...BoonCloneConfig.baseStats,
            maxHp: Math.floor(owner.logic.getTotalMaxHp() * 1.0), // 분신도 튼튼함
            hp: Math.floor(owner.logic.getTotalMaxHp() * 1.0),
            mAtk: Math.floor(owner.logic.getTotalMAtk() * 0.8), // 80% 위력
            def: owner.logic.getTotalDef(),
            mDef: owner.logic.getTotalMDef(),
            speed: owner.logic.getTotalSpeed()
        };

        const cloneLogic = new BaseEntity({
            id: `summon_boon_clone_${owner.logic.id}_${Date.now()}`,
            baseId: 'boon_clone', // [주의] AIManager에서 이 ID로 GuardAI를 찾아야 함
            name: 'Boon Clone',
            type: 'summon',
            className: BoonCloneConfig.className,
            isSpecial: true,
            level: owner.logic.level,
            baseStats: scaledStats
        });

        const clone = summonManager.spawnSummon(
            scene, 
            cloneLogic, 
            owner.team, 
            owner.x + 40, 
            owner.y + 40, 
            BoonCloneConfig.spriteKey
        );

        if (clone) {
            this.activeClones.set(owner.logic.id, clone);
            // 분신은 약간 투명하게 혹은 다르게 표시 (필요시)
            clone.sprite.setTint(0xccffff); // 신성한 정령 느낌
            
            Logger.info("ULTIMATE", `[Boon] Prove Your Existence: Clone summoned.`);
            return true;
        }

        return false;
    }

    /**
     * 스마이트 공격
     */
    executeSmite(owner, targetPoint) {
        Logger.debug("BOON_ULT", `executeSmite called with targetPoint: ${targetPoint ? `(${targetPoint.x}, ${targetPoint.y})` : 'NULL'}`);
        const actualTarget = targetPoint || SmiteAI.getBestTarget(owner);
        Logger.debug("BOON_ULT", `actualTarget determined: ${actualTarget ? `(${actualTarget.x}, ${actualTarget.y})` : 'NULL'}`);
        
        if (!actualTarget) return false;

        if (smite.execute(owner, actualTarget)) {
            Logger.info("ULTIMATE", `[Boon] Smite executed!`);
            return true;
        }
        return false;
    }
}

const proveYourExistence = new ProveYourExistence();
export default proveYourExistence;
