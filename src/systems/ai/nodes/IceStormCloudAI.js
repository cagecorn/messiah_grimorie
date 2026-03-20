import Phaser from 'phaser';
import coordinateManager from '../../combat/CoordinateManager.js';
import projectileManager from '../../combat/ProjectileManager.js';

/**
 * 아이스스톰 구름 AI (Ice Storm Cloud AI)
 * 역할: [적 밀집 구역 추격 및 눈(투사체) 투하]
 */
class IceStormCloudAI {
    static tick(entity, delta) {
        if (!entity || !entity.active || !entity.logic.isAlive) return;

        const scene = entity.scene;
        const enemies = (entity.team === 'mercenary' || entity.team === 'ally') ? scene.enemies : scene.allies;
        
        // 1. 지속 시간 체크 (Dummy 로직에 위임)
        if (entity.logic.tickDuration) {
            entity.logic.tickDuration(delta);
        } else {
            entity.logic.duration -= delta;
        }

        if (!entity.logic.isAlive || entity.logic.duration <= 0) {
            entity.handleDeath();
            return;
        }

        // 2. 타겟팅: 가장 밀집된 지점 분석 (추적 범위 200)
        const targetPoint = coordinateManager.getBestAOETarget(enemies, 180);
        
        if (targetPoint.x !== 0 || targetPoint.y !== 0) {
            const dist = Phaser.Math.Distance.Between(entity.x, entity.y, targetPoint.x, targetPoint.y);
            
            if (dist > 30) { // 타겟과 일정 거리 이상일 때만 이동
                // 타겟 방향으로 부드럽게 이동
                const angle = Phaser.Math.Angle.Between(entity.x, entity.y, targetPoint.x, targetPoint.y);
                const moveSpeed = 160; 
                entity.x += Math.cos(angle) * (moveSpeed * delta / 1000);
                entity.y += Math.sin(angle) * (moveSpeed * delta / 1000);
            }
        }

        // 3. 투사체 투하 로직 (엔티티 내부 타이머 활용 권장하나 여기서 처리 가능)
        if (!entity.dropTimer) entity.dropTimer = 0;
        entity.dropTimer += delta;

        if (entity.dropTimer > 150) { // 0.15초마다 눈 송이 하나씩 투하
            this.dropProjectile(entity, targetPoint);
            entity.dropTimer = 0;
        }
    }

    static dropProjectile(entity, targetPoint) {
        // 구름 범위 내 랜덤 위치에서 투하
        const offsetX = Phaser.Math.Between(-80, 80);
        const offsetY = Phaser.Math.Between(-40, 40);
        
        const spawnPos = { x: entity.x + offsetX, y: entity.y + offsetY };
        
        // 약간의 랜덤 타겟 위치 (구름 아래쪽으로 떨어짐)
        const hitPos = { 
            x: spawnPos.x + Phaser.Math.Between(-30, 30), 
            y: spawnPos.y + Phaser.Math.Between(100, 250) 
        };

        projectileManager.fire('ice_storm_projectile', entity, hitPos, {
            damageMultiplier: 0.5,
            attribute: 'ice',
            speed: 600,
            scale: 0.6 + (Math.random() * 0.4)
        });
    }
}

export default IceStormCloudAI;
