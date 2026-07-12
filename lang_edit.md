# 언어별 편집 가이드 (lang_edit.md)

en/jp 페이지의 **번역 문구, 줄바꿈(`<br>`), 언어별 여백**을 직접 수정하는 방법.
2026-07-12 기준. 대상 파일 3개는 모두 프로젝트 루트에 있다:

| 파일 | 언어 | `<html lang>` 값 |
|---|---|---|
| `min.postfolio-ko.html` | 한국어 — **정본(원문)** | `ko` |
| `min.postfolio-en.html` | 영어 — 번역 파생본 | `en` |
| `min.postfolio-jp.html` | 일본어 — 번역 파생본 | `ja` ⚠️ jp가 아니라 **ja** |

---

## 0. 큰 그림 — 무엇이 자유이고 무엇이 금지인가

세 파일은 "구조(태그·class·data-* 순서)는 동일, 텍스트만 각 언어"가 원칙이다.
공유 JS(슬라이드 열기/닫기 등)가 세 파일이 같은 구조라는 전제로 동작하기 때문.
구조가 같은지는 검사 도구(아래 4단계)로 언제든 확인할 수 있다.

| 하고 싶은 것 | 되나? | 방법 |
|---|---|---|
| en/jp 번역 문장 고치기 | ✅ 자유 | 1단계 |
| en/jp에서 `<br>` 넣기/빼기 | ✅ 자유 (2026-07-12부터) | 2단계 |
| en/jp에만 여백·자간·줄간격 조정 | ✅ 자유 | 3단계 — `css/lang_tune.css` |
| class, id, `data-*` 속성 변경 | ❌ 금지 | 공유 JS가 깨진다 |
| `<br>` 외의 태그 추가/삭제 (`<p>`, `<span>` 등) | ❌ 금지 | 구조가 어긋난다 — Claude에게 요청 |
| 공유 CSS(`css/works.css` 등)에서 여백 고치기 | ⚠️ 주의 | ko에도 같이 적용됨. 세 언어 모두 바꾸려는 의도일 때만 |
| ko(정본) 내용 고치기 | ⚠️ 주의 | 고치면 en/jp에도 번역 반영 필요 — Claude에게 맡기는 걸 권장 |

---

## 1단계. 번역 문구 고치기

텍스트는 검사가 아예 보지 않는다. 태그 **안쪽 글자만** 바꾸면 무엇이든 자유.

1. `min.postfolio-en.html`(또는 `-jp`)을 에디터로 연다.
2. `Ctrl+F`로 고치고 싶은 문장을 검색한다.
   - 본문 섹션(hero/works/workshop/cv/info)과, 파일 **맨 아래**
     `<div class="slide_data">` 안(노트·워크숍 상세 슬라이드의 글) 두 곳에 텍스트가 있다.
3. 태그 사이의 글자만 교체한다.

```html
<!-- 이렇게: 글자만 바꾼다 -->
<p class="note_text">Old sentence here.</p>
<p class="note_text">New sentence here.</p>

<!-- 이건 금지: class를 바꾸거나 태그를 지우면 안 된다 -->
<p class="note_text_v2">...</p>   ❌
<div>...</div>                     ❌ (p를 div로 변경)
```

> 워크숍 **목록 카드**(제목/날짜/장소/태그)의 글은 HTML이 아니라
> `js/workshop.js`의 `WORKSHOPS` 배열에 있다. 각 항목이 `{ ko: "...", en: "...", jp: "..." }`
> 형태라, 해당 언어 값만 따옴표 안에서 고치면 된다.

## 2단계. `<br>` 넣고 빼기

`<br>`은 조판(줄바꿈)용이라 언어마다 달라지는 게 자연스럽다.
2026-07-12부터 구조 검사에서 제외됐으므로 **en/jp에서 자유롭게 추가·삭제해도 된다.**
ko와 개수·위치가 달라져도 PASS.

```html
<!-- 한국어 기준 줄바꿈이 영어에서 어색하면 -->
<p class="note_text">A sentence that<br>breaks awkwardly.</p>
<!-- br을 지워도 되고 -->
<p class="note_text">A sentence that breaks awkwardly.</p>
<!-- 다른 위치로 옮겨도 된다 -->
<p class="note_text">A sentence<br>that breaks nicely.</p>
```

## 3단계. 언어별 여백·자간·줄간격 — `css/lang_tune.css`

HTML이 아니라 **CSS 한 파일**에서 조정한다. 공유 CSS를 건드리면 ko도 같이 바뀌지만,
`css/lang_tune.css`에 `html[lang="..."]`을 앞에 붙여 쓰면 그 언어 페이지에서만 적용된다.

