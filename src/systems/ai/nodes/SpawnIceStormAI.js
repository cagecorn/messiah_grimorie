import coordinateManager from '../../combat/CoordinateManager.js';

/**
 * 아이스스톰 전용 하위 AI (Spawn Ice Storm AI)
 * 역할: [궁극기 시전 시 가장 효율적인 소환 위치(밀집 지역) 계산]
 */
class SpawnIceStormAI {
    /**
     * 가장 적들이 밀집한 지점을 분석하여 소환 좌표 반환
     */
    static getBestSpawnPoint(entity) {
        if (!entity || !entity.scene) return { x: entity.x, y: entity.y - 150 };

        const enemies = (entity.team === 'mercenary' || entity.team === 'ally') ? entity.scene.enemies : entity.scene.allies;
        
        // 1. 적군이 없으면 본인 머리 위
        if (!enemies || enemies.length === 0) return { x: entity.x, y: entity.y - 150 };

        // 2. 가장 밀집된 지점 분석 (넓은 반경 250)
        const targetPoint = coordinateManager.getBestAOETarget(enemies, 250);
        
        // 3. 유효하지 않은 좌표라면 기본값
        if (targetPoint.x === 0 && targetPoint.y === 0) {
            return { x: entity.x, y: entity.y - 150 };
        }

        // 4. 구름 위치는 해당 지점의 약간 위쪽 (머리 위에서 떨어지는 느낌)
        return { x: targetPoint.x, y: targetPoint.y - 120 };
    }
}

export default SpawnIceStormAI;
