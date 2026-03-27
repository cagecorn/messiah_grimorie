import Logger from '../../../utils/Logger.js';
import fxManager from '../../graphics/FXManager.js';

/**
 * 전술지휘 (Tactical Command)
 * 역할: [아군 전체 평타 위력 50% 강화]
 */
class TacticalCommand {
    constructor() {
        this.id = 'TacticalCommand';
        this.name = 'Tactical Command';
        this.duration = 10000; // 10초
    }

    execute(owner) {
        if (!owner || !owner.active) return false;

        Logger.info("SKILL", `[Nickle] Tactical Command activated!`);

        // 씬 내의 모든 아군 검색
        const scene = owner.scene;
        const allies = (owner.team === 'mercenary' || owner.team === 'ally') ? scene.allies : scene.enemies;

        allies.forEach(ally => {
            if (ally.active && ally.logic && ally.logic.isAlive) {
                if (ally.logic.buffs) {
                    ally.logic.buffs.addBuff({
                        id: 'tactical_command',
                        icon: 'tactical_command_icon',
                        key: 'none', // 전용 매니저에서 체크하므로 스탯 직접 수정 안함
                        value: 0,
                        type: 'add',
                        duration: this.duration
                    });
                }
                
                // 시각 효과
                if (fxManager.showInspirationEffect) {
                    fxManager.showInspirationEffect(ally);
                }
            }
        });

        // 니클 자신에게도 적용 (allies에 포함되어 있을 가능성이 높지만 명시적 확인)
        if (owner.logic.buffs && !owner.logic.buffs.activeBuffs.some(b => b.id === 'tactical_command')) {
            owner.logic.buffs.addBuff({
                id: 'tactical_command',
                icon: 'tactical_command_icon',
                key: 'none',
                value: 0,
                type: 'add',
                duration: this.duration
            });
        }

        // 전체 화면 효과 (잠시 붉은/금빛 조준선 이펙트 등은 생략하고 로그와 아이콘으로 대체)
        Logger.system("TACTICAL_COMMAND", "All allies' standard attacks are now 50% stronger.");

        return true;
    }
}

const tacticalCommand = new TacticalCommand();
export default tacticalCommand;
