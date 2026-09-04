# Pet Health Diary

반려동물 건강 기록을 관리하는 Apps in Toss 미니앱입니다.

## 프로젝트 개요

Pet Health Diary는 반려동물의 기본 정보, 예방접종, 병원 방문, 체중 변화를 한 곳에서 기록하고 조회할 수 있는 앱입니다.

현재 앱은 React + TypeScript 기반으로 구현되어 있으며, 데이터는 localStorage에 저장됩니다.

## 현재 동작하는 기능 (2026-09-05 기준)

아래 기능은 현재 라우트와 화면에서 실제로 사용 가능합니다.

### 1) 홈 대시보드
- 반려동물 카드 목록 표시
- 빠른 이동 버튼
  - 프로필
  - 예방접종
  - 병원 기록
  - 체중 기록
- 다가오는 예방접종 최대 3개 표시
- 최근 병원 기록 최대 3개 표시
- 최근 체중 기록 최대 3개 표시
- 현재 포인트 표시 및 포인트 전환 버튼

### 2) 반려동물 프로필 관리
- 반려동물 추가/수정/삭제
- 입력 항목
  - 이름(필수)
  - 종류
  - 품종
  - 성별
  - 생년월일
  - 체중
  - 메모
- 목록에서 반려동물별 요약 카드 확인
- 새 반려동물 등록 시 포인트 +1
- 반려동물 삭제 시 연관 데이터 cascade 삭제
  - 예방접종
  - 병원 기록
  - 체중 기록
  - 일상 메모

### 3) 예방접종 관리
- 예방접종 추가/수정/삭제
- 입력 항목
  - 반려동물(필수)
  - 백신명(필수)
  - 접종일(필수)
  - 다음 접종일
  - 병원명
  - 메모
- 목록 최신순 정렬
- 다음 접종일 기준 배지 표시
  - 30일 이내: 남은 일수 표시
  - 기한 경과: overdue 표시
- 새 예방접종 등록 시 포인트 +1

### 4) 병원 기록 관리
- 병원 기록 추가/수정/삭제
- 입력 항목
  - 반려동물(필수)
  - 방문일(필수)
  - 병원명(필수)
  - 증상
  - 진단
  - 치료
  - 비용
  - 메모
- 목록 최신순 정렬
- 비용 천 단위 표시
- 새 병원 기록 등록 시 포인트 +1

### 5) 체중 기록 관리
- 체중 기록 추가/수정/삭제
- 반려동물별 기록 조회
- 입력 항목
  - 체중(필수)
  - 측정일(필수)
  - 메모
- 최신 체중 카드 표시
- 직전 기록 대비 증감 표시
- 최근 최대 10개 기준 체중 추이 차트 표시
- 새 체중 기록 등록 시 포인트 +1

### 6) 설정
- 언어 변경
  - 한국어, 영어, 러시아어, 베트남어, 중국어, 태국어
- 테마 변경
  - Auto, Light, Dark
- 설정값 localStorage 저장/복원

### 7) 포인트 시스템
- 앱 시작 시 기존 데이터 개수 기반 초기 포인트 자동 산정
  - pets + vaccinations + medicalRecords + weightRecords
- 새 데이터 추가 시 포인트 +1
  - 반려동물
  - 예방접종
  - 병원 기록
  - 체중 기록
- 홈에서 포인트 전환 시도 가능
- 최소 전환 포인트: 1P
- 전환 성공 시 포인트 0으로 초기화

## 포인트 전환(토스 프로모션) 사용 조건

포인트 전환은 코드상 구현되어 있으나, 실제 동작을 위해 아래 조건이 필요합니다.

1. Apps in Toss 콘솔에서 프로모션 생성
2. src/shared/constants.ts의 PROMOTION_ID를 실제 값으로 교체
3. 브라우저가 아닌 토스 앱/샌드박스 환경에서 실행

기본값은 YOUR_PROMOTION_ID로 되어 있어, 교체 전에는 경고 메시지가 표시됩니다.

4. 포인트 전환 기능을 도입하기 위해 [**정산 정보 단계**](https://developers-apps-in-toss.toss.im/guide/marketing/promotion#id-2)까지 진행했으며 예산 문제 때문에 향후 [**비즈니스 월렛 충전**](https://developers-apps-in-toss.toss.im/guide/marketing/promotion#id-3) 이후로 진행하여 사용자들의 리텐션을 끌어올릴 예정

## 현재 코드에 있으나 기본 라우트에 연결되지 않은 항목

다음 항목은 코드 파일은 존재하지만 App 라우트에 연결되어 있지 않아 현재 기본 흐름에서 접근할 수 없습니다.

- 인앱 광고 테스트 페이지
  - src/pages/InAppAdsPage.tsx
- 인앱 결제 테스트 페이지
  - src/pages/InAppPurchasePage.tsx
- 관련 훅
  - src/hooks/useInAppAds.tsx
  - src/hooks/useInAppPurchase.ts

## 데이터 저장 방식

- 저장소: localStorage
- 핵심 키
  - @pet_health_diary
  - @pet_health_theme_mode
  - @pet_health_language
  - @pet_health_points

## 기술 스택

### Runtime / Framework
- React 18
- TypeScript 5
- React Router DOM 7
- Vite 6

### UI
- Tailwind CSS
- TDS Mobile AIT Provider

### Apps in Toss
- @apps-in-toss/web-framework

### i18n
- i18next
- react-i18next

## 시작하기

### 요구사항
- Node.js 18+
- npm

### 설치

```bash
npm install
```

### 개발 서버

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 배포

```bash
npm run deploy
```

### 린트/포맷

```bash
npm run lint
npm run format
```

## 프로젝트 구조

```text
src/
  App.tsx
  main.tsx
  contexts/
    AppContext.tsx
  pages/
    HomePage.tsx
    PetProfilePage.tsx
    VaccinationPage.tsx
    MedicalPage.tsx
    WeightPage.tsx
    SettingsPage.tsx
  utils/
    storage.ts
  shared/
    constants.ts
    types.ts
```

## 참고 링크

- Apps in Toss 콘솔: https://console.apps-in-toss.im/
- Apps in Toss 개발자 문서: https://developers-apps-in-toss.toss.im/
- TDS 문서: https://toss.im/tds
