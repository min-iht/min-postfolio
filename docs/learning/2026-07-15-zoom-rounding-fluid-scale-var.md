# zoom 배율의 요소별 반올림 어긋남 — CSS 변수 유동 배율(--u)로 교체

- 날짜: 2026-07-15
- 맥락: index.html 우편함(언어 선택 봉투 3개)이 모바일에서 위(li 배경 upper.webp)와 아래(.bottom img bottom.webp) 그래픽이 딱 안 맞는 버그 + "데스크톱→태블릿에서 수식으로 자연스럽게 축소" 요청. `css/lang.css` 전면 수정.
- 태그: css, zoom, custom-property, calc, scrollbar-gutter, 100vw

## 문제

모바일(`zoom: 0.87`)에서 우편함 상단 그래픽(li의 background)과 하단 앞판(`.bottom img`)의 이음새가 어긋났다. 두 그래픽은 디자인 y=151에서 맞닿는 butt-joint 구조라 1px만 밀려도 흰 줄이 보인다. 원인이 자명하지 않았던 이유: CSS 값은 전부 정합(padding-top 151 = bg 83+68)인데 화면만 어긋났다.

## 시도한 것들 (실패 포함)

1. 스크린샷 육안 판독 → 브라우저 페인 스크린샷이 자체 스케일링돼서 픽셀 판정 불가. **기하 검증은 JS 실측(getBoundingClientRect/offsetWidth)으로 전환** — 이게 결정적이었다.
2. JS 실측으로 zoom 상태를 재보니: li 배경·`.bottom img`는 실효 배율 0.870인데 **크기 미지정 `<img>`(봉투)는 0.8757** — `zoom`은 요소마다 따로 반올림해서 같은 배율이 보장되지 않는다는 가설 확정. zoom 값을 미세 조정하는 계열 전부 배제.
3. 교체 후 1440/1024/768/375에서 검증하고 끝냈다가, 교차 리뷰에서 **1025~1336px 구간 누락 버그** 발견: `--u`가 100vw 기준인데 style.css의 `scrollbar-gutter: stable`이 7px 거터를 예약해 body가 100vw보다 좁아짐 → wrap이 body보다 넓어져 `margin: 0 auto`가 0으로 붕괴(왼쪽 붙음 + 오른쪽 7px 잘림). min/max 검증 폭 사이의 "중간 구간"을 안 본 것이 원인.

## 통한 접근법

`zoom`을 버리고 **길이형 CSS 변수 하나를 공통 단위로** 사용:

```css
.postbox_wrap { --u: min(1px, calc(100vw / 1330)); }   /* 데스크톱: 1330px 기준 */
@media (max-width: 767px) {
  .postbox_wrap { --u: min(0.94px, calc(100vw / 430)); } /* 모바일: 430px 기준 */
}
/* 모든 치수를 calc(N * var(--u))로 — N은 디자인 원본 px 그대로 */
```

통한 이유: 모든 요소가 **같은 하나의 길이 값**에서 파생되므로 요소별 반올림 편차가 사라진다. `min()` 캡 덕에 기준 폭 이상에선 `--u = 1px`이라 기존 px 값과 100% 동일(무손실 전환). 배율 축소 시 크기가 고정되는 것들은 명시 필수: background-size, `<img>` width, transform 거리, font-size. 추가 보험으로 앞판과 같은 이미지를 li 배경 겹으로도 깔아, 남을 수 있는 서브픽셀 틈에 흰 바탕 대신 같은 그림이 비치게 했다. 100vw-거터 충돌은 해당 페이지가 스크롤바를 절대 안 보이므로 `scrollbar-gutter: auto`로 해제해 100vw == body를 복원.

## 일반화된 교훈

1. **배율 축소에서 맞닿은 그래픽이 어긋나면 `zoom`부터 의심하라.** zoom은 배경/자식/크기 미지정 img를 각각 따로 반올림한다. 해법은 길이형 변수(`--u: min(1px, calc(100vw / 기준폭))`) + `calc(N * var(--u))` 전면 적용.
2. **100vw 기반 수식을 쓰기 전에 `scrollbar-gutter`/스크롤바가 body 폭을 줄이는지 확인하라.** 100vw는 거터·스크롤바를 빼지 않는다. "컨테이너가 왼쪽에 붙고 오른쪽이 살짝 잘린다"가 그 증상이다.
3. **반응형 검증은 대표 폭만이 아니라 캡 경계 사이의 중간 구간(예: 1024 초과~기준 폭 미만)을 반드시 포함하라.** min()/미디어쿼리 캡이 걸린 양끝만 보면 그 사이 구간의 버그를 놓친다.
4. **1px 단위 기하 검증은 스크린샷 육안이 아니라 JS 실측으로.** 브라우저 페인 스크린샷은 스케일링될 수 있다 — getBoundingClientRect(페인트 포함)와 offsetWidth(레이아웃만, transform 무시)를 구분해 쓰면 애니메이션(rotate wiggle) 중인 요소도 정확히 잰다.

## 재발 방지 (선택)

`css/lang.css`의 --u 블록 주석에 "zoom이 왜 안 되는지"와 "--u 조절점"을 남겼고, `scrollbar-gutter: auto` 해제 규칙에 100vw 충돌 사유를 명시해 나중에 stable로 되돌리는 실수를 막았다.
