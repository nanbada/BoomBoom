# 1단계 렌더 파이프라인 작업 보고서

확인일: 2026-10-23 (Asia/Seoul). 상태: **구현·가로/세로 렌더·자동 검증 완료. 사용자 청취 확인 수령. ±2프레임 정밀 실측은 미수행**.

후속 상태(2026-10-23): **장면 데이터화·테스트 보강·WAV 자동 발화 시작 측정·small 보정 반영. Claude가 샌드박스 밖 macOS 셸에서 테스트 18/18·타입 검사·42.14초 재빌드·영상 비교를 완료했다.** 사람의 프레임 단위 확인은 대기다. 아래 기존 기록은 최초 작업 이력이며, 이번 결과는 마지막 절에 구분했다.

## 결정과 현재 중단 지점

사용자가 “Astra 판단 우선”으로 결정을 위임했다. Astra는 비공개 EP00 기술 검증에 한해 인계 문서의 예외(단색 배경·도형 소품, ElevenLabs 무료 성인 보이스, 글자 타임스탬프)를 적용했다. 공개용 제작 규칙과 보호된 계획 파일은 바꾸지 않았다. 사용자가 사용한도를 직접 재설정했다고 알렸으며, 에이전트는 쿠폰을 사용하지 않았다.

인계 문서는 현재 채팅의 BlogEngine이 아닌 `/Users/nanbada/projects/BoomBoom`에 있었다. 작업은 지정 브랜치 `feat/phase1-pipeline`에서 수행했다. 시작 커밋은 `be0d5d8`이며 착수 당시 변경 사항이 없었다. push는 하지 않았다.

사용자가 공식 Rhubarb ZIP의 프로젝트 내부 설치를 명시적으로 승인했다. 공식 v1.14.0 macOS 배포본을 `03_Pipeline/.tools/rhubarb/`에 설치했고, 기존 Mac 환경에서 x86_64 실행 파일의 버전 조회와 두 대사 분석이 정상 작동했다. 시스템 보안 설정을 변경하지 않았다. `--extendedShapes ''`도 정상 실행되어 A~F만 출력했다.

최종 원문 영상 두 개를 단일 명령으로 생성했다. 첫 성공 빌드 35.61초, L02 변경 재빌드 35.99초, 원문 복구 빌드 34.25초, CLI 검토 수정 후 최종 빌드 44.65초다. 모두 로컬 실측이다.

Claude CLI의 Pro 구독 인증을 복구했다. 웹 검토 요청은 사용자의 “claude-cli로 진행” 지시에 따라 응답 중단 후 사용하지 않았고, CLI 읽기 전용 교차 검토와 수정 후 재검토를 완료했다. 키나 음성 파일은 리뷰 자료에 포함하지 않았다.

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
| `03_Pipeline/tests/` | 오프라인 테스트 14개 |
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

승인된 Rhubarb 설치가 적용되어 있다. 최종 출력 파일은 `03_Pipeline/out/EP00/EP00_16x9.mp4`, `EP00_9x16.mp4`다. 전체 실행 수치·캐시·음량·팝업 프레임은 같은 폴더의 `build-report.json`에 기록한다. 원문 `Make it small!`로 복구한 최종 MP4가 생성되어 있다.

## 도구·라이브러리와 공식 근거

| 항목 | 확인한 버전·상태 |
|---|---|
| Node.js | v23.9.0 |
| npm | 11.9.0 |
| ffmpeg | 8.0.1 |
| Rhubarb | 공식 v1.14.0 macOS ZIP 설치·실행 성공. x86_64 바이너리. GitHub API digest는 null |
| Claude CLI | 2.1.308, claude.ai Pro 구독 인증 성공 |
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
- Rhubarb 빈 extendedShapes 인자 관련 보고: https://github.com/DanielSWolf/rhubarb-lip-sync/issues/173 (실제 설치본에서 빈 문자열 옵션 정상 동작 확인)

