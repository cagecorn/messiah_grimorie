# 던전 씬 그래픽 효과 및 필터 분석 보고서

새로운 게임에 그대로 이식하실 수 있도록, 현재 던전 씬에 적용된 모든 시각 효과를 기술적 구현 방식에 따라 분류하여 정리했습니다.

## 1. Phaser 엔진 내부 효과 (Canvas 기반)

| 효과 명칭 | 구현 방식 | 주요 특징 |
| :--- | :--- | :--- |
| **Global Bloom** | `PostFX Pipeline` | `skillFxLayer`에 적용된 황금빛 광원 효과 (스킬 및 발사체에 적용). |
| **Intro Blur** | `Tween + PostFX` | 씬 진입 시 1.5초간 화면이 블러되었다가 선명해지는 시네마틱 연출. |
| **Ambient Motes** | `ParticleEmitter` | **3층 Parallax 시차**가 적용된 은은한 부유 먼지/빛 가루 효과. |
| **Dynamic Camera** | `Custom Manager` | 본 아이덴티티 스타일의 미세한 **핸드헬드 흔들림(Jitter)** 및 타격 시 **Camera Shake**. |
| **Potion Trails** | `ParticleEmitter` | 발사되는 포션 뒤에 생기는 색상별 파티클 궤적 및 폭발 효과. |

## 2. HD-2D 스타일 DOM/CSS 오버레이 (GPU 가속)

이 효과들은 게임 캔버스 위에 덮여 있는 레이어들로, [src/index.css](file:///c:/Users/lmcbv/Documents/GitHub/Isac_like_RPG/src/index.css)와 [index.html](file:///c:/Users/lmcbv/Documents/GitHub/Isac_like_RPG/index.html)에서 관리됩니다.

| 효과 명칭 | CSS 클래스 | 시각적 특징 |
| :--- | :--- | :--- |
| **Vignette** | `.vignette` | 화면 외곽을 어둡게 하여 중앙 집중도 향상. |
| **Tilt-Shift** | `.tilt-shift` | 화면 상하단을 블러 처리하여 미니어처 같은 공간감 부여. |
| **Soft Bloom** | `.soft-bloom` | 전체적인 밝기와 대비를 살려 화사한 느낌 연출. |
| **Color Grading** | `.color-grading` | 대기 중의 색감을 보정하는 그라데이션 레이어. |
| **Scanlines** | `.scanlines` | 레트로 CRT 모니터 느낌의 가로선 필터. |
| **Film Grain** | `.film-grain` | **SVG feTurbulence** 기반의 동적인 노이즈 효과 (고급 텍스처감). |

---

> [!TIP]
> **이식 시 주의사항**:
> 1. [index.html](file:///c:/Users/lmcbv/Documents/GitHub/Isac_like_RPG/index.html)의 `<svg>` 필터(noise)와 FX 레이어 구조를 그대로 복사해야 합니다.
> 2. [DungeonScene.js](file:///c:/Users/lmcbv/Documents/GitHub/Isac_like_RPG/src/scenes/DungeonScene.js)의 [applyIntroBlur()](file:///c:/Users/lmcbv/Documents/GitHub/Isac_like_RPG/src/scenes/DungeonScene.js#1737-1763)와 `PostFX.addBloom()` 코드는 WebGL 모드에서만 작동하므로 렌더링 설정을 확인하세요.
> 3. 성능 최적화를 위해 `batterySaver` 설정이 켜져 있을 경우 일부 효과가 자동 비활성화되도록 설계되어 있습니다.
