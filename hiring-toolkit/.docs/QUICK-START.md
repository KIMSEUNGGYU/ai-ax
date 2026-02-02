# Quick Start - FE Assignment Grading

## 1분 시작

### 1. (Optional) assignment.md 작성
```bash
# .ref/assignment.md 생성 (과제별 요구사항)
```
과제 요구사항을 Critical/High/Medium으로 분류하여 작성

### 2. 스킬 실행
```
/fe-evaluate
```

Claude가 경력 레벨을 물어보면 답변하세요.

## 평가 프로세스

1. **경력 레벨 확인** - Junior/Mid/Senior/Staff+
2. **assignment.md 확인** - 있으면 Phase 0 (요구사항 체크)
3. **Phase 0-5 평가** - SubAgent 실행
4. **최종 리포트** - 점수 + 채용 추천

## 주요 체크사항

### 즉시 실격 (Critical)
- ❌ any 사용 (0회 필수)
- ❌ Critical 요구사항 미충족

### 큰 감점 (High)
- 타입 단언 남용
- 불필요한 커스텀 훅/Context
- 순환 참조
- DRY 위반 (3+ 중복)
- [COG7] 위반 (30줄+, 3파라미터+)

### 가산점
- Page First 구조
- [GOAL] 변경 용이성
- 판별 유니온
- 응집도 높음

## 경력별 합격선

| 경력 | 합격선 |
|-----|--------|
| Junior | 50%+ |
| Mid | 60%+ |
| Senior | 70%+ |
| Staff+ | 80%+ |
