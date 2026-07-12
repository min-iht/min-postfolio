// ===================================
// Hero 오프닝 애니메이션 (scene1 → 2 → 3)
// 트리거(엔터/버튼/skip)는 startHero() 하나로 수렴하고,
// 모든 연출은 paused 상태의 마스터 타임라인 tl이 담당한다
// ===================================

const input = document.querySelector(".name_input");
const enterBtn = document.querySelector(".enter_btn");
const skipBtn = document.querySelector(".skip_btn");
const visitorName = document.querySelector(".visitor_name");

const envClosed = document.querySelector(".env_closed");
const iconImg = document.querySelector(".leftUI .iconBox .icon");

/* ---------- 닫힘 복귀용 봉투 이미지 (얇은 선 버전) ----------
   scene1의 첫 봉투는 name_envelope.png 그대로,
   봉투가 다시 닫힐 때부터는 아래 경로의 이미지로 교체된다.
   ★ 얇은 선 이미지를 만들면 아래 경로만 바꿔주세요.
     예: "./img/hero/name_envelope_thin.webp" */
const ENV_CLOSED_THIN_SRC = "./img/hero/name_envelope_thin.webp";

// 교체 순간 깜빡임이 없도록 미리 로드
const preloadThin = new Image();
preloadThin.src = ENV_CLOSED_THIN_SRC;


/* ---------- 스크롤 잠금 해제 (타임라인 완료 시) ---------- */

function unlockScroll() {
    document.body.classList.remove("is_locked");
    sessionStorage.setItem("heroDone", "1");
    // 이 탭에서 히어로를 봤다는 표시 — 새로고침 시 인트로를 건너뛴다
    if (window.lenis) window.lenis.start(); // Lenis 관성 스크롤 시작
    if (window.ScrollTrigger) ScrollTrigger.refresh();
}


/* ---------- 봉투 → 좌측 아이콘 이동량 계산 ----------
   재생 "시점"의 실제 화면 좌표로 계산해야 해서 함수값("+=") 사용.
   leftUI는 visibility:hidden이라 안 보여도 좌표는 잡힌다 */

function deltaToIcon(axis) {
    const from = envClosed.getBoundingClientRect();
    const to = iconImg.getBoundingClientRect();

    if (axis === "x") {
        return "+=" + ((to.left + to.width / 2) - (from.left + from.width / 2));
    }
    return "+=" + ((to.top + to.height / 2) - (from.top + from.height / 2));
}


/* ---------- 편지지 화면 맞춤 배율 ----------
   봉투·엽서 장면은 모든 폭에서 데스크톱 크기 그대로지만(2026-07-12 통일),
   마지막 편지지(720px)는 좁은 화면에서 좌우가 잘린다.
   그래서 편지지 장면만 화면 폭에 맞춰 축소한다.
   ★ 좌우 여백 20px — 상단 고정 바 텍스트의 시작선/끝선
     (responsive.css 모바일 --rsp_pad: 20px)과 맞춘 값 ★
   편지지 720px + 여백 40px이 다 들어가는 화면(760px 이상)에서는
   Math.min이 1을 골라 원본 크기 그대로 — 데스크톱·태블릿엔 영향 없음 */

const POSTCARD_SIDE_MARGIN = 20;

function postcardScale() {
    return Math.min(1, (window.innerWidth - POSTCARD_SIDE_MARGIN * 2) / 720);
}


/* ---------- 초기 상태 ---------- */

gsap.set(".env_bel", { transformOrigin: "50% 100%", scaleY: 0.1 }); // 뚜껑: 접힌 상태에서 시작
gsap.set(".postcard_text", { y: 14 });                              // 텍스트: 살짝 아래에서 올라오며 fadeIn

gsap.set(".hero_postcard, .shadow", { scale: postcardScale() });
// 편지지·그림자를 화면 맞춤 크기로 (기준점이 중앙이라 축소해도 가로 정중앙 유지.
// 편지 글은 편지지의 자식이라 같이 줄어든다)


/* ---------- 마스터 타임라인 ---------- */

const tl = gsap.timeline({
    paused: true,
    defaults: { ease: "power2.inOut" },
    onComplete: unlockScroll
});

