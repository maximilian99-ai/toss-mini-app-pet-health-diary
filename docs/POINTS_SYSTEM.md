# 🪙 포인트 시스템 구현 가이드

## 개요

펫 건강 다이어리 앱은 사용자가 데이터를 추가할 때마다 포인트를 지급하고, 이를 실제 토스 포인트로 전환할 수 있는 리워드 시스템을 제공합니다.

## 포인트 적립 규칙

각 데이터 추가 시 **1P씩 자동 적립**됩니다:

| 액션 | 포인트 |
|-----|-------|
| 반려동물 프로필 등록 | +1P |
| 예방접종 기록 추가 | +1P |
| 병원 방문 기록 추가 | +1P |
| 체중 기록 추가 | +1P |

**중요**: 수정(편집)은 포인트를 지급하지 않으며, **새로운 데이터 추가**만 적립됩니다.

## 구현 세부사항

### 1. 포인트 상태 관리 (AppContext.tsx)

```typescript
// 포인트 상태
const [points, setPoints] = useState<number>(0);

// 포인트 증가
const addPoints = (amount: number) => {
  setPoints((prevPoints) => {
    const newPoints = prevPoints + amount;
    localStorage.setItem(POINTS_KEY, newPoints.toString());
    console.log('[Points] Added', amount, '→ Total:', newPoints);
    return newPoints;
  });
};

// 포인트 리셋 (전환 후)
const resetPoints = () => {
  setPoints(0);
  localStorage.setItem(POINTS_KEY, '0');
  console.log('[Points] Reset to 0');
};
```

### 2. 데이터 추가 시 포인트 지급

각 페이지의 `handleSave` 함수에서 새 데이터인 경우에만 포인트 지급:

```typescript
// PetProfilePage.tsx, VaccinationPage.tsx, MedicalPage.tsx, WeightPage.tsx
const handleSave = () => {
  const isNewRecord = !editingRecord;
  
  // ... 데이터 저장 로직 ...
  
  // 새로운 데이터 추가 시에만 포인트 증가
  if (isNewRecord) {
    addPoints(1);
  }
};
```

### 3. 헤더에 포인트 표시 (HomePage.tsx)

```tsx
<button 
  onClick={handleConvertPoints}
  className="w-full flex flex-col items-center justify-center gap-1 px-3 py-3 bg-yellow-50"
>
  <span className="text-xl">🪙</span>
  <span className="text-sm font-semibold">
    {points.toLocaleString()} P
  </span>
  <span className="text-xs text-gray-500">
    {t('points.tapToConvert')}
  </span>
</button>
```

### 4. 포인트 전환 모달

- 포인트 클릭 시 전환 확인 모달 표시
- 로딩 상태 표시 (스피너)
- 에러 핸들링 및 사용자 안내

## 토스 프로모션 API 연동

### 개발 환경 설정

현재는 개발 모드로 동작하며, 실제 API 연동을 위해서는 다음 단계가 필요합니다:

#### 1단계: 앱인토스 콘솔에서 프로모션 생성

