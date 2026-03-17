import Logger from '../../../utils/Logger.js';

/**
 * 에어본 효과 (Airborne Effect)
 * 역할: [유닛을 공중으로 띄워 무력화]
 */
class Airborne {
    /**
     * @param {CombatEntity} target 대상 엔티티 (Phaser Container)
     * @param {number} duration 유지 시간 (ms)
     * @param {number} height 최대 높이 (px)
     * @param {CombatEntity} source 원인 제공자 (넉백 방향 계산용)
     */
    static apply(target, duration = 1000, height = 150, source = null) {
        if (!target || !target.active || !target.logic.isAlive) return;

        // 1. 상태 설정
        if (target.status) {
            target.status.applyEffect('airborne', duration);
        }

        const startingHeight = target.zHeight || 0;
        const maxHeight = startingHeight + height;
        const scene = target.scene;
        const riseTime = duration * 0.45;
        const fallTime = duration - riseTime;

        // 2. 물리 연출 (제자리 중력 법칙 적용)
        // A. 수직 운동 (zHeight)
        scene.tweens.add({
            targets: { val: startingHeight },
            val: maxHeight,
            duration: riseTime,
            ease: 'Power2.easeOut', 
            onUpdate: (tween) => {
                target.setHeight(tween.getValue());
            },
            onComplete: () => {
                scene.tweens.add({
                    targets: { val: maxHeight },
                    val: startingHeight,
                    duration: fallTime,
                    ease: 'Cubic.easeIn', 
                    onUpdate: (tween) => {
                        target.setHeight(tween.getValue());
                    },
                    onComplete: () => {
                        target.sprite.setAngle(0);
                        if (scene.cameras.main) {
                            // scene.cameras.main.shake(100, 0.005); // [USER 요청] 카메라 쉐이크 비활성화
                        }
                        Logger.info("CC", `${target.logic.name} returned to ${startingHeight}px height.`);
                    }
                });
            }
        });

        // [삭제] B. 수평 운동 (넉백은 별도 CC로 분리 위해 제거)

        // C. 회전 효과 (제자리에서 띄워진 느낌 강조)
        const rotationAngle = (target.x > (source ? source.x : 0)) ? 15 : -15;
        scene.tweens.add({
            targets: target.sprite,
            angle: rotationAngle,
            duration: riseTime,
            ease: 'Power1'
        });
    }
}

export default Airborne;
