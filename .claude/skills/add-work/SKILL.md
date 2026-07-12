---
name: add-work
description: 포트폴리오에 새 프로젝트 노트 또는 워크숍을 추가하는 전체 절차. "새 프로젝트 추가", "워크숍 추가", "노트 추가", "작업 올려줘" 등의 요청에 사용. slide_data 블록 작성, data-* 재번호, 이미지 최적화, 검증까지 포함.
---

# 새 작업(노트/워크숍) 추가 절차

대상 파일: `min.postfolio-ko.html` + `min.postfolio-en.html` + `min.postfolio-jp.html`(내용 — **세 파일 모두**), `js/workshop.js`(워크숍 목록만, 세 언어를 한 곳에서), `img/`(사진).
시작 전에 CLAUDE.md의 실수 도감 1·6·8·9번을 상기할 것.

## 0. 먼저 사용자에게 받을 것

- 종류: **프로젝트 노트**(Works 섹션 정보 카드의 "Open the NOTE")인지 **워크숍**(Workshop 스와이퍼 카드의 "VIEW DETAIL")인지
- 사진 원본 (폴더 경로)
- 본문 문구 (제목, Problem/Insight/… 블록별 텍스트, 메타 정보). **문구가 없으면 절대 지어내지 말고 placeholder(`.`)로 두고 목록을 정리해 요청한다.**
- 번역: 사용자는 한국어 원문만 준다. en/jp 번역은 Claude가 자연스럽게 생성해 세 파일에 모두 반영한다 (2026-07-12 사용자 합의). placeholder(`.`)는 번역하지 않고 세 파일 모두 `.` 그대로 둔다.

## 1. 이미지 준비

1. 사진을 규칙에 맞는 폴더로: 노트는 `img/slide/note/<data-note 값>/<탭이름>/1.webp, 2.webp…`, 워크숍 상세는 `img/slide/ws/…` 기존 구조 확인 후 동일하게, 워크숍 썸네일은 `img/workshop/N.webp`.
2. `/optimize-images`로 전부 변환 (장축 2400px, WebP q85).

## 2-A. 프로젝트 노트 추가

먼저 `min.postfolio-ko.html`에 아래 1~3을 완성하고, **같은 구조 변경을 en/jp 파일에도 그대로 반영한다 (텍스트만 번역).** 세 파일의 태그·class·data-* 구조는 글자 하나까지 동일해야 한다.

1. `min.postfolio-ko.html`의 `<section id="works">` 안에 정보 카드(`.info`)와 포스터 섹션(`.project`)을 기존 것 복사로 추가. 카드의 `data-index`는 포스터 섹션 순서(0부터)와 일치해야 함 — 기존 카드들 재확인.
2. 노트 버튼 `<a class="noteBtn" data-note="새-아이디">`의 `data-note` 값을 정한다 (kebab-case, 예: `project-brand`).
3. 파일 맨 아래 `<div class="slide_data">` 안에서 기존 `note_data` 블록 하나를 통째로 복사해 붙이고:
   - `data-note="새-아이디"` — 2번 버튼 값과 정확히 일치
   - `.src_tabs`: 탭 버튼들, `data-tab`은 **0부터 연속**
   - `.src_gallery`: `<div class="swiper-slide" data-tab="N"><img loading="lazy" decoding="async" src="…"></div>` 한 줄 = 사진 한 장. 각 슬라이드의 `data-tab`이 탭 버튼과 짝
   - `.src_body`: `note_case`(작은 글자) / `note_title`(제목) / `note_block`(라벨+본문) / `note_block muted`(회색 placeholder) / `note_link`(맨 아래 링크, 불필요하면 삭제)

## 2-B. 워크숍 추가

순서가 생명이다. **배열과 data-ws는 같은 순서(최신순)를 공유한다.**

1. `js/workshop.js`의 `WORKSHOPS` 배열 **맨 앞**에 카드 데이터 추가. 텍스트 필드(title/sub/venue/desc/tags)는 `{ ko: …, en: …, jp: … }` 세 언어 모두 작성 (date/img는 공통 1개). 이 파일 하나로 세 언어 페이지의 카드가 모두 만들어진다.
2. `min.postfolio-ko.html` / `-en.html` / `-jp.html` **세 파일 각각**의 `slide_data` 안에 `ws_data` 블록을 하나 복사해 새 워크숍 상세를 만들고 `data-ws="0"`으로 (en/jp는 번역 텍스트, 구조는 ko와 동일).
3. **세 파일 모두에서 기존 `ws_data`의 `data-ws`를 +1씩 재번호.** (배열 맨 앞에 추가했으므로 전부 밀린다.) 끝나면 파일마다 `grep -o 'data-ws="[0-9]*"'`로 0부터 연속·중복 없음·배열 길이와 일치를 확인하고, `python .claude/tools/check_lang_sync.py <리포트>`로 구조 지문 PASS 확인.

## 3. 검증 (생략 금지)

1. `portfolio` 서버로 페이지 열기 (기본 8123, 점유 시 autoPort 배정 — preview_start가 알려주는 포트 사용). 히어로는 Skip으로 통과.
2. 새 노트/워크숍을 실제로 열어서: 탭 전환 → 스와이프 → 자동재생 → 닫기 3경로(버튼/ESC/바깥 클릭).
3. console 에러 0 확인.
4. 1024px·375px 폭에서도 카드가 제자리에 보이는지 확인 (responsive.js가 ≤1024에서 `.info` 카드를 포스터 아래로 옮긴다).
5. 워크숍이면: 목록 스와이퍼에서 새 카드가 맨 앞에 보이고, **다른 기존 워크숍의 VIEW DETAIL도 하나 열어** 재번호가 안 깨졌는지 확인.

## 4. 마무리 체크리스트

- [ ] data-* 짝 전수 일치 (note: 버튼==블록 / ws: 0부터 연속 & 배열 순서 일치) — **ko/en/jp 세 파일 모두**
- [ ] data-tab 0부터 연속, 탭 수 == 갤러리 탭 종류 수
- [ ] 이미지 전부 정책 통과 (`/optimize-images` 리포트 첨부)
- [ ] 본문 문구는 사용자 제공분 그대로 (en/jp는 그 원문의 번역만), 없는 부분은 placeholder + 요청 목록 — placeholder는 세 파일 모두 `.`
- [ ] `python .claude/tools/check_lang_sync.py <리포트>` → RESULT: PASS
- [ ] en/jp 페이지도 실제로 열어 새 항목이 해당 언어로 표시되는지 확인
- [ ] 커밋은 사용자가 요청할 때만
