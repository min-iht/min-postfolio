# Min's Postfolio — 운영 매뉴얼

이 문서는 이 저장소에서 작업하는 모델을 위한 운영 매뉴얼이다.
여기 적힌 규칙과 실제 코드가 다르면 **코드가 진실**이다 — 코드를 따르고, 이 문서의 갱신을 제안하라.

## 0. 프로젝트 정체

- 강민경(디자이너·워크숍 기획자)의 개인 포트폴리오. **정적 사이트, 빌드 도구 없음, 프레임워크 없음.** GitHub Pages 배포를 전제로 한다.
- 라이브러리는 전부 CDN: Swiper 11, GSAP 3 + ScrollTrigger, Lenis 1(관성 스크롤). npm/패키지 설치를 시도하지 마라.
- 페이지 5개:
  - `index.html` — 언어 선택 랜딩 (한/영/일 봉투)
  - `min.postfolio-ko.html` — 본편 원페이지 (hero → works → workshop → cv → info). **정본(원문).**
  - `min.postfolio-en.html` / `min.postfolio-jp.html` — ko의 번역 파생본 (2026-07-12 생성). **구조는 ko와 동일**하고 텍스트만 각 언어. `<html lang>`이 각각 `en` / `ja`. 예외: 조판용 `<br>`은 언어별로 위치·개수가 달라도 된다 (2026-07-12 A안 — 검사 도구도 `<br>`을 지문에서 제외).
  - `pdf_brand.html` — PDF 이미지 나열 뷰어
- **다국어 동기화 규칙**: ko를 고치면 같은 세션에서 en/jp에도 반영한다 (스타일·동작은 CSS/JS 공유라 자동, HTML 텍스트·구조만 3벌). 번역은 사용자가 따로 주지 않으면 Claude가 자연스럽게 생성한다 (2026-07-12 사용자 합의). 구조를 바꿨으면 `python .claude/tools/check_lang_sync.py <리포트경로>`로 세 파일 구조 지문 PASS 확인.
- 개발 서버: `.claude/launch.json`의 `portfolio` (python http.server, 기본 8123 + autoPort — 포트가 점유 중이면 자동 배정되니 preview_start가 알려주는 포트를 쓴다). 검증은 항상 이 서버 + 브라우저 미리보기로 한다.

## 1. 아키텍처 — 무엇이 어디에 사는가

| 바꾸려는 것 | 고치는 곳 |
|---|---|
| 노트/워크숍 상세 슬라이드의 탭·사진·글 | 각 언어 파일(`min.postfolio-ko/-en/-jp.html`) 맨 아래 `<div class="slide_data">` 안의 `note_data` / `ws_data` 블록 (HTML) — **세 파일 각각** |
| 워크숍 목록 카드 (제목/날짜/장소/태그/썸네일) | `js/workshop.js`의 `WORKSHOPS` 배열 (최신순, 맨 앞이 최신). 텍스트 필드는 `{ ko, en, jp }` 다국어 객체 — 한 파일에서 세 언어를 관리하고, 페이지의 `<html lang>`에 따라 `WS_LANG`이 자동 선택 |
| 섹션별 스타일 | 섹션당 CSS 1파일: hero / works / workshop / cv / info / popup / lang. 어디를 고칠지는 `css/style.css` 상단의 "스타일 수정 위치 가이드" 주석이 원장이다 |
| 태블릿(≤1024) / 모바일(≤767) | `css/responsive.css` + `js/responsive.js` 세트 |
| 언어별(en/jp 전용) 여백·자간·줄바꿈 조정 | `css/lang_tune.css` — `html[lang="en"]` / `html[lang="ja"]` 스코프 규칙. 사용자 직접 편집 허용 구역. 사용법은 루트의 `lang_edit.md` |
| 전역 z-index | `css/style.css` 상단 주석의 스케일이 원장: 1030+ 팝업·슬라이드, 900 고정 UI, 700 히어로 인트로, 10 봉투 무대, 섹션 내부는 1~99 로컬 |
| 스크롤 (관성/잠금/스파이) | `js/scroll.js` (Lenis 초기화, `window.lenis` 전역 공유) |

