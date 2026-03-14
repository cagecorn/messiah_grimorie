/**
 * 실시간 전투 데이터 통계 분석 워커 (Statistics Tracker Worker)
 * 역할: [메인 스레드 부하 분산, 대규모 유닛 데미지/치유 데이터 집계 및 dps 계산]
 */

// 유닛별 데이터 저장소 (ID -> Data Object)
const stats = new Map();

// 전투 시작 시간 (워커 생성 시점 기준)
const startTime = Date.now();

// 상수 설정
const HISTORY_WINDOW_MS = 30000; // 30초 히스토리
const SNAPSHOT_INTERVAL_MS = 1000; // 1초마다 스냅샷

self.onmessage = function(e) {
    const { type, data } = e.data;

    switch (type) {
        case 'COMBAT_EVENT':
            handleCombatEvent(data);
            break;
        case 'GET_UNIT_STATS':
            const unitStats = stats.get(data.id);
            // 요청 시점에 현재 히스토리 포함하여 전송
            self.postMessage({ type: 'UNIT_STATS_RES', data: unitStats || createEmptyStats(data.id) });
            break;
        case 'GET_ALL_STATS':
            self.postMessage({ type: 'ALL_STATS_RES', data: Array.from(stats.values()) });
            break;
        case 'RESET_STATS':
            stats.clear();
            break;
    }
};

function handleCombatEvent(event) {
    const { attackerId, targetId, damage, healed, mitigated } = event;
    const now = Date.now();

    // 1. 공격자 데이터 갱신 (Dealt, Healed)
    if (attackerId) {
        let aData = stats.get(attackerId);
        if (!aData) aData = createEmptyStats(attackerId);
        
        const dmg = (damage || 0);
        aData.totalDealt += dmg;
        aData.totalHealed += (healed || 0);
        aData.totalMitigated += (mitigated || 0);
        
        // 실시간 DPS 계산용 원시 로그 기록 (정밀 계산용)
        aData.rawHistory.push({ t: now, v: dmg });
        
        updateUnitStats(aData, now);
        stats.set(attackerId, aData);
    }

    // 2. 피격자 데이터 갱신 (Received)
    if (targetId) {
        let tData = stats.get(targetId);
        if (!tData) tData = createEmptyStats(targetId);
        
        tData.totalReceived += (damage || 0);
        stats.set(targetId, tData);
    }
}

function updateUnitStats(unitData, now) {
    const cutoff = now - HISTORY_WINDOW_MS;
    
    // 1. 원시 히스토리 정리 (30초 초과분 제거)
    unitData.rawHistory = unitData.rawHistory.filter(h => h.t > cutoff);
    
    // 2. 실시간 DPS 계산 (최근 5초 기준 혹은 전체 시간 기준 선택 - 여기선 전체 기반 윈도우)
    const totalInWindow = unitData.rawHistory.reduce((sum, h) => sum + h.v, 0);
    unitData.dps = totalInWindow / (HISTORY_WINDOW_MS / 1000);

    // 3. UI용 초단위 집계 히스토리 (Graph용)
    // 1초마다 스냅샷을 찍어 dpsHistory에 저장
    if (now - unitData.lastSnapshotTime >= SNAPSHOT_INTERVAL_MS) {
        unitData.dpsHistory.push(Math.floor(unitData.dps));
        if (unitData.dpsHistory.length > 30) unitData.dpsHistory.shift(); // 최대 30초
        unitData.lastSnapshotTime = now;
    }
}

function createEmptyStats(id) {
    return {
        id: id,
        totalDealt: 0,
        totalReceived: 0,
        totalHealed: 0,
        totalMitigated: 0,
        dps: 0,
        hps: 0,
        rawHistory: [],    // {t, v} 원시 데이터
        dpsHistory: [],    // [number, number...] 1초 단위 DPS 기록
        lastSnapshotTime: 0,
        lastUpdate: Date.now()
    };
}
