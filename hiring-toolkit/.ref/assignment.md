# **Frontend Developer 사전 과제 가이드**

## **과제를 시작하기 전 유의 사항**

- **기술 과제의 제한 시간은 총 4시간입니다.**
- **API는 본문의 [API 문서] 내용을 참고하여 호출해 주세요.**
- API의 요청과 응답 형식은 문서를 확인해 주세요.
- ChatGPT 등 생성형 AI의 도움 없이 직접 작성해 주세요.
- 디테일을 챙길 수 있도록 과제를 꼼꼼히 읽어주세요.

---

# 주제 > 신규 가맹점 계약

## 사전 설정

🌟 과제를 진행하기 전, 아래 안내 사항에 따라 **사전 설정을 진행해 주세요.**

### Git 저장소 만들기

1. 나인하이어에서 전달 받은 과제 파일(`merchant-contract.zip`)을 다운로드한 후, 압축 파일을 풀어주세요.
    
    이후, 깃 저장소를 만들어주세요
    
    ```bash
    git init
    ```
    
2. 애플리케이션을 실행해 보세요. http://localhost:4200 으로 접속할 수 있습니다.
    
    ```bash
    pnpm install
    pnpm run dev
    ```
    

## 과제

---

🌟아이샵케어로 신규 가맹점을 등록하기 위해 매장 정보를 간단하게 입력하는 서비스를 만들어요. 마크업과 스타일 이미 대부분 구현되어 있지만 기능이 구현되어있지 않아요. 아래 내용에 따라 서비스를 완성해 주세요.

## 구현 요구사항

---

<aside>
⏰ **문제를 푸는 시간이 제한되어 있습니다. 기한 안에 과제를 제출할 수 있도록 시간에 유의해 주세요.**

</aside>

- 화려한 방법보다는 평소에 하던 가장 익숙한 방법으로 문제를 해결할 것을 권장합니다.
- 실행 환경은 Node.js 22 버전과 Google Chrome 등 모던 브라우저를 권장해요.
- 완성을 위해 필요한 라이브러리가 있다면 자유롭게 사용해 주세요.
- 의문점이 있다면 스스로 합리적인 가설을 세우고 계속 진행해 주세요.
- 사용자 경험을 개선하고 싶은 지점이 있다면 구현에 포함시키거나, README 등에 문서로 남겨주세요.

---

### 1. 대표자 정보 입력하기 (BasicInfoPage.tsx)

1. 대표자 정보를 입력받는 화면을 구현해요.
2. 대표자 정보는 이름, 휴대폰 번호, 이메일이 필요해요.
    1. 휴대폰 번호 입력에는 숫자만 입력이 가능해요.
    2. 휴대폰 번호는 아래와 같이 표기해요.
        1. 010-XXXX-XXXX
3. 모든 값이 입력되면 다음 버튼을 활성화해 주세요.
4. 다음 버튼을 클릭하면 매장 정보 입력하기 페이지로 이동해요.

![localhost_4200_merchant-info(iPhone 12 Pro) (1).png](attachment:e959de5b-a846-4054-af3f-906d6520c1ed:localhost_4200_merchant-info(iPhone_12_Pro)_(1).png)

---

### 2.  매장 정보 입력하기 (MerchantInfoPage.tsx)

1. 매장 정보를 입력받는 화면을 구현해요.
    1. 사업자등록번호 입력에는 숫자만 입력이 가능해요.
    2. 사업자등록번호 입력에는 아래와 같이 표기해요.
        1. XXX-XX-XXXXX
2. 주소 입력을 클릭하면 **주소 검색하기 페이지**로 이동해 주세요.
3. 모든 값이 입력되면 다음 버튼을 활성화해 주세요.
    1. 다음 버튼 클릭 시 기가맹 업체인지 확인하기 위해 `POST /api/merchants/validation` 을 호출해 주세요.
    2. `MERCHANT_CONFLICATED` 오류 코드를 받으면 “이미 계약된 매장이에요” 메시지로 토스트를 표시해 주세요.
        1. `0000000000` 또는 `1111111111` 로 사업자등록번호를 입력하면 해당 오류를 응답받을 수 있어요.
    3. API 요청에 성공하면 업종 정보 입력하기 페이지로 이동해요.
    

![localhost_4200_merchant-info(iPhone 12 Pro).png](attachment:8d5b1544-ead4-4283-87c3-9e9cd0ec7779:localhost_4200_merchant-info(iPhone_12_Pro).png)

---

### 3.  주소 검색하기 (AddressPage.tsx)

1. 매장 정보 입력 페이지에서 주소 검색 입력 클릭 시 주소 검색하기 페이지로 넘어와요.
2. 검색어를 입력하면 서버로부터 주소 정보를 검색해서 리스트에 표시해요.
    1. `GET /api/addresses` API를 사용해요.
3. 검색 결과에서 항목을 선택하면 이전 페이지로 이동 후 주소값을 채워 넣어요.
    1. 주소값은 **“{city} {state} {street}”** 와 같이 표기해요. 

![localhost_4200_(iPhone 12 Pro) (1).png](attachment:e612c4d7-dbad-449f-85e1-0c54152096b7:localhost_4200_(iPhone_12_Pro)_(1).png)

---

### 4.  업종 정보 입력하기 (BusinessInfoPage.tsx)