JS는 관심사별 1파일이고 모듈 시스템이 없다. 파일 간 공유는 `window.lenis` 같은 전역과 body 클래스 상태 머신으로 한다:
`is_locked`(히어로 재생 중) / `slide_locked`(노트·워크숍 슬라이드 열림) / `menu_open`(햄버거) / `page_fadein_loaded`.

**CSS 로드 순서는 기능이다** (min.postfolio-ko.html `<head>`):
style → hero → popup → **Swiper CDN CSS** → works → workshop → cv → info → **lang_tune** → **responsive(반드시 마지막)**.
Swiper CSS는 섹션 CSS보다 먼저(페이지네이션을 섹션 CSS가 덮어쓰기 위해), responsive.css는 같은 선택자를 나중에 로드해서 덮어쓰는 설계다. lang_tune.css는 섹션 CSS를 언어별로 덮어쓰되 responsive 직전에 로드한다 (단 `html[lang]` 선택자는 구체성이 높아 responsive의 일반 규칙을 이길 수 있음 — 모바일 언어별 값은 lang_tune 안의 미디어쿼리로).

## 2. 이 저장소의 관례

**사용자가 지키는 관례 — 그대로 유지하라:**

1. **한국어 튜토리얼 주석.** 모든 파일에 "왜 이렇게 했는지 + 어디를 고치면 되는지"를 설명하는 한국어 주석이 있고, `★`는 수정 포인트 표시다. 주석은 코드와 동급의 산출물이다. 새 코드에도 같은 밀도로 쓰고, 동작을 바꿨으면 주석도 같이 갱신하라.
2. **네이밍**: CSS 클래스는 snake_case(`note_panel`, `env_closed`), JS가 잡는 훅 클래스는 camelCase(`noteBtn`, `noteOverlay`, `leftUI`). data 속성으로 짝을 맺는다(`data-note`, `data-tab`, `data-ws`, `data-index`).
3. **널널한 포맷.** JS는 문장 사이 빈 줄이 많다. 취향이 아니라 스타일이다 — 압축하지 마라.
4. **이미지 정책** (2026-07-12 일괄 적용): 장축 2400px 캡 + WebP q85. 예외 — `img/favicon*.png`·`img/cursor/*.png`는 PNG 유지, `img/pdf/pdf_brand/*.jpg`는 JPEG 유지(폭 2000px, q85 progressive; 세로 16,383px 초과라 WebP 불가), `img/workshop/gallery1/review/*.PNG`는 원본 유지. 새 이미지는 `/optimize-images`로 처리.
5. **커밋은 요청 처리가 끝날 때마다** (2026-07-12 규칙 변경 — 이전: 사용자가 요청할 때만). 요청을 처리하고 나면 그 요청에서 수정·추가·변경한 파일만 커밋한다 — 변경하지 않은 파일은 포함하지 않는다. 제목 1줄(기존 스타일: 영어 명사구) + `Co-Authored-By: Claude` 라인. push는 여전히 사용자가 요청할 때만. `.omc/`와 `.claude/*`는 gitignore 처리되어 있다 (예외: `.claude/skills/`는 커밋 대상).
6. **학습 규칙(전역)**: 사소하지 않은 문제를 하나 풀 때마다 다음으로 넘어가기 전에 `extract-approach` 스킬을 실행한다. 학습 노트 없는 해결책은 미완성이다.

**이 매뉴얼이 추가하는 관례:**

