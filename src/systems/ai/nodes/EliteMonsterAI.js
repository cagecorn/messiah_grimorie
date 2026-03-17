import Phaser from 'phaser';
import monsterPatternAnimationManager from '../../graphics/MonsterPatternAnimationManager.js';
import Logger from '../../../utils/Logger.js';
import EliteMonsterThrowAI from './EliteMonsterThrowAI.js';

/**
 * 엘리트 몬스터 AI 노드 (Elite Monster AI Node)
 * 역할: [기본 클래스 AI + 특수 패턴(들기/던지기) 실행]
 */
class EliteMonsterAI {
    static execute(entity, bb, delta, baseNode) {
        if (!entity.logic.isAlive) return;

        // 1. 이미 애니메이션 중(들기/던지기 시전 중)이라면 중단
        if (entity.isBusy && !entity.carriedEntity) return;

        // 2. 들고 있는 개체가 있는 경우 처리
        if (entity.carriedEntity) {
            monsterPatternAnimationManager.syncCarriedPosition(entity);
            
                // [PHASE 2] 던지기 시도
                const opponents = (entity.team === 'mercenary') ? entity.scene.enemies : entity.scene.allies;
                if (opponents) {
                    // [Safety] 자기 자신 및 이미 들려있는 대상 제외 필터링 추가
                    const filteredOpponents = opponents.filter(opp => opp !== entity && !opp.isBeingCarried);
                    const thrown = EliteMonsterThrowAI.update(entity, filteredOpponents);
                    if (thrown) return; // 던지기 성공 시 이번 턴 종료
                }
            
            // 던지지 않았다면 기본 AI로 이동은 가능하게 함 (단, 공격은 제한할 수도 있음)
            // 여기서는 일단 기본 AI에게 위임하여 추격하게 함
            if (baseNode) {
                baseNode.execute(entity, bb, delta);
                // [USER 요청 피드백] 들고 있는 동안에는 공격 대신 추격만 하도록 유도하려면 
                // MeleeAI 등이 attack()을 호출할 때 isBeingCarried를 체크해야 함.
                // 이미 CombatEntity.updateAttackCooldown에서 isBeingCarried면 중단하므로 
                // 안전하게 baseNode.execute를 호출해도 됨.
            }
            return;
        }

        // 3. 특수 패턴 체크 (들기 시도)
        this.checkSpecialPatterns(entity, bb, delta);

        // 4. 기본 클래스 AI 실행
        if (!entity.isBusy && baseNode) {
            baseNode.execute(entity, bb, delta);
        }
    }

    /**
     * 특수 패턴 조건 체크 (들기)
     */
    static checkSpecialPatterns(entity, bb, delta) {
        // 패턴 쿨다운 관리 (블랙보드 활용)
        let patternCooldown = bb.get('patternCooldown') || 0;
        patternCooldown -= delta;
        bb.set('patternCooldown', patternCooldown);

        if (patternCooldown <= 0) {
            // 주위에 일반 몬스터가 있는지 탐색
            const nearbyMonster = this.findNearbyNormalMonster(entity);
            
            if (nearbyMonster) {
                // 확률 체크 (30%)
                if (Math.random() < 0.3) {
                    const success = monsterPatternAnimationManager.pickUp(entity, nearbyMonster);
                    if (success) {
                        bb.set('patternCooldown', 5000 + Math.random() * 2000); // 5~7초 쿨다운
                        Logger.debug("ELITE_AI", `${entity.logic.name} starting pickup pattern.`);
                    }
                } else {
                    // 확률 실패 시 짧은 재시도 쿨다운
                    bb.set('patternCooldown', 1000);
                }
            }
        }
    }

    /**
     * 주위의 일반 몬스터(비-엘리트, 비-보스) 탐색
     */
    static findNearbyNormalMonster(entity) {
        if (entity.carriedEntity) return null; // [추가] 이미 들고 있으면 찾지 않음
        
        const scene = entity.scene;
        const enemies = scene.enemies; // 자신과 같은 팀원들 (엘리트 입장에서의 적은 아군이지만, 코드상 몬스터는 enemies 레이어)
        if (!enemies) return null;

        const pickupRange = 100;

        for (const other of enemies) {
            if (other === entity) continue;
            if (!other.active || !other.logic.isAlive) continue;
            
            // 일반 몬스터 조건: 엘리트가 아니고 보스가 아니어야 함
            if (other.logic.isElite || other.logic.id.includes('boss')) continue;
            
            // 이미 들려있는 경우 제외
            if (other.isBeingCarried) continue;

            const dist = Phaser.Math.Distance.Between(entity.x, entity.y, other.x, other.y);
            if (dist < pickupRange) {
                return other;
            }
        }

        return null;
    }
}

export default EliteMonsterAI;
