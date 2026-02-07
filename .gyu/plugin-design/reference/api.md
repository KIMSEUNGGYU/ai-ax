## api 정의 


Review your answers                              
                       
 ● models 파일 네이밍은? 현재 .schema.ts와 .ts가 혼재
   → models 는 서버 API 의 타입 정의이고 types 는 클라이언트에서 정의도니는 거야 그래서 zod 는 
   schema 야 그리고mdoels 에서 서버 타입을 정의하면 dto.ts 와 같은 형태로 사용할거야 
 ● Zod를 언제 사용할까요? 현재 폼에서만 사용 중                                     
   → 클라이언트에서 validate 정의할때 (주로 form 제어할때 사용 +a)                                
 ● transformer(폼 → API 변환) 패턴을 별도 파일로 분리할까요?                                      
   → 구조에 따라 다를거 같아, transformer 는 항상 잇는 것보다 client 에서 관리하는 데이터 형태와  
   서버가 많이 다른 경우 또는 복잡해서 큰 경우 사용하는 편이야                      
                                                                   