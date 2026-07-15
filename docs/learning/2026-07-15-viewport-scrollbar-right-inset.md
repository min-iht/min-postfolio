# 뷰포트 스크롤바를 창 오른쪽 가장자리에서 1px 띄우기

- 날짜: 2026-07-15
- 맥락: Portfolio 전체 페이지의 스크롤바를 워크숍 슬라이드 스타일(6px, #ccc 테두리 필)로 통일하는 작업. `css/style.css`(전 페이지 공유)와 `pdf_brand.html`(인라인 CSS)에 페이지 스크롤바 규칙 추가.
- 태그: css, webkit-scrollbar, viewport, box-shadow, pixel-verification

## 문제

`works.css`의 슬라이드 스크롤바(`border: #ccc solid 0.1px` 아웃라인 필)를 페이지 스크롤바에 그대로 옮기면, 썸의 오른쪽 테두리 선이 창 맨 끝 픽셀에 딱 붙는다. 요소 안의 스크롤 상자와 달리 뷰포트 스크롤바는 "오른쪽 여백"을 줄 표준 속성이 없고, 어떤 CSS 박스가 스크롤바 위치에 영향을 주는지가 자명하지 않았다.

## 시도한 것들 (실패 포함)

1. `html { border-right: 1px solid transparent }` — 스크롤바는 border box 안쪽(테두리와 패딩 사이)에 그려진다는 스펙을 근거로 시도. 레이아웃 공간(clientWidth)은 1px 줄었지만, 스크린샷 픽셀 샘플링 결과 썸의 오른쪽 테두리(#ccc=204)가 여전히 마지막 픽셀 열에 있었다 → **뷰포트 스크롤바는 루트 요소의 border를 무시하고 항상 창 가장자리에 그려진다**는 가설 확정, 루트 박스 조작 계열 전부 배제.
2. 썸의 `border-right`만 투명 1px로 늘리는 안 — 테두리 필 자체가 border로 그려져 있어서 오른쪽 선이 사라짐. border 한 겹으로는 "보이는 선 + 그 바깥 여백"을 동시에 만들 수 없음을 확인.

## 통한 접근법

스크롤바 폭을 7px로 잡고, 썸의 오른쪽 1px을 투명 border로 비운 뒤, 테두리 링은 inset box-shadow로 그린다:

```css
html::-webkit-scrollbar { width: 7px; }
html::-webkit-scrollbar-thumb {
    border-radius: 2px;
    border-right: 1px solid transparent;
    box-shadow: inset 0 0 0 1px #ccc;
}
```

통한 이유: inset box-shadow는 **padding box에 클리핑**되므로, 투명 border-right가 차지한 1px 안쪽에만 링이 그려진다. 결과적으로 보이는 막대는 6px + 오른쪽 여백 1px. 스크린샷 픽셀 값으로 `…204(테두리)…255(여백)` 배치를 확인했다.

## 일반화된 교훈

1. 뷰포트(페이지) 스크롤바의 위치를 옮기고 싶으면 루트 요소의 border/margin/padding부터 시도하지 마라 — 뷰포트 스크롤바는 항상 창 가장자리에 그려진다. 여백은 스크롤바 폭 안에서 thumb의 투명 border + inset box-shadow 조합으로 만든다.
2. border로 그린 아웃라인에 한쪽 여백이 필요해지면 border 조작을 포기하고 inset box-shadow(padding box 클리핑)로 갈아타라 — border는 "선"과 "여백" 역할을 동시에 못 한다.
3. 1px 단위 CSS 검증은 눈이나 통짜 스크린샷으로 하지 마라 — 스크린샷을 Pillow로 열어 가장자리 픽셀 값을 직접 샘플링하면 "여백이 생겼는지/테두리가 잘렸는지"가 숫자로 판정된다. dpr(1.3125 같은 배율) 때문에 CSS px와 스크린샷 px가 다르다는 것도 함께 기억.

## 재발 방지 (선택)

`css/style.css`의 페이지 스크롤바 규칙 주석에 "왜 works.css처럼 border로 그리지 않는지"를 남겨서, 나중에 works.css와 통일한다며 border 방식으로 되돌리는 실수를 막았다.
