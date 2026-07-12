// =====================================================
// Workshop 시안 JS
// 1) 카드 목록 생성 + 무한 드래그 스와이퍼
// 2) 워크숍 슬라이드(.ws_overlay) 아래→위 열기/닫기
//    + 탭 스와이퍼 갤러리
//
// ★★ 역할 구분 (어디서 무엇을 수정하나) ★★
//  ● 워크숍 "목록 카드"(#workshop 스와이퍼의 제목/날짜/장소/태그/썸네일)
//    → 이 파일의 WORKSHOPS 배열에서 수정 (기존과 동일)
//  ● 워크숍 "상세 슬라이드"(VIEW DETAIL로 열리는 화면의 탭/사진/글/메타)
//    → min.postfolio-ko.html 아래쪽 <div class="slide_data"> 안의
//      <div class="ws_data" data-ws="번호"> 블록(HTML)에서 수정
//      (data-ws 번호 = 아래 배열의 순서: 0 = 첫 번째(최신) 워크숍)
//
// ★ 병합 시: popup.js(슬라이드) / works.js(카드 생성)와 합칠 것
// =====================================================


// -------------------------------------
// 워크숍 "목록 카드" 데이터 — 배열은 "최신순" (첫 번째 = 가장 최근 워크숍)
//
// 카드(목록)에 보이는 것만 여기서 수정:
//   title : 카드 제목
//   sub   : 제목 옆 작은 글자 (없으면 "")
//   date  : 날짜
//   venue : 장소 (@로 시작)
//   desc  : 지원사업/주최 설명 한 줄
//   tags  : 해시태그 목록
//   img   : 썸네일 이미지 경로
//
// ★ 새 워크숍을 추가하는 방법 (최신순 유지):
//   1) 아래 배열 "맨 앞"에 카드 데이터를 추가
//   2) min.postfolio-ko.html의 slide_data 안에 ws_data 블록을 하나 복사해
//      상세 내용을 만들고, data-ws 번호를 전체적으로 다시 매긴다
//      (배열 맨 앞에 추가했으면 새 워크숍이 data-ws="0",
//       기존 것들은 번호가 1씩 밀린다)
// -------------------------------------
const WORKSHOPS = [

    {
        title: "끼리끼리 사진 놀이",
        sub: "",
        date: "2024.09.04 - 2024.10.30",
        venue: "@청년아트스테이션",
        desc: "부산 북구청 · 그루북 협동조합",
        tags: ["출사", "짝활동", "사진놀이"],
        img: "./img/workshop/6.webp"
    },

    {
        title: "책 정리 워크숍",
        sub: "",
        date: "2024.09.03 - 2024.10.15",
        venue: "@복합문화공간 무사이",
        desc: "부산도서관 지역서점 독서문화프로그램",
        tags: ["책 정리", "수다스러운 방"],
        img: "./img/workshop/5.webp"
    },

    {
        title: "사진에 깃든 나",
        sub: ": 내가 찍은 사진 속에서 찾는 나다움",
        date: "2023.12.09",
        venue: "@KT&G 상상마당 부산",
        desc: "제1회 마우스 북페어 @부산",
        tags: ["사진", "발견", "영감"],
        img: "./img/workshop/4.webp"
    },

    {
        title: "희타, 미지의 여름 이야기",
        sub: "",
        date: "2023.07.08 - 2023.08.19",
        venue: "@책방 미지의 세계",
        desc: "작가와 함께하는 작은서점 지원사업",
        tags: ["글쓰기", "여름", "산책"],
        img: "./img/workshop/3.webp"
    },

    {
        title: "이희타의 겨울 상상",
        sub: "",
        date: "2022.11.14",
        venue: "@동주책방",
        desc: "부산도서관 독서문화 프로그램 지원사업",
        tags: ["글쓰기", "겨울", "편지"],
        img: "./img/workshop/2.webp"
    },

    {
        title: "영혼의 포토 부스",
        sub: "",
        date: "2022.10.20 - 2022.11.17",
        venue: "@청년작당소",
        desc: "청년작당소 청년 프로그래머 시즌4",
        tags: ["사진놀이", "명상", "자기이해"],
        img: "./img/workshop/1.webp"
    }

];


// -------------------------------------
// 1) 카드 생성 + 무한 드래그 스와이퍼
// -------------------------------------

const wsWrapper = document.querySelector(".ws_swiper .swiper-wrapper");


function wsCardHTML(w, index) {

    const tags = w.tags.map(t => `<li class="tag">${t}</li>`).join("");

    const sub = w.sub ? ` <small>${w.sub}</small>` : "";

    return `
        <div class="swiper-slide ws_card">

            <div class="ws_media ws_open" data-index="${index}">

                <img loading="lazy" decoding="async" src="${w.img}" alt="${w.title}">

                <span class="ws_view">
                    <span class="ws_view_glass">⌕</span> VIEW DETAIL
                </span>

            </div>

            <h3 class="ws_title">
                <a href="#" class="ws_open" data-index="${index}">${w.title}${sub}</a>
            </h3>

            <p class="ws_date">${w.date}</p>

            <p class="ws_venue">${w.venue}</p>

            <p class="ws_desc">${w.desc}</p>

            <ul class="ws_tags">${tags}</ul>

        </div>
    `;

}