공식 Rhubarb macOS ZIP은 실행 파일과 `res/`를 함께 보존하여 `03_Pipeline/.tools/rhubarb/`에 풀 수 있다. 해당 경로는 Git 제외다. 시스템 보안 우회는 하지 않는다. 사용자 승인 후 설치했다. 다운로드 파일의 로컬 SHA-256은 `f991deacac6c973a14a4431a16a58b842f436531e120cfaea142c87c0d3ab4c5`다. 공식 체크섬과 대조한 값은 아니며 다운로드 파일 식별용이다.

## ElevenLabs 무료 사용 확인

2026-10-23 공식 요금·타임스탬프 API·상업 이용 안내를 확인했다. Free는 월 10,000크레딧이며 상업 라이선스가 없다. 실제 계정 조회도 `tier=free`, 시작 사용량 0 / 한도 10,000, `can_extend_character_limit=false`였다. 기존 루트 `.env`의 키를 읽었으며 값을 출력하거나 복사하지 않았다.

- 요금: https://elevenlabs.io/pricing · https://elevenlabs.io/pricing/api
- 타임스탬프 API: https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
- 무료 산출물 권리: https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform
- 계정 한도: https://elevenlabs.io/docs/api-reference/user/subscription/get
- 보이스 목록: https://elevenlabs.io/docs/api-reference/voices/search
- 연기 설정: https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices

Roger(서비스 확인: premade, middle_aged, male, american)로 두 대사를 실제 생성했다. 모델은 `eleven_multilingual_v2`, 응답은 무료 지원 `mp3_44100_128`이며 로컬에서 48kHz mono WAV로 변환했다. 유료 44.1kHz WAV 출력 기능은 요청하지 않았다. 원본·대사별 생성 결과는 `04_Episodes/EP00_pipeline_test/audio/`, 믹스·마스터는 `03_Pipeline/out/EP00/`에 저장했다. 최종 계정 조회는 무료 플랜 51/10,000크레딧 사용, 추가 과금 불가였다. L02 변경 시험용 음성은 원장에 미채택으로 표시했다. 무료 플랜 산출물과 임시 리그는 **테스트 전용, 공개 영상 사용 금지**다.

## 완료 조건별 검증

| 조건 | 결과·수치 |
|---|---|
| 1. npm test | **통과: 14/14**. 스키마 정상·실패 5종, 타이밍·보정·프레임, 캐시 키·무료 과금 보호, 오디오 길이·크기, loudnorm 필수 필드, 비BMP 문자 타이밍 회귀 테스트 |
| 타입 검사 | **통과**: `npm run typecheck` |
| 2. 단일 명령 MP4 2종 | **통과**: 16:9 1920×1080 및 9:16 1080×1920, 각각 30fps·15.000초·450프레임. 전체 디코드 오류 없음 |
| 최종 MP4 음량 | **두 파일 모두 -14.01 LUFS / -1.49 dBTP**. 목표 -14±1 / -1 이하 충족. AAC 포함 최종 파일에서 재측정 |
| 3. L02 변경 재빌드 | **통과: 35.99초**. L02만 `Make it small, please!`로 변경. L01 원래 키 유지·cacheHit=true, L02 새 키·cacheHit=false. 복구 빌드 34.25초. CLI 수정 후 최종 44.65초, 두 원래 키 모두 cacheHit=true |
| 4. 실제 발화와 팝업 ±2프레임 | **사용자 정성 청취 확인 수령**: “자막과 발화가 자연스럽게 맞음”. 최종 영상에서 big 83프레임, small 163프레임 첫 등장 확인. 실제 발화 시작의 프레임 숫자를 독립 측정하지 않았으므로 ±2프레임 정량 판정은 미측정으로 유지 |
| 5. 키·음성·MP4 제외 | `.env`, audio, out, .tools 제외 규칙 확인. 커밋 대상에 키·오디오·MP4 없음. 비밀 값 출력 없음 |
| Claude 검토 | **완료**: 전달한 diff·테스트 텍스트의 정적 검토. 수정 후 재검토에서 “차단 결함 없음”. 실행 검증은 root·Luna가 별도로 수행 |

