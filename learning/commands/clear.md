---
description: 세션 종료 — 컨텍스트 저장 + 패턴 승격
allowed-tools: Read, Glob, Grep, Task, Write, Bash
---

## 세션 종료 프로세스

### 1. 세션 변경 사항 파악

```bash
git diff --name-only HEAD~5  # 최근 변경된 파일
git diff --stat              # 변경 규모
```

### 2. CLAUDE.md 업데이트 제안

세션에서 발견된 패턴/규칙 중 CLAUDE.md에 반영할 것이 있으면 제안.
**유저 승인 후에만 반영.**

### 3. 컨텍스트 파일 갱신

`.ai/context/latest.md`에 다음 세션을 위한 요약 저장:

```markdown
# 최근 작업 컨텍스트

## 마지막 작업
- 날짜: YYYY-MM-DD
- 주요 변경: [변경 요약]
- 작업 중인 기능: [진행 중 항목]

## 다음 세션 TODO
- [ ] 이어서 할 작업들

## 주의사항
- 알려진 이슈나 주의점
```

### 4. 패턴 승격 제안

3회 이상 반복된 패턴 식별 → `.ai/patterns/` 승격 여부 확인.

---

## 출력 형식

```markdown
# 세션 완료

## 작업 요약
- 변경된 파일 N개
- 주요 작업: ...

## 저장됨
- `.ai/context/latest.md`

## CLAUDE.md 업데이트 제안
- [있으면 제안, 없으면 "없음"]

## 패턴 승격 제안
- [ ] `패턴명` → `.ai/patterns/패턴명.md`
```