// 무한 루프가 자연스럽도록 목록을 2번 이어 붙인다
[...WORKSHOPS, ...WORKSHOPS].forEach((w, i) => {

    wsWrapper.insertAdjacentHTML("beforeend", wsCardHTML(w, i % WORKSHOPS.length));

});


const wsSwiper = new Swiper(".ws_swiper", {

    slidesPerView: "auto",
    spaceBetween: 45,
    slidesOffsetBefore: 13,
    /* 시안: 첫 카드 x300 (선 시작 287 + 13) */

    loop: true,
    grabCursor: true,

    touchRatio: 1.25,
    /* 섹션 zoom 0.8 보정 (1/0.8) — zoom을 빼면 1로 되돌릴 것 */

    // ★ 자동으로 천천히 흘러가는 설정 ★
    // speed = 한 칸 이동에 걸리는 시간(ms) — 클수록 더 천천히 흐른다
    // (delay 0 + 아래 CSS의 linear와 세트 = 끊김 없이 연속으로 흐르는 효과)
    speed: 2000,
    autoplay: {
        delay: 0,
        disableOnInteraction: false,
        // 드래그한 뒤에도 다시 흐름
        pauseOnMouseEnter: true
        // 마우스를 올리면 잠시 멈춤 (카드 클릭하기 편하게)
    },

    // 드래그도 그대로 가능
    freeMode: {
        enabled: true,
        momentum: false
        /* 관성은 끔 — 자동 흐름과 겹치면 튀는 움직임이 생김 */
    }

});


// -------------------------------------
// 2) 워크숍 슬라이드 (아래→위)
//
// ★ 내용 수정은 여기가 아니라 HTML!
//   min.postfolio-ko.html의 <div class="slide_data"> 안
//   ws_data 블록에서 탭(src_tabs)/사진(src_gallery)/글(src_body)/
//   메타(src_meta)를 고친다.
//   (사진 추가 = <div class="swiper-slide"> 한 줄 복사 후 src 교체)
// -------------------------------------

const wsOverlay = document.querySelector(".ws_overlay");
const wsPanel = document.querySelector(".ws_panel");
const wsScroll = document.querySelector(".ws_detail_scroll");
const wsHint = document.querySelector(".ws_hint");

let wsSlideSwiper = null;
let wsOpen = false;
let wsAnimating = false;


// HTML의 ws_data 블록 내용을 슬라이드 패널로 복사하고 스와이퍼를 만든다
function buildWsSlide(index) {

    // 카드의 data-index와 같은 data-ws를 가진 블록을 찾는다
    const src = document.querySelector(`.slide_data .ws_data[data-ws="${index}"]`);

    if (!src) return false; // slide_data가 없는 문서에선 열지 않음

    // 탭 버튼 / 갤러리 사진 / 오른쪽 글 — HTML 그대로 복사
    wsPanel.querySelector(".ws_slide_tabs").innerHTML =
        src.querySelector(".src_tabs").innerHTML;

    wsPanel.querySelector(".ws_slide_swiper .swiper-wrapper").innerHTML =
        src.querySelector(".src_gallery").innerHTML;

    wsScroll.innerHTML =
        src.querySelector(".src_body").innerHTML;

    // 아래 고정 메타 (스크롤 되어도 그 자리) — src_meta의 값 복사
    wsPanel.querySelector(".ws_meta_role").textContent =
        src.querySelector(".src_role").textContent;

    wsPanel.querySelector(".ws_meta_duration").textContent =
        src.querySelector(".src_duration").textContent;

    wsPanel.querySelector(".ws_meta_location").textContent =
        src.querySelector(".src_location").textContent;


    // 스와이퍼 재생성
    if (wsSlideSwiper) wsSlideSwiper.destroy(true, true);

    wsSlideSwiper = new Swiper(".ws_slide_swiper", {

        speed: 1600,
        /* 슬라이드 넘김 애니메이션 시간(ms) — 클수록 천천히 넘어감 */

        spaceBetween: 40,
        /* 사진 사이 여백 — 넘어갈 때 옆 사진과의 간격 */

        touchRatio: 1.25,
        /* 패널 zoom 0.8 보정 (1/0.8) — zoom을 빼면 1로 되돌릴 것 */

        // 2.5초 간격 자동 넘김 — 드래그해도 자동재생 유지, 마우스 올리면 일시정지
        autoplay: {
            delay: 2500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
        },
        rewind: true,
        /* 마지막 장에서 첫 장으로 되감기 */

        pagination: {
            el: ".ws_slide_pagination",
            clickable: true
        },

        // 좌우 넘김 버튼 (HTML의 .ws_slide_left 안 버튼과 연결)
        navigation: {
            prevEl: ".ws_slide_left .swiper-button-prev",
            nextEl: ".ws_slide_left .swiper-button-next"
        }

    });

    wsSlideSwiper.on("slideChange", () => {

        const slide = wsSlideSwiper.slides[wsSlideSwiper.activeIndex];

        if (slide) setWsTab(slide.dataset.tab);

    });

    setWsTab(0);

    return true;

}