7. 잠금(오버레이/메뉴)을 여닫는 코드는 항상 **body 클래스 + `lenis.stop()/start()` 쌍**으로 쓴다. 풀 때는 다른 잠금이 살아있는지 확인 — `js/responsive.js`의 `setMenu()`가 표준 패턴이다.
8. 문서 높이를 바꾸는 DOM 변경(요소 이동/추가/표시 전환) 뒤에는 `ScrollTrigger.refresh()`.
9. 데스크톱용 CSS에 `!important` 금지. responsive.css가 나중에 덮어써야 하기 때문이다 (`!important`는 responsive.css 안에서만 허용).
10. `.leftUI`와 fixed 요소의 조상에 `filter` / `backdrop-filter` / `transform` 금지 — fixed 자손의 위치 기준이 되어 레이아웃이 깨진다 (responsive.css 주석 참고).
11. **다국어 동기화** (2026-07-12): ko HTML의 텍스트·구조를 고쳤으면 같은 세션에서 en/jp에 동일 변경(텍스트는 번역)을 반영한다. 공유 JS에 사용자 가시 문구를 넣을 때는 하드코딩 금지 — `workshop.js`의 `WS_LANG`/`popup.js`의 `SUBS_MSG`처럼 `{ ko, en, jp }` 객체 + `<html lang>` 감지 패턴을 따른다. placeholder(`.`)는 세 파일 모두 `.` 그대로. 예외 2건: ① 조판용 `<br>`은 언어별로 자유 (동기화·검사 대상 아님), ② 언어별 여백·자간 차이는 HTML이 아니라 `css/lang_tune.css`에서. en/jp의 번역 문구·`<br>`·lang_tune.css는 **사용자가 직접 편집하는 구역**이다 — 다른 작업 중 발견해도 ko와 다르다고 "고치지" 마라.
12. **토큰 절약 모드** (2026-07-16): 사용자가 사용량 부족을 알리면 — 최소 도구 호출로 원인을 바로 겨냥하고(전 폭 재검증·멀티에이전트 리뷰 생략), 검증은 핵심 1~2개 실측으로 줄이고, 생략한 검증은 보고에 명시해 사용자 확인으로 대체한다.
13. **1920 시안 섹션의 노트북 폭 보정** (2026-07-16): 데스크톱 레이아웃은 1920px 시안 좌표를 그대로 쓰므로, 시안 px가 화면 오른쪽 끝 근처까지 가는 섹션은 1025~1919px(노트북)에서 잘린다. 이런 섹션에는 fluid zoom을 건다 — 표준 패턴은 works.css의 `@media (min-width: 1025px) and (max-width: 1919px) { zoom: min(1, tan(atan2(100vw, 1920px))) }` (cv/info의 고정 `zoom: 0.8`은 콘텐츠가 1536px 안에 끝나는 섹션용). 데스크톱 CSS를 만졌으면 1920 외에 **1440 폭에서도 잘림을 확인**한다.

## 3. 실수 도감 — 이름 붙인 함정과 막는 규칙

