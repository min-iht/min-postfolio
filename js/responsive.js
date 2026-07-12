// =====================================================
// 반응형 전용 JS (css/responsive.css와 세트)
// 1) 햄버거 메뉴 열기/닫기 (body.menu_open)
// 2) ≤1024px에서 Works 정보 카드(.info)를 각 포스터 아래로 이동
//    - 데스크톱으로 돌아오면 원래 자리(.info_sticky)로 복귀
//    - works.js의 스크롤 fade는 그대로 돌지만,
//      모바일에선 responsive.css가 !important로 항상 보이게 고정한다
// =====================================================

(function () {

    const BP = window.matchMedia("(max-width: 1024px)");


    // -------------------------------------
    // 1) 햄버거 메뉴
    // -------------------------------------

    const hamBtn = document.querySelector(".ham_btn");
    const gnbNav = document.querySelector(".leftUI nav");

    function setMenu(open) {

        document.body.classList.toggle("menu_open", open);

        if (hamBtn) hamBtn.setAttribute("aria-expanded", open ? "true" : "false");

        // Lenis 관성 스크롤도 같이 멈춤/재개
        // (히어로/슬라이드가 이미 잠가둔 상태면 재개하지 않는다)
        if (window.lenis) {
            if (open) {
                window.lenis.stop();
            } else if (!document.body.classList.contains("is_locked")
                && !document.body.classList.contains("slide_locked")) {
                window.lenis.start();
            }
        }

    }

    if (hamBtn) {
        hamBtn.addEventListener("click", () => {
            setMenu(!document.body.classList.contains("menu_open"));
        });
    }

    // 메뉴 안 링크 클릭 → 메뉴 닫기 (앵커 이동은 그대로 진행)
    if (gnbNav) {
        gnbNav.addEventListener("click", (e) => {
            if (e.target.closest("a")) setMenu(false);
        });
    }

    // ESC로 닫기
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && document.body.classList.contains("menu_open")) {
            setMenu(false);
        }
    });


    // -------------------------------------
    // 2) Works 정보 카드 재배치
    //    카드 data-index(0~5) = .project_group 안 포스터 섹션 순서
    // -------------------------------------

    const infoSticky = document.querySelector(".info_sticky");
    const projects = document.querySelectorAll(".project_group .project");
    const infoCards = infoSticky
        ? Array.from(infoSticky.querySelectorAll(".info"))
        : [];

    function placeInfoCards() {

        if (!infoSticky || !infoCards.length) return;

        if (BP.matches) {

            // 모바일/태블릿: 각 포스터 섹션 끝(포스터 아래)으로
            infoCards.forEach((card) => {
                const target = projects[Number(card.dataset.index)];
                if (target && card.parentElement !== target) target.appendChild(card);
            });

        } else {

            // 데스크톱: 원래 순서대로 .info_sticky로 복귀
            infoCards.forEach((card) => {
                if (card.parentElement !== infoSticky) infoSticky.appendChild(card);
            });

        }

        // 문서 높이가 크게 바뀌므로 스크롤트리거 재계산
        if (window.ScrollTrigger) ScrollTrigger.refresh();

    }

    placeInfoCards();

    BP.addEventListener("change", () => {
        placeInfoCards();
        setMenu(false); // 브레이크포인트를 넘나들 때 열린 메뉴 정리
    });

})();
