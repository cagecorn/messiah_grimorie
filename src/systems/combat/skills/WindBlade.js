import Logger from '../../../utils/Logger.js';
import { STAT_KEYS } from '../../../core/EntityConstants.js';
import { BUFF_VALUES, STATS } from '../../../core/TechnicalConstants.js';

/**
 * 윈드 블레이드 (Wind Blade)
 * 역할: [자신에게 '질풍(Gale)' 버프를 걸어 사거리를 대폭 증가시킴]
 * 효과: 검객임에도 원거리 공격(검기)이 가능해지는 상태가 됨.
 */
class WindBlade {
    constructor() {
        this.scalingStat = 'atk';
    }

    /**
     * 스킬 실행
     * @param {CombatEntity} owner 시전자
     */
    execute(owner) {
        if (!owner || !owner.active) return;

        Logger.info("SKILL", `[Ria] Wind Blade activated!`);

        const rangeBonus = BUFF_VALUES.GALE.RANGE_BONUS;
        const minRangeBonus = BUFF_VALUES.GALE.MIN_RANGE_BONUS;
        const duration = BUFF_VALUES.GALE.DURATION;

        if (owner.buffs) {
            owner.buffs.addBuff({
                id: 'gale',
                key: STAT_KEYS.ATK_RANGE,
                value: rangeBonus,
                type: 'add',
                duration: duration
            });
            // [신규] 원거리 AI 대응을 위한 최소/최대 사거리 보정
            owner.buffs.addBuff({
                id: 'gale_min',
                key: STAT_KEYS.RANGE_MIN,
                value: minRangeBonus,
                type: 'add',
                duration: duration
            });
            owner.buffs.addBuff({
                id: 'gale_max',
                key: STAT_KEYS.RANGE_MAX,
                value: rangeBonus,
                type: 'add',
                duration: duration
            });
        }

        // 시각 효과 연출 (바람 이펙트 등 추가 가능하나 현재는 아이콘으로 표시)
        if (owner.scene && owner.scene.tweens) {
            // 간단한 시각적 피드백: 푸른 빛이 몸을 감쌈
            owner.visual.sprite.setTint(0x00ffff);
            owner.scene.time.delayedCall(500, () => {
                if (owner.active) owner.visual.sprite.clearTint();
            });
        }
    }
}

const windBlade = new WindBlade();
export default windBlade;
