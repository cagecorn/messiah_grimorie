import Logger from '../../utils/Logger.js';

/**
 * 몬스터 패턴 애니메이션 매니저 (Monster Pattern Animation Manager)
 * 역할: [엘리트 몬스터의 특수 패턴(들기, 던지기 등) 시각 효과 및 연출 관리]
 */
class MonsterPatternAnimationManager {
    constructor() {
        this.activePatterns = new Map();
    }

    /**
     * 엘리트 몬스터가 일반 몬스터를 들어올림
     * @param {CombatEntity} carrier 엘리트 몬스터
     * @param {CombatEntity} target 들어올려질 몬스터
     */
    pickUp(carrier, target) {
        if (!carrier || !target) return false;
        if (target.isBeingCarried || carrier.isBusy) return false;

        Logger.info("MONSTER_PATTERN", `${carrier.logic.name} picked up ${target.logic.name}!`);

        // 1. 상태 설정
        carrier.isBusy = true;
        target.isBeingCarried = true;
        
        // 2. 물리 및 AI 비활성화 (대상 몬스터)
        if (target.body) target.body.setEnable(false);
        target.setVisible(true); // 혹시 모를 가시성 보장
        
        // 3. 위치 고정 및 애니메이션 (캐리어 머리 위로)
        this.animatePickUp(carrier, target);

        return true;
    }

    /**
     * 들어올리기 연출 (Tween)
     */
    animatePickUp(carrier, target) {
        const scene = carrier.scene;
        
        // [ENHANCED] '휙' 들어올리는 연출을 위해 2단계 트윈 사용
        // 1단계: 빠르게 머리 위로 휙! (Hoisting)
        scene.tweens.add({
            targets: target,
            x: carrier.x,
            y: carrier.y - 100, // 우선 더 높이 휙 들어올림
            duration: 150,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                // 2단계: 머리 위로 살짝 내려앉으며 정착 (Settling)
                scene.tweens.add({
                    targets: target,
                    x: carrier.x,
                    y: carrier.y - 60,
                    duration: 150,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        carrier.isBusy = false; 
                        Logger.debug("MONSTER_PATTERN", `${carrier.logic.name} finished hoist animation.`);
                    }
                });
            }
        });

        // 캐리어 인스턴스에 현재 들고 있는 대상을 저장
        carrier.carriedEntity = target;
    }

    /**
     * 매 프레임 위치 동기화 (CombatEntity.update에서 호출 유도)
     */
    syncCarriedPosition(carrier) {
        if (carrier.carriedEntity && carrier.carriedEntity.active) {
            carrier.carriedEntity.setPosition(carrier.x, carrier.y - 60);
            carrier.carriedEntity.setDepth(carrier.depth + 1); // 캐리어보다 앞에 보이게
        }
    }

    /**
     * 들고 있는 유닛 해제 (던지거나 떨어뜨릴 때)
     */
    release(carrier) {
        const target = carrier.carriedEntity;
        if (!target) return;

        target.isBeingCarried = false;
        carrier.isBusy = false;
        carrier.carriedEntity = null;

        if (target.body) target.body.setEnable(true);
        
        Logger.info("MONSTER_PATTERN", `${carrier.logic.name} released ${target.logic.name}.`);
    }
}

const monsterPatternAnimationManager = new MonsterPatternAnimationManager();
export default monsterPatternAnimationManager;
