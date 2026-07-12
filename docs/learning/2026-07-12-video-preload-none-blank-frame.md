# contact 팝업 video가 재생 전까지 빈 화면으로 보이는 문제

- 날짜: 2026-07-12
- 맥락: Portfolio `min.postfolio-ko.html`의 contact 팝업(`.pp_con_video`). 팝업을 열면 재생 버튼만 보이고 비디오 첫 프레임이 안 보임. 검증은 브라우저 pane + `js/popup.js`의 GSAP 팝업 애니메이션 환경.
- 태그: video, preload, gsap, requestAnimationFrame, headless-verification

## 문제

contact 팝업을 열었을 때 비디오 영역이 비어 있고 재생 버튼만 떠 있었다. 재생 버튼을 누르면 그제야 비디오가 나타났다. CSS(`visibility`/`opacity`)나 JS 로직 문제처럼 보였지만 실제로는 `<video preload="none">` 때문에 브라우저가 비디오 데이터를 한 바이트도 받아오지 않아 그릴 첫 프레임 자체가 없었던 것.

## 시도한 것들 (실패 포함)

1. popup.js의 `resetConVideo()`·CSS의 `.pp_con_video` 규칙을 의심하고 검토 → 비디오를 숨기는 코드는 없음. CSS/JS 가설 배제.
2. 검증 중 브라우저 pane에서 `.contact`를 프로그래매틱 클릭해도 팝업 opacity가 0에 머묾 → 수정이 안 통한 줄 알았으나, `gsap.getTweensOf(overlay)`가 1을 반환하는데 인라인 스타일이 없음을 발견. pane이 백그라운드라 requestAnimationFrame이 멈춰 GSAP 트윈이 영원히 진행되지 않는 **검증 환경 함정**이었다 (스크린샷 타임아웃도 같은 원인).

## 통한 접근법

- 본 수정: `<video src="..." preload="none">` → `preload="metadata"`. Chrome은 metadata 프리로드 시 첫 프레임까지 디코딩해 표시한다(readyState 4 확인). 팝업은 초기 hidden 상태라 페이지 로드 비용 증가는 미미.
- 검증 우회: rAF가 멈춘 pane에서는 `gsap.getTweensOf(el).forEach(t => t.progress(1))`로 트윈을 강제 완료시킨 뒤 computed style을 검사. 비디오 프레임 존재는 canvas에 `drawImage` 후 평균 휘도(131, 전부 검정 아님)로 확인.

## 일반화된 교훈

1. "video가 재생 전까지 안 보인다" 증상이면 CSS보다 먼저 `preload` 속성부터 확인하라. `preload="none"` + poster 없음 = 빈 화면이 정상 동작이다.
2. 백그라운드 브라우저 pane에서 GSAP/rAF 기반 애니메이션은 진행되지 않는다. "트윈은 살아 있는데(getTweensOf > 0) 스타일이 안 바뀐다"가 보이면 코드 버그가 아니라 rAF 정지를 의심하고, `tween.progress(1)`로 강제 완료 후 상태를 검사하라.
3. 스크린샷이 타임아웃되는 pane에서는 canvas `drawImage` + 픽셀 휘도 검사로 "화면에 뭔가 그려지는가"를 텍스트로 증명할 수 있다.
