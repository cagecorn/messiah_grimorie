import Phaser from 'phaser';
import Logger from '../../../utils/Logger.js';
import ultimateCutsceneManager from '../../../ui/UltimateCutsceneManager.js';
import projectileManager from '../ProjectileManager.js';
import skillManager from '../SkillManager.js';

/**
 * 바오 궁극기: 가라! 바바오! (Go! Babao!)
 * 역할: [바바오를 전장에 투사체로 사출하여 적들을 휩씀]
 */
class GoBabao {
    constructor() {
        this.id = 'GoBabao';
    }

    execute(owner) {
        if (!owner) return;

        // 1. 바바오 찾기
        const summonSkill = skillManager.getSkill('SummonBabao');
        if (!summonSkill) return;

        const babao = summonSkill.activeSummons.get(owner.logic.id);
        
        // 바바오가 없거나 죽었다면 시전 불가 (혹은 강제 소환 후 시전?)
        // 여기서는 안전하게 바바오가 있을 때만 시전하도록 함
        if (!babao || !babao.active || !babao.logic.isAlive) {
            Logger.warn("ULTIMATE", "Cannot use Go Babao! - Babao is not present.");
            return;
        }

        // 2. 컷씬
        ultimateCutsceneManager.show('bao', 'Go! Babao!');

        // 3. 투사체 발사
        // 가장 가까운 적을 향해 첫 발사
        const enemies = (owner.team === 'mercenary') ? owner.scene.enemies : owner.scene.allies;
        const aliveEnemies = enemies.filter(e => e.active && e.logic.isAlive);
        let firstTarget = { x: owner.x + (owner.team === 'mercenary' ? 400 : -400), y: owner.y };

        if (aliveEnemies.length > 0) {
            const nearest = owner.scene.physics.closest(owner, aliveEnemies);
            if (nearest) firstTarget = { x: nearest.x, y: nearest.y };
        }

        projectileManager.fire('go_babao_projectile', owner, firstTarget, {
            babao: babao,
            duration: 5000, // 5초간 휩씀
            speed: 900
        });

        // 4. 게이지 리셋
        owner.ultimateProgress = 0;
        if (owner.hpBar) owner.hpBar.isDirty = true;
    }
}

const goBabao = new GoBabao();
export default goBabao;
