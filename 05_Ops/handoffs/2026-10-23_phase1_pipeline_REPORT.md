# 1단계 렌더 파이프라인 작업 보고서

확인일: 2026-10-23 (Asia/Seoul). 상태: **구현·부분 검증 완료, 전체 렌더와 최종 검토 미완료**.

## 결정과 현재 중단 지점

사용자가 “Astra 판단 우선”으로 결정을 위임했다. Astra는 비공개 EP00 기술 검증에 한해 인계 문서의 예외(단색 배경·도형 소품, ElevenLabs 무료 성인 보이스, 글자 타임스탬프)를 적용했다. 공개용 제작 규칙과 보호된 계획 파일은 바꾸지 않았다. 사용자가 사용한도를 직접 재설정했다고 알렸으며, 에이전트는 쿠폰을 사용하지 않았다.

인계 문서는 현재 채팅의 BlogEngine이 아닌 `/Users/nanbada/projects/BoomBoom`에 있었다. 작업은 지정 브랜치 `feat/phase1-pipeline`에서 수행했다. 시작 커밋은 `be0d5d8`이며 착수 당시 변경 사항이 없었다. push는 하지 않았다.

Rhubarb는 설치되지 않았고 Homebrew 패키지도 찾지 못했다. 인계 문서는 Homebrew 한 줄 설치만 허용하므로 공식 ZIP의 프로젝트 내부 설치 예외를 사용자에게 요청했다. **답변 전에는 설치하지 않는다.** `npm run build:episode -- ../04_Episodes/EP00_pipeline_test`는 실제로 실행했으며, Rhubarb 사전 검사에서 명확한 오류로 종료했다. 이는 성공한 전체 빌드가 아니다.

Claude CLI는 설치되어 있으나 `claude auth status` 결과 `loggedIn: false`, `authMethod: none`이었다. 최종 Claude 교차 검토는 미실행이다. Sol 독립 코드 검토가 이를 대신 완료한 것으로 처리하지 않는다.

## 만든 것

| 위치 | 내용 |
|---|---|
| `03_Pipeline/package.json`, `package-lock.json`, `tsconfig.json` | 버전을 고정한 Remotion·React·TypeScript 프로젝트 |
| `03_Pipeline/src/schema.ts` | 안전한 YAML 파싱, 엄격한 스키마, 줄·필드 오류, ID·참조·범위 검증, 정리된 대사 추출 |
| `03_Pipeline/src/timing.ts` | 글자→단어 타이밍, 무음 제거·대사 오프셋 반영, 단어별 수동 보정, 공통 프레임 변환 |
| `03_Pipeline/src/voice.ts` | 무료 플랜·크레딧 검사, 기본 제공 성인 보이스 확인, 타임스탬프 TTS, 대사별 응답·WAV 캐시, WAV 해시 검사 |
| `03_Pipeline/src/audio.ts`, `process.ts` | 인자 배열 기반 ffmpeg·Rhubarb 실행, 대사 믹싱, 2-pass loudnorm, 최종 파일 음량 측정 |
| `03_Pipeline/scripts/build-episode.ts` | 검증부터 두 화면비 렌더·마스터링까지 단일 실행 명령 |
| `03_Pipeline/video/` | 별도 가로·세로 카메라, 입 A~F·눈 깜빡임·작은 머리/팔 움직임, 목표 단어 팝업, L02 종료 후 풍선 축소·만족 표정 |
| `03_Pipeline/tests/` | 오프라인 테스트 11개 |
| `03_Pipeline/README.md`, `.env.example` | 실행·캐시·타이밍·설치 안내, 비밀 값 없는 환경 예시 |
| `03_Pipeline/voice-config.json` | 보이스 ID·모델·출력 형식의 단일 원본 |
| `04_Episodes/EP00_pipeline_test/script.yaml` | 지정 문장 그대로의 15초·30fps 에피소드. L01 2초, L02 5초 시작 |
| `02_Assets/characters/toby/_candidates/toby_cand01.svg`~`05.svg` | 원본 SVG 후보 5종. 각 파일 필수 그룹·3색 확인 |
| `02_Assets/characters/toby/toby_temp_rig.svg` | 1번 후보와 동일한 채택 임시 리그 |
| `02_Assets/characters/toby/toby_candidates_preview.png` | 후보 5종 나란히 보기 |
| `05_Ops/voices.md`, `assets_log.csv` | 테스트 전용·공개 사용 금지 기록 |

