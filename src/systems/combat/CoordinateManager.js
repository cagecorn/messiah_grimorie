/**
 * 좌표 매니저 (Coordinate Manager)
 * 역할: [군집 계산 & 위치 보정]
 * 
 * 설명: 여러 유닛의 위치를 분석하여 무게 중심(Center of Mass)이나 
 * 유닛들 사이의 거리(Spread)를 계산합니다. 카메라 트래킹이나 범위 공격 판정에 사용됩니다.
 */
class CoordinateManager {
    /**
     * 유닛 집합의 중앙 지점 계산
     * @param {Array} units CombatEntity 배열
     */
    getCenterOfMass(units) {
        if (!units || units.length === 0) return { x: 0, y: 0 };

        let totalX = 0;
        let totalY = 0;
        let count = 0;

        units.forEach(unit => {
            if (unit && unit.active) {
                totalX += unit.x;
                totalY += unit.y;
                count++;
            }
        });

        if (count === 0) return { x: 0, y: 0 };

        return {
            x: totalX / count,
            y: totalY / count
        };
    }

    /**
     * 유닛 집합을 감싸는 경계 상자 및 확산 정도 계산
     * @param {Array} units CombatEntity 배열
     */
    getGroupBounds(units) {
        if (!units || units.length === 0) return { width: 0, height: 0, centerX: 0, centerY: 0 };

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        let count = 0;

        units.forEach(unit => {
            if (unit && unit.active) {
                minX = Math.min(minX, unit.x);
                maxX = Math.max(maxX, unit.x);
                minY = Math.min(minY, unit.y);
                maxY = Math.max(maxY, unit.y);
                count++;
            }
        });

        if (count === 0 || !isFinite(minX)) return { width: 0, height: 0, centerX: NaN, centerY: NaN };

        const width = maxX - minX;
        const height = maxY - minY;

        return {
            minX, maxX, minY, maxY,
            width,
            height,
            centerX: minX + width / 2,
            centerY: minY + height / 2,
            maxSpread: Math.max(width, height)
        };
    }
}

const coordinateManager = new CoordinateManager();
export default coordinateManager;
