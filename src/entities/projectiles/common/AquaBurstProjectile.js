import Phaser from 'phaser';
import poolingManager from '../../../core/PoolingManager.js';
import combatManager from '../../../systems/CombatManager.js';
import fxManager from '../../../systems/graphics/FXManager.js';

/**
 * 아쿠아 버스트 투사체 (AquaBurstProjectile)
 * 역할: [세이렌의 스킬 투사체. 명중 시 광역 데미지 발생]
 */
export default class AquaBurstProjectile extends Phaser.GameObjects.Container {
    constructor(scene) {
        super(scene, 0, 0);
        this.sprite = scene.add.sprite(0, 0, 'aqua_burtst_projectile');
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

    fire(attacker, target, config = {}) {
        this.attacker = attacker;
        this.target = target;
        this.config = config; // { isSleeping: false, damageMultiplier: 1.0 }

        this.setAlpha(1);
        this.setVisible(true);
        this.setActive(true);
        this.setPosition(attacker.x, attacker.y - 40);

        // 타겟 방향으로 회전 및 플립
        const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y - 40);
        this.setRotation(angle);
        
        // 원본 이미지가 왼쪽을 보고 있으므로, 오른쪽으로 쏠 때는 Y축 반전 등이 필요할 수 있음
        // 보통 Angle.Between은 오른쪽(0)을 기준으로 하므로, 왼쪽(-PI) 기준인 이미지는 180도 보정 필요
        this.sprite.setRotation(Math.PI); // 이미지 자체를 180도 돌려서 오른쪽을 보게 만든 후 컨테이너 회전 적용
        
        // 물리 엔진 활성화
        if (!this.body) {
            this.scene.physics.add.existing(this);
        }
        this.scene.physics.moveToObject(this, { x: target.x, y: target.y - 40 }, this.speed);
    }

    update() {
        if (!this.active) return;

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
        combatManager.units.forEach(unit => {
            if (unit.active && unit.logic.isAlive && unit.team !== this.attacker.team) {
                const dist = Phaser.Math.Distance.Between(this.x, this.y, unit.x, unit.y - 40);
                if (dist <= radius) {
                    // 데미지 처리
                    combatManager.processDamage(this.attacker, unit, damage, 'magic', false);
                    
                    // 수면 효과 (Sleeping Bubble일 때만)
                    if (isSleeping && unit.logic.status) {
                        unit.logic.status.applyEffect('sleep', 4000); // 4초 수면
                    }
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