최종 영상 파일 크기: 가로 537,495 bytes, 세로 544,722 bytes. Luna 결정적 검증에서 두 영상을 처음부터 끝까지 디코드했고, 4개 `mouth.json`의 A~F·유한 시간·정렬·대사 구간 검사도 통과했다. 최종 대본의 Git 차이는 없다.

팝업 근거를 구분한다. ElevenLabs 글자 타임스탬프에서 얻은 단어 시작은 big 2.778초, small 5.418초다. 30fps 반올림 결과는 83·163프레임이며 반올림 오차는 각각 -0.34·+0.46프레임이다. 최종 MP4의 직전/첫 등장 프레임(82/83, 162/163)을 추출해 양쪽 화면비에서 확인했다. **이 반올림 오차는 실제 귀로 들은 발화 시작과의 오차가 아니다.** 수동 보정은 아직 없다.

화면 근거: `03_Pipeline/out/EP00/qa/landscape-boundaries.png`, `portrait-boundaries.png`와 12초 종료 장면 PNG. 토비·풍선·팝업이 잘리지 않고, L02 뒤 풍선이 작아지고 만족 표정이 유지됨을 root가 시각 확인했다. 2026-10-23 사용자가 가로 영상의 발화·자막이 자연스럽게 맞는다고 확인했다. 세로 영상의 별도 사람 시청 확인은 받지 않았다.

수치 원본: `out/EP00/baseline-build-report.json`, `l02-change-build-report.json`, `build-report.json`, `usage-evidence.json`. 모두 Git 제외이며 이 보고서에 핵심 수치를 보존한다.

## 발견한 문제와 조치

- Sol 독립 검토에서 원본 발화 태그가 TTS 전에 사라지는 문제와 CSV 중복 검사 형식 문제를 찾아 수정했다.
- 첫 전체 실행에서 `apad` 뒤 시간 기반 절단이 기대대로 멈추지 않아 약 44GiB 임시 믹스와 디스크 부족 오류가 발생했다. 실패한 자체 생성 파일을 삭제해 여유 공간을 복구했다. 무음 패딩 자체 길이, 샘플 수 절단, 타임스탬프 재설정, 출력 `-t`를 함께 적용했다. 원인의 정확한 ffmpeg 내부 조건은 확정하지 않았지만 이후 네 번의 전체 빌드에서 15초·약 4.1MiB 믹스가 생성됐다. 회귀 테스트도 15초·5MB 미만을 확인하며 OS 파일 크기와 실행 시간 상한을 둔다.
- Claude CLI 검토의 필수 loudnorm 필드 누락 지적을 반영해 숫자 필드 존재·빈 값·비유한 값을 검증한다. 회귀 테스트에서 각 누락을 검사했다. root가 재현한 비BMP 문자 앞의 단어 타이밍 인덱스 문제도 UTF-16 인덱스 매핑으로 수정했다. 기존 EP00의 영어 타이밍 값은 바뀌지 않는다.
- 현재 보장된 입력에서 재현되지 않는 CSV 파일 부재(추적 필수 파일), 임시 SVG 경로의 미래 변경 가정은 범위를 늘려 수정하지 않았다. 48kHz 전제는 음성 변환부에서 보장하며 믹서에 주석으로 명시했다.
- 최종 무료 크레딧 사용량은 51이며, 원문 복구에 추가 TTS 호출은 없었다. 생성 실패 시 유료 전환·자동 재시도는 하지 않는다.

## 남은 검수와 한계

