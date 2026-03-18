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

    execute(owner, target) {
        if (!owner) return;
 
        Logger.info("ULTIMATE", `[Aina] Ice Storm triggered!`);
 
        // 1. 컷씬 연출
        ultimateCutsceneManager.show('aina', 'Ice Storm');
 
        // 2. 구름 논리 객체 생성 (Dummy 상속 방식)
        const cloudLogic = IceStormCloudEntity.create(owner.logic, 10000);
        
        // 3. 구름 소환 위치 결정 (타겟 지점이 있으면 해당 지점, 없으면 메인 캐릭터 위치)
        const spawnX = target ? target.x : owner.x;
        const spawnY = target ? target.y : (owner.y - 150);
        
        // SummonManager를 통한 소환
        const cloud = summonManager.spawnSummon(owner.scene, cloudLogic, owner.team, spawnX, spawnY, 'ice_storm_cloud');
        
        if (cloud) {
            cloud.setDepth(2000); // 전열보다 위에 표시
        }

        return true;
    }
}

const iceStorm = new IceStorm();
export default iceStorm;
