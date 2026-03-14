import Logger from '../../../utils/Logger.js';
import combatManager from '../../CombatManager.js';
import fxManager from '../../graphics/FXManager.js';

/**
 * 수호의 노래 (Song of Protection)
 * 역할: [광역 보호막 부여]
 * 설명: 모든 아군에게 마법 공격력의 1.5배 보호막(5초)을 생성합니다.
 */
class SongOfProtection {
    constructor() {
        this.scalingStat = 'mAtk';
    }
    execute(owner) {
        if (!owner) return;

        const mAtk = owner.logic.getTotalMAtk();
        const shieldAmount = mAtk * 1.5;

        Logger.info("SKILL", `${owner.logic.name} performs Song of Protection! (Shield: ${shieldAmount.toFixed(1)})`);
        
        // 게이지 초기화
        owner.skillProgress = 0;
        if (owner.hpBar) owner.hpBar.isDirty = true;

        // [시각 효과] 맵 전체 파동
        if (fxManager.showSongOfProtectionEffect) {
            fxManager.showSongOfProtectionEffect(owner);
        }

        // 컴뱃 매니저를 통해 광역 처리 (모듈화)
        combatManager.processSongOfProtection(owner, shieldAmount);
    }
}

const songOfProtection = new SongOfProtection();
export default songOfProtection;
