import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import ultimateCutsceneManager from '../../../ui/UltimateCutsceneManager.js';
import projectileManager from '../ProjectileManager.js';
import coordinateManager from '../CoordinateManager.js';
import soundManager from '../../SoundManager.js';
import Invincible from '../effects/Invincible.js';

/**
 * 엘라 궁극기: 운명의 끈 (Threads of Fate)
 * 역할: [6회 연속 화면 횡단 타격 + 실 형태의 강렬한 궤적 + 적 추적]
 */
class ThreadsOfFate {
    constructor() {
        this.id = 'threads_of_fate';
        this.name = 'Threads of Fate';
        this.crossCount = 6;
        this.scalingStat = 'atk';
    }

    execute(owner) {
        if (!owner) return;

        Logger.info("ULTIMATE", `[Ella] Threads of Fate!`);

        // 1. 컷씬 연출
        ultimateCutsceneManager.show('ella', 'Threads of Fate!');

        // 2. 게이지 초기화
        owner.ultimateProgress = 0;
        if (owner.hpBar) owner.hpBar.isDirty = true;

        // 3. 무적 상태 부여 (시전 중 무적 - [USER 요청])
        Invincible.apply(owner, 2000);

        // 4. 6회 연속 발사 시작
        this.startThreadingSequence(owner);
    }

    /**
     * 6번의 끈 타격 시퀀스 시작
     */
    startThreadingSequence(owner) {
        const scene = owner.scene;
        
        for (let i = 0; i < this.crossCount; i++) {
            // 각 타격 사이에 지연 시간 (약 250ms 간격)
            scene.time.delayedCall(300 + (i * 250), () => {
                this.performSingleCross(owner);
            });
        }
    }

    /**
     * 단일 횡단 타격 수행
     */
    performSingleCross(owner) {
        const scene = owner.scene;
        const enemies = scene.enemies.filter(e => e.active && e.logic.isAlive);
        
        // 타겟 포인트 결정
        let targetPoint;
        if (enemies.length > 0) {
            // 1. 타겟팅: 적들이 밀집된 곳의 최적 지점 찾기 (CoordinateManager 활용)
            targetPoint = coordinateManager.getBestAOETarget(enemies, 150);
            
            // 약간의 변동성 부여
            targetPoint.x += Phaser.Math.Between(-50, 50);
            targetPoint.y += Phaser.Math.Between(-50, 50);
            
            // 마지막 유효 타겟 지점 기억
            this.lastTargetPoint = { x: targetPoint.x, y: targetPoint.y };
        } else {
            // 적이 없다면 마지막 타겟 지점이나 화면 중앙 조준
            targetPoint = this.lastTargetPoint || { x: scene.cameras.main.centerX, y: scene.cameras.main.centerY };
            
            // 매번 같은 곳만 쏘지 않도록 넓게 랜덤 오프셋
            targetPoint.x += Phaser.Math.Between(-200, 200);
            targetPoint.y += Phaser.Math.Between(-200, 200);
        }

        // 2. 발사 궤적 계산 (화면 밖 -> 화면 밖)
        const trajectory = this.calculateScreenCrossing(scene, targetPoint);

        // 3. 투사체 발사
        projectileManager.fire('threads_of_fate_projectile', owner, null, {
            startPos: trajectory.start,
            targetPos: trajectory.end,
            damageMultiplier: 3.0, // [USER 요청] 공격력의 3배
            scalingStat: 'atk'
        });

        // 4. 효과음 및 카메라 흔들림
        soundManager.playSound('arrow_1'); // 적절한 '칭!' 사운드가 없다면 화살 소리 대체
        // scene.cameras.main.shake(150, 0.01); // [USER 요청] 카메라 쉐이크 비활성화
    }

    /**
     * 타겟 지점을 통과하는 화면 밖 시작점과 끝점 계산
     */
    calculateScreenCrossing(scene, target) {
        const width = scene.physics.world.bounds.width;
        const height = scene.physics.world.bounds.height;
        const margin = 150;

        // 랜덤한 각도로 타겟을 통과하는 선 생성
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const distance = 1200; // 충분히 긴 거리

        const start = {
            x: target.x - Math.cos(angle) * distance,
            y: target.y - Math.sin(angle) * distance
        };

        const end = {
            x: target.x + Math.cos(angle) * distance,
            y: target.y + Math.sin(angle) * distance
        };

        return { start, end };
    }
}

const threadsOfFate = new ThreadsOfFate();
export default threadsOfFate;
