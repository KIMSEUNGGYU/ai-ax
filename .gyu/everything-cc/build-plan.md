# 자체 구축 계획

> 현재 `~/.claude/CLAUDE.md`에 프론트엔드 원칙이 있음. 이를 기반으로 확장.

## 현재 상태

- `~/.claude/CLAUDE.md`: 글로벌 지시사항 (언어, 스타일, FE 원칙, 네이밍 등)
- `.claude/rules/`: 미사용
- `.claude/commands/`: 기존 스킬로 일부 구현 (review, recap, architecture 등)
- `.claude/hooks/`: 미확인

## 구축 우선순위

### Phase 1: Rules 분리 (CLAUDE.md → rules/)

현재 CLAUDE.md에 있는 내용을 주제별 rules 파일로 분리.

```
~/.claude/rules/
├── code-style.md        # 코딩 원칙 ([GOAL], [SSOT], [SRP] 등)
├── naming.md            # 네이밍 컨벤션
├── typescript.md        # TS 규칙 (any 금지, 판별 유니온 등)
├── react.md             # React 규칙 (useEffect 기명함수, mutateAsync 등)
└── response-style.md    # 응답 스타일 (한국어, 핵심만 등)
```

**장점**: path 스코핑 가능, 주제별 on/off 가능

### Phase 2: Commands 정비

기존 스킬을 점검하고 필요한 명령어 추가.

```
현재 있는 것: /review, /recap, /architecture, /organization
추가 검토: /plan, /tdd, /build-fix
```

### Phase 3: Agents 정의

반복적으로 위임하는 작업을 에이전트로 정의.

```
검토 대상:
- code-reviewer (FE 특화)
- planner (기능 계획)
- refactor-cleaner (정리)
```

### Phase 4: Hooks 설정

자동화할 이벤트 정의.

```
검토 대상:
- PostToolUse: TS/TSX 파일 저장 시 타입 체크
- PostToolUse: console.log 경고
- PreToolUse: git push 전 확인
```

### Phase 5: Skills 축적

프로젝트 경험에서 도메인 지식 축적.

```
검토 대상:
- frontend-patterns (React/Next.js)
- coding-standards (TS)
```

## 참고

- ECC를 그대로 복사하는 게 아니라, **내 워크플로우에 맞게** 구축
- 이미 CLAUDE.md에 잘 정리된 원칙이 있으므로 이를 활용
- 단계적으로 하나씩 추가하며 실제 효과를 확인