태그가 있는 원본 대사는 TTS 요청과 캐시 식별에만 사용하고, `lines.json`·Rhubarb 대사는 태그를 제거한다. 감정은 모델의 style 수치로 전달한다. EP00에는 별도 발화 태그가 없으며, 현재 모델이 모든 종류의 태그를 연기로 해석한다는 보장은 하지 않는다.

대본 문자열을 셸이나 eval에 넣지 않는다. Rhubarb와 ffmpeg는 인자 배열로 실행한다. 임의 YAML 태그·별칭과 알 수 없는 필드는 거부한다. 오류 응답이나 키를 로그에 출력하지 않는다.

## 실행 방법

```sh
cd /Users/nanbada/projects/BoomBoom/03_Pipeline
npm ci
npm test
npm run typecheck
npm run build:episode -- ../04_Episodes/EP00_pipeline_test
```

Rhubarb 설치가 선행되어야 한다. 출력 예정 파일은 `03_Pipeline/out/EP00/EP00_16x9.mp4`, `EP00_9x16.mp4`다. 전체 실행 수치·캐시·음량·팝업 프레임은 같은 폴더의 `build-report.json`에 기록한다. 아직 해당 최종 MP4는 생성되지 않았다.

## 도구·라이브러리와 공식 근거

| 항목 | 확인한 버전·상태 |
|---|---|
| Node.js | v23.9.0 |
| npm | 11.9.0 |
| ffmpeg | 8.0.1 |
| Rhubarb | 미설치. 공식 최신 릴리스 v1.14.0, macOS ZIP 제공. GitHub API digest는 null |
| Claude CLI | 2.1.308, 로그아웃 |
| remotion / @remotion/bundler / @remotion/renderer | 모두 4.0.538 |
| react / react-dom | 모두 19.3.1 |
| typescript / tsx | 7.0.2 / 4.23.15 |
| yaml / zod | 2.9.1 / 4.6.7 |
| @types/react / @types/node | 19.3.0 / 26.6.5 |

2026-10-23 npm 레지스트리 `npm view <package> version`으로 버전을 확인하고 lockfile에 고정했다. 설치 시 audit 결과 취약점 0건이었다. 이 결과가 모든 보안 위험이 없다는 의미는 아니다.

- Remotion: https://www.remotion.dev/docs/renderer/render-media · https://www.remotion.dev/docs/bundler
- YAML: https://eemeli.org/yaml/
- Zod: https://zod.dev/
- ffmpeg: https://ffmpeg.org/ffmpeg-filters.html#loudnorm
- Rhubarb: https://github.com/DanielSWolf/rhubarb-lip-sync/releases/tag/v1.14.0 · https://github.com/DanielSWolf/rhubarb-lip-sync
- Rhubarb 빈 extendedShapes 인자 관련 보고: https://github.com/DanielSWolf/rhubarb-lip-sync/issues/173 (설치 후 실제 바이너리에서 확인 필요)

공식 Rhubarb macOS ZIP은 실행 파일과 `res/`를 함께 보존하여 `03_Pipeline/.tools/rhubarb/`에 풀 수 있다. 해당 경로는 Git 제외다. 시스템 보안 우회는 하지 않는다. 아직 다운로드하거나 설치하지 않았다.

## ElevenLabs 무료 사용 확인

2026-10-23 공식 요금·타임스탬프 API·상업 이용 안내를 확인했다. Free는 월 10,000크레딧이며 상업 라이선스가 없다. 실제 계정 조회도 `tier=free`, 시작 사용량 0 / 한도 10,000, `can_extend_character_limit=false`였다. 기존 루트 `.env`의 키를 읽었으며 값을 출력하거나 복사하지 않았다.

- 요금: https://elevenlabs.io/pricing · https://elevenlabs.io/pricing/api
- 타임스탬프 API: https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
- 무료 산출물 권리: https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform
- 계정 한도: https://elevenlabs.io/docs/api-reference/user/subscription/get
- 보이스 목록: https://elevenlabs.io/docs/api-reference/voices/search
- 연기 설정: https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices

