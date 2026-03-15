/**
 * 안티그래비티 로거 (Antigravity Logger)
 * 유저 규칙: 새로운 중요한 패치를 할 때마다 그 로직을 개발자 콘솔 창에서 로그로 확인할 수 있도록 함.
 */
const Logger = {
    info: (area, message, data = null) => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`%c[${timestamp}] [${area}] ${message}`, "color: #00ff00; font-weight: bold;", data || "");
    },
    debug: (area, message, data = null) => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`%c[${timestamp}] [${area}] ${message}`, "color: #9e9e9e; font-style: italic;", data || "");
    },
    warn: (area, message, data = null) => {
        console.warn(`[${area}] ${message}`, data || "");
    },
    error: (area, message, data = null) => {
        console.error(`[${area}] ${message}`, data || "");
    },
    // 시스템 초기화 로그용
    system: (message) => {
        console.log(`%c🚀 [SYSTEM] ${message}`, "color: #00fbff; font-family: monospace; font-size: 1.1em;");
    }
};

export default Logger;
