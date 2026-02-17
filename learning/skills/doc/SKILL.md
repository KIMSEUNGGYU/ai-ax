---
name: doc
description: >-
  This skill should be used when the user asks to "정리해줘", "기록해둬", "문서로 남겨", "백업해둬",
  "이거 저장", "메모해둬", "노트 남겨", "save this", "document this", "write it down",
  or wants to save knowledge, decisions, troubleshooting results, or guidelines from the current session.
  Also trigger when user says "나중에 볼 수 있게", "까먹기 전에", "다음에 참고하게".
---

# 문서 정리 스킬

대화 중 유저가 내용 정리/저장을 요청하면 자동으로 `/learning:doc` 커맨드와 동일한 프로세스를 실행한다.

## 트리거 패턴

자연어에서 다음 의도를 감지:

| 패턴 | 예시 |
|------|------|
| 정리 요청 | "이거 정리해줘", "방금 내용 정리" |
| 저장 요청 | "기록해둬", "메모해둬", "저장해줘" |
| 백업 의도 | "나중에 참고하게 남겨둬", "까먹기 전에 적어둬" |
| 문서화 요청 | "문서로 만들어줘", "노트 남겨" |

## 실행 프로세스

`/learning:doc` 커맨드의 전체 프로세스를 따른다:

1. **주제 파악** — 대화 맥락에서 주제 추출
2. **자동 분류** — troubleshooting / guideline / tech-memo / decision / comparison / til
3. **템플릿 적용** — 유형별 구조화된 마크다운
4. **저장 위치 선택** — AskUserQuestion으로 프로젝트(.ai/notes/) vs Obsidian(~/obsidian-note/) 선택
5. **파일 저장** — 선택한 위치에 `YYYY-MM-DD-주제.md`
6. **태그 삽입** — 유형 태그 + 주제 태그
7. **결과 출력** — 파일 경로, 위치, 유형, 태그, 요약
