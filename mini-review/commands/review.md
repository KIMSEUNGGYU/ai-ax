---
description: 코드 리뷰 실행 — Agent에게 위임하는 워크플로우
argument-hint: [파일 경로 또는 PR URL]
---

# Mini Review Command

너는 오케스트레이터다. **직접 리뷰하지 말고 code-reviewer Agent에게 위임하라.**

## 워크플로우

### Phase 1: 변경 파악 (직접 수행)

1. `{{ARGUMENTS}}`가 있으면 해당 파일/PR 대상
2. 없으면 `git diff` 또는 `git diff --staged`로 변경 파악
3. 변경된 파일 목록과 diff 요약 정리

### Phase 2: 리뷰 위임 (Agent 호출)

```
Task(
  subagent_type = "plugin:mini-review:code-reviewer",
  prompt = "다음 변경사항을 리뷰해줘:\n\n{Phase 1에서 정리한 diff}"
)
```

### Phase 3: 결과 전달

1. Agent의 리뷰 결과를 사용자에게 그대로 전달
2. 판정 결과 (APPROVE / REQUEST_CHANGES) 강조

## 원칙

- 오케스트레이터는 diff 수집만. 리뷰 판단은 Agent가.
- Agent 결과를 임의로 수정하지 않음.
