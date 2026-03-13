import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import { ENTITY_CLASSES } from '../../core/EntityConstants.js';
import blackboardManager from './BlackboardManager.js';
import MeleeAI from './nodes/MeleeAI.js';
import RangedAI from './nodes/RangedAI.js';

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
            [ENTITY_CLASSES.WARRIOR]: MeleeAI, // 클래스명(소문자)에 따른 AI 노드 맵핑
            [ENTITY_CLASSES.ARCHER]: RangedAI
        };
        
        // [신규] AI 성능 및 안정성 필드
        this.thinkInterval = 200; // 0.2초마다 사고함 (60fps 기준 효율적)
        this.thinkCooldowns = new Map(); // EntityID -> cooldown
        
        Logger.system("AIManager: Initialized with Optimized Thinking (200ms).");
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

            const entityId = entity.logic.id;
            
            // 1. 블랙보드 초기화 (없을 경우)
            blackboardManager.initForEntity(entityId);
            const bb = blackboardManager.get(entityId, 'ai');

            // 2. [신규] 사고 간격 제어 (Stutter 방지의 핵심)
            let cooldown = this.thinkCooldowns.get(entityId) || 0;
            cooldown -= delta;

            if (cooldown <= 0) {
                // 타겟팅 (가장 가까운 적 찾기 - 히스테리시스 적용)
                const opponents = (entity.team === 'mercenary') ? enemies : allies;
                const currentTarget = bb.get('target');
                const newTarget = this.findNearestTargetWithHysteresis(entity, currentTarget, opponents);
                
                bb.set('target', newTarget);
                
                // 쿨다운 리셋
                cooldown = this.thinkInterval + Math.random() * 50; // 미세한 랜덤화로 작업 분산
            }
            
            this.thinkCooldowns.set(entityId, cooldown);

            // 3. 클래스별 AI 노드 실행 (매 프레임 실행하여 이동은 부드럽게 유지)
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
     * 히스테리시스가 적용된 타겟 탐색 (Stutter 방지)
     * 이미 타겟이 있다면, 새로운 타겟이 충분히 더 가까울 때만 교체함.
     */
    findNearestTargetWithHysteresis(entity, currentTarget, opponents) {
        let nearest = null;
        let minDist = Infinity;
        
        // 현재 타겟의 거리 계산 (있을 경우)
        let currentDist = Infinity;
        if (currentTarget && currentTarget.logic.isAlive && currentTarget.active) {
            currentDist = Phaser.Math.Distance.Between(entity.x, entity.y, currentTarget.x, currentTarget.y);
        }

        opponents.forEach(opp => {
            if (!opp.logic.isAlive) return;

            const dist = Phaser.Math.Distance.Between(entity.x, entity.y, opp.x, opp.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = opp;
            }
        });

        // [USER 요청] "가장 가까운 적" 로직에 의한 급격한 방향 전환 방지
        // 현재 타겟이 있고, 새로운 타겟이 현재 타겟보다 20% 이상 가깝지 않으면 유지
        if (currentTarget && currentTarget.logic.isAlive && nearest !== currentTarget) {
            if (minDist > currentDist * 0.8) {
                return currentTarget;
            }
        }

        return nearest;
    }

    /**
     * 데이터 클리어 (씬 종료 시)
     */
    clear() {
        this.thinkCooldowns.clear();
        Logger.info("AI_MANAGER", "AI thinking cooldowns cleared.");
    }
}

const aiManager = new AIManager();
export default aiManager;
