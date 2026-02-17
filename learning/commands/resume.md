---
description: 이전 세션 컨텍스트 복원 (/clear 후 이어서 작업할 때)
allowed-tools: Read, Glob, Bash
---

## 컨텍스트 복원

`.ai/context/latest.md` 파일을 읽어서 이전 작업 내용과 TODO를 파악한다.

### 출력

```markdown
# 컨텍스트 복원됨

## 이전 작업
[context/latest.md 요약]

## 다음 할 일
[TODO 항목]
```

복원 후 유저에게 "이어서 뭘 할까?" 한 줄만 물어본다.
