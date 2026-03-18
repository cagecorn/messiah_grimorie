import Logger from '../../../utils/Logger.js';
import IceStormCloudEntity from '../../../data/summons/IceStormCloudEntity.js';
import summonManager from '../../entities/SummonManager.js';
import ultimateCutsceneManager from '../../../ui/UltimateCutsceneManager.js';

/**
 * 아이나 궁극기: 아이스스톰 (Ice Storm)
 * 역할: [광범위에 지속적인 피해를 입히는 얼음 구름 소환]
 */
class IceStorm {
    constructor() {
        this.id = 'ice_storm';
        this.name = 'Ice Storm';
        this.scalingStat = 'mAtk';
    }

    execute(owner) {
        if (!owner) return;

        Logger.info("ULTIMATE", `[Aina] Ice Storm triggered!`);

        // 1. 컷씬 연출
        ultimateCutsceneManager.show('aina', 'Ice Storm');

        // 2. 구름 논리 객체 생성 (Dummy 상속 방식)
        const cloudLogic = IceStormCloudEntity.create(owner.logic, 10000);
        
        // 3. 구름 소환 (SummonManager 중앙화 활용)
        const spawnX = owner.x;
        const spawnY = owner.y - 150; // 머리 위쪽 소환
        
        // [IMPORTANT] SummonManager가 IceStormCloud 클래스를 알 수 있도록 나중에 등록 필요
        const cloud = summonManager.spawnSummon(owner.scene, cloudLogic, owner.team, spawnX, spawnY, 'ice_storm_cloud');
        
        if (cloud) {
            cloud.setDepth(2000); // 전열보다 위에 표시
        }

        return true;
    }
}

const iceStorm = new IceStorm();
export default iceStorm;
