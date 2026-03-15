import BaseEntity from '../../entities/BaseEntity.js';
import { STAT_KEYS } from '../../core/EntityConstants.js';
import Logger from '../../utils/Logger.js';

/**
 * 세이렌 (Siren) - 소환수 데이터
 * 역할: [Lute의 소환수, 원거리 마법 딜러]
 */
class SirenEntity extends BaseEntity {
    constructor(config, master) {
        // master는 BaseEntity(Logic) 객체여야 함
        const masterLogic = master.logic || master;
        const masterMAtk = masterLogic.getTotalMAtk ? masterLogic.getTotalMAtk() : 10;
        
        const sirenConfig = {
            id: 'siren',
            baseId: 'siren', // [FIX] 명시적 베이스 ID 추가
            name: 'Siren',
            type: 'summon', // 시스템상 소환수로 취급
            className: 'wizard',
            level: 1, // [USER 요청] 소환수는 레벨업 성장을 하지 않도록 1로 고정
            baseStats: {
                [STAT_KEYS.MAX_HP]: masterMAtk * 5, // 체력은 마스터 마공의 5배
                [STAT_KEYS.HP]: masterMAtk * 5,
                [STAT_KEYS.ATK]: 0,
                [STAT_KEYS.M_ATK]: masterMAtk * 1.2, // 공격력은 마스터 마공의 1.2배
                [STAT_KEYS.DEF]: master.getTotalDef() * 0.5,
                [STAT_KEYS.M_DEF]: master.getTotalMDef() * 0.5,
                [STAT_KEYS.SPEED]: master.getTotalSpeed() * 0.8,
                [STAT_KEYS.ATK_SPD]: 1.2,
                [STAT_KEYS.ATK_RANGE]: 350,
                [STAT_KEYS.ACC]: 100,
                [STAT_KEYS.EVA]: 20,
                [STAT_KEYS.CRIT]: 10
            }
        };

        super(sirenConfig);
        this.master = master;
        this.summonTime = Date.now();
        
        Logger.info("SUMMON", `Siren summoned by ${master.name} with MAtk: ${this.getTotalMAtk()}`);
    }

    // 세이렌은 별도의 레벨업이 아닌 마스터 스탯에 실시간 동기화될 필요가 있을지도? 
    // 우선 소환 시점 고정 스탯으로 구현
}

export default SirenEntity;
