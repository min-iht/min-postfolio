# hidden 상태 브라우저 탭에서는 rAF가 멈춰 GSAP 검증이 불가능하다

- 날짜: 2026-07-12
- 맥락: min.postfolio-en/jp.html 스모크 테스트 중. Skip 클릭 후 8초를 기다려도 `is_locked`가 안 풀리고, 스크린샷은 30초 타임아웃이 반복됐다.
- 태그: requestAnimationFrame, gsap, headless, visibility, smoke-test

## 문제

히어로 Skip을 눌러도 스크롤 잠금이 영영 안 풀렸다. 코드 버그처럼 보였지만 ko 원본은 배포되어 잘 돌던 코드였고, 번역 작업은 텍스트만 바꿨다. 스크린샷 도구도 같이 실패하고 있다는 점이 단서였다.

## 시도한 것들 (실패 포함)

1. 스크린샷 재시도 (2회) → 동일 타임아웃. 도구 일시 장애 가설 배제 (M8 규칙에 따라 재시도 중단).
2. 페이지 리로드 후 클린 상태에서 Skip 재실행 → 여전히 잠김. "테스트 순서가 꼬였다" 가설 배제.
3. hero.js 정독 → Skip은 `tl.play()`로 GSAP 타임라인을 재생하고 완료 콜백에서 잠금 해제. 타임라인이 "진행 자체를 못 하는" 가능성 부상.
4. `document.visibilityState`와 `gsap.ticker.frame`을 1초 간격으로 샘플링 → `visibility: "hidden"`, frame이 0에서 고정. **원인 확정**: 탭이 백그라운드라 requestAnimationFrame이 한 번도 발화하지 않음. `tabs_select`로 fronting해도 패널 자체가 사용자 화면에 없으면 hidden 유지.

## 통한 접근법

rAF 없이 동기적으로 도달 가능한 경로로 검증을 대체했다: `sessionStorage.setItem('heroDone','1')` 후 리로드하면 hero.js가 `tl.progress(1)` + `unlockScroll()`을 동기 실행해 최종 상태로 점프한다. 이후 텍스트·상태 검증은 javascript_tool(DOM 질의), 레이아웃 검증은 `resize_window` + `scrollWidth` 비교로 수행 — 레이아웃 계산은 hidden 탭에서도 정상 동작한다. 애니메이션 의존 항목(닫힘 전환 등)은 "미확인"으로 정직하게 보고.

## 일반화된 교훈

1. **애니메이션 완료 콜백이 안 오고 스크린샷도 같이 실패하면, 코드보다 먼저 `document.visibilityState`와 `gsap.ticker.frame`(또는 rAF 카운터)을 확인하라.** hidden 탭에서 rAF 기반 라이브러리는 전부 멈춘다.
2. hidden 탭에서도 살아있는 것: DOM 조작, 이벤트 디스패치, 레이아웃 계산(getBoundingClientRect/scrollWidth), setTimeout. 죽는 것: rAF, 트랜지션/GSAP 진행, 렌더링 캡처. 검증 계획을 이 경계에 맞춰 짜라.
3. 애니메이션 끝에서만 도달하는 상태를 테스트해야 한다면, **동기 점프 경로(`timeline.progress(1)` 류)가 코드에 이미 있는지** 먼저 찾아라 — 이 프로젝트의 heroDone 복원 경로가 정확히 그 용도다.

## 재발 방지 (선택)

- /smoke-test 스킬 준비 절차에 "visibilityState가 hidden이면 heroDone 동기 복원 경로로 전환 + 애니메이션 항목은 미확인으로 보고" 지침 추가 완료.
