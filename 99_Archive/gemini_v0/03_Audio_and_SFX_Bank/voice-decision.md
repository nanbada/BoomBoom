# BoomBoom English — 캐릭터 보이스(TTS) 결정 기록

작성일: 2026-10-21 · 상태: **파일럿 대기** (엔진 최종 확정은 비교 테스트 후)

## 현재 결정

주인공 2명 기준으로 정리했다. 대사별 생성 구조를 쓰므로 4명으로 늘려도 파이프라인은 그대로 쓴다.

| 역할 | 엔진 | 비고 |
|---|---|---|
| 우선 구현 후보 | Gemini 3.8 Flash TTS (`gemini-3.8-flash-tts`) | Voice Design으로 캐릭터 voice ID 생성 |
| 품질 비교 후보 | Fish Drama 3 (`model: drama-3` 헤더) | 연기 품질이 확실히 앞서면 메인으로 교체 |
| 로컬 대안 | Qwen3-TTS (VoiceDesign → Base 클론) | Mac 로컬, 서비스 이전 대비용 |

파일럿에서 두 엔진의 차이가 작으면 Gemini를 메인으로 확정한다. 커스텀 보이스 설계부터 대사별 생성, 립싱크까지 이어지는 구조가 가장 단순하다. Fish가 감정 연기나 음색에서 분명히 앞서면 Fish를 고른다. 두 엔진 모두 월 TTS 비용이 몇 달러 수준이라 비용은 선정 기준에서 뺀다.

### 제외한 선택지

- **ElevenLabs**: 아동 음성이나 아이처럼 들리는 성인 음성을 Voice Library에 올릴 수 없다. 18세 미만 대상 서비스에는 사전 승인이 필요하다는 정책도 있다.
- **Dia2**: CUDA 전용이고 화자가 2명으로 제한된다. 생성할 때마다 음색이 달라진다.
- **RVC(Applio), IndexTTS-2.5, Chatterbox**: 초기에는 넣지 않는다. 특정 문제가 생기면 그때 검토한다.

## 제작 파이프라인

```
Voice Design (캐릭터 A·B 확정: voice_id + 기준 WAV)
  → DialogueSpec JSON (대사ID · 캐릭터ID · 텍스트 · 감정 · 장면ID)
  → TTS 어댑터 (Gemini / Fish) — 발화 턴 단위로 단일 화자 생성
  → WAV 저장 + Audio QA (발음 · 음색 일관성 · 감정 · 채택 테이크 보존)
  → Rhubarb Lip Sync (캐릭터별 WAV → 입모양 타임스탬프, 대사 텍스트 함께 제공)
  → FFmpeg 배치·믹싱
  → 2D 렌더 (입모양 · 표정 · 컷 길이 · 자막)
```

대사별 생성은 기술적 필수 조건은 아니다. 수정과 립싱크 자동화가 쉬워서 택했다. 한 줄에 발음 오류가 생기면 그 파일만 다시 만들면 된다. 운영 규칙은 아래와 같다.

- 생성 단위는 한 번의 자연스러운 발화 턴이다. 단어 단위로 쪼개지 않는다.
- 대사 사이 간격은 편집 단계에서 장면과 반응에 맞춰 다르게 준다. 일정한 간격은 기계적으로 들린다.
- 겹치는 발화(Gemini `|reaction|`)는 쓰지 않는다. 맞장구와 웃음도 별도 대사로 생성한다.
- 음성을 먼저 확정하고 그 길이에 맞춰 애니메이션을 만든다. 발화 길이를 강제하는 TTS는 도입하지 않는다.
- TTS 추상화 프레임워크는 만들지 않는다. DialogueSpec을 공통 입력으로 두고 엔진별 어댑터 2개만 둔다.

## 캐스팅 원칙

- 완전한 아동 음색 대신 **어려 보이는 성인 목소리**로 설계한다. 합성 품질이 안정적이고 발음이 더 또렷하다.
- 악센트는 두 캐릭터 모두 표준 미국식 영어로 통일한다.
- 캐릭터는 피치를 올려서 구분하지 않는다. 음색, 속도, 에너지 차이로 구분한다.
- 성격 대비를 확실히 둔다. 예: 호기심 많고 적극적인 친구 / 차분하지만 엉뚱한 친구.
- Voice Design 프롬프트에는 고정 특성(나이대, 음색, 억양, 기본 말투)만 1~2문장으로 쓴다.
- 대사별 `style`에는 감정 변화만 짧게 쓴다. 긴 Audio Profile 문단은 음색이 흔들리는 주된 원인이다.

## 보이스 자산 관리

```
voices/
├── character_A/
│   ├── voice.json            # voice_id, engine, model, 생성일, 마지막 사용일, expire_time
│   ├── design_prompt.txt
│   ├── master_reference.wav  # Gemini sample_audio 등
│   └── sample_dialogues.wav
└── character_B/ (동일)
```

