# Statusline 구축 작업

## 개요
Claude Code CLI의 커스텀 statusline. 세션 정보 + 리소스 현황 + 라이브 활동을 한 줄로 표시.

## 현재 구조

```
~/.claude/
├── settings.json          # statusLine 설정 (type: command)
└── statusline.sh          # 메인 스크립트
```

## 설정 (settings.json)
```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh",
    "padding": 0
  }
}
```

## 출력 포맷
```
[모델명] 디렉토리 | ██░░░░░░░░ 20% | $비용 | 입력↑출력↓ | S:1 C:4 A:0 P:3 H:0 | 라이브활동
```

### 섹션별 구성

| 섹션 | 데이터 소스 | 설명 |
|------|------------|------|
| 모델명 | stdin JSON `.model.display_name` | 현재 모델 |
| 디렉토리 | stdin JSON `.workspace.current_dir` | 작업 디렉토리 (basename) |
| 컨텍스트 바 | stdin JSON `.context_window.used_percentage` | 10칸 프로그레스 바 |
| 비용 | stdin JSON `.cost.total_cost_usd` | 세션 누적 비용 |
| 토큰 | stdin JSON `.context_window.total_*_tokens` | 입/출력 토큰 (k/M 포맷) |
| 리소스 카운트 | 파일시스템 직접 조회 | S(kills)/C(ommands)/A(gents)/P(lugins)/H(ooks) |
| 라이브 활동 | 디버그 로그 + 세션 JSONL | 아래 상세 |

### 라이브 활동 상세

| 항목 | 소스 | 디버그 필요 | 설명 |
|------|------|:-----------:|------|
| `loaded:[...]` | 디버그 로그 | O | 마지막 턴에 주입된 스킬 프롬프트 |
| `fired:[...]` | 세션 JSONL | X | 세션 중 Skill 도구로 실행된 스킬 누적 |
| `agent(RUN/DONE:...)` | 디버그 로그 | O | 서브에이전트 상태 |
| `tool:...` | 디버그 로그 | O | 마지막 사용 도구 |
| `hook:Nx(...)` | 디버그 로그 | O | 훅 실행 횟수 + 마지막 훅 |

## 진행 상태

- [x] 기본 세션 정보 표시 (모델, 디렉토리, 컨텍스트, 비용, 토큰)
- [x] 리소스 카운트 (Skills, Commands, Agents, Plugins, Hooks)
- [x] 컨텍스트 프로그레스 바
- [x] 토큰 포맷팅 (k/M)
- [x] 라이브 활동 - fired skills (JSONL 기반, 디버그 불필요)
- [x] 라이브 활동 - loaded skills (디버그 로그 기반)
- [x] 라이브 활동 - agent 상태 (디버그 로그 기반)
- [x] 라이브 활동 - tool 추적 (디버그 로그 기반)
- [x] 라이브 활동 - hook 실행 추적 (디버그 로그 기반)
- [ ] 디버그 모드 없이 라이브 활동 확보 방안 검토
- [ ] 성능 최적화 (매 렌더마다 find/jq 호출 비용)
- [ ] 에러/엣지케이스 처리 강화

## 의존성
- `jq`: JSON 파싱
- `bc`: 토큰 포맷팅 연산
- `--debug` 플래그: 라이브 활동 대부분 기능에 필요

## 알려진 이슈
- 디버그 모드 없이 실행 시 라이브 활동 섹션 대부분 비활성 (fired skills만 동작)
- 리소스 카운트가 매 렌더마다 `find` 실행 (캐싱 없음)
