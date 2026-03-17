/**
 * 비행 애니메이터 (Flying Animation)
 * 역할: [비행 유닛전용 상하 바빙 및 고도 연출]
 */
class FlyingAnimation {
    constructor(animationManager) {
        this.am = animationManager;
    }

    get scene() { return this.am.scene; }

    /**
     * 비행 전용 와이드 바빙 시작
     * @param {CombatEntity} entity 
     */
    playFlyingBobbing(entity) {
        if (!this.scene || !entity || !entity.sprite || entity.idleBobbingTween) return;

        // 비행 유닛은 더 넓고(Wide) 느긋한 바빙을 가짐
        const amplitude = -20; // 기존 -4에서 -20으로 대폭 강화
        const duration = 1500; // 약간 더 천천히 움직여서 부유감 강조

        entity.idleBobbingTween = this.scene.tweens.add({
            targets: entity.sprite,
            y: entity.sprite.y + amplitude, // 현재 고도(zHeight) 기준 상대적 이동
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * 비행 바빙 중지 (기존 stopIdleBobbing과 유사하게 호환성 유지)
     */
    stopFlyingBobbing(entity) {
        if (entity.idleBobbingTween) {
            entity.idleBobbingTween.stop();
            entity.idleBobbingTween = null;
            
            // 현재 고도로 부드럽게 복귀
            const baseHeight = entity.zHeight || 0;
            this.scene.tweens.add({
                targets: entity.sprite,
                y: -baseHeight,
                duration: 300,
                ease: 'Cubic.out'
            });
        }
    }
}

export default FlyingAnimation;