tl
    // ── scene1 → 2 : 인트로 UI만 퇴장 (env_closed는 그대로) ──
    .to(".intro_ui", { autoAlpha: 0, y: -20, duration: 0.7, ease: "power2.out" })

    // ── scene2-1 : 봉투 열림 ──
    // 닫힌 봉투가 앞판(env_over)으로 바뀌고, 뒷판 뚜껑(env_bel)이 위로 펼쳐진다
    // 두 이미지의 선 굵기가 달라서, 겹쳐 보이지 않게
    // 먼저 fade out이 끝나갈 때 fade in이 시작되도록 시간차를 둔다
    .to(".env_closed", { autoAlpha: 0, duration: 0.2, ease: "power1.out" }, "open")
    .to(".env_over", { autoAlpha: 1, duration: 0.25, ease: "power1.in" }, "open+=0.16")
    .to(".env_bel", { autoAlpha: 1, duration: 0.2 }, "open+=0.2")
    .to(".env_bel", { scaleY: 1, duration: 0.5, ease: "back.out(1.6)" }, "open+=0.26")

    // ── scene2-2 : 엽서 위로, 봉투는 아래로 ──
    // 엽서는 env_over(z:40) 뒤에 완전히 가려져 있어서 미리 켜도 안 보인다
    .set(".env_card", { autoAlpha: 1 }, "rise-=0.01")
    .to(".env_card", { y: -110, duration: 0.9, ease: "power2.out" }, "rise")
    .to(".env_bel, .env_over", { y: 45, duration: 0.9, ease: "power2.out" }, "rise")

    // ── scene2-3 : 봉투 닫힘 → env_closed로 복귀 ──
    // 닫힘에는 fade 없음: 뚜껑이 접히는 동작만 하고, 접힘이 끝나는 순간
    // 열린 봉투(env_bel/over) → 닫힌 봉투(env_closed)로 즉시 교체된다
    .to(".env_bel", { scaleY: 0.1, duration: 0.4, ease: "power2.in" }, "close")
    .set(".env_closed img", { attr: { src: ENV_CLOSED_THIN_SRC } }, "close")
    // 닫힘부터는 얇은 선 버전 봉투로 교체
    .set(".env_closed", { y: 45 }, "close")
    // 봉투가 내려간 위치(y:45)에서 나타나야 이어져 보인다
    .set(".env_bel", { autoAlpha: 0 }, "close+=0.4")
    .set(".env_over", { autoAlpha: 0 }, "close+=0.4")
    .set(".env_closed", { autoAlpha: 1 }, "close+=0.4")

    // ── scene2-4 : 닫힌 봉투가 축소되며 좌측 아이콘 자리로 ──
    .to(".env_closed", {
        x: () => deltaToIcon("x"),
        y: () => deltaToIcon("y"),
        scale: 54 / 196,
        // 도착 크기 = 아이콘 이미지(envelope_closed53.png, 54px) 크기
        duration: 1,
        ease: "power2.inOut"
    }, "fly")

    // ── scene2-5 : 고정 UI 등장, 봉투는 아이콘에 흡수 ──
    // scene3(엽서 확대)도 같은 "ui" 시점에 바로 시작 — 사이에 멈춤 없음
    .to(".leftUI, .rightUI", { autoAlpha: 1, duration: 0.6 }, "ui")
    .to(".env_closed", { autoAlpha: 0, duration: 0.35 }, "ui+=0.1")

    // ── scene3-1 : 엽서 확대 ──
    // scale 2.769(=720/260)에서 hero_postcard(720x463)와 정확히 겹친다.
    // 편지지가 화면 맞춤(postcardScale)으로 줄어 있으면 같은 배율을 곱해 맞춘다.
    // x/y는 그대로 — 축소 기준점이 편지지 중앙이라 도착 중심은 변하지 않는다
    .to(".env_card", {
        x: 4, y: 63,
        scale: () => (720 / 260) * postcardScale(),
        duration: 1.1,
        ease: "power3.inOut"
    }, "ui")
    // 확대가 끝나갈 때 실제 편지지로 크로스페이드
    .to(".hero_postcard", { autoAlpha: 1, duration: 0.3 }, "ui+=0.85")
    .to(".env_card", { autoAlpha: 0, duration: 0.3 }, "ui+=0.85")

    // ── scene3-2 : 편지지 ↑ / 그림자 ↘ (떠오르는 입체 효과) ──
    // 편지지가 페이지 가로 정중앙에 오도록 x는 0. 그림자와의 간격 16px.
    // 이동량에 화면 맞춤 배율을 곱해 좁은 화면에서도 "뜨는" 비율을 유지한다
    .to(".shadow", { autoAlpha: 1, duration: 0.4 }, "lift")
    .to(".hero_postcard", { x: 0, y: () => -10 * postcardScale(), duration: 0.6, ease: "power2.out" }, "lift")
    .to(".shadow", { x: () => 16 * postcardScale(), y: () => 6 * postcardScale(), duration: 0.6, ease: "power2.out" }, "lift")

    // ── scene3-3 : 편지 내용 fadeIn (분리 중간부터 겹쳐서 일찍 시작) ──
    .to(".postcard_text", { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" }, "lift+=0.25");
// 타임라인이 끝나면 onComplete → unlockScroll


/* ---------- 트리거 ---------- */

let started = false;

function startHero(name) {
    if (started) return;
    started = true;

    // 이름을 입력한 경우에만 반영 (skip이면 Future Colleague 유지)
    if (name) visitorName.textContent = name;

    tl.play();
}

enterBtn.addEventListener("click", () => startHero(input.value.trim()));

input.addEventListener("keydown", (e) => {
    if (e.isComposing) return; // 한글 조합 중 엔터가 두 번 발생하는 것 방지
    if (e.key === "Enter") startHero(input.value.trim());
});

skipBtn.addEventListener("click", (e) => {
    e.preventDefault(); // href="#" 해시 이동 방지
    startHero("");
});


/* ---------- 새로고침 처리 ----------
   같은 탭에서 이미 히어로를 완료했다면(새로고침 등)
   인트로를 건너뛰고 바로 완료 상태로 시작한다.
   (새 탭/새 방문에서는 인트로가 정상 재생됨) */

if (sessionStorage.getItem("heroDone")) {
    started = true;
    tl.progress(1);  // 타임라인을 최종 상태로
    unlockScroll();  // 스크롤 해제 + 고정 UI는 타임라인 끝 상태라 이미 표시됨
}
