# ai-ax

Claude Code 플러그인 모음. FE 개발 워크플로우 자동화 + 세션 관리.

## 플러그인

| 플러그인 | 버전 | 역할 |
|----------|------|------|
| [fe-workflow](./fe-workflow/) | v0.4.0 | FE 컨벤션 기반 설계 → 리뷰 |
| [session-manager](./session-manager/) | v0.2.0 | 세션 context 관리 — 맥락 유지 + 지식 영속 저장 |

## 설치

```bash
# 개발 중 (플러그인 동시 로드)
claude --plugin-dir ./fe-workflow --plugin-dir ./session-manager

# 마켓플레이스 등록 후
/plugin marketplace add /path/to/ai-ax
/plugin install fe-workflow@claude-plugins
/plugin install session-manager@claude-plugins
```

## 워크플로우

```
세션 시작 (자동: current.md 로드)                    ← session-manager
    ↓
/architecture 기능명                              ← fe-workflow
    ↓
대화로 구현                                       ← 기본
    ↓
/review                                          ← fe-workflow
    ↓
/note 주제명                                     ← session-manager (개발 중 아무 때나)
    ↓
/save                                            ← session-manager (상태 저장)
```

## 커맨드 요약

### fe-workflow

| 커맨드 | 역할 |
|--------|------|
| `/architecture` | 컨벤션 기반 설계 → 구현 지시서 생성 |
| `/review` | 컨벤션 기반 코드 리뷰 → 점수/피드백 |

### session-manager

| 커맨드 | 역할 |
|--------|------|
| `/save` | 세션 context를 `.ai/current.md`에 저장 |
| `/resume` | `.ai/current.md` 수동 복원 |
| `/note` | 세션 지식 영속 저장 (notes/patterns/obsidian) |

