# 🐾 Pet Health Diary

반려동물의 건강 정보를 체계적으로 관리할 수 있는 Apps in Toss 미니앱입니다.

## 📖 프로젝트 소개

반려동물의 프로필, 예방접종 일정, 병원 방문 기록, 체중 변화 등을 간편하게 기록하고 관리할 수 있는 건강 다이어리 애플리케이션입니다.

## 🛠 기술 스택

### 프레임워크 & 라이브러리
- **React 18.3** - UI 라이브러리
- **TypeScript 5.7** - 타입 안정성
- **Vite 6.2** - 빌드 도구 및 개발 서버
- **React Router DOM 7.15** - 클라이언트 사이드 라우팅

### Apps in Toss
- **@apps-in-toss/web-framework 2.6** - 앱인토스 프레임워크
  - 인앱 광고 (In-App Ads)
  - 인앱 결제 (In-App Purchase)

### UI & 스타일링
- **Toss Design System (TDS Mobile) 2.3** - UI 컴포넌트
- **Emotion 11.14** - CSS-in-JS
- **@toss/tds-colors** - 디자인 시스템 컬러

### 다국어 & 국제화
- **i18next 26.2** - 국제화 프레임워크
- **react-i18next 17.0** - React i18next 통합
- **지원 언어**: 한국어(ko), 영어(en), 러시아어(ru), 베트남어(vi), 중국어(zh), 태국어(th)

### 개발 도구
- **ESLint 9.21** - 코드 품질 관리
- **Prettier 3.4** - 코드 포맷팅
- **TypeScript ESLint 8.24** - TypeScript 린팅

## 📁 프로젝트 구조

```
src/
├── contexts/          # React Context (전역 상태 관리)
│   └── AppContext.tsx # 테마/언어 설정 관리
├── hooks/             # Custom Hooks
│   ├── useInAppAds.tsx      # 인앱 광고 Hook
│   └── useInAppPurchase.ts  # 인앱 결제 Hook
├── i18n/              # 다국어 설정
│   ├── index.ts       # i18next 설정
│   └── locales/       # 언어별 번역 파일 (ko, en, ru, vi, zh, th)
├── pages/             # 페이지 컴포넌트
│   ├── HomePage.tsx            # 홈 (대시보드)
│   ├── PetProfilePage.tsx      # 반려동물 프로필 관리
│   ├── VaccinationPage.tsx     # 예방접종 관리
│   ├── MedicalPage.tsx         # 병원 방문 기록
│   ├── WeightPage.tsx          # 체중 관리
│   ├── SettingsPage.tsx        # 설정 (언어/테마)
│   ├── InAppAdsPage.tsx        # 인앱 광고 테스트
│   └── InAppPurchasePage.tsx   # 인앱 결제 테스트
├── shared/            # 공유 유틸리티
│   ├── constants.ts   # 상수 정의
│   ├── theme.ts       # 테마 관리
│   ├── types.ts       # TypeScript 타입 정의
│   └── utils.ts       # 유틸리티 함수
└── utils/
    └── storage.ts     # localStorage 관리

docs/skills/           # 프로젝트 문서
├── apps-in-toss.md   # Apps in Toss 가이드
└── tds-mobile.md     # TDS Mobile 사용법
```

## ✨ 주요 기능

### 🏠 홈 (대시보드)
- 반려동물 요약 카드 (가로 스크롤)
- 빠른 시작 버튼 (프로필/예방접종/병원/체중)
- 다가오는 예방접종 일정 (최대 3개)
- 최근 병원 방문 기록 (최대 3개)

### 🐶 반려동물 프로필 관리
- 반려동물 등록/수정/삭제
- 기본 정보: 이름, 종류, 품종, 생년월일, 성별, 체중
- 추가 정보: 입양일, 특이사항 메모
- 프로필 사진 업로드 (base64 저장)

### 💉 예방접종 관리
- 예방접종 기록 추가/수정/삭제
- 백신명, 접종일, 병원명
- 다음 접종 예정일 관리
- 메모 기능

### 🏥 병원 방문 기록
- 병원 방문 기록 추가/수정/삭제
- 증상, 진단명, 치료 내용
- 진료비 기록
- 다음 방문 예정일
- 메모 기능

### ⚖️ 체중 관리
- 체중 기록 추가/수정/삭제
- 체중 변화 차트 시각화
- 측정일별 체중 데이터
- 메모 기능

### ⚙️ 설정
- **다국어 지원**: 한국어, 영어, 러시아어, 베트남어, 중국어, 태국어
- **테마 설정**: Auto (시스템 설정 따름), Light, Dark 모드
- 설정 자동 저장 (localStorage)

### 💰 Apps in Toss 기능
- **인앱 광고**: 전면 광고 (Fullscreen Ad) 지원
- **인앱 결제**: 상품 목록 조회 및 결제 처리

### 🪙 포인트 시스템 & 토스 프로모션
- **포인트 적립**: 데이터 추가 시 1P 자동 적립
  - 반려동물 프로필 등록: +1P
  - 예방접종 기록 추가: +1P
  - 병원 방문 기록 추가: +1P
  - 체중 기록 추가: +1P