**3-1. 고칠 요소의 클래스 이름 찾기**

1. 브라우저에서 페이지를 연다 (아래 "미리보기" 참고).
2. 여백을 바꾸고 싶은 부분에서 **우클릭 → 검사**(개발자 도구).
3. 파란색으로 선택된 요소의 `class="..."` 값을 확인한다. 예: `note_text`.

**3-2. `css/lang_tune.css`에 규칙 추가**

파일 안에 언어별 구역(★ 표시)이 나뉘어 있다. 해당 구역에 이렇게 쓴다:

```css
/* 영어 페이지에서만: 문단 아래 여백을 24px로 */
html[lang="en"] .note_text {
    margin-bottom: 24px;
}

/* 일본어 페이지에서만: 줄간격을 넉넉하게 */
html[lang="ja"] .note_text {
    line-height: 1.9;
}

/* 영어·일본어 둘 다 같은 값이면 쉼표로 묶는다 */
html[lang="en"] .note_text,
html[lang="ja"] .note_text {
    letter-spacing: 0.01em;
}
```

자주 쓰는 속성:

| 속성 | 뜻 | 예 |
|---|---|---|
| `margin-top` / `margin-bottom` | 요소 바깥 위/아래 여백 | `margin-bottom: 24px;` |
| `padding-top` / `padding-bottom` | 요소 안쪽 위/아래 여백 | `padding-top: 8px;` |
| `line-height` | 줄간격 (숫자만 = 글자크기의 배수) | `line-height: 1.7;` |
| `letter-spacing` | 자간 | `letter-spacing: 0.02em;` |
| `font-size` | 글자 크기 | `font-size: 15px;` |

**지켜야 할 것 2가지:**
- `!important`를 쓰지 않는다 (이 사이트의 캐스케이드 설계를 깨뜨림 — responsive.css 전용).
- 일본어는 `html[lang="jp"]`가 아니라 **`html[lang="ja"]`**.

**3-3. 모바일에서만 값이 달라야 하면**

lang_tune.css 맨 아래 "모바일 구역"의 미디어쿼리 안에 쓴다:

```css
@media (max-width: 767px) {
    html[lang="en"] .note_text {
        margin-bottom: 16px;
    }
}
```

## 4단계. 수정 후 확인

**4-1. 미리보기 (브라우저에서 보기)**

프로젝트 폴더에서 터미널(PowerShell)을 열고:

```
python -m http.server 8123
```

브라우저에서 `http://localhost:8123/min.postfolio-en.html` 접속.
수정이 반영 안 된 것처럼 보이면 **Ctrl+F5** (캐시 무시 새로고침).
파일을 더블클릭해서 여는 것(`file://`)은 일부 기능이 안 돌아가니 꼭 서버로.

**4-2. 구조 검사 (HTML을 고쳤을 때만 — CSS만 고쳤으면 생략 가능)**

```
python .claude/tools/check_lang_sync.py report.txt
```

실행 후 `report.txt`를 열어 마지막 줄이 `RESULT: PASS`면 안전.
`FAIL`이면 그 위에 어긋난 지점이 `#번호: ko쪽 <-> en쪽` 형식으로 최대 10개 표시된다 —
대부분 태그나 class를 실수로 지운/바꾼 자리다. 해당 부분을 되돌리면 된다.
원인을 못 찾겠으면 report.txt 내용을 Claude에게 보여주면 된다.

**4-3. 커밋**

직접 커밋해도 되고, 다음 Claude 세션에서 "커밋해줘"라고 해도 된다.

---

## 자주 묻는 것

- **en만 고치고 jp는 안 고쳐도 되나?** — 된다. en/jp는 서로 독립이다. 번역·조판 차이는 자유.
- **ko를 고치면?** — ko는 정본이라 en/jp에도 같은 변경(번역)이 들어가야 한다.
  직접 세 벌을 고쳐도 되지만, Claude에게 "ko의 ○○ 고치고 en/jp 동기화해줘"라고 맡기는 게 안전하다.
- **내가 고친 en/jp 문구를 Claude가 덮어쓰지 않나?** — 안 덮는다. en/jp의 번역 문구·`<br>`·
  lang_tune.css는 "사용자 직접 편집 구역"으로 CLAUDE.md에 등록돼 있다 (관례 11).
- **여백을 세 언어 모두 바꾸고 싶으면?** — 그건 언어별 조정이 아니므로 lang_tune.css가 아니라
  해당 섹션 CSS(works.css, workshop.css 등)에서 고친다. 어느 파일인지는
  `css/style.css` 상단의 "스타일 수정 위치 가이드" 주석 참고.
