# ai-ax

Claude Code 플러그인 모음. FE 개발 워크플로우 자동화 + 세션 관리.

## 플러그인

| 플러그인 | 버전 | 역할 |
|----------|------|------|
| [fe-workflow](./fe-workflow/) | v0.4.0 | FE 컨벤션 기반 설계 → 리뷰 → PR |
| [session-manager](./session-manager/) | v0.1.0 | 세션 로깅, 습관 분석, 상태 저장 |

## 설치

```bash
# 개발 중 (두 플러그인 동시 로드)
claude --plugin-dir ./fe-workflow --plugin-dir ./session-manager

# 마켓플레이스 등록 후
/plugin marketplace add /path/to/ai-ax
/plugin install fe-workflow@claude-plugins
/plugin install session-manager@claude-plugins
```

## 워크플로우

```
세션 시작 (자동: STATUS.md 로드 + 세션 ID 생성)  ← session-manager
    ↓
/architecture 기능명                              ← fe-workflow
    ↓
대화로 구현                                       ← 기본
    ↓
/review                                          ← fe-workflow
    ↓
/pr                                              ← fe-workflow
    ↓
/organization                                    ← session-manager (세션 종료)
```

- `/habit`은 아무 때나 실행 가능 (습관 대시보드)
- fe-workflow는 **개발 중**, session-manager는 **세션 시작/종료 시** 동작

## 커맨드 요약

### fe-workflow

| 커맨드 | 역할 |
|--------|------|
| `/architecture` | 컨벤션 기반 설계 → 구현 지시서 생성 |
| `/review` | 컨벤션 기반 코드 리뷰 → 점수/피드백 |
| `/pr` | 변경사항 분석 → PR 생성 |

### session-manager

| 커맨드 | 역할 |
|--------|------|
| `/organization` | 세션 종료 — 상태 저장 + 로그 + 습관 점수 |
| `/habit` | 습관 대시보드 — 점수 추이, 개선 포인트 |
