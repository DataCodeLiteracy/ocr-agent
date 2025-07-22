# OCR Agent

책 페이지를 핸드폰으로 찍어서 텍스트를 추출하는 웹 애플리케이션입니다. Google Vision API를 사용하여 고정밀 OCR 기능을 제공합니다.

## 주요 기능

- 📱 **모바일 친화적 UI**: 핸드폰과 데스크톱 모두에서 최적화된 사용자 경험
- 📷 **쉬운 이미지 업로드**: 카메라로 직접 촬영하거나 기존 이미지 업로드
- 🔍 **고정밀 OCR**: Google Vision API를 활용한 정확한 텍스트 추출
- 📚 **책 페이지 최적화**: 책 페이지와 문서에 특화된 OCR 처리
- 📋 **결과 관리**: 추출된 텍스트 복사, 다운로드 기능

## 기술 스택

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **OCR**: Google Cloud Vision API
- **UI Components**: Lucide React Icons

## 설치 및 설정

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd ocr-agent
npm install
```

### 2. Google Cloud Vision API 설정

#### Vercel 배포용 설정 (권장)

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Cloud Vision API 활성화
3. 서비스 계정 생성 및 키 파일 다운로드
4. 키 파일에서 `client_email`과 `private_key` 추출

#### 로컬 개발용 설정 (선택적)

서비스 계정 키 파일을 프로젝트 루트에 `google-credentials.json`으로 저장

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가:

```env
# Vercel 배포용 (권장)
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# 로컬 개발용 (선택적)
# GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

# API URL (개발 환경에서는 기본값 사용)
NEXT_PUBLIC_API_URL=/api
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 사용 방법

1. **이미지 업로드**: "Take Photo" 버튼으로 카메라 촬영 또는 "Upload Image" 버튼으로 기존 이미지 선택
2. **OCR 실행**: "Extract Text" 버튼을 클릭하여 텍스트 추출 시작
3. **결과 확인**: 모달에서 추출된 텍스트를 확인하고 복사 또는 다운로드

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   └── ocr/          # OCR API 엔드포인트
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 메인 페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── Button.tsx        # 버튼 컴포넌트
│   ├── ImageUpload.tsx   # 이미지 업로드 컴포넌트
│   ├── LoadingSpinner.tsx # 로딩 스피너
│   ├── Modal.tsx         # 모달 컴포넌트
│   └── OCRResult.tsx     # OCR 결과 표시 컴포넌트
├── lib/                  # 유틸리티 및 서비스
│   ├── ApiClient.ts      # 범용 API 클라이언트
│   └── OCRService.ts     # OCR 전용 서비스
└── types/               # TypeScript 타입 정의
    └── index.ts         # 공통 타입 정의
```

## 아키텍처 설계

### ApiClient

- 범용 HTTP 클라이언트로 설계
- GET, POST, 파일 업로드 등 다양한 요청 지원
- 재사용 가능한 구조로 다른 서비스에서도 활용 가능

### OCRService

- OCR 관련 비즈니스 로직 담당
- ApiClient를 활용하여 OCR API 호출
- 에러 처리 및 응답 변환 로직 포함

### 확장성

- 새로운 서비스 추가 시 ApiClient 재사용 가능
- 각 서비스는 독립적으로 관리되어 유지보수 용이

## 배포

### Vercel 배포 (권장)

1. GitHub에 프로젝트 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 연결
3. 환경 변수 설정:
   - `GOOGLE_CLIENT_EMAIL`: 서비스 계정 이메일
   - `GOOGLE_PRIVATE_KEY`: 서비스 계정 개인 키 (전체 내용)
4. 배포 완료

### 환경 변수 설정 방법

1. Google Cloud Console에서 서비스 계정 키 파일 다운로드
2. JSON 파일에서 `client_email`과 `private_key` 값 추출
3. Vercel 대시보드에서 환경 변수 설정:
   - `GOOGLE_CLIENT_EMAIL`: client_email 값
   - `GOOGLE_PRIVATE_KEY`: private_key 값 (전체, 줄바꿈 포함)

### 다른 플랫폼 배포

다른 플랫폼에서 배포할 때는 Google Cloud Vision API 인증 정보를 적절히 설정해야 합니다.

## 라이선스

MIT License

## 기여

이슈와 풀 리퀘스트를 환영합니다!
