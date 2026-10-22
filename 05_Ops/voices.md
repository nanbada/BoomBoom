# 보이스 기록

보이스 정보의 원본은 이 파일 하나다(`00_Plan/03_Voice_Decision.md` '보이스 자산 관리'). 설계한 보이스는 공개·공유하지 않는다.

| 캐릭터 | 엔진 | 모델 | voice ID | 설계 프롬프트 | 생성일 | 마지막 사용일 | 상업 이용 근거(URL·확인일) | 용도 |
|---|---|---|---|---|---|---|---|---|

## EP00 비공개 테스트

2026-10-23 사용자에게 위임받은 Astra 판단으로 EP00에만 인계 문서의 무료 음성 예외를 적용한다. 정식 캐릭터 캐스팅이 아니며 **테스트 전용, 공개 영상 사용 금지**다.

기본 제공 성인 남성 Roger(미국식, 서비스 라벨 `middle_aged`, `premade`)를 사용한다. Voice Design·복제·아이 음색 설계는 하지 않는다. ID·모델·출력 형식의 단일 원본은 `03_Pipeline/voice-config.json`이다. 모델은 Eleven Multilingual v2, 플랜은 Free다. 감정은 대사별 style 설정에 반영하며 실제 연기 품질은 청취 검수 대상이다.

생성 직전 조회: 무료 플랜, 사용 0 / 한도 10,000크레딧, 추가 사용량 과금 불가. 공식 확인일은 2026-10-23이다. 무료 플랜의 상업 라이선스가 없음을 [공식 안내](https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform)에서 확인했다. [요금](https://elevenlabs.io/pricing), [API 요금](https://elevenlabs.io/pricing/api), [타임스탬프 API](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps)를 확인했다.

생성일·마지막 생성 요청과 채택 테이크는 에피소드의 생성물 `takes.json` 및 `audio/<대사ID>/<해시>/take.json`, 권리 기록은 `assets_log.csv`에 남긴다. 음성 파일은 Git에서 제외한다.
