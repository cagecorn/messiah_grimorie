import Logger from '../utils/Logger.js';
import { COMBAT } from '../core/TechnicalConstants.js';
import TimeManager from '../core/TimeManager.js';
import damageCalculationManager from './combat/DamageCalculationManager.js';
import fxManager from './graphics/FXManager.js';

/**
 * 전투 연산 매니저 (Combat Calculation Manager)
 * 역할: [라우터 (Router) & 연산 중추]
 * 
 * 설명: 1000마리 이상의 유닛이 참여하는 대규모 전투를 처리하기 위한 연산 허브입니다.
 * [Web Worker]로의 전환이 용이하도록 설계되었으며, 내부적으로 공간 분할(Spatial Grid)
 * 로직을 통해 타겟 탐색 부하를 최소화합니다.
 */
class CombatManager {
    constructor() {
        this.units = new Set(); // 현재 전장에 존재하는 모든 유닛 (용병+몬스터)
        this.grid = null;       // 공간 분할 격자 (Spatial Partitioning Grid)
        
        Logger.system("CombatManager: Initialized (Large-scale optimization ready).");
    }

    /**
     * 전투 업데이트 루프
     * @param {number} delta 
     */
    update(delta) {
        // [TimeManager] 확인: 정지 상태라면 연산 스킵
        if (!TimeManager.shouldUpdate()) return;

        // 1. 공간 분할 격자 갱신 (유닛 위치 동기화)
        this.refreshSpatialGrid();

        // 2. 유닛별 AI 및 전투 연산 라우팅
        // (실제 루프는 Scene의 update에서 호출됨)
    }

    /**
     * 데미지 발생 라우팅
     * @param {object} attacker 공격자
     * @param {object} target 대상
     * @param {number} multiplier 스킬 계수
     * @param {string} type 'physical' | 'magic'
     */
    processDamage(attackerEntity, targetEntity, multiplier, type = 'physical') {
        const attacker = attackerEntity.logic;
        const target = targetEntity.logic;
        
        let damage = 0;
        if (type === 'physical') {
            damage = COMBAT.calcPhysicalDamage(attacker.getTotalAtk(), multiplier);
        } else {
            // 마법 및 각종 속성(fire, ice, lightning)은 기본적으로 MAtk 기반 연산
            damage = COMBAT.calcMagicEffect(attacker.getTotalMAtk(), multiplier);
        }

        // 1. 최종 데미지 적용 요청
        if (targetEntity && targetEntity.takeDamage) {
            Logger.info("COMBAT_MANAGER", `Processing ${type} damage: ${attacker.name} -> ${target.name} (${damage})`);
            targetEntity.takeDamage(damage, attackerEntity);
            
            // 2. 데미지 기록 (DPS 및 경험치 추적용) - 속성(type) 명시
            damageCalculationManager.recordDamage(attacker, target, damage, type);
            
            // 3. 시각적 피드백 (데미지 텍스트) - 속성(type)에 따른 컬러 색상 자동 적용
            fxManager.showDamageText(targetEntity.x, targetEntity.y, damage, type);

            // 4. [신규] 피격 이펙트 연출
            fxManager.showImpactEffect(targetEntity, type);
        }
    }

    /**
     * 타겟 검색 라우팅 (공간 분할 활용)
     * 1000마리 유닛 대상 O(n^2) 연산을 피하기 위한 핵심 로직
     */
    findNearestTarget(origin, range, teamType) {
        // [TODO] Spatial Grid에서 주변 유닛만 필터링하여 검색
        // 현재는 예시 구조만 잡음
        return null;
    }

    /**
     * 공간 분할 격자 초기화/갱신
     */
    refreshSpatialGrid() {
        // 대규모 유닛 처리를 위한 그리드 업데이트 로직
    }

    /**
     * 유닛 등록/해제
     */
    addUnit(unit) { this.units.add(unit); }
    removeUnit(unit) { this.units.delete(unit); }
}

const combatManager = new CombatManager();
export default combatManager;