1. [앱인토스 콘솔](https://console.apps-in-toss.im/) 접속
2. **성장 > 프로모션(토스 포인트)** 메뉴 선택
3. **프로모션 만들기** 클릭
4. 프로모션 정보 입력:
   - 프로모션 이름: "펫 건강 다이어리 포인트 전환"
   - 액션 유형: `REWARD`
   - 포인트 지급 설정
5. 생성된 **Promotion ID** 복사

#### 2단계: Promotion ID 설정

`src/shared/constants.ts` 파일 수정:

```typescript
// 기존
export const PROMOTION_ID = 'YOUR_PROMOTION_ID';

// 수정 (콘솔에서 발급받은 ID로 변경)
export const PROMOTION_ID = 'promo_abc123xyz456';
```

#### 3단계: API 코드 활성화

`src/pages/HomePage.tsx` 파일에서 주석 처리된 코드 활성화:

```typescript
// 1. Import 추가
import { executePromotion } from '@apps-in-toss/web-framework';

// 2. handleConfirmConvert 함수 수정
const handleConfirmConvert = async () => {
  setIsConverting(true);

  try {
    // 실제 프로모션 API 호출
    const result = await executePromotion({
      promotionId: PROMOTION_ID,
      actionType: 'REWARD',
      metadata: {
        points: points,
        timestamp: new Date().toISOString(),
        source: 'pet_health_diary',
      },
    });

    if (result.success) {
      resetPoints();
      setShowConvertModal(false);
      alert(t('points.convertSuccess'));
      console.log('[Points] 토스 포인트 전환 성공:', result);
    } else {
      throw new Error(result.message || 'Unknown error');
    }
  } catch (error) {
    // 에러 처리...
  } finally {
    setIsConverting(false);
  }
};
```

#### 4단계: 테스트

**중요**: 프로모션 기능은 **브라우저에서 테스트할 수 없습니다**.

테스트 방법:
1. **샌드박스 앱** 또는 **토스 앱**에서 실행
2. 데이터 추가로 포인트 적립
3. 포인트 전환 기능 테스트
4. 토스 앱에서 실제 포인트 지급 확인

### API 참고 문서

- [프로모션(토스 포인트) 이해하기](https://developers-apps-in-toss.toss.im/promotion/intro.md)
- [프로모션 콘솔 가이드](https://developers-apps-in-toss.toss.im/promotion/console.md)
- [프로모션 개발 가이드](https://developers-apps-in-toss.toss.im/promotion/develop.md)
- [비게임 프로모션 API 레퍼런스](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/비게임/promotion.md)

## 에러 핸들링

### 주요 에러 타입

1. **PROMOTION_NOT_FOUND**
   - 원인: 프로모션 ID가 잘못되었거나 콘솔에서 생성되지 않음
   - 해결: 앱인토스 콘솔에서 프로모션 생성 확인

2. **NOT_SUPPORTED**
   - 원인: 브라우저 환경에서 실행
   - 해결: 샌드박스 앱 또는 토스 앱에서 실행

3. **INSUFFICIENT_BALANCE**
   - 원인: 프로모션 예산 소진
   - 해결: 콘솔에서 프로모션 예산 확인 및 충전

### 에러 메시지 커스터마이징

```typescript
catch (error) {
  let errorMessage = t('points.convertFailed');
  
  if (error instanceof Error) {
    if (error.message.includes('PROMOTION_NOT_FOUND')) {
      errorMessage += '\n\n앱인토스 콘솔에서 프로모션을 먼저 생성해주세요.';
    } else if (error.message.includes('NOT_SUPPORTED')) {
      errorMessage += '\n\n브라우저가 아닌 토스 앱에서 실행해주세요.';
    } else {
      errorMessage += `\n\n${error.message}`;
    }
  }
  
  alert(errorMessage);
}
```

## 추가 기능 아이디어

### 포인트 차감 (선택사항)

데이터 삭제 시 포인트 차감을 원할 경우:

```typescript
const handleDelete = (record: Record) => {
  if (window.confirm(t('alert.deleteConfirm'))) {
    storage.delete(record.id);
    addPoints(-1); // 포인트 1점 차감
  }
};
```

### 포인트 배수 이벤트

특정 조건에서 포인트 배수 지급:

```typescript
const handleSave = () => {
  const isNewRecord = !editingRecord;
  
  if (isNewRecord) {
    const isEventPeriod = checkEventPeriod(); // 이벤트 기간 체크
    const pointsToAdd = isEventPeriod ? 2 : 1; // 2배 이벤트
    addPoints(pointsToAdd);
  }
};
```

### 최소 전환 포인트 설정

`src/shared/constants.ts`:

```typescript
export const MIN_CONVERT_POINTS = 10; // 최소 10P 이상
```

`src/pages/HomePage.tsx`:

```typescript
const handleConvertPoints = () => {
  if (points < MIN_CONVERT_POINTS) {
    alert(t('points.minPoints', { min: MIN_CONVERT_POINTS }));
    return;
  }
  setShowConvertModal(true);
};
```

## 디버깅 팁

### 로그 확인

모든 포인트 관련 액션은 콘솔에 로그가 남습니다:

```
[Points] Initialized with 5 points
[Points] Added 1 → Total: 6
[Points] 토스 포인트 전환 성공
[Points] Reset to 0
```

### localStorage 확인

브라우저 개발자 도구에서 확인:

```javascript
// 현재 포인트 확인
localStorage.getItem('@pet_health_points')

// 포인트 수동 설정 (테스트용)
localStorage.setItem('@pet_health_points', '100')

// 포인트 초기화
localStorage.removeItem('@pet_health_points')
```

## 문제 해결

### Q: 포인트가 지급되지 않아요
A: 
1. 새 데이터를 추가했는지 확인 (수정은 포인트 미지급)
2. 콘솔 로그에서 `[Points] Added` 메시지 확인
3. localStorage에 저장되었는지 확인

### Q: 포인트 전환이 안 돼요
A:
1. 프로모션 ID가 올바르게 설정되었는지 확인
2. 샌드박스 앱 또는 토스 앱에서 실행 중인지 확인
3. 콘솔에서 에러 메시지 확인

### Q: 앱 재실행 시 포인트가 사라져요
A: localStorage에 저장되므로 정상적으로는 유지됩니다. 브라우저 캐시를 지우지 않았는지 확인하세요.

## 라이선스

이 포인트 시스템은 펫 건강 다이어리 프로젝트의 일부입니다.
