import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import ultimateCutsceneManager from '../../../ui/UltimateCutsceneManager.js';
import GuardianAngelConfig from '../../../data/summons/GuardianAngel.js';
import CombatEntity from '../../../entities/CombatEntity.js';
import BaseEntity from '../../../entities/BaseEntity.js';
import ultimateManager from '../UltimateManager.js';
import animationManager from '../../graphics/AnimationManager.js';

/**
 * 세라 궁극기: 소환 : 수호천사 (Summon: Guardian Angel)
 * 역할: [수호천사 소환 -> 강화 -> 강화 -> 힐]
 */
class SummonGuardianAngel {
    constructor() {
        this.angelInstances = new Map(); // 시전자별 소환된 천사 관리
    }

    /**
     * 궁극기 실행
     * @param {CombatEntity} owner 시전자 (세라)
     */
    execute(owner) {
        if (!owner) return;

        const ownerId = owner.logic.id;
        let angel = this.angelInstances.get(ownerId);

        // 컷씬 출력
        ultimateCutsceneManager.show('sera', 'Summon: Guardian Angel');

        // [USER 요청] 수호천사가 없거나 죽었다면 소환
        if (!angel || !angel.active || !angel.logic.isAlive) {
            this.summonAngel(owner);
        } else {
            // 이미 존재한다면 강화 단계 진행
            this.upgradeAngel(owner, angel);
        }

        // 게이지 리셋
        owner.ultimateProgress = 0;
        if (owner.hpBar) owner.hpBar.isDirty = true;
    }

    /**
     * 수호천사 소환 로직
     */
    summonAngel(owner) {
        const scene = owner.scene;
        Logger.info("ULTIMATE", `[Sera] Summoning Guardian Angel!`);

        // 1. 스탯 계산 (시전자 MAtk 기반)
        const mAtk = owner.logic.getTotalMAtk();
        const scaledStats = { ...GuardianAngelConfig.baseStats };
        
        // [USER 요청] 세라 마법 계수에 따른 스탯 보정
        scaledStats.maxHp = Math.floor(mAtk * 15);
        scaledStats.hp = scaledStats.maxHp;
        scaledStats.atk = Math.floor(mAtk * 2.5);
        scaledStats.def = Math.floor(mAtk * 1.2);
        scaledStats.mDef = Math.floor(mAtk * 1.5);

        // 2. BaseEntity를 사용하여 논리 객체 생성 (TypeError: stats.update 해결책)
        const angelLogic = new BaseEntity({
            id: `summon_angel_${owner.logic.id}_${Date.now()}`,
            name: 'Guardian Angel',
            type: owner.team, // 시전자 소속 팀 (mercenary / monster)
            className: GuardianAngelConfig.className,
            isSpecial: true,
            level: owner.logic.leveling ? owner.logic.leveling.getLevel() : 1,
            baseStats: scaledStats
        });

        // 3. 물리 엔티티 생성
        const spawnX = owner.x + (owner.team === 'mercenary' ? 100 : -100);
        const spawnY = owner.y;

        const angelEntity = new CombatEntity(scene, spawnX, spawnY, angelLogic, GuardianAngelConfig.spriteKey || 'guardian_angel_sprite');
        angelEntity.upgradeStage = 0; 

        // 4. 소환 이펙트
        this.playSummonEffect(scene, spawnX, spawnY);

        // 5. 관리 목록에 등록
        this.angelInstances.set(owner.logic.id, angelEntity);
        
        if (owner.team === 'mercenary') {
            scene.allies.push(angelEntity);
        } else {
            scene.enemies.push(angelEntity);
        }
    }

    /**
     * 수호천사 강화 로직
     */
    upgradeAngel(owner, angel) {
        angel.upgradeStage++;
        Logger.info("ULTIMATE", `[Sera] Upgrading Guardian Angel to Stage ${angel.upgradeStage}`);

        const scene = owner.scene;

        if (angel.upgradeStage === 1) {
            // 1단계: 1.2배 강화
            this.applyMultiplier(angel, 1.2);
            this.playUpgradeEffect(scene, angel, 0x00ff00); 
        } else if (angel.upgradeStage === 2) {
            // 2단계: 1.5배 강화
            this.applyMultiplier(angel, 1.5);
            this.playUpgradeEffect(scene, angel, 0xffff00); 
        } else {
            // 3단계 이후: 100% 힐
            angel.heal(angel.logic.getTotalMaxHp()); // CombatEntity.heal 호출
            this.playUpgradeEffect(scene, angel, 0xffffff); 
            Logger.info("ULTIMATE", `[Sera] Guardian Angel Healed to Full!`);
        }
    }

    applyMultiplier(angel, mult) {
        const stats = angel.logic.stats;
        // StatManager의 mult 카테고리를 사용하여 공격력, 체력 등 강화
        ['atk', 'maxHp', 'def', 'mDef'].forEach(key => {
            stats.update('mult', key, mult);
        });
        
        // 현재 체력도 비율에 맞춰 상향
        const currentHp = angel.logic.hp;
        stats.update('base', 'hp', currentHp * mult);
        
        if (angel.hpBar) angel.hpBar.isDirty = true;
    }

    playSummonEffect(scene, x, y) {
        // [USER 요청] 애니메이션 매니저를 통해 6병렬 시차 중첩 연출
        animationManager.playGuardianAngelSummonVFX(x, y);
    }

    playUpgradeEffect(scene, angel, tint) {
        // [USER 요청] 애니메이션 매니저를 통해 4병렬 시차 중첩 연출
        animationManager.playGuardianAngelUpgradeVFX(angel, tint);
    }
}

const summonGuardianAngel = new SummonGuardianAngel();
export default summonGuardianAngel;
