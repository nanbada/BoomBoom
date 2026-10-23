# EP00 렌더 파이프라인

비공개 기술 테스트 전용이다. 임시 리그와 무료 플랜 음성은 공개 영상에 쓰지 않는다.

## 실행

프로젝트 루트 `.env`에 `ELEVENLABS_API_KEY`가 있어야 한다. `.env.example`에는 키 이름만 있다. Node.js, ffmpeg, Rhubarb가 필요하다.

```sh
cd 03_Pipeline
npm ci
npm test
npm run typecheck
npm run build:episode -- ../04_Episodes/EP00_pipeline_test
```

명령은 대본 검증 → 대사 추출 → 대사별 음성 캐시 → 무음 제거 → 단어 타이밍 → Rhubarb → Remotion 가로·세로 렌더 → 2-pass loudnorm → 최종 AAC 재측정을 수행한다. 결과는 `out/EP00/EP00_16x9.mp4`, `out/EP00/EP00_9x16.mp4`다. 이 폴더 전체는 Git에서 제외된다. 개별 실행 수치와 캐시 사용 여부는 `out/EP00/build-report.json`에 기록한다.

Rhubarb가 PATH에 없으면 `03_Pipeline/.tools/rhubarb/rhubarb`를 찾는다. 공식 배포처는 <https://github.com/DanielSWolf/rhubarb-lip-sync/releases/tag/v1.14.0>다. macOS ZIP을 풀 때 실행 파일과 함께 `res/`를 보존한다. 2026-10-23 사용자가 공식 ZIP의 프로젝트 내부 설치 예외를 승인해 이 위치에 설치했다. 보안 설정 우회나 유료 설치는 하지 않는다.

## 대본과 타이밍

`04_Episodes/EP00_pipeline_test/script.yaml`이 대사의 유일한 원본이다. `lines.json`은 생성물이다. 현 단계는 한 장면과 토비 한 명만 지원한다. 가로·세로 카메라 좌표를 별도로 지정한다. `toby`와 `balloon`은 왼쪽 위 좌표다. `caption.x`는 가로 중심, `caption.y`는 위쪽 좌표다.

장면의 `resolutionLineId`가 가리키는 대사가 끝나면 풍선이 작아지고 토비가 만족 표정으로 바뀐다. 같은 장면의 대사 ID만 허용하며, 필드를 생략하면 이 결과 동작을 하지 않는다. 종료 확인 PNG는 마지막 대사 종료와 에피소드 종료 사이의 중간 프레임에서 만든다. 해당 프레임은 `build-report.json`의 `endCheckFrame`에 남긴다.

`timing.json`은 `{lineId, word, start, end}` 배열이며, 초 단위의 에피소드 절대 시각을 담는다. 나중에 로컬 정렬기도 이 형식을 출력하면 된다. 글자 타임스탬프에서 앞 무음 제거 길이를 빼고 대사 오프셋을 더한다. Rhubarb에도 같은 최종 WAV와 같은 오프셋을 쓴다. 프레임은 `secondsToFrames()` 한 함수에서 반올림한다.

목표 단어가 2프레임보다 어긋나면 해당 대사의 `timingCorrections`에 단어, 초 보정값, 이유를 기록한다.

```yaml
timingCorrections:
  - word: big
    offsetSeconds: 0.033333
    reason: "Listening review: move popup one frame later"
```

이 보정은 팝업만 옮기며 음성·립싱크는 바꾸지 않는다. 동일 단어가 여러 번 나오면 모호한 보정을 거부한다. 실제 발화와 팝업은 최종 파일을 듣고 확인해야 하며, API 타임스탬프 일치만으로 청취 검증 통과라고 기록하지 않는다.

## 음성·캐시

기본 제공 성인 Roger 보이스를 사용한다. 보이스 ID와 모델·출력 형식의 원본은 `voice-config.json` 하나다. 무료 계정과 잔여 크레딧을 매 생성 전 확인하고, 무료 사용이 불가능하면 실패한다. 유료 엔진·플랜으로 자동 전환하거나 실패 요청을 자동 재시도하지 않는다.

대사 텍스트, 보이스, 모델, 음성 설정의 해시로 대사별 캐시를 만든다. 오프셋·팝업 보정만 바꾸면 음성을 다시 만들지 않는다. TTS 응답을 먼저 저장하므로 후처리가 실패해도 같은 음성을 다시 구매하지 않는다. WAV는 `audio/<대사ID>/<해시>/final.wav`에 저장하고 파일 해시로 무결성을 확인한다. API의 무료 MP3를 로컬에서 WAV로 변환하므로 유료 44.1kHz WAV 출력 옵션은 요청하지 않는다. MP3 원본·응답·WAV는 전부 `audio/` 아래 Git 제외 대상이다.

최종 음성·영상은 서로 다른 두 위치에 별도로 백업해야 한다. 이 명령은 원격 백업이나 업로드를 수행하지 않는다.

## 검증

`npm test`는 오프라인 스키마·타이밍·캐시 키·무료 크레딧 보호 테스트다. `npm run typecheck`는 코드 계약을 검사한다. 실제 빌드는 두 화면비의 최종 인코딩 결과가 -14 LUFS(±1), 트루 피크 -1 dBTP 이하인지 측정하고 기준을 벗어나면 실패한다. AAC 변환 오버슈트를 고려해 loudnorm 내부 ceiling은 -1.5 dBTP로 둔다.

대본 L02 수정 재빌드 시험 후에는 원래 문장 `Make it small!`로 복구하고 최종 영상도 다시 생성한다. 계정 키·음성·MP4가 Git 대상에 들어가지 않았는지 별도로 확인한다.
