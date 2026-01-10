# prompt

내가 사용하는 prompt 모음집

## 개요 
> 현재 사용 버전
> 개발 : dev/v4

- AI 를 잘 사용하기 위한 prompt 및 여러 시도들을 관리하는 레포
- v1, v2 와 같이 버전으로 history 관리 

### 구조 설명 
```
.
├── README.md
├── claude                              # claude code 를 잘 사용하기 위한 claude 설정
├── dev                                 # 개발 관련된 prompt 
│   ├── v1
│   └── v2
├── wiki                                # AI prompt 를 잘 관리하기 위해 클린 코드/아키텍처 와 같은 관점 및 개념이 있으면 좋음, 해당 내용 관리 
└── writer                              # 글 작성을 위한 prompt 
```



## Claude Code
- claude code 에서 제공하는 기능들을 활용하여 사용하기
- v1, v2 ... 와 같은 형식으로 저장하여 계속 개선할 예정

```
.
└── v1
    ├── agents
    │   ├── dev-research-specialist.md
    │   ├── feature-architect.md
    │   └── frontend-architect-developer.md
    └── commands
        └── organization.md
```

### `commands`
- 커스텀 명령어를 추가해서 관리, 자주 사용하는 문구/명령어 를 등록해서 사용 (자주 쓰는 프롬프트 저장해서 사용하는 개념)
- `~/.claude ` 해당 경로에 `commands` 디렉토리 안에 추가하고 싶은 커스텀 명령어 추가하면됨 

### `agents`
- claude sub agent 들을 등록해서 사용 

```sh
/agents
# agents 목록을 보거나 "Create new agent" 메뉴 선택시 agents 생성 가능 
```

```sh
# 사용 
frontend-architect-developer .....
```
- 추가한 agent(frontend-architect-developer) 을 입력하고 요청하고 싶은 문장을 추가하면됨 


## 개발

```
├─ dev
│  └─ .cursor
│     ├─ docs
│     │  └─ _STYLE_GUIDE.md                 # 코드 스타일 가이드
│     └─ rules
│        └─ personal-frontend-rule.mdc      # 범용적인 개발 룰
│  └─ GEMINI.md                             # gemini-cli 용 rule (전반적인 프로그래밍 룰 + 코드 리뷰)
└─ writer
```

TODO: GEMINI.md

- gemini-cli 에서 개발할때 GEMINI.md 를 어떻게 설정할지!

## 글쓰기 + 학습

```
prompt
├─ README.md
...
└─ writer
   └─ GEMINI.md                     # 글쓰기 가이드
```