1. **JS에서 글 고치기** — 노트/워크숍 상세 내용을 works.js·workshop.js에서 찾으려 든다. 그 파일들은 복사·개폐 동작만 담당한다. → 상세 내용은 `slide_data`의 HTML 블록에서만, 목록 카드만 `WORKSHOPS` 배열에서.
2. **로드 순서 파괴** — 새 CSS `<link>`를 responsive.css 뒤나 Swiper CSS 앞에 끼운다. → 새 섹션 CSS는 info.css와 lang_tune.css 사이. lang_tune.css → responsive.css 순서는 고정, responsive.css는 영원히 마지막.
3. **z-index 즉흥 발급** — 안 보인다고 `z-index: 9999`를 박는다. → style.css 스케일 주석을 먼저 읽고, 새 층이 필요하면 값과 함께 그 주석에 등록하라.
4. **잠금 고아** — 오버레이를 열며 `lenis.stop()`만 하고 닫는 경로(ESC/바깥 클릭/버튼) 어딘가에서 `start()`를 빠뜨리거나, 다른 잠금이 살아있는데 무조건 `start()`한다. → 관례 7.
5. **refresh 생략** — DOM을 옮기고 ScrollTrigger가 옛 좌표로 발화한다. → 관례 8.
6. **문구 창작** — `note_text`의 placeholder(`.`)를 그럴듯한 포트폴리오 문구로 채운다. **이 사이트의 글은 사용자의 목소리다. 절대 대신 쓰지 마라.** placeholder를 유지하고 문구를 요청하라.
7. **주석 학살** — 리팩터링하며 한국어 주석을 지우거나 영어로 바꾸거나 빈 줄을 압축한다. → 관례 1, 3.
8. **짝 번호 깨기** — `data-note`/`data-tab`/`data-ws`/`data-index` 짝을 깬다. 특히 워크숍을 배열 맨 앞에 추가하고 기존 `ws_data`들의 `data-ws`를 +1씩 재번호하지 않는 실수. → `/add-work` 절차와 체크리스트를 따르라.
9. **원본 통째 커밋** — 24MB PNG를 그대로 img/에 넣는다. → 관례 4, `/optimize-images`.
10. **히어로 오판** — 새로고침했더니 인트로가 안 나온다고 버그로 착각한다. `sessionStorage.heroDone`이 있으면 인트로를 건너뛰는 게 정상이다. → 히어로 테스트는 시크릿 창 또는 `sessionStorage.clear()` 후. hero.js를 만졌으면 3경로(이름 입력 / Skip / 새로고침 복원)를 모두 확인.
11. **깨진 참조 청소** — 알려진 missing 이미지 5건(`img/cv/skill_figma.png`, `img/info/ongoing.png`, `img/info/upcoming1~3.png`)을 지우거나 임의 이미지로 "고친다". 이건 사용자가 아직 안 만든 자산이다. → 건드리지 말고, 관련 작업 시 언급만.
12. **!important 응급처치** — 반응형에서 안 먹는다고 데스크톱 CSS에 `!important`를 넣어 캐스케이드 설계를 부순다. → 관례 9. 원인은 대부분 로드 순서나 선택자 구체성이다.
13. **file:// 검증** — 서버 없이 파일을 직접 열어 "확인했다"고 한다. → 항상 `portfolio` 서버로 (기본 8123, 점유 시 autoPort 배정).
14. **언어 파일 반쪽 수정** — ko만 고치고 완료 선언하거나, en/jp 구조를 ko와 다르게 만든다 (공유 JS가 세 파일의 동일한 `slide_data` 구조·`data-ws` 번호에 의존한다). → 관례 11 + `.claude/tools/check_lang_sync.py` PASS 확인. 반영 못 한 파일이 있으면 보고에 명시.

## 4. 품질 기준 — 산출물별 체크 조건

완료 선언의 전제: **`portfolio` 서버로 브라우저에서 실제 확인 + console 에러 0.** "될 것이다"는 완료가 아니다.

**CSS 변경:**
- [ ] 1280 / 1024 / 375 세 폭에서 해당 영역 스크린샷 확인
- [ ] responsive.css가 마지막 로드 유지, 데스크톱 규칙에 새 `!important` 0건
- [ ] 새 z-index 값이 style.css 스케일 주석에 반영됨
- [ ] fixed 요소 조상에 filter/backdrop-filter/transform 추가 0건
- [ ] 가로 스크롤 없음, `.leftUI`와 콘텐츠 겹침 없음

**JS 변경:**
- [ ] 페이지 로드 + 변경한 기능 실행 후 console 에러 0
- [ ] 여닫는 기능이면 전 경로 확인: 버튼, ESC, 바깥 클릭 (+ 팝업·슬라이드 중첩 시 ESC가 위 것만 닫는지)
- [ ] `lenis.stop()`이 추가됐다면 모든 닫힘 경로에 대칭 `start()` 존재, 다른 잠금 클래스와 공존 확인
- [ ] 문서 높이가 바뀌는 경로에 `ScrollTrigger.refresh()` 존재
- [ ] hero.js를 만졌으면: 이름 입력 / Skip / heroDone 새로고침 복원 3경로 통과

**콘텐츠 추가 (노트/워크숍) — `/add-work` 사용:**
- [ ] data-* 짝 전수 일치 (버튼 `data-note` == 블록 `data-note`; `data-ws`는 0부터 연속이고 WORKSHOPS 배열 순서와 일치 — **세 언어 파일 모두**)
- [ ] 탭 버튼의 `data-tab`이 0부터 연속, 갤러리 슬라이드의 `data-tab` 집합과 일치
- [ ] 새 이미지 전부 이미지 정책 통과
- [ ] 실제로 열어서: 탭 전환, 스와이프, 자동재생, 닫기(3경로) 확인
- [ ] 본문 글은 사용자가 준 문구 그대로 (창작 0자 — 한국어 원문 기준. en/jp는 그 원문의 번역만 허용)
- [ ] ko/en/jp 세 파일에 모두 반영 + `check_lang_sync.py` 구조 지문 PASS

