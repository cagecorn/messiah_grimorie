/**
 * HP바 페인터 (HealthBar Painter)
 * 역할: [Canvas API를 사용하여 바의 시각적 요소를 직접 그리는 순수 렌더링 모듈]
 */
const HealthBarPainter = {
    /**
     * 전체 배경 및 테두리 그리기
     */
    drawFrame(ctx, w, h, resolution) {
        ctx.clearRect(0, 0, w, h);
        
        // 바깥쪽 테두리 (Metallic Dark Silver)
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, w, h);
    },

    /**
     * 메인 HP 바 그리기 (쉴드 포함)
     */
    drawHPBar(ctx, x, y, w, h, ratio, shieldRatio, resolution) {
        // HP 배경
        ctx.fillStyle = '#2a0000';
        ctx.fillRect(x, y, w, h);

        if (ratio > 0) {
            const gaugeWidth = w * ratio;
            const grad = ctx.createLinearGradient(x, y, x, y + h);
            grad.addColorStop(0, '#ff4d4d');
            grad.addColorStop(0.5, '#b30000');
            grad.addColorStop(1, '#660000');
            
            ctx.fillStyle = grad;
            ctx.fillRect(x, y, gaugeWidth, h);

            // 광택 효과
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.fillRect(x, y, gaugeWidth, h * 0.4);
        }

        // 쉴드 오버레이
        if (shieldRatio > 0) {
            const minShieldWidth = w * 0.15;
            const shieldWidth = Math.max(minShieldWidth, w * shieldRatio);
            const shieldHeight = h * 0.7;
            
            const shieldGrad = ctx.createLinearGradient(x, y, x, y + shieldHeight);
            shieldGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            shieldGrad.addColorStop(0.5, 'rgba(255, 223, 0, 0.6)');
            shieldGrad.addColorStop(1, 'rgba(184, 134, 11, 0.4)');
            
            ctx.fillStyle = shieldGrad;
            ctx.shadowBlur = 8 * resolution;
            ctx.shadowColor = 'rgba(255, 215, 0, 1.0)';
            ctx.fillRect(x, y, shieldWidth, shieldHeight);
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
            ctx.lineWidth = 1 * resolution;
            ctx.strokeRect(x, y, shieldWidth, shieldHeight);
            
            ctx.shadowBlur = 0;
        }
    },

    /**
     * 보조 게이지 바 그리기 (스태미나, 스킬, 궁극기)
     */
    drawSubBar(ctx, x, y, w, h, ratio, type, resolution) {
        let bg, gradColors;

        switch(type) {
            case 'stamina':
                bg = '#082f49';
                gradColors = ['#22d3ee', '#0891b2'];
                break;
            case 'skill':
                bg = '#0f0f1b';
                gradColors = ['#c084fc', '#7e22ce'];
                break;
            case 'ultimate':
                bg = '#1e1b4b';
                gradColors = ['#fbbf24', '#4f46e5', '#312e81'];
                break;
            default:
                bg = '#1a1a1a';
                gradColors = ['#666666', '#333333'];
        }

        // 배경
        ctx.fillStyle = bg;
        ctx.fillRect(x, y, w, h);

        if (ratio > 0) {
            const gaugeWidth = w * Math.min(1, ratio);
            const grad = ctx.createLinearGradient(x, y, x, y + h);
            
            if (gradColors.length === 2) {
                grad.addColorStop(0, gradColors[0]);
                grad.addColorStop(1, gradColors[1]);
            } else {
                grad.addColorStop(0, gradColors[0]);
                grad.addColorStop(0.5, gradColors[1]);
                grad.addColorStop(1, gradColors[2]);
            }

            ctx.fillStyle = grad;
            ctx.fillRect(x, y, gaugeWidth, h);

            // 궁극기 풀차지 이펙트
            if (type === 'ultimate' && ratio >= 1.0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.fillRect(x, y, gaugeWidth, h * 0.3);
            }
        }
    }
};

export default HealthBarPainter;
