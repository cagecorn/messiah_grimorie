import Logger from '../../../utils/Logger.js';
import { BUFF_VALUES } from '../../../core/TechnicalConstants.js';
import fxManager from '../../graphics/FXManager.js';

/**
 * 발도술 (Battō-jutsu) - 리아의 궁극기
 * 역할: [자신에게 '속사(Rapid Fire)' 버프를 걸어 공격 횟수를 5회로 증가시킴]
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

        Logger.info("ULTIMATE", `[Ria] Battō-jutsu activated!`);

        const duration = BUFF_VALUES.RAPID_FIRE.DURATION;

        if (owner.buffs) {
            owner.buffs.addBuff({
                id: 'rapidfire',
                key: 'atk', // 실제 스탯 영향보다는 ID 체크용 (현재 시스템 구조상 key가 필요함)
                value: 0,
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
