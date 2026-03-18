import Dummy from '../../entities/Dummy.js';
import { STAT_KEYS } from '../../core/EntityConstants.js';

/**
 * 아이스스톰 구름 가상 로직 (Ice Storm Cloud Virtual Logic)
 * 역할: [최소한의 인터페이스만 갖춘 더미 소환수 데이터]
 */
export default class IceStormCloudEntity {
    static create(ownerLogic, duration = 10000) {
        // Dummy.createLogic을 기반으로 필요한 데이터만 추가/수정
        const dummyLogic = Dummy.createLogic(`ice_storm_cloud_${Date.now()}`, 'Ice Storm Cloud');
        
        // 주인(아이나)의 마공 계승
        const masterMAtk = ownerLogic ? ownerLogic.getTotalMAtk() : 10;
        
        // 필요한 프로퍼티 덮어쓰기
        Object.assign(dummyLogic, {
            baseId: 'ice_storm_cloud',
            duration: duration,
            owner: ownerLogic,
            isInvincible: true,
            isDummy: true,
            // 투사체 데미지 계산 시 참조되는 마공 Getter
            getTotalMAtk: () => masterMAtk,
            // 유효성 체크용
            isAlive: true,
            // 소모성 타이머 (AI에서 사용)
            tickDuration: (delta) => {
                dummyLogic.duration -= delta;
                if (dummyLogic.duration <= 0) dummyLogic.isAlive = false;
            }
        });

        return dummyLogic;
    }
}
