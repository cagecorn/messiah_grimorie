import Logger from '../utils/Logger.js';

/**
 * Z-축 매니저 (Z-Axis Manager)
 * 역할: [라우터 (Router) & 깊이 정렬기]
 * 
 * 설명: 수많은 유닛 스프라이트들의 z-index(Depth)를 자동으로 정렬해주는 라우터입니다.
 * 캐릭터가 위로 이동하면 배경 뒤로, 아래로 이동하면 배경 앞으로 오게 하는 Y-Sorting 등을 담당합니다.
 */
class ZAxisManager {
    constructor() {
        this.sortGroups = new Map(); // 정렬이 필요한 씬/레이어별 그룹
        Logger.system("ZAxisManager Router: Initialized (Auto-depth sorting ready).");
    }

    /**
     * 정렬 대상 등록
     */
    registerToGroup(groupName, object) {
        if (!this.sortGroups.has(groupName)) {
            this.sortGroups.set(groupName, new Set());
        }
        this.sortGroups.get(groupName).add(object);
    }

    /**
     * [핵심] Y-Sort 실행 라우팅
     * 모든 등록된 유닛의 y좌표에 기반하여 depth를 자동 갱신합니다.
     */
    updateSort(groupName) {
        const group = this.sortGroups.get(groupName);
        if (!group) return;

        group.forEach(obj => {
            if (obj && obj.y) {
                // y좌표가 높을수록(아래쪽에 있을수록) 큰 depth 부여
                obj.setDepth(obj.y);
            }
        });
    }

    /**
     * 특정 객체 해제
     */
    unregister(groupName, object) {
        const group = this.sortGroups.get(groupName);
        if (group) group.delete(object);
    }
}

const zAxisManager = new ZAxisManager();
export default zAxisManager;
