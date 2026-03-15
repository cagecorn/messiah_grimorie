import Logger from '../utils/Logger.js';

/**
 * 이모지 매니저 (Emoji Manager)
 * 역할: [텍스트 -> 그래픽 자동 변환 라우터]
 * 
 * 설명: 텍스트 내의 특정 이모지를 게임 내 고퀄리티 자산 이미지로 자동 교체합니다.
 * 개발자가 패치 노트나 대화창에 🪙, 💎 같은 이모지를 쓰면 실제 gold.png, diamond.png로 변환됩니다.
 */
class EmojiManager {
    constructor() {
        this.basePath = 'assets/emojis/';
        this.emojiMap = {
            '🪙': 'gold.png',
            '💎': 'diamond.png',
            '🛡️': 'shield.png',
            '🪵': 'log.png'
        };

        // [STABLE] 역방향 매핑 (ID -> Emoji)
        this.idMap = {
            'gold': '🪙',
            'diamond': '💎',
            'shield': '🛡️',
            'log': '🪵'
        };
        
        Logger.system("EmojiManager: Initialized with ID normalization.");
    }

    /**
     * ID를 이모지로 변환 (Compat용)
     */
    getEmojiFromId(id) {
        return this.idMap[id] || id;
    }

    /**
     * 이모지 또는 ID를 표준 ID로 정규화 (Compat용)
     */
    normalizeToId(key) {
        for (const [id, emoji] of Object.entries(this.idMap)) {
            if (key === id || key === emoji) return id;
        }
        return key;
    }

    /**
     * 텍스트를 HTML <img> 태그가 포함된 문자열로 변환 (DOM 렌더링용)
     */
    parseToHTML(text) {
        let parsedText = text;
        
        for (const [emoji, fileName] of Object.entries(this.emojiMap)) {
            const imgTag = `<img src="${this.basePath}${fileName}" alt="${emoji}" class="mg-icon-emoji" style="height: 1em; vertical-align: middle; margin: 0 2px;">`;
            parsedText = parsedText.split(emoji).join(imgTag);
        }
        
        return parsedText;
    }

    /**
     * Phaser 텍스트 또는 캔버스에서 사용할 수 있도록 이모지/ID에 해당하는 자산 키 반환
     */
    getAssetKey(key) {
        const emoji = this.idMap[key] || key;
        const fileName = this.emojiMap[emoji];
        if (!fileName) return null;
        
        return `emoji_${fileName.split('.')[0]}`;
    }

    /**
     * 특정 텍스트에 포함된 이모지들을 Phaser 텍스트 아이콘 시스템에 맞게 변환 (필요 시 확장)
     */
    parse(text) {
        // [TODO] 향후 Phaser 텍스트 입출력 시스템과 연동할 때 보강
        return text;
    }
}

const emojiManager = new EmojiManager();
export default emojiManager;
