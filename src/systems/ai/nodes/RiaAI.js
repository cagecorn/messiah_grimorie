import MeleeAI from './MeleeAI.js';

/**
 * 리아 전용 AI 노드 (Ria Specialized AI)
 * 역할: [투사체 반사 로직을 포함할 소드마스터 사고]
 */
class RiaAI {
    static execute(entity, bb, delta) {
        if (!entity.logic.isAlive) return;

        // 1. 투사체 패링(Parry) 로직
        const PARRY_RANGE = 120; // 패링 가능 반경
        const PARRY_COST = 15;   // 스태미나 소모량 (TechnicalConstants.STAMINA.PARRY_COST)
        
        // 투사체 감지
        const nearbyProjectiles = ProjectileSensor.sense(entity, PARRY_RANGE);
        
        if (nearbyProjectiles.length > 0) {
            const lastParryTime = bb.get('lastParryTime') || 0;
            const currentTime = entity.scene.time.now;
            
            // 너무 빈번한 패링 방지 (전술적 스태미나 누수 방지 - 50ms 쿨다운)
            if (currentTime - lastParryTime > 50) {
                nearbyProjectiles.forEach(data => {
                    const proj = data.projectile;
                    
                    // 내 팀이 발사한 것이거나, 스태미나가 부족하면 패스
                    if (proj.owner.team === entity.team || !entity.stamina || entity.stamina.currentStamina < PARRY_COST) return;

                    // [Robust Check] 매우 가까울 때 즉시 반사
                    if (data.distance < 60) {
                        this.performParry(entity, proj, PARRY_COST);
                        bb.set('lastParryTime', currentTime);
                    }
                });
            }
        }
        
        // 2. 기본 근접 공격/이동 로직 수행
        MeleeAI.execute(entity, bb, delta);
    }

    /**
     * 패링 실행 및 자원 소모
     */
    static performParry(entity, proj, cost) {
        // 스태미나 소모
        entity.stamina.consume(cost);

        // 투사체 반사 실행
        const originalOwner = proj.owner;
        if (proj.target !== undefined) {
            // TargetProjectile인 경우
            proj.reflect(entity, originalOwner);
        } else {
            // NonTargetProjectile인 경우
            proj.reflect(entity, { x: originalOwner.x, y: originalOwner.y });
        }

        // 비주얼 및 사운드 피드백
        if (entity.scene) {
            // 스파크 이펙트 (기존 melee_effect 재활용)
            const spark = entity.scene.add.sprite(proj.x, proj.y, 'melee_effect');
            spark.setScale(0.5);
            spark.setTint(0x00ffff);
            entity.scene.tweens.add({
                targets: spark,
                alpha: 0,
                scale: 0.8,
                duration: 200,
                onComplete: () => spark.destroy()
            });

            // 반사 효과음 (roll_sfx는 굴러가는 소리니까 나중에 챙 소리로 교체 권장, 현재는 로드된 것 중 선택)
            // entity.scene.sound.play('stone_skin_sfx', { volume: 0.5 });
        }

        Logger.info("RIA_AI", `${entity.logic.name} parried projectile ${proj.id}!`);
    }
}

export default RiaAI;
