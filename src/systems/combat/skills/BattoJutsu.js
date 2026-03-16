import Logger from '../../../utils/Logger.js';
import { BUFF_VALUES } from '../../../core/TechnicalConstants.js';
import { STAT_KEYS } from '../../../core/EntityConstants.js';
import fxManager from '../../graphics/FXManager.js';

/**
 * 발도술 (Battō-jutsu) - 리아의 궁극기
 * 역할: [자신에게 '속사(Rapid Fire)' 및 '질풍(Gale)' 버프 적용]
 */
class BattoJutsu {
    constructor() {
        this.scalingStat = 'atk';
    }

    /**
     * 궁극기 실행
     * @param {CombatEntity} owner 시전자
     */
    execute(owner) {
        if (!owner || !owner.active) return;

        Logger.info("ULTIMATE", `[Ria] Battō-jutsu activated! (Full Buff Set)`);

        const duration = BUFF_VALUES.RAPID_FIRE.DURATION;
        const rangeBonus = BUFF_VALUES.GALE.RANGE_BONUS;
        const minRangeBonus = BUFF_VALUES.GALE.MIN_RANGE_BONUS;

        if (owner.buffs) {
            // 1. 속사 (복제 투사체 5연발)
            owner.buffs.addBuff({
                id: 'rapidfire',
                key: 'atk', 
                value: 0,
                type: 'add',
                duration: duration
            });

            // 2. 질풍 (사거리 대폭 증가)
            owner.buffs.addBuff({
                id: 'gale',
                key: STAT_KEYS.ATK_RANGE,
                value: rangeBonus,
                type: 'add',
                duration: duration
            });
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

        // 시각 효과 연출
        if (owner.scene && owner.visual) {
            // 강렬한 노란색/백색 섬광 효과
            owner.visual.sprite.setTint(0xffffff);
            owner.scene.time.delayedCall(300, () => {
                if (owner.active) owner.visual.sprite.clearTint();
            });

            // 발도술 느낌을 주기 위한 가벼운 떨림
            if (owner.hpBar) owner.hpBar.shake(6, 300);

            // [신규] 전용 시각 이펙트 오버랩
            fxManager.showBattoJutsuEffect(owner.x, owner.y);
        }
    }
}

const battoJutsu = new BattoJutsu();
export default battoJutsu;
