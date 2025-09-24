# Ting OTP API (Vercel + KV + Aligo)

이 레포는 아임웹 폼에 붙일 휴대폰 인증(OTP)용 **Vercel Edge API** 예제입니다.

## API
- `POST /api/send-otp` : 6자리 코드 생성 → KV(5분 TTL) 저장 → **알리고**로 SMS 발송
- `POST /api/verify-otp` : 폰+코드 해시 검증 → 일회성 사용(삭제)

## 환경변수 (Vercel 프로젝트 Settings → Environment Variables)
- (Vercel KV를 프로젝트에 Connect하면 자동 생성)
  - `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`
- (알리고)
  - `ALIGO_USER_ID`
  - `ALIGO_API_KEY`
  - `ALIGO_SENDER` (사전등록된 발신번호, 숫자만)
- (CORS)
  - `ALLOWED_ORIGIN` (예: `https://www.ttting.co.kr`)

## 배포 순서 (요약)
1. GitHub에 새 레포 생성 후 이 폴더 파일들을 업로드
2. Vercel에서 **New Project → Import Git Repository**로 연결
3. Vercel **Storage → KV** 생성 후 이 프로젝트에 **Connect**
4. 위 **환경변수** 4개를 등록 → **Redeploy**
5. 배포 도메인 예: `https://ting-otp.vercel.app`
   - 프런트 스니펫의 `API_BASE`를 `https://ting-otp.vercel.app/api`로 설정
6. 테스트:  
   - `POST /api/send-otp` `{ "phone": "01012345678" }`  
   - `POST /api/verify-otp` `{ "phone": "01012345678", "code": "123456" }`

## 로컬 개발(선택)
- `.env.local` 파일에 위 환경변수를 넣고 `npm i && npm run dev`