1. 업종 정보를 선택하는 페이지를 구현해요.
2. 업종 목록은 `GET /api/business-categories` API를 이용해 불러와 표시해요.
3. 제출하기 버튼을 누르면 앞선 퍼널에서 입력한 정보들과 함께 API를 호출해 주세요.
    1. `POST /api/contracts` API를 이용해 입력한 정보들을 서버로 전송해요.
    2. 자세한 스펙은 아래 API 문서를 참조해 주세요.
    3. API 요청에 성공하면 완료 페이지로 이동해 주세요.

![localhost_4200_(iPhone 12 Pro).png](attachment:48724b08-8d5e-4307-916c-1f159be01550:localhost_4200_(iPhone_12_Pro).png)

---

## API 문서

`pnpm run dev` 로 개발 서버를 실행시켜 API를 테스트할 수 있어요.

손쉬운 API 사용을 위해 http client 구현체를 미리 제공하고 있어요. `ishopcare-lib` 패키지에서 아래와 같이 import 해서 사용할 수 있어요.

```tsx
import { httpClient, isHttpError } from 'ishopcare-lib';

// GET /api/business-categories
const businessCategories  = await http.get('/api/business-categories');

// POST /api/contracts
await http.post('/api/contracts', {
  json: {
    basic: { ... },
  },
});

// API 오류 캐치하기
try {
  await http.post(...);
} catch (e) {
  if (isHttpError(e)) {
    console.log(e.code, e.message);
  }
}
```

### 주소 검색하기 (`GET /api/addresses`)

```tsx
GET http://localhost:4200/api/addresses?search=테헤란로

// Response
[
  {
    "street": "테헤란로142",
    "city": "서울특별시",
    "state": "강남구",
    "zipcode": "06236"
  }
]
```

### 기가맹 여부 확인하기 (`POST /api/merchants/validation`)

```tsx
POST http://localhost:4200/api/merchants/validation
Content-Type: application/json

// Request
{
   // 상호명
  "name": "상호명",
   // 사업자등록번호
  "businessNumber": "0000000000",
  // 매장 주소
  "address": {
    "street": "테헤란로142",
    "city": "서울특별시",
    "state": "강남구",
    "zipcode": "06236"
  },
}
```

- 이미 계약된 매장의 경우 `MERCHANT_CONFLICTED` 오류 코드를 응답받아요.
    - `0000000000` 또는 `1111111111` 로 사업자등록번호를 입력하면 해당 오류를 응답받을 수 있어요.

### 업종 목록 불러오기 (`GET /api/business-categories`)

```tsx
GET http://localhost:4200/api/business-categories

// Response
[
  {
    "name": "음식점업",
    "value": "FOOD
  }
]
```

### 제출하기 (`POST /api/contracts`)

```tsx
POST http://localhost:4200/api/contracts
Content-Type: application/json

// Request
{
  // 대표자 정보
  "basic": {
    // 이름
    "name": "김사장님",
    // 휴대폰 번호
    "phone": "01012345678",
    // 이메일
    "email": "test@test.com"
  },
  // 매장 정보
  "merchant": {
    // 상호명
    "name": "내매장",
    // 사업자등록번호
    "businessNumber": "0000000000",
    // 주소
    "address": {
      // 도로명
      "street": "테헤란로142",
      // 시
      "city": "서울특별시",
      // 구
      "state": "강남구",
      // 우편번호
      "zipcode": "06236",
      // 상세주소
      "details": "12층 아크플레이스"
    }
  },
  // 업종 정보
  "businessCategory": "FOOD"
}
```

---

## 제출 방법

1. 작업이 완료되면 작업 내용을 `git bundle` 커맨드를 이용해 한 개의 파일로 압축해 주세요.
    
    ```bash
    git bundle create merchant-contract.bundle HEAD main
    ```
    
2. 번들이 잘 만들어졌는지 아래 커맨드로 테스트해주세요.
    - 작업 내용과 커밋 히스토리가 담겨 있어야 해요.
    - gitignore 설정으로 `node_modules` 등 불필요한 파일/디렉터리가 포함되지 않게 유의해 주세요.
    
    ```bash
    git clone merchant-contract.bundle
    ```
    
3. 이후 생성된 `merchant-contract.bundle` 파일을 **.zip 형식으로 압축 후, 나인하이어 통해 제출해 주세요.**
    - **과제 제출 시간(4시간)을 유의해 주세요.**
    - 과제 제출 링크는 1회 제출만 유효해요. 만일 제출이 어려우시다면 채용팀 이메일 ([hr@ishopcare.co.kr](mailto:hr@ishopcare.co.kr))로 성함/연락처/이메일 정보와 함께 시간 내에 전달해 주세요.

---

*이 문제의 저작권은 주식회사 아이샵케어에 있으며, 지원자는 오로지 채용을 위한 목적으로만 이 문제를 활용할 수 있습니다. 이 문제의 전부 또는 일부를 공개, 게재, 배포, 제3자에게 제공하는 등의 일체의 “누설 행위”에 대해서는 저작권법에 의해 민・형사상의 책임을 질 수 있습니다. 이 "누설 행위"에는 문제의 문구를 변형하여 그 취지를 알 수 있도록 하는 경우도 포함됩니다.*