1. 사용자 청취 결과는 수령했다. 인계 문서의 엄격한 수치 조건을 닫으려면 실제 발화 시작 프레임을 별도로 기록해야 한다. 현재 정성 승인을 ±2프레임 실측 통과로 바꾸지 않는다. 보정이 필요하다는 피드백은 없어 원문과 타이밍을 유지했다.
2. CLI 교차 검토 지적의 실제 결함을 반영하고 재검토를 받았다. CLI 재검토는 전달한 diff·테스트 텍스트만 검토했으며 직접 실행하지 않았다. 결과 원본은 `03_Pipeline/out/claude-cli-final-check.txt`에 보존했다.
3. 최종 음성·영상의 서로 다른 두 위치 백업은 미실행이다. 임의 외부 저장소에 업로드하지 않았다.

## Claude 교차 검토와 후속 조치

2026-10-23 인계 `2026-10-23_phase1_followup.md`에 기록된 Claude 검토 결과는 차단 결함 없음, 깨끗한 설치에서 테스트 14/14와 타입 검사 재현, 두 MP4 각각 450프레임·15.000초·-14.0 LUFS·피크 -1.5 dBFS였다. 이는 이전 구현에 대한 검토 이력이다. 이후 Claude가 이번 수정의 실행 검증을 샌드박스 밖 원장님 Mac의 macOS 셸에서 완료했다. 아래 최종 테스트·재빌드·PSNR·음량 수치는 Claude가 전달한 실행 결과이며, Codex가 이 샌드박스에서 재실행한 결과로 기록하지 않는다.

이번 작업은 지정 브랜치 `feat/phase1-pipeline`, 기존 HEAD `d0b9010`에서 수행했다. 착수 당시 추적 파일 변경은 없었고, Claude가 작성한 이번 인계 문서만 미추적 상태였다. Claude의 후속 지시에 따라 인계 문서도 내용 변경 없이 커밋 대상에 포함한다. 보호된 계획·지침·아카이브, 라이브러리 버전, 런타임 설정, 실제 음성 생성 코드는 바꾸지 않았다. 이번 보고서 정정 과정에서는 코드·테스트·대본·README를 더 수정하지 않았다.

### 변경 파일과 검증 결과

| 할 일 | 변경·결과 |
|---|---|
| 1. 장면 결과 데이터화 | `src/schema.ts`, `video/Episode.tsx`, `script.yaml`, `tests/schema.test.ts`, `README.md` 수정. 장면에 선택 필드 `resolutionLineId` 하나를 추가했고 EP00은 `L02`를 지정했다. 없는 ID·다른 장면의 대사 참조는 줄·필드 오류로 거부한다. ID 변경·잘못된 참조·필드 생략을 테스트했다. Claude의 두 화면비 비교에서 small 팝업 보정 외에 장면 데이터화로 생긴 화면 변화는 없었다. |
| 1. 종료 확인 프레임 | `scripts/build-episode.ts`의 12초 고정을 제거했다. 마지막 대사의 `startOffset + WAV 길이`와 에피소드 종료의 중간을 공통 함수로 프레임 변환하고 마지막 프레임 이내로 제한한다. Claude의 성공 빌드에서 **endCheckFrame=314**를 확인했다. |
| 2. 캐시 테스트 | `tests/voice.test.ts`: `generateTake` 적중 시 fetch **0회**, `.env` 없이 캐시 반환. 누락 시 모의 TTS POST **1회**, 무료 계정·성인 보이스 확인용 모의 GET **2회**. 후속 적중 시 추가 fetch **0회**. 실제 API 호출은 **0회**다. |
| 2. 립싱크 테스트 | `tests/audio.test.ts`: 모의 Rhubarb가 최종 `final.wav`, 대사 원문, 기본 입모양 설정을 받는지 검사한다. 앞 무음 **0.25초**, 대사 오프셋 **2초**일 때 단어·입모양 구간 모두 **2.35~2.55초**다. 이미 잘린 WAV의 입모양에서 무음을 이중으로 빼지 않는 것도 확인했다. |
| 3. 사전 캐시 검사·보존 | 실제 캐시 키와 최종 WAV SHA-256을 검사해 **2/2 적중**을 확인했다. 기존 두 MP4와 이전 `build-report.json`을 `out/EP00/prev/`에 복사했고 MP4 복사본 **2/2 SHA-256 일치**를 확인했다. 외부 백업은 아니다. |
| 3. 재빌드 | Claude가 샌드박스 밖 macOS 셸에서 지정 명령을 실행해 **exit 0·42.14초**로 완료했다. **L01·L02 cacheHit=true**, 실제 TTS 호출 **0회**다. |
| 3. 프레임 비교 | Claude가 `out/EP00/prev/`와 PSNR을 비교했다. 두 화면비 모두 **40dB 미만은 160–174·190–192프레임뿐**이며 small 팝업 등장·퇴장이 3프레임 앞당겨진 구간과 일치한다. 최저 PSNR은 **16:9 25.7dB / 9:16 26.3dB**다. 나머지는 **40dB 이상 또는 동일**이고, 초반 `0–121/127`은 비트 단위 동일하다. 이후 미세 차이는 같은 GOP(키프레임 **0·250**) 안의 인코더 잡음이며 장면 데이터화로 다른 화면 변화는 없었다. |
| 3. 최종 MP4 음량 | Claude의 재빌드 후 측정에서 두 영상 모두 **-14.01 LUFS / -1.49 dBTP**로 기준을 충족했다. |
| 5. 보고 | 이 절에 변경 파일·수치·실행 환경·남은 일을 정정했다. 수정 파일 **9개**와 새로 추적할 인계 문서 **1개**, 총 **10개**가 커밋 대상이다. `out/`는 Git 제외를 유지한다. |
| 6. 테스트·타입·커밋 | 테스트는 기존 **14개 → 18개**. Claude의 샌드박스 밖 실행에서 **npm test 18/18 통과**, **npm run typecheck 통과**로 필수 검증 조건을 충족했다. 이 결과를 반영해 `feat/phase1-pipeline`에 로컬 커밋했다. push·병합은 수행하지 않는다. |

