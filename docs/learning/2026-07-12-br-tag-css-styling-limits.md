# 모바일에서 <br> 줄바꿈만 끄고 단락 간격은 유지하기 — br 스타일링의 두 가지 함정

- 날짜: 2026-07-12
- 맥락: Portfolio `min.postfolio-ko.html`의 #works 정보 카드(.info_desc 등). 데스크톱용 수동 `<br>` 줄바꿈을 모바일(≤767)에서 해제하되, `<br><br>` 빈 줄로 나눈 단락 구분은 유지하려 했다. 스타일은 `css/responsive.css` 모바일 블록.
- 태그: css, br, adjacent-sibling-selector, chrome, responsive

## 문제

모바일 좁은 폭에서 데스크톱 기준으로 넣은 `<br>`이 문장 중간을 어색하게 끊는다. 전부 `display: none` 하면 자연 줄바꿈은 되지만, 보따리·음반 카드처럼 `<br><br>`(빈 줄)로 단락을 나눈 곳의 간격까지 사라진다. "단락용 br만 살리기"가 CSS만으로는 자명하지 않았다.

## 시도한 것들 (실패 포함)

1. `br { display: none }` + `br + br { display: block; margin-top: 12px }` → computed style은 의도대로 나왔지만, `br + br`이 **연속 br이 아닌 것까지** 매칭했다. 인접 형제 결합자(`+`)는 사이의 텍스트 노드를 무시하므로 `<br>텍스트<br>`의 두 번째 br도 매칭된다. 단락 구분이 아닌 일반 br들이 전부 살아나서 역효과.
2. 단락용 br에만 클래스를 붙여 `br.br_gap { display: block; content: " "; margin-top: 12px }` → computed display는 block으로 나오지만 **렌더링에는 margin/height가 전혀 반영 안 됨**. 라인 박스 지오메트리로 측정해 확인(줄 간격이 전부 동일). Chrome은 br 요소의 박스 스타일링(display:block, margin, height, content)을 무시한다. `display: none`만 동작한다.
3. 둘째 단락 전체를 `<span class="info_para">`로 감싸고 모바일에서만 `display: block; margin-top: 12px` → 성공.

## 통한 접근법

단락 텍스트(내부의 br 포함)를 span으로 감싼다. 데스크톱에서는 span이 기본 inline이라 렌더링이 바이트 단위로 동일하고, 모바일 블록에서만 block으로 세워 단락 간격을 margin으로 준다. 내부 br은 일반 규칙(`display: none`)에 같이 걸려 자연 줄바꿈이 된다.

```html
텍스트 단락1
<br>
<span class="info_para"><br>텍스트 단락2 …</span>
```

```css
/* responsive.css ≤767 블록 */
.info_desc br { display: none; }
.info_desc .info_para { display: block; margin-top: 12px; }
```

검증은 computed style만 믿지 말고 Range의 getClientRects/getBoundingClientRect로 실제 줄 위치·간격을 측정했다 — 2번 시도가 "computed는 block인데 렌더링은 무시"였기 때문에 이 측정이 결정적이었다.

## 일반화된 교훈

1. `A + B` 인접 형제 선택자는 **요소** 형제만 본다 — 사이에 텍스트가 있어도 매칭된다. "연속된 br"을 선택자로 구분하려는 시도는 성립하지 않는다.
2. `<br>`에는 `display: none` 외의 박스 스타일링(display:block, margin, height, content)이 Chrome에서 무시된다. br의 간격을 조절하고 싶으면 br이 아니라 **주변 요소를 감싸서** 스타일링하라.
3. computed style이 의도대로인데 화면이 안 바뀌는 것 같으면, Range/getClientRects로 실제 라인 지오메트리를 측정해 렌더링 반영 여부를 분리 검증하라. (스크린샷이 불가능한 환경에서도 유효한 검증법)

## 재발 방지 (선택)

반응형에서 br을 끄는 기존 패턴(`.cv_story br { display: none }`)에 단락 유지가 필요해지면 이 노트의 `info_para` 패턴을 그대로 쓰면 된다.
