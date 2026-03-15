import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';
import combatManager from '../../../systems/CombatManager.js';
import fxManager from '../../../systems/graphics/FXManager.js';
import Logger from '../../../utils/Logger.js';

/**
 * 아쿠아 버스트 투사체 (AquaBurstProjectile)
 * 역할: [세이렌의 스킬 투사체. 명중 시 광역 데미지 발생]
 */
export default class AquaBurstProjectile extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        this.sprite = scene.add.sprite(0, 0, 'aqua_burst_projectile');
        this.add(this.sprite);
        
        // 투사체는 항상 좌측을 보고 있음 -> 기본적으로 왼쪽 응시
        // 방향에 따라 각도 조절 필요
        
        scene.add.existing(this);
        this.setVisible(false);
        this.setActive(false);
        
        this.speed = 400;
        this.target = null;
        this.attacker = null;
        this.config = {};
    }

    launch(attacker, target, config = {}) {
        this.attacker = attacker;
        this.target = target;
        this.config = config; // { isSleeping: false, damageMultiplier: 1.0 }

        this.setAlpha(1);
        this.setVisible(true);
        this.setActive(true);
        this.setPosition(attacker.x, attacker.y - 40);

        // 타겟 방향으로 회전 및 플립
        const targetX = target.x || (config.targetPos ? config.targetPos.x : this.x);
        const targetY = (target.y || (config.targetPos ? config.targetPos.y : this.y)) - 40;
        
        const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
        this.setRotation(angle);
        
        // 원본 이미지가 왼쪽을 보고 있으므로, 오른쪽으로 쏠 때는 Y축 반전 등이 필요할 수 있음
        this.sprite.setRotation(Math.PI); 
        
        // 물리 엔진 활성화
        if (!this.body) {
            this.scene.physics.add.existing(this);
        }
        this.scene.physics.moveTo(this, targetX, targetY, this.speed);
    }

    update() {
        if (!this.active) return;

        // [BUG FIX] 타겟이 소멸되었는지 체크
        if (!this.target || !this.target.active || (this.target.logic && !this.target.logic.isAlive)) {
            // 타겟을 잃으면 그냥 그 자리에서 폭발시키거나 소멸시킴 (여기서는 관대하게 폭발 유도)
            this.onHit();
            return;
        }

        // 타겟 근접 체크
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y - 40);
        if (dist < 20) {
            this.onHit();
        }

        // 화면 밖으로 나가면 해제
        if (this.x < -100 || this.x > 2000 || this.y < -100 || this.y > 1200) {
            this.release();
        }
    }

    onHit() {
        // [시각 효과] 아쿠아 폭발
        if (fxManager.showAquaExplosion) {
            fxManager.showAquaExplosion(this.x, this.y);
        }

        // [광역 데미지]
        const radius = 80;
        const damage = this.config.damageMultiplier || 1.5;
        const isSleeping = this.config.isSleeping || false;

        // AOE Manager가 있다면 활용, 없으면 직접 거리 체크
        const unitsInScene = Array.from(combatManager.units);
        Logger.debug("AQUA_BURST_DEBUG", `onHit at (${this.x.toFixed(1)}, ${this.y.toFixed(1)}). Checking ${unitsInScene.length} units.`);

        unitsInScene.forEach(unit => {
            if (unit.active && unit.logic.isAlive) {
                if (unit.team !== this.attacker.team) {
                    const dist = Phaser.Math.Distance.Between(this.x, this.y, unit.x, unit.y - 40);
                    if (dist <= radius) {
                        Logger.debug("AQUA_BURST_DEBUG", `Hitting ${unit.logic.name} at dist ${dist.toFixed(1)}`);
                        // 데미지 처리
                        combatManager.processDamage(this.attacker, unit, damage, 'magic', false);
                        
                        // 수면 효과 (Sleeping Bubble일 때만)
                        if (isSleeping && unit.logic.status) {
                            unit.logic.status.applyEffect('sleep', 4000); // 4초 수면
                        }
                    }
                } else if (unit === this.target) {
                    // [DEBUG] 타겟인데 팀이 같아서 무시되는 경우 확인
                    Logger.debug("AQUA_BURST_DEBUG", `Target ${unit.logic.name} ignored: same team (${unit.team} === ${this.attacker.team})`);
                }
            }
        });

        this.release();
    }

    release() {
        this.setActive(false);
        this.setVisible(false);
        if (this.body) this.body.setVelocity(0, 0);
        poolingManager.release('aqua_burst_projectile', this);
    }
}
