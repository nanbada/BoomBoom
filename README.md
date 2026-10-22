# BoomBoom English

5~7세(Pre-A1) 아이를 위한 영어 전용 2D 애니메이션 유튜브 채널(토비·모모) 제작 저장소. 공개 전이며, 시즌 1 계획 §11 기준 0단계(정리)를 마치고 1단계(기술 검증)에 들어간다.

## 문서 지도

| 위치 | 내용 |
|---|---|
| `00_Plan/02_Season1_Launch_Plan.md` | 시즌 1 실행 계획. 모든 작업의 기준 문서 |
| `00_Plan/03_Voice_Decision.md` | 음성 엔진·캐스팅·보이스 자산 규칙 |
| `00_Plan/01_Research_Review.md` | 기존 Gemini 리서치의 유지·수정·보관 판정 |
| `CLAUDE.md` / `AGENTS.md` | Claude·Codex 작업 규칙 |
| `01_Bible/` | Bible, 커리큘럼, 캐릭터 외형 명세, `image_style.md` |
| `02_Assets/` | 캐릭터 SVG, 배경, 소품, 효과음, 음악. `voices/`·`_raw/`는 git 제외 |
| `03_Pipeline/` | Remotion 렌더 파이프라인 |
| `04_Episodes/EPxx_<slug>/` | `episode_card.md`, `storyboard.md`, `script.yaml` |
| `05_Ops/` | `assets_log.csv`, `voices.md`, 작업 인계 문서(`handoffs/`) |
| `99_Archive/gemini_v0/` | 기존 리서치·대본 원본(참고용, 수정하지 않음) |

렌더 결과와 음성 원본은 git에 넣지 않고 서로 다른 두 곳에 백업한다(계획 §7).
