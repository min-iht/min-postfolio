// =====================================================
// Works JS
// 1) 스크롤 시 오른쪽 정보 카드(.info) fade in 교체
// 2) 노트 슬라이드(.noteOverlay) 열기/닫기 + 탭 스와이퍼 갤러리
//    (좌측 메뉴 스크롤 스파이는 scroll.js의 changeSub가 담당)
//
// ★★ 노트의 "내용"(탭/사진/글)은 이 파일에 없다! ★★
//    min.postfolio-ko.html 아래쪽 <div class="slide_data"> 안의
//    <div class="note_data" data-note="프로젝트id"> 블록(HTML)을 수정하면 된다.
//    이 파일은 그 블록을 노트 패널로 복사하고, 열고 닫는 동작만 담당한다.
// =====================================================

gsap.registerPlugin(ScrollTrigger);


// -------------------------------------
// 1) 정보 카드 fade in 교체
// -------------------------------------

const infoBlocks = gsap.utils.toArray(".info");

const projectSections = gsap.utils.toArray(".project_group .project");

let currentInfo = 0;


function activateInfo(index) {

    if (index === currentInfo) return;

    currentInfo = index;

    const next = infoBlocks[index];

    if (!next) return;

    // 이전 카드는 부드럽게 사라진다 (은은한 크로스페이드)
    infoBlocks.forEach(el => {

        if (el === next || !el.classList.contains("active")) return;

        el.classList.remove("active");

        gsap.fromTo(el,

            { autoAlpha: 1 },

            {
                autoAlpha: 0,
                duration: 0.5,
                ease: "power2.out",
                overwrite: "auto",

                onComplete() {
                    // 인라인 스타일 정리 → CSS(.active 없음 = 숨김)로 복귀
                    gsap.set(el, { clearProps: "opacity,visibility" });
                }
            }

        );

    });

    next.classList.add("active");

    gsap.fromTo(next,

        { autoAlpha: 0, y: 16 },

        { autoAlpha: 1, y: 0, duration: 1.2, ease: "power2.out", overwrite: "auto" }

    );

}


projectSections.forEach((section, index) => {

    ScrollTrigger.create({

        trigger: section,

        start: "top center",

        end: "bottom center",

        onEnter() {
            activateInfo(index);
        },

        onEnterBack() {
            activateInfo(index);
        }

    });

});


// workshop 섹션이 카드 높이에 닿으면 카드를 숨긴다
// (높이 0 sticky는 그룹 끝까지 붙어 있어서, 숨기지 않으면
//  마지막 카드가 workshop 위에 겹쳐 스와이퍼 드래그/클릭을 막는다)
ScrollTrigger.create({

    trigger: "#workshop",

    start: "top 65%",

    onEnter() {

        // 클래스만 지우면 fade in이 남긴 인라인 opacity가 살아서
        // 카드가 workshop 위에 겹쳐 보인다 → 트윈을 죽이고 부드럽게 정리
        infoBlocks.forEach(el => {

            el.classList.remove("active");

            gsap.killTweensOf(el);

            gsap.to(el, {
                autoAlpha: 0,
                duration: 0.25,
                overwrite: "auto",

                onComplete() {
                    gsap.set(el, { clearProps: "opacity,visibility,transform" });
                }
            });

        });

        currentInfo = -1;

    },

    onLeaveBack() {

        currentInfo = -1;

        activateInfo(infoBlocks.length - 1);

    }

});


// -------------------------------------
// 2) 노트 슬라이드
//
// ★ 내용 수정은 여기가 아니라 HTML!
//   min.postfolio-ko.html의 <div class="slide_data"> 안
//   note_data 블록에서 탭(src_tabs)/사진(src_gallery)/글(src_body)을 고친다.
//   (사진 추가 = <div class="swiper-slide"> 한 줄 복사 후 src 교체)
// -------------------------------------

const noteOverlay = document.querySelector(".noteOverlay");
const notePanel = document.querySelector(".note_panel");
const noteRight = document.querySelector(".note_right");
const noteHint = document.querySelector(".note_hint");

let noteSwiper = null;
let noteOpen = false;
let noteAnimating = false;