**이미지 추가 — `/optimize-images` 사용:**
- [ ] 정책 표 준수 (기본 2400px WebP q85 / 예외 3종)
- [ ] 변환 후 파일 크기 보고, 사진 1장 300KB 초과 시 사유 명시
- [ ] HTML의 `<img>`에 `loading="lazy" decoding="async"` (첫 화면 제외)

**커밋:**
- [ ] 요청 처리가 끝난 뒤 실행 — 그 요청에서 수정·추가·변경한 파일만 포함 (변경 없는 파일 0건)
- [ ] 제목 1줄 + Co-Authored-By 라인, 작업 외 파일 미포함
- [ ] push는 하지 않음 (사용자가 명시적으로 요청할 때만)

## 5. 불확실할 때 — 에스컬레이션 규칙

형식: 상황 → 행동. "적당히 판단"은 없다.

1. **시각 디자인 취향이 갈릴 때** (색, 간격, 모션 속도, 이징의 "느낌") → 기존 값 체계에서 유추 가능하면 유추해서 진행하고 보고에 명시. 유추 불가능한 새 결정이면 한 안으로 구현하되 완료 보고에 스크린샷과 대안을 함께 제시. 사용자 확인 전에는 "확정"이라고 말하지 않는다.
2. **포트폴리오 본문 문구가 필요할 때** → 생성 금지. placeholder 유지 + 필요한 문구 목록을 정리해 요청.
3. **파일 삭제, git 이력 변경, 이미지 원본 덮어쓰기** → 실행 전 반드시 사용자 확인. (원본 이미지는 사용자가 별도 보관 중인 `Portfolio_originals_backup.bundle` 사본에만 보존되어 있음 — 2026-07-12에 옛 히스토리와 로컬 번들을 정리해 저장소에는 원본이 없다. 복구는 사용자에게 번들 위치를 물어 `git fetch <번들> master:originals` 후 checkout)
4. **요청과 무관한 기존 버그·깨진 참조 발견** → 고치지 말고 보고만. (실수 도감 11 참고)
5. **같은 버그를 2회 수정 시도했는데 원인 불명** → 추측 수정 반복 금지. 관찰한 사실(재현 조건, console, 어느 폭에서)을 정리해 보고하고 멈춘다.
6. **이 문서와 코드가 충돌** → 코드를 따르고 문서 갱신을 제안.
7. **사소하지 않은 문제를 해결한 직후** → `extract-approach` 실행 (전역 규칙).

## 6. 프로젝트 스킬

`.claude/skills/`에 3개가 있다 (`.claude/*`는 gitignore지만 skills는 예외로 커밋된다 — `.claude/tools/`는 이 기기에만 존재):

- **/add-work** — 새 프로젝트 노트 또는 워크숍 추가 (ko/en/jp 세 파일 모두). slide_data 블록 복사, data-* 재번호, 이미지 처리, 검증까지의 전체 절차.
- **/optimize-images** — 새 이미지를 이미지 정책(2400px WebP q85 + 예외)대로 변환 (Pillow 사용, magick/cwebp는 이 기기에 없음).
- **/smoke-test** — 변경 후 전체 스모크 테스트: 3개 폭 스크린샷 + 히어로/노트/워크숍/팝업/햄버거 인터랙션 + console 검사 (+ en/jp 로드·언어 표시 확인).

도구: `.claude/tools/check_lang_sync.py` — 세 언어 파일의 구조 지문(태그·class·id·data-* 순서) 비교. 조판용 `<br>`은 지문에서 제외 (2026-07-12 A안). 사용법: `python .claude/tools/check_lang_sync.py <리포트파일>` → RESULT: PASS 확인.

사용자용 가이드: 루트의 `lang_edit.md` — en/jp 텍스트·`<br>`·언어별 여백을 사용자가 직접 편집하는 step-by-step 절차.
