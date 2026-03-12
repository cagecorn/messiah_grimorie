import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import { ENTITY_CLASSES } from '../../core/EntityConstants.js';
import blackboardManager from './BlackboardManager.js';
import MeleeAI from './nodes/MeleeAI.js';

/**
 * AI 매니저 (AI Manager)
 * 역할: [전체 개체 AI 루프 및 타겟팅 라우터]
 * 
 * 설명: 모든 아군과 적군 유닛의 사고(Thinking) 과정을 관리합니다.
 * 매 프레임 타겟을 갱신하고, 클래스별 적절한 AI 노드를 실행합니다.
 */
class AIManager {
    constructor() {
        this.aiNodes = {
            [ENTITY_CLASSES.WARRIOR]: MeleeAI // 클래스명(소문자)에 따른 AI 노드 맵핑
        };
        Logger.system("AIManager: Initialized.");
    }

    /**
     * AI 메인 루프
     * @param {Array<CombatEntity>} allies 
     * @param {Array<CombatEntity>} enemies 
     * @param {number} delta 
     */
    update(allies, enemies, delta) {
        // 모든 엔티티 통합 리스트
        const allEntities = [...allies, ...enemies];

        allEntities.forEach(entity => {
            if (!entity.logic.isAlive) return;

            // 1. 블랙보드 초기화 (없을 경우)
            blackboardManager.initForEntity(entity.logic.id);
            const bb = blackboardManager.get(entity.logic.id, 'ai');

            // 2. 타겟팅 (가장 가까운 적 찾기)
            const opponents = (entity.team === 'mercenary') ? enemies : allies;
            const target = this.findNearestTarget(entity, opponents);
            bb.set('target', target);

            // 3. 클래스별 AI 노드 실행
            const className = entity.logic.class.getClassName();
            const node = this.aiNodes[className];

            if (node) {
                // AI 노드에서 엔티티의 moveDirection을 설정함
                node.execute(entity, bb, delta);
            } else {
                // 기본 대기 상태
                entity.moveDirection = { x: 0, y: 0 };
            }
        });
    }

    /**
     * 가장 가까운 적 엔티티 탐색
     */
    findNearestTarget(entity, opponents) {
        let nearest = null;
        let minDist = Infinity;

        opponents.forEach(opp => {
            if (!opp.logic.isAlive) return;

            const dist = Phaser.Math.Distance.Between(entity.x, entity.y, opp.x, opp.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = opp;
            }
        });

        return nearest;
    }
}

const aiManager = new AIManager();
export default aiManager;
