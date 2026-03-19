import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import WarriorAI from './WarriorAI.js';

/**
 * 바바오 전용 AI 노드 (Babao AI Node)
 * 역할: [근접 전사로서 적에게 돌진하여 공격]
 * 특성: WarriorAI 상속하여 기본 행동 수행
 */
class BabaoAI extends WarriorAI {
    static update(entity, enemies) {
        // 기본 WarriorAI 로직 사용 (타겟 추적 및 근접 공격)
        return super.update(entity, enemies);
    }
}

export default BabaoAI;
