# ai-ax

Claude Code 플러그인 모음. FE 개발 워크플로우 자동화 + 세션 관리.

## 플러그인

| 플러그인 | 역할 |
|----------|------|
| [fe-workflow](./fe-workflow/) | FE 컨벤션 기반 설계 → 리뷰 |
| [session-manager](./session-manager/) | 세션 context 관리 — 맥락 유지 + 지식 영속 저장 |

## 설치

```bash
# 개발 중 (플러그인 동시 로드)
claude --plugin-dir ./fe-workflow --plugin-dir ./session-manager

# 마켓플레이스 등록 후
/plugin marketplace add /path/to/ai-ax
/plugin install fe-workflow@claude-plugins
/plugin install session-manager@claude-plugins
```

## 실사용 워크플로우

| 상황 | 흐름 |
|------|------|
| **단순 수정** (버그, 작은 변경) | 바로 구현 → 끝 |
| **새 기능 / 구조 고민** | `/architecture` → 구현 → `/review` (PR 전) |
| **복잡한 작업** (멀티 세션) | `/save`로 current.md 생성 → 위 흐름 반복 + 세션 이어가기 |

### 상세 흐름 (새 기능 / 복잡한 작업)

```
세션 시작 (자동: current.md 로드)        ← session-manager
    ↓
/architecture 기능명                     ← 설계 방향성/구조 결정이 필요할 때
    ↓
대화로 구현
    ↓
/review                                  ← PR 올리기 전
    ↓
/note                                    ← 기억할 내용 있으면 (아무 때나)
    ↓
/save                                    ← 다음 세션에 이어갈 작업이면
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

