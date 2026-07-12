# GSAP 무대의 반응형 축소 — CSS scale + JS 역보정 얽힘 대신 JS 단일 배율 함수

- 날짜: 2026-07-12
- 맥락: Portfolio 히어로(min.postfolio-ko.html)의 봉투·엽서·편지지를 모바일에 맞추는 작업. js/hero.js, css/responsive.css
- 태그: gsap, transform, responsive, scale, transform-origin

## 문제

히어로의 봉투와 편지지(720px)는 같은 GSAP 무대(.envelope_stage) 위에 있어서,
모바일에서 "봉투는 데스크톱 크기 그대로, 편지지만 화면 안에"를 만들기가 어려웠다.
CSS transform은 무대 전체에 걸리는데, hero.js의 애니메이션 좌표(봉투 비행, 엽서 확대 배율)는
화면 픽셀 기준이라 CSS 배율이 바뀔 때마다 JS 쪽 계산이 어긋난다.

## 시도한 것들 (실패 포함)

1. (이전 세션) 무대를 CSS로 scale(1.5) 확대 + 편지지만 scale(0.3333) 역보정, hero.js가
   `gsap.getProperty(..., "scaleX")`와 `getBoundingClientRect` 비율로 모든 좌표를 나눠 보정
   → 동작은 했지만 CSS 두 곳과 JS 세 곳이 짝으로 묶여, 한 곳만 고치면 깨지는 구조가 됐다.
   "배율의 진실 원천"이 CSS와 JS에 분산된 것이 근본 문제임을 배제·확인.
2. 반응형 폭마다 미디어쿼리로 고정 scale 값을 두는 방안 검토
   → 좌우 여백을 상단 바 텍스트 시작선(20px)과 "모든 폭에서" 맞추려면
   scale이 (100vw - 40px) / 720 처럼 연속적이어야 해서 고정값으로는 불가. 기각.

## 통한 접근법

배율 계산을 JS 한 곳(`postcardScale()`)으로 모았다:

```js
const POSTCARD_SIDE_MARGIN = 20; // 상단 바 --rsp_pad와 맞춘 값
function postcardScale() {
    return Math.min(1, (window.innerWidth - POSTCARD_SIDE_MARGIN * 2) / 720);
}
```

- `gsap.set(".hero_postcard, .shadow", { scale: postcardScale() })`로 초기 적용
- 타임라인의 관련 값(엽서 확대 배율, 떠오름 이동량)은 함수값으로 같은 배율을 곱함
- `Math.min(1, …)` 덕분에 넓은 화면(≥760px)에서는 자동으로 배율 1 → 미디어쿼리 불필요

이게 통한 결정적 이유 두 가지:
- **transform-origin이 중앙**이라 편지지를 축소해도 중심 좌표가 변하지 않는다.
  → 엽서가 날아가 겹치는 도착 지점(x:4, y:63)을 재계산할 필요가 없고, 최종 scale에만 배율을 곱하면 된다.
- 배율의 진실 원천이 함수 하나뿐이라 CSS와 JS가 어긋날 수 없다.

## 일반화된 교훈

1. "CSS의 scale 값과 JS 애니메이션 좌표가 서로를 참조해서 보정한다"는 구조가 보이면,
   배율 계산을 JS 함수 하나로 모으고 CSS에서는 transform을 제거하는 리팩터링부터 검토하라.
2. 요소 크기를 뷰포트에 연속적으로 맞춰야 하면(여백 N px 유지) 미디어쿼리 고정값 대신
   `Math.min(1, (innerWidth - 여백*2) / 원본폭)` 패턴을 쓰라 — 브레이크포인트 경계 점프도 사라진다.
3. GSAP에서 scale이 걸린 요소로 다른 요소를 날려 겹칠 때, 두 요소의 transform-origin이
   모두 중앙이면 도착 x/y는 그대로 두고 도착 scale에만 배율을 곱하면 정확히 겹친다.

## 재발 방지 (선택)

css/responsive.css의 두 Hero 주석 블록에 "scale을 다시 넣지 말 것, 화면 맞춤은
hero.js의 postcardScale() 담당"을 명시해 두었다.
