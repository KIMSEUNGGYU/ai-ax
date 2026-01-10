
...

```
## AI 컨텍스트 (.ai/)
.ai/
├── context/    # 프로젝트 배경
├── patterns/   # 구현 패턴
├── prompts/    # 프롬프트 템플릿
├── sessions/   # 작업 기록
└── specs/      # [옵션] 스펙 문서
```

### 사용 시점
- 프로젝트 파악 → `.ai/context/` 참조
- 구현 중 → `.ai/patterns/` 참조
- 반복 요청 → `.ai/prompts/` 참조
- `/recap`, `/organization` → `.ai/sessions/`에 저장

### 스펙주도개발 시 (옵션)
- 구현 전 → `.ai/specs/` 확인
- 스펙 없으면 작성 요청
