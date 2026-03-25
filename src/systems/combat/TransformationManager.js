import Logger from '../../utils/Logger.js';

/**
 * 전환 매니저 (Transformation Manager)
 * 역할: [엔티티의 클래스, 외형, 능력치를 일시적으로 변경 및 복구]
 * 
 * 설명: 나나와 같이 궁극기 사용 시 클래스가 바뀌거나 외형이 변하는 캐릭터들을 위한 공용 시스템입니다.
 */
class TransformationManager {
    constructor() {
        this.transformations = new Map(); // EntityID -> OriginalData
    }

    /**
     * 엔티티 변신 실행
     * @param {CombatEntity} entity 대상 엔티티
     * @param {Object} config 변합 설정 { class, spriteKey, duration, stats }
     */
    transform(entity, config) {
        if (!entity || !entity.logic) return;

        const entityId = entity.logic.id;
        Logger.info("TRANSFORMATION", `Transforming ${entity.logic.name} to ${config.class || 'Special State'}`);

        // 1. 기존 상태 백업 (최초 변신 시에만)
        if (!this.transformations.has(entityId)) {
            this.transformations.set(entityId, {
                class: entity.logic.class,
                spriteKey: entity.spriteKey,
                // 스탯 백업은 필요 시 추가 (현재는 클래스 기반 AI/스킬 변경이 주축)
            });
        }

        // 2. 클래스 변경 (AI 라우팅에 즉시 반영됨)
        if (config.class) {
            entity.logic.class = {
                getClassName: () => config.class
            };
        }

        // 3. 비주얼(스프라이트) 변경
        if (config.spriteKey) {
            entity.visual.setTexture(config.spriteKey);
            entity.spriteKey = config.spriteKey;
        }

        // 4. 지속 시간 설정 및 복구 예약
        if (config.duration) {
            if (entity._revertTimer) entity.scene.time.removeEvent(entity._revertTimer);
            
            entity._revertTimer = entity.scene.time.delayedCall(config.duration, () => {
                this.revert(entity);
            });
        }

        // [신규] 변신 이펙트 (FXManager 연동 추천)
        if (entity.scene.fxManager) {
            entity.scene.fxManager.showImpactEffect(entity, 'magic');
        }
    }

    /**
     * 원래 상태로 복구
     */
    revert(entity) {
        if (!entity || !entity.logic) return;

        const entityId = entity.logic.id;
        const original = this.transformations.get(entityId);

        if (!original) return;

        Logger.info("TRANSFORMATION", `Reverting ${entity.logic.name} to original state.`);

        // 1. 클래스 복구
        entity.logic.class = original.class;

        // 2. 비주얼 복구
        entity.visual.setTexture(original.spriteKey);
        entity.spriteKey = original.spriteKey;

        // 3. 백업 데이터 삭제
        this.transformations.delete(entityId);
        entity._revertTimer = null;

        // [시각 효과] 복구 알림
        if (entity.scene.fxManager) {
            entity.scene.fxManager.showHealEffect(entity);
        }
    }
}

const transformationManager = new TransformationManager();
export default transformationManager;
