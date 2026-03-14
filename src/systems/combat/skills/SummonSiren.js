import Logger from '../../../utils/Logger.js';
import SirenEntity from '../../../data/summons/siren.js';
import combatManager from '../../CombatManager.js';
import summonManager from '../../entities/SummonManager.js';
import skillManager from '../SkillManager.js';
import ultimateManager from '../UltimateManager.js';
import ultimateCutsceneManager from '../../../ui/UltimateCutsceneManager.js';

/**
 * 소환: 세이렌 (Summon: Siren)
 * 역할: [Lute의 궁극기 - 세이렌 소환, 강화, 회복]
 */
class SummonSiren {
    constructor() {
        this.activeSummons = new Map(); // ownerID -> Siren CombatEntity
        this.upgradeStage = new Map(); // ownerID -> stage level (0: Just summoned, 1: Upgraded)
    }

    execute(owner) {
        if (!owner) return;

        const ownerId = owner.logic.id;
        let siren = this.activeSummons.get(ownerId);

        // 컷씬 연출
        ultimateCutsceneManager.show('lute', 'Summon: Siren');

        // 게이지 초기화 (AI에서 useUltimate를 쓸 경우 중복되지만, 직접 호출을 대비해 유지)
        owner.ultimateProgress = 0;
        if (owner.hpBar) owner.hpBar.isDirty = true;

        if (!siren || !siren.active || !siren.logic.isAlive) {
            // 1단계: 세이렌 소환
            this.summon(owner);
        } else if ((this.upgradeStage.get(ownerId) || 0) === 0) {
            // 2단계: 수면 방울로 강화
            this.upgrade(owner, siren);
        } else {
            // 3단계+: 세이렌 체력 100% 회복
            this.heal(owner, siren);
        }
    }

    summon(owner) {
        Logger.info("ULTIMATE", `${owner.name} summons the Siren!`);
        
        // Siren Logic Entity 생성 (owner.logic을 pass하여 stat scaling)
        const sirenLogic = new SirenEntity({}, owner.logic);
        
        // Phaser Entity (Visual) 생성 및 스폰 (SummonManager 중앙화)
        const spawnX = owner.x + (owner.team === 'mercenary' ? 100 : -100);
        const spawnY = owner.y;
        const siren = summonManager.spawnSummon(owner.scene, sirenLogic, owner.team, spawnX, spawnY, 'siren_sprite');
        
        if (siren) {
            this.activeSummons.set(owner.id, siren);
            this.upgradeStage.set(owner.id, 0);
            
            // 시각 효과 연출 (HP바 등)
            if (owner.scene.fxManager) {
                owner.scene.fxManager.showImpactEffect(siren, 'magic');
            }
        }
    }

    upgrade(owner, siren) {
        Logger.info("ULTIMATE", `${owner.name} upgrades Siren to Sleeping Bubble!`);
        this.upgradeStage.set(owner.id, 1);
        
        const sirenLogic = siren.logic;
        
        // 세이렌의 스킬을 수면 방울(siren_upgraded)로 변경
        // SirenEntity의 logicId를 변경하고 components를 리셋하여 스킬을 교체
        sirenLogic.id = 'siren_upgraded';
        if (siren.skills) {
            siren.skills.reset(skillManager, ultimateManager);
            Logger.info("SUMMON", "Siren's skill upgraded to Sleeping Bubble!");
        }

        // 시각 효과 연출 (강화 이펙트)
        if (owner.scene.fxManager) {
            owner.scene.fxManager.showHealEffect(siren);
        }
    }

    heal(owner, siren) {
        Logger.info("ULTIMATE", `${owner.name} restores Siren's HP to 100%!`);
        
        const maxHp = siren.logic.getTotalMaxHp();
        siren.heal(maxHp); // CombatEntity.heal 호출
        
        // 시각 효과
        if (owner.scene.fxManager) {
            owner.scene.fxManager.showHealEffect(siren);
        }
    }
}

const summonSiren = new SummonSiren();
export default summonSiren;