// HTML의 note_data 블록 내용을 노트 패널로 복사하고 스와이퍼를 만든다
function buildNote(id) {

    // 버튼의 data-note와 같은 data-note를 가진 블록을 찾는다
    // (없으면 첫 번째 블록으로 대체 — slide_data 자체가 없는 문서에선 열지 않음)
    const src = document.querySelector(`.slide_data .note_data[data-note="${id}"]`)
        || document.querySelector(".slide_data .note_data");

    if (!src) return false;

    // 탭 버튼 / 갤러리 사진 / 오른쪽 글 — HTML 그대로 복사
    notePanel.querySelector(".note_tabs").innerHTML =
        src.querySelector(".src_tabs").innerHTML;

    notePanel.querySelector(".note_swiper .swiper-wrapper").innerHTML =
        src.querySelector(".src_gallery").innerHTML;

    noteRight.innerHTML =
        src.querySelector(".src_body").innerHTML;


    // 스와이퍼 재생성
    if (noteSwiper) noteSwiper.destroy(true, true);

    noteSwiper = new Swiper(".note_swiper", {

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
            el: ".note_pagination",
            clickable: true
        },

        // 좌우 넘김 버튼 (HTML의 .note_left 안 버튼과 연결)
        navigation: {
            prevEl: ".note_left .swiper-button-prev",
            nextEl: ".note_left .swiper-button-next"
        }

    });

    // 슬라이드 넘기면 해당 탭 활성화
    noteSwiper.on("slideChange", () => {

        const slide = noteSwiper.slides[noteSwiper.activeIndex];

        if (slide) setNoteTab(slide.dataset.tab);

    });

    setNoteTab(0);

    return true;

}


function setNoteTab(t) {

    notePanel.querySelectorAll(".note_tab").forEach(tab => {

        tab.classList.toggle("active", tab.dataset.tab === String(t));

    });

}


function openNote(id) {

    if (noteOpen || noteAnimating) return;

    if (!buildNote(id)) return;

    noteRight.scrollTop = 0;

    // 내용이 넘칠 때만 힌트 표시 — 힌트가 떠 있는 동안은 스크롤바 숨김(hint_on)
    const noteOverflow = noteRight.scrollHeight > noteRight.clientHeight;

    noteHint.style.opacity = noteOverflow ? 1 : 0;
    noteRight.classList.toggle("hint_on", noteOverflow);

    noteOverlay.classList.add("open");
    document.body.classList.add("slide_locked");
    if (window.lenis) window.lenis.stop(); // 뒤 페이지 관성 스크롤 정지

    noteOpen = true;
    noteAnimating = true;

    // 오른쪽에서 왼쪽으로 빠르게 슬라이드
    gsap.fromTo(notePanel,

        { xPercent: 100 },

        {
            xPercent: 0,
            duration: 0.5,
            ease: "power3.out",
            onComplete() {
                noteAnimating = false;
            }
        }

    );

}


function closeNote() {

    if (!noteOpen || noteAnimating) return;

    noteAnimating = true;

    // 다시 왼쪽에서 오른쪽으로
    gsap.to(notePanel, {

        xPercent: 100,
        duration: 0.4,
        ease: "power3.in",

        onComplete() {

            noteOverlay.classList.remove("open");
            document.body.classList.remove("slide_locked");
            if (window.lenis) window.lenis.start();

            noteOpen = false;
            noteAnimating = false;

        }

    });

}


// 열기 : 정보 카드의 Open the NOTE 버튼
document.addEventListener("click", e => {

    const btn = e.target.closest(".noteBtn");

    if (!btn) return;

    openNote(btn.dataset.note);

});

// 닫기 : 클로즈 버튼
document.addEventListener("click", e => {

    if (!e.target.closest(".noteClose")) return;

    e.preventDefault();

    closeNote();

});

// 닫기 : 슬라이드 바깥(패널 왼쪽 여백) 클릭
noteOverlay.addEventListener("click", e => {

    if (e.target !== noteOverlay) return;

    closeNote();

});

// 탭 클릭 → 해당 탭 첫 슬라이드로 이동
document.addEventListener("click", e => {

    const tab = e.target.closest(".note_tab");

    if (!tab) return;

    e.preventDefault();

    const t = tab.dataset.tab;

    const slides = [...notePanel.querySelectorAll(".note_swiper .swiper-slide")];

    const first = slides.findIndex(s => s.dataset.tab === t);

    if (first >= 0 && noteSwiper) noteSwiper.slideTo(first, 0);

});

// 오른쪽 상자 스크롤 시: 힌트가 사라지고 그 자리에 스크롤바가 나타난다
// (한 번 사라지면 다시 열 때까지 유지 — 둘이 동시에 보이지 않게)
noteRight.addEventListener("scroll", () => {

    if (noteRight.scrollTop <= 30) return;

    noteHint.style.opacity = 0;
    noteRight.classList.remove("hint_on");

});

// ESC로 닫기 (워크숍 슬라이드는 workshop.js에서 처리)
// 팝업(z-1030)이 슬라이드 위에 열려 있으면 팝업만 닫히도록 건너뛴다 (min_postfolio 병합 대비)
document.addEventListener("keydown", e => {

    if (e.key !== "Escape") return;

    const popupOpen = [...document.querySelectorAll(".pop_overlay")]
        .some(o => getComputedStyle(o).visibility === "visible");

    if (popupOpen) return;

    closeNote();

});
