# Plugin Design Study

멀티 에이전트 오케스트레이션 시스템 구축을 위한 학습 기록.

## 학습 로드맵

```
Phase 1: 학습 ─────────────────────────────────────────
  Level 1. 전체 그림         — 멀티 에이전트 오케스트레이션이란?
  Level 2. 플러그인 컴포넌트  — 각 부품(Skill/Command/Agent/Hook)의 역할과 동작
  Level 3. OMC 코드 분석     — 실제 구현 패턴 리딩
  Level 4. 미니 플러그인      — 직접 만들며 감각 체득

Phase 2: 나만의 시스템 구축 (방향은 Phase 1 완료 후 재정의) ──
  Level 5. fe-workflow 플러그인 — ishopcare FE 전용 워크플로우 구현
           ← 학습한 OMC 패턴 + .gyu/plugin-design/의 컨벤션 합류

Phase 3: 범용화 (후순위, 방향 미정) ────────────────────────
  Level 6. 범용 에이전트      — 다른 개발자를 위한 OMC 스타일 플러그인
```

### Phase 2에서 두 트랙 합류

```
.gyu/plugin-design/          .gyu/plugin-design-study/
  ├ conventions/                ├ Level 1~3 (개념/분석)
  │  ├ api-type-layer.md        ├ Level 4 (미니 실습)
  │  ├ component-design.md      │
  │  ├ page-structure.md        │
  │  └ folder-structure.md      │
  └ plugin-design.md            │
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
            Level 5: fe-workflow
            (컨벤션 + OMC 패턴 → 나만의 플러그인)
```

### OMC vs 나만의 시스템 차이

| | OMC (범용) | fe-workflow (Level 5) |
|---|---|---|
| **대상** | 모든 언어/프레임워크 | React/Next.js/TypeScript |
| **컨벤션** | 없음 | api-type-layer, component-design 등 |
| **워크플로우** | autopilot/swarm/pipeline 등 | /architecture → 구현 → /review → /recap |
| **에이전트** | 35개 범용 | 5~8개 FE 전문 |
| **강점** | 뭐든 할 수 있는 만능 | 우리 프로젝트를 정확히 아는 전문가 |

## 학습 방식
- 개념 설명 + OMC 코드 리딩 + 미니 실습 병행
- 각 Level 완료 시 문서에 기록

## 파일 구조

| 파일 | 내용 |
|------|------|
| `README.md` | 학습 로드맵 및 진행 상태 (이 파일) |
| `plugin-design-study.md` | OMC 구조 분석 (완료) |
| `level-1-big-picture.md` | Level 1: 전체 그림 |
| `level-2-components.md` | Level 2: 플러그인 컴포넌트 상세 |
| `level-3-omc-analysis.md` | Level 3: OMC 코드 심층 분석 |
| `level-4-mini-plugin.md` | Level 4: 미니 플러그인 실습 기록 |
| `level-5-fe-workflow.md` | Level 5: fe-workflow 플러그인 설계/구현 |
| `level-6-generic-agent.md` | Level 6: 범용 에이전트 (후순위) |

## 진행 상태

### Phase 1: 학습
- [x] OMC 구조 분석 (`plugin-design-study.md`)
- [x] Level 1: 전체 그림
- [x] Level 2: 플러그인 컴포넌트 상세
- [~] Level 3: OMC 코드 심층 분석 (이해중)
- [ ] Level 4: 미니 플러그인 실습

### Phase 2: 나만의 시스템 구축
- [ ] Level 5: fe-workflow 플러그인 (컨벤션 + OMC 패턴)

### Phase 3: 범용화 (후순위)
- [ ] Level 6: 범용 에이전트


---

## ECC vs OMC 분석 (블로그 참고)

> 출처: https://roboco.io/posts/everything-claude-code-vs-oh-my-claude-code/

### 두 접근법 요약

| | ECC (Everything Claude Code) | OMC (Oh My Claude Code) |
|---|---|---|
| **철학** | 개발자 주도, 설정 지향 | 시스템 주도, 자동 오케스트레이션 |
| **핵심** | MD 규칙 + 구성형 툴킷 | TypeScript 코드 + 5가지 실행 모드 |
| **강점** | 장기 일관성, 품질, 팀 표준 교육 | 병렬 가속, 낮은 진입 장벽 |
| **약점** | 학습 곡선, 순차 처리 | 디버깅 어려움, 비용 증가, Rate limit |
| **적합** | 규칙 기반 팀, 장기 프로젝트 | 빠른 프로토타입, 병렬 작업 |

### 결론: fe-workflow = ECC 철학 + OMC 구조 패턴

**철학은 ECC**, 구현 참고는 OMC.

| 우리 설정 | 매칭 |
|---|---|
| MD 기반 규칙/컨벤션 (CLAUDE.md, SKILL.md, conventions/) | ECC |
| 명시적 워크플로우 (`/architecture → 구현 → /review → /recap`) | ECC |
| 품질 우선 (리뷰 체크리스트, 컨벤션 강제) | ECC |
| FE 전문 5~8개 에이전트 | ECC |
| 장기 프로젝트 관리 (.gyu/ 문서화) | ECC |
| Skill/Command/Agent/Hook 4컴포넌트 구조 | OMC (구조만 차용) |
| disallowedTools 역할 제한 | OMC (패턴만 차용) |

### OMC에서 차용할 것 / 안 할 것

**차용:**
- 4컴포넌트 구조 (Skill/Command/Agent/Hook)
- disallowedTools 역할 제한
- SKILL.md 단일 파일 패턴 (frontmatter + markdown)
- 검증 프로토콜

**불필요:**
- 40개+ 범용 스킬 → 5~8개 FE 전문으로 충분
- keyword-detector 자연어 매직 → 명시적 `/command`로 충분
- 3-티어 모델 라우팅 → 비용 최적화보다 컨벤션 품질 우선
- .omc/state/ 복잡한 상태 관리 → 단순 워크플로우에 과도
- MCP 브릿지 → 불필요
- persistent-mode → 후순위 (필요 시 추가)


## 사용자 커스텀 
> 내가 AI 에게 내 상황을 설명하기 위한 항목 
- 정리 폴더는 너가 정리해준 내용들을 내가 이해한 내용들로 정리한 내용이야 
- 현재 Level1 과 level2 내용 참고해서 하나만 정리 