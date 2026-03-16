import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import ultimateCutsceneManager from '../../../ui/UltimateCutsceneManager.js';
import ZaynCloneConfig from '../../../data/summons/zaynclone.js';
import summonManager from '../../entities/SummonManager.js';
import BaseEntity from '../../../entities/BaseEntity.js';
import animationManager from '../../graphics/AnimationManager.js';
import poolingManager from '../../../core/PoolingManager.js';
import localizationManager from '../../../core/LocalizationManager.js';

/**
 * 자인 궁극기: 분신술 (Cloning Technique)
 * 역할: [2명의 분신 소환, 본체 스탯 2/3 상속]
 */
class Cloning {
    constructor() {
        this.scalingStat = 'atk';
        this.activeClones = new Map(); // ownerID -> Array of Clone CombatEntities
    }

    /**
     * 궁극기 실행
     */
    execute(owner) {
        if (!owner) return;

        const ownerId = owner.logic.id;
        
        // 컷씬 출력 (로컬라이징 적용)
        const ultName = localizationManager.t('ult_zayn_name');
        ultimateCutsceneManager.show('zayn', ultName);

        // [USER 요청] 자인이 궁극기를 사용한 동안 궁극기 게이지 보충 금지
        owner.isUltActive = true;

        // 1. 시각 효과 (PooledCloningEffect 사용)
        this.playCloningEffect(owner.scene, owner.x, owner.y);

        // 2. 분신 2명 소환
        const clones = [];
        for (let i = 0; i < 2; i++) {
            const clone = this.spawnClone(owner, i);
            if (clone) clones.push(clone);
        }

        this.activeClones.set(ownerId, clones);

        // 3. 분신이 모두 사라지면 본체의 궁극기 게이지 보충 재개
        // (간단하게 일정 시간 뒤에 해제하거나, 분신 소멸 이벤트를 감시해야 함)
        // 여기서는 소환물 지속 시간을 설정하고 그 후에 해제하는 방식 사용
        const duration = 15000; // 15초 지속
        owner.scene.time.delayedCall(duration, () => {
            this.cleanupClones(owner);
        });

        // 게이지 리셋
        owner.ultimateProgress = 0;
        if (owner.hpBar) owner.hpBar.isDirty = true;
    }

    spawnClone(owner, index) {
        const scene = owner.scene;
        
        // Zayn의 2/3 스탯 계산
        const atk = owner.logic.getTotalAtk() * (2/3);
        const maxHp = owner.logic.getTotalMaxHp() * (2/3);
        
        const scaledStats = { 
            ...ZaynCloneConfig.baseStats,
            maxHp: Math.floor(maxHp),
            hp: Math.floor(maxHp),
            atk: Math.floor(atk),
            def: Math.floor(owner.logic.getTotalDef() * (2/3)),
            mDef: Math.floor(owner.logic.getTotalMDef() * (2/3)),
            speed: owner.logic.getTotalSpeed(),
            atkSpd: owner.logic.getTotalAtkSpd()
        };

        const cloneLogic = new BaseEntity({
            id: `summon_zayn_clone_${owner.logic.id}_${index}_${Date.now()}`,
            baseId: 'zayn_clone',
            name: 'Zayn Clone',
            type: 'summon',
            className: ZaynCloneConfig.className,
            isSpecial: true,
            level: owner.logic.level,
            baseStats: scaledStats
        });

        const offsetX = (index === 0 ? -60 : 60);
        const offsetY = (index === 0 ? -30 : 30);
        
        const clone = summonManager.spawnSummon(
            scene, 
            cloneLogic, 
            owner.team, 
            owner.x + offsetX, 
            owner.y + offsetY, 
            ZaynCloneConfig.spriteKey
        );

        if (clone) {
            // 은신 효과를 본체처럼 받도록 설정 가능
            if (clone.sprite) {
                clone.sprite.setAlpha(0.6);
            } else {
                clone.setAlpha(0.6); // 분신은 약간 더 투명하게 구분
            }
        }

        return clone;
    }

    playCloningEffect(scene, x, y) {
        const effect = poolingManager.get('cloning_effect');
        if (effect) {
            effect.show(x, y);
        }
    }

    cleanupClones(owner) {
        if (!owner || !owner.active) return;
        
        const ownerId = owner.logic.id;
        const clones = this.activeClones.get(ownerId);
        
        if (clones) {
            clones.forEach(clone => {
                if (clone && clone.active) {
                    // 소멸 연출
                    this.playCloningEffect(clone.scene, clone.x, clone.y);
                    clone.destroy();
                }
            });
            this.activeClones.delete(ownerId);
        }
        
        owner.isUltActive = false;
        Logger.info("ULTIMATE", `[Zayn] Cloning effect ended. Ult gauge charging enabled.`);
    }
}

const cloning = new Cloning();
export default cloning;
