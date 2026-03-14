/**
 * 수호의 노래 AI (Song of Protection AI)
 * 역할: [스킬 자동 시전 결정]
 */
export const updateSongOfProtectionAI = (entity) => {
    if (!entity || !entity.active) return;

    // [USER 요청] 쿨타임이 되면 바로바로 사용
    if (entity.isSkillReady && entity.isSkillReady('songofprotection')) {
        entity.useSkill('songofprotection');
    }
};
