// 페이지 전환 페이드아웃 (다른 html로 이동하는 링크에만 적용)
// index.html / min.postfolio-*.html 공용

const FADEOUT_MS = 450; // css/style.css의 body.page_fadeout transition과 맞출 것

document.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", function (e) {

        const href = this.getAttribute("href");

        // 앵커/빈 링크는 제외
        if (!href || href.startsWith("#") || href.includes("javascript")) return;

        // 새 창으로 여는 링크(target="_blank")는 페이드아웃 없이 기본 동작 유지
        if (this.target === "_blank") return;

        e.preventDefault();

        document.body.classList.add("page_fadeout");

        setTimeout(() => {
            window.location.href = href;
        }, FADEOUT_MS);
    });
});