**Gemini 저장 보이스 조건**
- 프로젝트당 최대 200개를 저장할 수 있다.
- 마지막 사용 후 1년간 쓰지 않으면 삭제된다. 합성하거나 기본 보이스로 재사용할 때마다 기간이 갱신된다.
- 모델 자체는 내보낼 수 없다. `GetVoice`로 `expire_time`을 주기적으로 확인한다.

**기준 WAV의 한계**
- 기준 WAV는 음색 비교와 재현 시험용 자료일 뿐 백업 모델이 아니다.
- Gemini Voice Replication은 실제 사람의 동의 녹음이 필요해서, 합성 WAV를 다시 등록하는 용도로는 쓸 수 없다.
- Qwen3나 Fish에서 같은 음색이 나오는지는 직접 시험해야 한다.

캐릭터 음성을 확정한 뒤에는 엔진을 임의로 바꾸지 않는다.

## 엔진별 확인된 사실

**Gemini 3.8 Flash TTS**
- 멀티스피커 단일 요청은 프리셋 보이스 2명까지만 된다. 커스텀 `voice_...` 보이스는 턴별로 따로 생성해야 한다.
- 단일 요청 출력은 24kHz mono WAV다.

**Fish Drama 3**
- 아직 프리뷰다. 엔드포인트는 `POST /v1/tts`, 헤더는 `model: drama-3`이다.
- 보이스는 `POST /model`로 등록하고 `reference_id`로 사용한다.
- 테이크마다 결과가 다르다. 여러 번 렌더링해서 고른다.
- 단어 단위 인페인팅과 인터랙티브 편집은 초대 기반 테스트 중이다. 일반 API에서는 쓸 수 없으므로 비교 장점으로 계산하지 않는다.
- API 가격: 11/12까지 100만 자당 $10, 이후 정가 $50.
- 오픈 웨이트는 연 매출 50만 달러 미만일 때만 무료로 상업 이용할 수 있고, 48GB 이상 NVIDIA GPU가 필요하다. Mac 로컬로는 실행할 수 없다.

**Qwen3-TTS**
- 공식 권장 방식: VoiceDesign으로 기준 클립을 만들고, 이후 모든 대사를 Base 모델 클론으로 생성한다.

## 파일럿 계획 (11/12 Fish 할인 종료 전 실행)

동일한 60~90초 대본으로 비교한다. 대본에는 일반 대화, 빠른 주고받기, 감정 변화, 영어 학습용 발음 장면을 넣는다. 1화와 5화에 해당하는 가상 대본을 같은 voice ID로 생성해 장기 일관성도 본다. Fish에서는 2인 통합 생성과 대사별 생성을 함께 들어보고, 통합 생성의 연기 품질이 실제로 나은지 확인한다.

| 평가 기준 | 비중 |
|---|---|
| 캐릭터 음색의 고유성·일관성 | 30% |
| 영어 발음의 명료성·정확성 | 25% |
| 감정 연기의 자연스러움 | 20% |
| 대화 흐름의 자연스러움 | 15% |
| 재생성·편집 편의성 | 10% |

초기 품질 목표(업계 기준이 아닌 프로젝트 자체 목표):
- 핵심 단어 누락 0건, 화자 혼동 0건
- 독립 청취자의 캐릭터 식별 정확도 90% 이상
- 파닉스 핵심 단어는 ASR의 WER와 별도로 직접 듣고 검수한다.

## 미확인 사항

- Gemini Voice Design이 아이 같은 음색 설명을 받아들이는지
- Gemini와 Fish의 이용 조건에서 아동 대상 콘텐츠 제작에 제한이 있는지 (약관 원문 미확인)
- 합성 WAV를 Fish `POST /model`에 등록할 수 있는지 (동의 절차 적용 여부)
- Gemini 기준 WAV로 Qwen3 클론 시 음색 재현도

## YouTube 정책 메모

AI 음성 사용 자체는 수익화를 막지 않는다. 문제가 되는 것은 inauthentic content 정책이다. 템플릿화된 줄거리, 같은 상황에 반복해서 놓이는 캐릭터, 대량 생산 인상을 주는 콘텐츠는 수익화에서 제외된다. Made-for-Kids 채널은 심사가 더 엄격하다. 에피소드마다 학습 목표와 이야기를 확실히 다르게 설계한다.

## 출처

- Gemini TTS: https://ai.google.dev/gemini-api/docs/generate-content/speech-generation
- Gemini Voice Design: https://ai.google.dev/gemini-api/docs/generate-content/voice-design
- Fish Drama 3 발표: https://fish.audio/blog/fish-audio-drama-3/
- Fish API: https://docs.fish.audio
- ElevenLabs 아동 음성 정책: https://elevenlabs.io/docs/help-center/product/voices/voice-library/can-childrens-or-child-like-voices-be-added-to-the-voice-library
- Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Rhubarb Lip Sync: https://github.com/DanielSWolf/rhubarb-lip-sync
