# 미디어쿼리를 다 써놨는데 모바일에서 데스크톱 레이아웃이 나오던 문제

- 날짜: 2026-07-12
- 맥락: Portfolio 프로젝트 — index.html(언어 선택 랜딩)에 모바일 반응형(우편함 세로 정렬)을 추가하는 작업. CSS는 css/lang.css 하단에 `@media (max-width: 767px)` 블록으로 작성.
- 태그: responsive, viewport-meta, media-query, mobile-emulation

## 문제

375px 모바일 에뮬레이션으로 확인했는데, 방금 작성한 미디어쿼리가 전혀 적용되지 않고 데스크톱 레이아웃(우편함 3개 가로 나열)이 그대로 나왔다. CSS 문법도 맞고, 로드 순서도 맞고, 선택자 우선순위도 문제가 없어서 원인이 자명하지 않았다.

## 시도한 것들 (실패 포함)

1. 브라우저 창 크기만 375px로 리사이즈 → Chrome은 창 최소 폭(~500px) 제한이 있어 innerWidth가 504px로 잡혔다. 이 상태로는 767px 브레이크포인트 안이라 CSS 자체는 발동했지만, "실제 기기 조건"과 달라서 진짜 문제를 드러내지 못했다.
2. 모바일 기기 에뮬레이션(isMobile + 375px)으로 전환 → 데스크톱 레이아웃이 나왔다. 이게 결정적 단서: **기기 에뮬레이션에서만 깨진다면 CSS가 아니라 viewport 설정 문제다.**

## 통한 접근법

`grep viewport *.html`로 확인하니 min.postfolio-ko.html과 pdf_brand.html에는 `<meta name="viewport">`가 있는데 **index.html에만 없었다.** viewport meta가 없으면 모바일 브라우저는 페이지를 가상 폭 980px로 렌더링하므로, `max-width: 767px` 쿼리는 실제 폰에서 영원히 발동하지 않는다. head에 한 줄 추가로 해결:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## 일반화된 교훈

1. **미디어쿼리가 "문법은 맞는데 모바일에서 안 먹는" 증상이 보이면, CSS를 의심하기 전에 해당 HTML의 viewport meta 존재부터 확인하라.** 페이지가 여러 개인 사이트는 페이지마다 head가 따로라서 한 파일만 누락되기 쉽다.
2. 반응형 검증은 창 리사이즈가 아니라 **기기 에뮬레이션(isMobile)** 으로 하라. 창 리사이즈는 viewport meta 부재를 숨긴다 (데스크톱 브라우저는 meta 없이도 innerWidth 기준으로 쿼리를 발동시킨다).
3. Chrome 데스크톱 창은 ~500px 아래로 줄어들지 않는다. 375px 확인은 반드시 DevTools 기기 에뮬레이션으로.

## 재발 방지 (선택)

이후 en/jp 언어 페이지를 새로 만들 때 ko 페이지의 head를 복사해서 시작하면 viewport meta가 자동으로 포함된다. 새 HTML 파일을 만들면 viewport meta부터 확인하는 것을 체크리스트에 포함.