function setWsTab(t) {

    wsPanel.querySelectorAll(".ws_slide_tab").forEach(tab => {

        tab.classList.toggle("active", tab.dataset.tab === String(t));

    });

}


function openWsSlide(index) {

    if (wsOpen || wsAnimating) return;

    if (!buildWsSlide(index)) return;

    wsScroll.scrollTop = 0;

    // 내용이 넘칠 때만 힌트 표시 — 힌트가 떠 있는 동안은 스크롤바 숨김(hint_on)
    if (wsHint) {

        const wsOverflow = wsScroll.scrollHeight > wsScroll.clientHeight;

        wsHint.style.opacity = wsOverflow ? 1 : 0;
        wsScroll.classList.toggle("hint_on", wsOverflow);

    }

    wsOverlay.classList.add("open");
    document.body.classList.add("slide_locked");
    if (window.lenis) window.lenis.stop(); // 뒤 페이지 관성 스크롤 정지

    wsOpen = true;
    wsAnimating = true;

    // 아래에서 위로 (클로즈 버튼이 위에 붙어 있어 105%부터 출발)
    gsap.fromTo(wsPanel,

        { yPercent: 105 },

        {
            yPercent: 0,
            duration: 0.55,
            ease: "power3.out",
            onComplete() {
                wsAnimating = false;
            }
        }

    );

}


function closeWsSlide() {

    if (!wsOpen || wsAnimating) return;

    wsAnimating = true;

    gsap.to(wsPanel, {

        yPercent: 105,
        duration: 0.45,
        ease: "power3.in",

        onComplete() {

            wsOverlay.classList.remove("open");
            document.body.classList.remove("slide_locked");
            if (window.lenis) window.lenis.start();

            wsOpen = false;
            wsAnimating = false;

        }

    });

}


// 열기 : VIEW DETAIL 버튼 / 워크숍 타이틀
document.addEventListener("click", e => {

    const btn = e.target.closest(".ws_open");

    if (!btn) return;

    e.preventDefault();

    openWsSlide(Number(btn.dataset.index));

});

// 닫기 : 클로즈 버튼
document.addEventListener("click", e => {

    if (!e.target.closest(".ws_close")) return;

    e.preventDefault();

    closeWsSlide();

});

// 닫기 : 슬라이드 바깥(패널 왼쪽/위 여백) 클릭
wsOverlay.addEventListener("click", e => {

    if (e.target !== wsOverlay) return;

    closeWsSlide();

});

// 오른쪽 상자 스크롤 시: 힌트가 사라지고 그 자리에 스크롤바가 나타난다
// (한 번 사라지면 다시 열 때까지 유지 — 둘이 동시에 보이지 않게)
wsScroll.addEventListener("scroll", () => {

    if (!wsHint || wsScroll.scrollTop <= 30) return;

    wsHint.style.opacity = 0;
    wsScroll.classList.remove("hint_on");

});

// 탭 클릭 → 해당 탭 첫 슬라이드로 이동
document.addEventListener("click", e => {

    const tab = e.target.closest(".ws_slide_tab");

    if (!tab) return;

    e.preventDefault();

    const t = tab.dataset.tab;

    const slides = [...wsPanel.querySelectorAll(".ws_slide_swiper .swiper-slide")];

    const first = slides.findIndex(s => s.dataset.tab === t);

    if (first >= 0 && wsSlideSwiper) wsSlideSwiper.slideTo(first, 0);

});

// ESC로 닫기
// 팝업(z-1030)이 슬라이드 위에 열려 있으면 팝업만 닫히도록 건너뛴다 (min_postfolio 병합 대비)
document.addEventListener("keydown", e => {

    if (e.key !== "Escape") return;

    const popupOpen = [...document.querySelectorAll(".pop_overlay")]
        .some(o => getComputedStyle(o).visibility === "visible");

    if (popupOpen) return;

    closeWsSlide();

});


// -------------------------------------
// gnb/로고로 다른 섹션을 선택하면 열려 있는 슬라이드를 닫는다
// (works.js의 closeNote와 이 파일의 closeWsSlide 둘 다)
// -------------------------------------

document.querySelectorAll(".leftUI .gnb a, .leftUI .logo").forEach(link => {

    link.addEventListener("click", () => {

        // 앵커 점프가 스크롤 잠금(slide_locked)에 막히지 않게 먼저 해제
        document.body.classList.remove("slide_locked");

        // 슬라이드 때문에 멈춰 있던 Lenis를 깨우고 목적지로 부드럽게 이동
        if (window.lenis) {
            window.lenis.start();
            window.lenis.scrollTo(link.getAttribute("href"));
        }

        if (typeof closeNote === "function") closeNote();

        closeWsSlide();

    });

});