최초 Codex 실행에서는 workspace-write 샌드박스가 `tsx` IPC 소켓의 `listen`을 `EPERM`으로 막았다. 당시 테스트 진단은 17통과·1환경 오류였고 빌드는 0.264초 만에 종료 코드 1로 중단됐다. Claude의 샌드박스 밖 실행으로 코드 결함이 아닌 환경 권한 문제임이 확인됐으며, 현재 테스트·재빌드 미완료 상태는 해소됐다. Codex가 샌드박스 권한이나 런타임 설정을 변경한 것은 아니다.

### 발화 시작 신호 측정과 보정

실제 채택된 최종 mono PCM WAV(48kHz, 16-bit)를 로컬에서 분석했다. 원래 글자 타임스탬프는 검색 범위를 정하는 데만 사용하고, 그 주변 **-120~+100ms** 신호에 2~10kHz, 4차 Butterworth 대역 필터를 위상 지연 없이 적용했다. **5ms RMS 창·1ms 간격**으로 계산하고, 검색 범위 RMS의 하위 10백분위 +12dB와 국소 최대 -35dB 중 높은 값을 문턱으로 정했다. 문턱 아래 10ms 뒤 문턱 위 5ms가 지속되는 첫 지점을 찾아 첫 창의 중심을 시작 후보로 삼았다. `big`의 /b/ 파열과 `small`의 /s/ 마찰음 상승을 탐지하는 방식이다. 문턱 상승량을 10·12·14dB로 바꿔도 두 후보는 같았다.

아래 차이는 **팝업 첫 프레임 - 자동 발화 시작의 연속 프레임 좌표**다. 양수면 팝업이 늦다. 프레임 번호는 기존 렌더와 같은 0 기준, 30fps다.

