---
description: 이전 작업 컨텍스트 복원 — .ai/current.md 수동 로드
allowed-tools: Read
---

SessionStart hook이 작동하지 않았을 때 수동으로 작업 컨텍스트를 복원한다.

## 동작

1. `.ai/current.md` 읽기
2. 없으면 → "활성 작업 없음. /save로 작업 컨텍스트를 저장하세요." 출력
3. 있으면 → 내용 전체 출력 + "이어서 뭘 할까요?" 질문
