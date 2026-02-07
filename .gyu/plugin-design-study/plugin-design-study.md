# Plugin Design Study

## 참고 레포: oh-my-claudecode

> https://github.com/Yeachan-Heo/oh-my-claudecode (4.7k stars)
> Claude Code용 멀티에이전트 오케스트레이션 플러그인

---

## 핵심 구조

```
oh-my-claudecode/
├── .claude-plugin/
│   └── plugin.json          # 매니페스트 (name, version, skills 경로)
├── skills/<name>/SKILL.md   # 스킬 정의 (40개+)
├── commands/<name>.md       # 커맨드 정의 (32개)
├── agents/<name>.md         # 에이전트 정의 (34개)
├── hooks/hooks.json         # 라이프사이클 훅
├── scripts/*.mjs            # 훅 실행 스크립트
├── bridge/*.cjs             # MCP 서버 브릿지
└── .mcp.json                # MCP 서버 설정
```

## 컴포넌트별 정의 패턴

### plugin.json (매니페스트)
```json
{
  "name": "oh-my-claudecode",
  "version": "4.0.2",
  "description": "Multi-agent orchestration system for Claude Code",
  "skills": "./skills/",
  "mcpServers": "./.mcp.json"
}
```

### Skill — `skills/<name>/SKILL.md`
```yaml
---
name: plan
description: Strategic planning with optional interview workflow
---
# 마크다운 본문 = Claude에게 주어지는 시스템 프롬프트
```
- 디렉토리명 = 스킬 이름 (kebab-case)
- frontmatter: `name`, `description`
- 본문: 역할 선언 + 워크플로우 단계 + 판단 기준

### Command — `commands/<name>.md`
```yaml
---
description: Full autonomous execution from idea to working code
aliases: [ap, autonomous]
---
# 실행 지침. {{ARGUMENTS}}로 사용자 입력 참조
```
- 호출: `/plugin-name:<command>`
- frontmatter: `description`, `aliases`

### Agent — `agents/<name>.md`
```yaml
---
name: architect
description: Strategic Architecture Advisor (READ-ONLY)
model: opus
disallowedTools: Write, Edit
---
# 에이전트 시스템 프롬프트
```
- frontmatter: `name`, `description`, `model`, `disallowedTools`
- `model`: opus / sonnet / haiku 선택
- `disallowedTools`: 역할 경계 강제

### Hook — `hooks/hooks.json`
```json
{
  "hooks": {
    "UserPromptSubmit": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/keyword-detector.mjs\"",
        "timeout": 5
      }]
    }]
  }
}
```
- 이벤트: UserPromptSubmit, PreToolUse, PostToolUse, SessionStart/End 등
- `${CLAUDE_PLUGIN_ROOT}`: 플러그인 루트 자동 치환

---

## 배울 디자인 패턴

### 1. 단일 파일 = 단일 정의
- Frontmatter(메타데이터) + Markdown(프롬프트)가 한 파일에 공존
- 별도 설정 파일 불필요, 파일 하나만 보면 전체 파악 가능

### 2. 역할 기반 도구 제한
- `disallowedTools: Write, Edit` — 분석 전용 에이전트는 수정 불가
- 역할 경계를 메타데이터로 선언적 강제

### 3. 검증 프로토콜
- 모든 에이전트에 "완료 전 검증" 의무 부과
- 빌드/테스트 실행 → 출력 확인 → 증거 인용

### 4. 에이전트 위임 원칙
- 오케스트레이터는 직접 코드 수정 안 함
- `Task(subagent_type="plugin:executor", model="sonnet", prompt="...")` 패턴

---

## fe-workflow에 적용할 것 vs 안 할 것

### 적용

| 패턴 | 적용 방법 |
|------|----------|
| 매니페스트 구조 | `plugin.json`에 name, version, skills 경로 |
| SKILL.md 단일 파일 | 각 컨벤션을 스킬로 변환 |
| disallowedTools | review 에이전트에 적용 (읽기 전용) |
| 검증 프로토콜 | review 시 체크리스트 강제 |

### 불필요

| 패턴 | 이유 |
|------|------|
| 40개+ 스킬 | 우리는 5~8개면 충분 |
| 3-티어 모델 라우팅 | 비용 최적화보다 컨벤션 품질 우선 |
| keyword-detector 매직 | 이미 명확한 워크플로우 존재 |
| MCP 브릿지 (외부 AI) | 불필요 |
| .omc/state/ 상태 관리 | 단순 워크플로우에 과도 |
