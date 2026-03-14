import Logger from '../../../utils/Logger.js';

/**
 * 실비 궁극기: 죄송합니다!! (Silvi: I'm Sorry!!)
 * 역할: [구색만 갖춘 플레이스홀더]
 */
class SilviUltimate {
    execute(owner, targetPos) {
        if (!owner) return;

        Logger.info("ULTIMATE", `[Silvi] I'm Sorry!! (죄송합니다!!) - Placeholder activated.`);
        
        // 게이지 초기화
        owner.ultimateProgress = 0;
        if (owner.hpBar) owner.hpBar.isDirty = true;
    }
}

const silviUltimate = new SilviUltimate();
export default silviUltimate;
