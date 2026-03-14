import Logger from '../utils/Logger.js';
import iconManager from './IconManager.js';
import { STAT_KEYS } from '../core/EntityConstants.js';

/**
 * 캐릭터 상태 매니저 (Character Status Manager)
 * 역할: [실시간 엔티티 데이터 요약 및 UI용 가공]
 * 
 * 설명: StatManager, BuffManager, StatusEffectManager의 데이터를 통합하여 
 * UI가 한 번에 읽을 수 있는 "상태 리포트"를 생성합니다.
 */
class CharacterStatusManager {
    constructor() {}

    /**
     * 엔티티의 실시간 상태 요약 보고서를 생성합니다.
     * @param {object} entity CombatEntity 또는 BaseEntity
     */
    getStatusReport(entity) {
        if (!entity || !entity.logic) return null;

        const logic = entity.logic;
        const stats = logic.stats;
        const buffs = logic.buffs;
        const status = logic.status;
        const shields = logic.shields;

        // 1. 기본 실시간 스탯
        const report = {
            id: logic.id,
            name: logic.name,
            hp: logic.hp,
            maxHp: logic.getTotalMaxHp ? logic.getTotalMaxHp() : stats.get(STAT_KEYS.MAX_HP),
            shield: shields ? shields.getTotalShield() : 0,
            ultProgress: entity.ultimateProgress || 0,
            skillProgress: entity.skillProgress || 0,
            
            // 실시간 계산된 최종 스탯들
            finalStats: {
                hp: logic.hp,
                maxHp: logic.getTotalMaxHp ? logic.getTotalMaxHp() : stats.get(STAT_KEYS.MAX_HP),
                shield: shields ? shields.getTotalShield() : 0,
                atk: logic.getTotalAtk(),
                mAtk: logic.getTotalMAtk(),
                def: logic.getTotalDef(),
                mDef: logic.getTotalMDef(),
                atkSpd: logic.getTotalAtkSpd(),
                crit: logic.getTotalCrit()
            },

            // 2. 활성화된 모든 아이콘들 (버프 + 상태이상)
            activeIcons: []
        };

        // 버프 아이콘 수집
        if (buffs) {
            const activeBuffIds = buffs.getActiveBuffIds();
            activeBuffIds.forEach(id => {
                report.activeIcons.push({
                    id: id,
                    type: 'buff',
                    iconPath: iconManager.getStatusPath(id)
                });
            });
        }

        // 상태이상 아이콘 수집
        if (status) {
            const activeStatusIds = status.getActiveEffectIds();
            activeStatusIds.forEach(id => {
                report.activeIcons.push({
                    id: id,
                    type: 'status',
                    iconPath: iconManager.getStatusPath(id)
                });
            });
        }

        // 쉴드 아이콘 추가 (보호막 활성 시)
        if (report.shield > 0) {
            report.activeIcons.push({
                id: 'shield',
                type: 'buff',
                iconPath: iconManager.getStatusPath('shield')
            });
        }

        return report;
    }
}

const characterStatusManager = new CharacterStatusManager();
export default characterStatusManager;