Roger(서비스 확인: premade, middle_aged, male, american)로 두 대사를 실제 생성했다. 모델은 `eleven_multilingual_v2`, 응답은 무료 지원 `mp3_44100_128`이며 로컬에서 48kHz mono WAV로 변환했다. 유료 44.1kHz WAV 출력 기능은 요청하지 않았다. 생성 결과는 `04_Episodes/EP00_pipeline_test/audio/`에만 저장했다. 무료 플랜 산출물과 임시 리그는 **테스트 전용, 공개 영상 사용 금지**다.

## 완료 조건별 검증

| 조건 | 결과·수치 |
|---|---|
| 1. npm test | **통과: 11/11**. 정상 YAML, 누락 필드, 잘못된 fps, 잘못된 장면 참조, 중복 ID, 태그·별칭 거부, 글자→단어, 수동 보정, 프레임, 캐시 키, 무료 과금 보호 포함 |
| 타입 검사 | **통과**: `npm run typecheck` |
| 2. 단일 명령으로 MP4 2종 | **미완료**: Rhubarb 사전 검사에서 중단. 전체 영상 생성 성공 주장하지 않음 |
| 가로·세로 화면 검증 | 1920×1080, 1080×1920 Remotion 스틸 생성 성공. root가 토비·풍선·팝업 배치와 작은 풍선·만족 표정을 시각 확인. 샘플 입모양·타이밍을 사용한 화면 검증이며 실제 Rhubarb 결과 검증은 아님 |
| 오디오 loudnorm | 실제 두 대사로 만든 15초 stereo WAV의 2-pass 결과 **-14.00 LUFS / -1.50 dBTP**. 원본 믹스는 -20.59 LUFS / -5.37 dBTP. 최종 MP4/AAC 측정은 미실행 |
| 3. L02 변경 후 전체 재빌드 | **미완료**. 오프라인 테스트로 L02 텍스트 변경만 해당 캐시 키를 바꾸고 L01·오프셋 변경은 캐시 유지 확인. 실제 두 원문 재처리에서 모두 cacheHit=true 확인. L02 변경 전체 렌더 시간은 미측정 |
| 4. big/small 실제 발화 대조 | **미완료**. API 기반 big 시작 2.778초 → 83프레임, small 시작 5.418초 → 163프레임. 이 수치는 청취로 측정한 실제 발화 시작이 아니며 오차 0이라고 주장하지 않음. 수동 보정은 없음 |
| 5. 키·음성·MP4 제외 | `.env`, episode audio, out, .tools 제외 규칙 확인. 추적 파일에서 키·오디오·MP4 후보 없음. 비밀 값 출력 없음 |
| Claude 검토 | **대기**: CLI 로그아웃. Sol 독립 코드 검토 및 Luna 결정적 검증 수행 |

Sol 검토에서 발견한 원본 발화 태그 전달과 CSV 중복 검사 문제를 수정했다. Rhubarb `--extendedShapes ''`가 실제 v1.14.0에서 동작하는지는 설치 후 확인해야 한다. 에피소드 원문은 변경하지 않았다.

## 남은 질문과 다음 단계

1. 요청한 **공식 Rhubarb ZIP의 프로젝트 내부 설치** 예외 답변을 기다린다. 설치 후 버전·실행·기본 A~F 출력을 확인하고 전체 명령을 실행한다. Mac에서 실행되지 않으면 인계 규칙대로 보고한다.
2. 두 최종 MP4를 검사하고, L02만 시험 변경한 전체 재빌드에서 L01 캐시 유지·실행 시간을 기록한 뒤 원문을 복구해 최종 렌더한다.
3. 실제 음성을 들으며 big/small 시작 프레임을 확인하고 필요하면 YAML에 이유와 보정값을 남긴다.
4. Claude 로그인이 복구되면 브랜치 diff와 이 보고서의 교차 검토를 받는다. 유료 API로 우회하지 않는다.
5. 최종 음성·영상의 별도 두 위치 백업은 미실행이다. 임의 외부 저장소에 업로드하지 않았다.