- **토스 포인트 전환**: 적립된 포인트를 실제 토스 포인트로 전환
- **자동 초기화**: 앱 최초 실행 시 기존 데이터 개수만큼 포인트 자동 지급
- **영구 저장**: localStorage를 통한 포인트 영구 보관

#### 토스 프로모션 연동 설정

포인트를 실제 토스 포인트로 전환하려면 앱인토스 콘솔에서 프로모션을 설정해야 합니다:

1. **앱인토스 콘솔 접속**
   - [앱인토스 콘솔](https://console.apps-in-toss.im/) 로그인
   
2. **프로모션 생성**
   - 좌측 메뉴: 성장 > 프로모션(토스 포인트)
   - "프로모션 만들기" 클릭
   - 프로모션 정보 입력:
     - 프로모션 이름: "펫 건강 다이어리 포인트 전환"
     - 액션 유형: REWARD
     - 포인트 지급 방식 설정
   
3. **Promotion ID 설정**
   - 생성된 프로모션의 ID 복사
   - `src/shared/constants.ts` 파일 수정:
   ```typescript
   export const PROMOTION_ID = '발급받은_프로모션_ID';
   ```

4. **API 연동 코드 활성화**
   - `src/pages/HomePage.tsx` 파일에서 TODO 주석 확인
   - 주석 처리된 프로모션 API 코드 활성화:
   ```typescript
   import { executePromotion } from '@apps-in-toss/web-framework';
   
   const result = await executePromotion({
     promotionId: PROMOTION_ID,
     actionType: 'REWARD',
     metadata: {
       points: points,
       timestamp: new Date().toISOString(),
       source: 'pet_health_diary',
     },
   });
   ```

5. **테스트**
   - 샌드박스 앱 또는 토스 앱에서 실행 (브라우저 X)
   - 포인트 적립 후 전환 기능 테스트

**참고 문서**:
- [프로모션(토스 포인트) 이해하기](https://developers-apps-in-toss.toss.im/promotion/intro.md)
- [프로모션 콘솔 가이드](https://developers-apps-in-toss.toss.im/promotion/console.md)
- [프로모션 개발 가이드](https://developers-apps-in-toss.toss.im/promotion/develop.md)
- [비게임 프로모션 API](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/비게임/promotion.md)

### 💾 데이터 관리
- localStorage 기반 데이터 저장
- JSON 내보내기/가져오기 기능
- 전체 데이터 초기화 기능

## 🚀 시작하기

### 개발 환경 요구사항
- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
# Vite 개발 서버 시작 (http://localhost:5173)
npm run dev
```

### 빌드

```bash
# 프로덕션 빌드
npm run build
```

### 코드 품질 관리

```bash
# ESLint 실행
npm run lint

# Prettier 포맷팅
npm run format
```

## 📦 배포하기

Apps in Toss 배포를 위해서는 앱인토스 콘솔에서 API 키가 필요합니다.

### API 키 발급
1. [앱인토스 콘솔](https://apps-in-toss.toss.im/) 접속
2. 워크스페이스 > API 키 > 콘솔 API 키 발급

### 배포 명령어

```bash
# 빌드 후 배포
npm run build
npm run deploy
```

## 🗂️ 데이터 구조

### Pet (반려동물)
```typescript
{
  id: string;
  name: string;
  species: string; // '강아지', '고양이', '기타'
  breed?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'unknown';
  weight?: number; // kg
  photo?: string; // base64
  adoptionDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Vaccination (예방접종)
```typescript
{
  id: string;
  petId: string;
  vaccineName: string;
  vaccinationDate: string;
  nextDueDate?: string;
  hospitalName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### MedicalRecord (병원 기록)
```typescript
{
  id: string;
  petId: string;
  visitDate: string;
  hospitalName: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  cost?: number;
  nextVisitDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### WeightRecord (체중 기록)
```typescript
{
  id: string;
  petId: string;
  weight: number; // kg
  measureDate: string;
  notes?: string;
  createdAt: string;
}
```

## 🔗 유용한 링크

### Apps in Toss
- [앱인토스 콘솔](https://apps-in-toss.toss.im/)
- [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im/)
- [앱인토스 개발자 커뮤니티](https://techchat-apps-in-toss.toss.im/)
- [AI 개발 가이드](https://developers-apps-in-toss.toss.im/development/llms.html)

### 문서
- [인앱 광고 가이드](https://developers-apps-in-toss.toss.im/ads/intro.html)
- [인앱 결제 가이드](https://developers-apps-in-toss.toss.im/iap/intro.html)
- [TDS Mobile 문서](https://toss.im/tds)

## 📝 라이선스

이 프로젝트는 Apps in Toss 플랫폼 위에서 동작하는 미니앱입니다.

## 👨‍💻 개발자

사이드 프로젝트 - Pet Health Diary

---

**Made with ❤️ for pet lovers**