| 단어 | WAV 내 시작 후보 | 에피소드 시작 후보 | 연속 프레임 / 가장 가까운 프레임 | 기존 팝업 | 기존 차이 | YAML 보정·최종 팝업 | 보정 후 자동 측정값과 차이 |
|---|---:|---:|---:|---:|---:|---|---:|
| big | 0.7855초 | **2.7855초** | **83.565 / 84** | **83** | **-0.565프레임** | 보정 없음·83 | -0.565프레임 |
| small | 0.3475초 | **5.3475초** | **160.425 / 160** | **163** | **+2.575프레임** | `timingCorrections`에 **-0.0705초**·최종 **160** | **-0.425프레임** |

`small`만 2프레임을 넘어서 해당 단어 보정과 자동 측정·사람 검수 대기라는 영어 이유를 `script.yaml`에 남겼다. 텍스트·음성 설정·캐시 키·입모양 타이밍은 바뀌지 않는다. 이후 Claude의 재빌드에서 팝업 시점은 **big 2.778초 → 83프레임(변화 없음)**, **small 5.3475초 → 160프레임(기존 163)**으로 확인됐다. 보정된 팝업은 최종 영상에 반영됐으며 사람의 프레임 단위 확인은 아직이다. big의 팝업 타이밍 2.778초와 위 자동 발화 시작 후보 2.7855초는 서로 다른 측정값이다.

이는 자동 신호 후보 측정이며 사람의 프레임별 청취 확인을 대체하지 않는다. 5ms 창·필터·문턱 선택에 따른 수 ms의 경계 불확실성이 있고, 특히 연결 발화의 /t/ 방출과 /s/ 시작을 신호만으로 정확하게 구분한다고 보장할 수 없다. 짧은 프레임 오차는 측정법과 지각 경계에 따라 달라질 수 있다. 자동 추정에 따른 보정을 청취 승인으로 해석하지 않는다.

최초 Codex 실행의 근거 파일은 Git 제외 `03_Pipeline/out/EP00/qa/`에 있다: `followup-onsets.py`, `followup-onsets.json`, 단어별 `followup-*-energy.csv`, `followup-cache-preflight.json`, `followup-existing-media.json`, `followup-build-attempt.json`, `followup-build.log`. 마지막 두 파일은 최초 샌드박스 실패 이력이며 위 Claude 성공 결과를 나타내지 않는다. 최초 실행에서는 실제 API를 막는 일회성 fetch 가드를 빌드 프로세스에만 추가했고 차단 시도 기록도 없었다. 계정 키를 읽거나 출력하지 않았다. Claude의 최종 실행 수치는 Claude가 전달한 결과를 근거로 이 절에 기록했다.

기존 고정 버전과 같은 날 확인한 문서 근거를 재사용했다. 이번에 [Zod의 superRefine 공식 문서](https://zod.dev/api#superrefine), [Node 테스트 모킹 공식 문서](https://nodejs.org/api/test.html#mocking)를 추가 확인했다. 패키지·API 계약을 바꾸지 않았다. 두 화면비의 재빌드·PSNR 비교는 Claude가 완료했으며 사람의 전체 시청 여부와 구분한다.

### 남은 일

필수 테스트·타입 검사·캐시 2/2·TTS 무호출 재빌드·PSNR 비교·최종 음량 검증은 Claude의 외부 실행으로 완료됐다. 지정 브랜치에서 코드·테스트·대본·README·이 보고서·후속 인계 문서를 커밋 대상으로 삼고, 렌더·음성·캐시 등 Git 제외 파일은 포함하지 않는다.

발화 시작은 자동 신호 측정값이며 사람의 프레임 단위 타이밍 확인은 대기다. 세로 영상 전체 사람 시청, 음성·최종 렌더의 서로 다른 두 위치 백업, push·병합은 원장님 결정으로 남긴다.

2026-10-23 원장님 결정: EP00 음성·렌더는 공개 금지 테스트물이고 다시 생성할 수 있어 두 위치 백업을 생략한다. 계획 §7의 백업 규칙은 EP01 정식 자산부터 적용한다. 같은 날 `feat/phase1-pipeline`까지의 브랜치를 `main`에 fast-forward로 병합하고 origin에 push했다.
