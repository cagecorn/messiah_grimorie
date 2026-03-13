import Logger from '../utils/Logger.js';
import portraitHUDDOMManager from '../ui/PortraitHUDDOMManager.js';

/**
 * 초상화 허드 매니저 (Portrait HUD Manager)
 * 역할: [전투 데이터와 UI 연동]
 */
class PortraitHUDManager {
    constructor() {
        this.scene = null;
        this.mercenaries = []; // 감시 대상 엔티티들
        this.updateInterval = 100; // 0.1s 마다 체크
        this.lastUpdateTime = 0;
    }

    /**
     * 전투 시작 시 초기화
     */
    init(scene, allies) {
        this.scene = scene;
        this.mercenaries = allies.filter(a => a.team === 'mercenary');

        // 초기 데이터 준비 및 DOM 초기화 가동
        const partyData = this.mercenaries.map(m => ({
            id: m.logic.baseId || m.logic.id, // 에셋 조회용 (aren, ella)
            instanceId: m.logic.id,           // 인스턴스 업데이트용 (aren_1)
            name: m.logic.name,
            grade: m.logic.grade ? m.logic.grade.getStars() : 1,
            level: m.logic.leveling ? m.logic.leveling.getLevel() : 1
        }));

        portraitHUDDOMManager.initialize(partyData);
        Logger.system("PortraitHUDManager: Linked to battle scene allies.");
    }

    /**
     * 매 프레임/정기적 데이터 동기화
     */
    update(time, delta) {
        if (!this.mercenaries.length) return;

        this.lastUpdateTime += delta;
        if (this.lastUpdateTime < this.updateInterval) return;
        this.lastUpdateTime = 0;

        // 각 용병의 실시간 상태 추출 및 UI 전달
        this.mercenaries.forEach(m => {
            if (!m.active || !m.logic) return;

            const stats = m.logic.stats;
            const hpPercent = (m.logic.hp / stats.get('maxHp')) * 100;
            
            // 스킬 게이지 (EntitySkillComponent 연동)
            const skillPercent = (m.skillProgress || 0) * 100;
            
            // 궁극기 게이지
            const ultPercent = (m.ultimateProgress || 0) * 100;

            // 상태 이상 (Status 연동)
            const buffs = m.status ? m.status.getActiveEffectIds() : [];

            portraitHUDDOMManager.updateCard(m.logic.id, {
                hpPercent,
                skillPercent,
                ultPercent,
                buffs
            });
        });
    }

    clear() {
        portraitHUDDOMManager.clear();
        this.mercenaries = [];
    }
}

const portraitHUDManager = new PortraitHUDManager();
export default portraitHUDManager;
