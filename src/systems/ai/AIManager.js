import Phaser from 'phaser';
import Logger from '../../utils/Logger.js';
import { ENTITY_CLASSES } from '../../core/EntityConstants.js';
import blackboardManager from './BlackboardManager.js';
import MeleeAI from './nodes/MeleeAI.js';
import RangedAI from './nodes/RangedAI.js';
import HealerAI from './nodes/HealerAI.js';
import WizardAI from './nodes/WizardAI.js';
import SirenAI from './nodes/SirenAI.js';
import BardAI from './nodes/BardAI.js';
import ArenAI from './nodes/ArenAI.js';
import SilviAI from './nodes/SilviAI.js';
import LuteAI from './nodes/LuteAI.js';
import EllaAI from './nodes/EllaAI.js';
import MerlinAI from './nodes/MerlinAI.js';
import SeraAI from './nodes/SeraAI.js';
import RogueAI from './nodes/RogueAI.js';
import ZaynAI from './nodes/ZaynAI.js';
import CloningAI from './nodes/CloningAI.js';
import GoblinWizardAI from './nodes/GoblinWizardAI.js';
import ProjectileSensor from './nodes/ProjectileSensor.js';
import ProjectileClassifier from './nodes/ProjectileClassifier.js';
import ProjectileEvasion from './nodes/ProjectileEvasion.js';
import GroupLeashAI from './nodes/GroupLeashAI.js';
import ActionSelector from './nodes/ActionSelector.js';
import RollingNode from './nodes/RollingNode.js';
import RiaAI from './nodes/RiaAI.js';
import StationaryAI from './nodes/StationaryAI.js';
import TotemistAI from './nodes/TotemistAI.js';
import JoojooAI from './nodes/JoojooAI.js';
import EliteMonsterAI from './nodes/EliteMonsterAI.js';
import FlyingManAI from './nodes/FlyingManAI.js';
import SeinAI from './nodes/SeinAI.js';
import ShadowmancerAI from './nodes/ShadowmancerAI.js';
import AinaAI from './nodes/ainaAI.js';
import BaoAI from './nodes/BaoAI.js';
import BabaoAI from './nodes/BabaoAI.js';

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
            [ENTITY_CLASSES.ARCHER]: RangedAI,
            [ENTITY_CLASSES.HEALER]: HealerAI,
            [ENTITY_CLASSES.WIZARD]: WizardAI,
            [ENTITY_CLASSES.BARD]: BardAI,
            [ENTITY_CLASSES.ROGUE]: RogueAI,
            [ENTITY_CLASSES.TOTEMIST]: TotemistAI,
            [ENTITY_CLASSES.FLYINGMAN]: FlyingManAI,
            [ENTITY_CLASSES.SHADOWMANCER]: ShadowmancerAI
        };

        // [신규] AI 성능 및 안정성 필드
        this.thinkInterval = 200; // 0.2초마다 사고함 (60fps 기준 효율적)
        this.thinkCooldowns = new Map(); // EntityID -> cooldown

        // [신규] 액션 시스템 연동
        this.rollingNode = new RollingNode();
        this.actionSelector = new ActionSelector(this.rollingNode);

        Logger.system("AIManager: Initialized with Optimized Thinking (200ms) & ActionSelector.");
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
            const className = entity.logic.class.getClassName();
            const id = entity.logic.baseId || entity.logic.id.split('_')[0];

            // 1. 블랙보드 초기화 (없을 경우)
            blackboardManager.initForEntity(entityId);
            const bb = blackboardManager.get(entityId, 'ai');

            // 2. [신규] 사고 간격 제어 (Stutter 방지의 핵심)
            let cooldown = this.thinkCooldowns.get(entityId) || 0;
            cooldown -= delta;

            if (cooldown <= 0) {
                // 타겟팅 (가장 가까운 적/아군 찾기 - 히스테리시스 적용)
                const opponents = (entity.team === 'mercenary') ? enemies : allies;
                
                const currentTarget = bb.get('target');
                const newTarget = this.findNearestTargetWithHysteresis(entity, currentTarget, opponents);

                if (newTarget) {
                    bb.set('target', newTarget);
                } else {
                    bb.set('target', null);
                    if (entity.team === 'mercenary' && enemies.length > 0) {
                        Logger.info("AI", `${entity.logic.name} found no ALIVE targets among ${enemies.length} enemies.`);
                    }
                }

                // 쿨다운 리셋
                cooldown = this.thinkInterval + Math.random() * 50; // 미세한 랜덤화로 작업 분산
            }

            this.thinkCooldowns.set(entityId, cooldown);

            // [NEW] Projectile AI Block System (Priority: SURVIVAL)
            // 1. [Sense] 주변 투사체 스캔
            const detectedProjectiles = ProjectileSensor.sense(entity);
            
            // 2. [Select Action] 구르기 또는 다른 액션 선택
            const actionResult = this.actionSelector.evaluate(entity, detectedProjectiles, bb.get('target'));
            
            if (actionResult === 'roll' || actionResult === 'rolling_in_progress') {
                return; // 구르기 중이거나 방금 구르기를 시작했으면 클래스 AI 스킵
            }

            // [NEW] Mercenary Leash AI (Priority: COHESION)
            // 아군 그룹에서 너무 멀어지면 중심으로 복귀하도록 강제함 (화면 이탈 방지)
            // [FIX] 전투 중이거나 행동 중일 때는 목줄 체크를 유연하게 하여 갈팡질팡(Jitter) 방지
            if (entity.team === 'mercenary') {
                const currentTarget = bb.get('target');
                const isEngaged = currentTarget && currentTarget.logic.isAlive && Phaser.Math.Distance.Between(entity.x, entity.y, currentTarget.x, currentTarget.y) < 500;
                
                if (!entity.isBusy && !entity.isJumping && !isEngaged) {
                    const leashDirection = GroupLeashAI.execute(entity, allies, 650); // [ENHANCED] 더 넓은 활동 범위 보장 (기존 450)
                    if (leashDirection) {
                        entity.moveDirection = leashDirection;
                        // [DEBUG] 목줄 작동 중일 때는 다른 AI 로직을 건너뜀 (귀환 우선)
                        return;
                    }
                }
            }

            // 3. 클래스별 AI 노드 실행 (매 프레임 실행하여 이동은 부드럽게 유지)
            const baseNode = this.aiNodes[className];
            let node = baseNode;
            
            // [신규] 특정 유닛 전용 AI 오버라이드 (모듈화 준수)
            if (entity.logic.isElite) {
                node = EliteMonsterAI;
            } else if (id === 'zayn' || id === 'zayn_clone') {
                node = ZaynAI;
            } else if (id === 'siren') {
                node = SirenAI;
            } else if (id === 'aren') {
                node = ArenAI;
            } else if (id === 'silvi') {
                node = SilviAI;
            } else if (id === 'lute') {
                node = LuteAI;
            } else if (id === 'ella') {
                node = EllaAI;
            } else if (id === 'merlin') {
                node = MerlinAI;
            } else if (id === 'sera') {
                node = SeraAI;
            } else if (id === 'goblin_wizard') {
                node = GoblinWizardAI;
            } else if (id === 'ria') {
                node = RiaAI;
            } else if (id === 'joojoo') {
                node = JoojooAI;
            } else if (id === 'sein') {
                node = SeinAI;
            } else if (id === 'aina') {
                node = AinaAI;
            } else if (id === 'bao') {
                node = BaoAI;
            } else if (id === 'babao') {
                node = BabaoAI;
            } else if (entity.logic.isTotem) {
                node = StationaryAI;
            }

            if (node) {
                // AI 노드에서 엔티티의 moveDirection을 설정함
                if (entity.logic.isElite && node === EliteMonsterAI) {
                    node.execute(entity, bb, delta, baseNode);
                } else {
                    node.execute(entity, bb, delta);
                }
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
            if (!opp.logic.isAlive || opp === entity) return;

            // [신규] 은신 상태 유닛은 타겟팅에서 제외
            if (opp.logic.status.states && opp.logic.status.states.stealthed) return;

            const dist = Phaser.Math.Distance.Between(entity.x, entity.y, opp.x, opp.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = opp;
            }
        });

        // [USER 요청] "가장 가까운 적" 로직에 의한 급격한 방향 전환 방지
        // 현재 타겟이 있고, 새로운 타겟이 현재 타겟보다 20% 이상 가깝지 않으면 유지
        if (currentTarget && currentTarget.logic.isAlive && nearest !== currentTarget) {
            // [FIX] 현재 타겟이 은신 상태가 되었다면 즉시 타겟을 포기함
            const isCurrentTargetStealthed = currentTarget.logic.status.states && currentTarget.logic.status.states.stealthed;
            if (!isCurrentTargetStealthed && minDist > currentDist * 0.8) {
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
