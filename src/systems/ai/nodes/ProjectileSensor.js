import Phaser from 'phaser';
import projectileManager from '../../combat/ProjectileManager.js';

/**
 * 1. 투사체 감지 노드 (Projectile Sensor)
 * 역할: [내 주변의 활성 투사체들을 스캔하여 리스트업]
 */
class ProjectileSensor {
    /**
     * 주변 투사체 스캔
     * @param {CombatEntity} entity 감지 주체
     * @param {number} range 감지 반경
     * @returns {Array} 감지된 적군 투사체 배열
     */
    static sense(entity, range = 300) {
        const detected = [];
        const projectiles = projectileManager.activeProjectiles;

        if (!projectiles) return detected;

        projectiles.forEach(proj => {
            // 아군 투사체는 무시
            if (proj.owner.team === entity.team) return;

            const dist = Phaser.Math.Distance.Between(entity.x, entity.y, proj.x, proj.y);
            if (dist <= range) {
                detected.push({
                    projectile: proj,
                    distance: dist
                });
            }
        });

        // 거리순 정렬
        return detected.sort((a, b) => a.distance - b.distance);
    }
}

export default ProjectileSensor;
