// ===================================
// 팝업 (contact / subscribe / mission)
// 열기: 트리거 버튼 클릭
// 닫기: 클로즈 버튼, 팝업 바깥(딤) 클릭, ESC
// ===================================

const POPUP_MAP = [
    { trigger: ".contact",       popup: ".pop_contact"   },
    { trigger: ".subscribe",     popup: ".pop_subscribe" },
    { trigger: ".cv_subscribe",  popup: ".pop_subscribe" },
    // CV 하단의 SUBSCRIBE MY JOURNEY → 도 같은 구독 팝업
    { trigger: ".mission a",     popup: ".pop_mission"   }
];

function openPopup(sel) {

    const overlay = document.querySelector(sel);
    if (!overlay) return;

    const box = overlay.firstElementChild; // .pp_con_bg / .pp_subs_bg / .pp_miss_bg

    gsap.to(overlay, { autoAlpha: 1, duration: 0.35, ease: "power2.out" });
    gsap.fromTo(box, { y: 30 }, { y: 0, duration: 0.5, ease: "power3.out" });

    // 컨택트 팝업이 열릴 때마다: 아이콘 낙하 연출 + 비디오 처음으로 리셋
    if (sel === ".pop_contact") {
        playConIcons();
        resetConVideo();
    }

}

/* 컨택트 팝업 장식 아이콘:
   열릴 때 위에서 내려와 부드럽게 안착한 뒤, 둥실둥실 떠다닌다 */
function playConIcons() {

    gsap.utils.toArray(".pp_con_gsap img").forEach((icon, i) => {

        gsap.killTweensOf(icon);

        gsap.timeline({ delay: 0.2 + i * 0.15 })

            // 1) 위에서 내려와 감속하며 안착 (튕김/회전 없음)
            .fromTo(icon,
                { y: -700, rotation: 0 },
                { y: 0, duration: 2.2, ease: "power2.out" }
            )

            // 2) 착지 후 둥실둥실 (원래 각도 유지)
            .to(icon, {
                y: 18,
                duration: 1.4 + i * 0.2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

    });

}

function closePopup(overlay) {

    gsap.to(overlay, { autoAlpha: 0, duration: 0.3, ease: "power2.in" });

    // 컨택트 팝업이 닫히면 비디오 정지
    if (overlay.classList.contains("pop_contact") && conVideo) conVideo.pause();

}

// 열기 트리거
POPUP_MAP.forEach(({ trigger, popup }) => {

    const btn = document.querySelector(trigger);
    if (!btn) return;

    btn.addEventListener("click", (e) => {
        e.preventDefault(); // href="#" 해시 이동 방지
        openPopup(popup);
    });

});

// 닫기: 클로즈 버튼 또는 바깥(딤 영역) 클릭
document.querySelectorAll(".pop_overlay").forEach(overlay => {

    overlay.addEventListener("click", (e) => {

        const isOutside = e.target === overlay;
        const isCloseBtn = e.target.closest(".close_vertical");

        if (isOutside || isCloseBtn) {
            e.preventDefault();
            closePopup(overlay);
        }

    });

});

// 닫기: ESC
document.addEventListener("keydown", (e) => {

    if (e.key !== "Escape") return;

    document.querySelectorAll(".pop_overlay").forEach(closePopup);

});

// 슬라이드(노트/워크숍) 열기·닫기는 works.js / workshop.js가 담당


// ===================================
// 컨택트 팝업 비디오 타임라인
// - 재생 버튼(.pp_con_play) 클릭 → 재생 시작
// - 4초 : .first 등장 → 8.28초 : 사라짐
// - 9.21초 : .second 등장
// - .second 클릭 → 사라지고 .third 등장
// - .third 클릭 → 사라짐
// - 루프 없음. 끝나면 재생 버튼이 다시 나타난다
// ===================================

const conVideo = document.querySelector(".pp_con_video video");
const conPlay = document.querySelector(".pp_con_play");
const btnZero = document.querySelector(".pp_con_btn.zero");
const btnFirst = document.querySelector(".pp_con_btn.first");
const btnSecond = document.querySelector(".pp_con_btn.second");
const btnThird = document.querySelector(".pp_con_btn.third");

let secondDismissed = false; // .second를 클릭해서 넘어갔는지

function fadeBtn(el, show) {

    // 같은 상태면 반복 호출해도 아무 일 없음 (timeupdate마다 불려도 안전)
    if (el.dataset.shown === String(show)) return;
    el.dataset.shown = String(show);

    // transition 없이 바로 나타나고 바로 사라진다
    gsap.set(el, { autoAlpha: show ? 1 : 0 });

}

function resetConVideo() {

    if (!conVideo) return;

    conVideo.pause();
    conVideo.currentTime = 0;

    secondDismissed = false;

    [btnZero, btnFirst, btnSecond, btnThird].forEach(el => {
        if (!el) return;
        el.dataset.shown = "false";
        gsap.set(el, { autoAlpha: 0 });
    });

    gsap.set(conPlay, { autoAlpha: 1 });

}

if (conVideo && conPlay) {

    // 초기 상태: 타임라인 버튼 숨김
    resetConVideo();

    // 재생 시작
    conPlay.addEventListener("click", (e) => {
        e.preventDefault();
        gsap.to(conPlay, { autoAlpha: 0, duration: 0.25 });
        conVideo.play();
    });

    // 시점별 버튼 표시 (timeupdate: 재생 중 계속 호출됨)
    conVideo.addEventListener("timeupdate", () => {

        // 리셋(currentTime=0) 때도 timeupdate가 발생하므로
        // 실제 재생 중일 때만 버튼을 갱신한다 (.zero가 미리 뜨던 버그 방지)
        if (conVideo.paused) return;

        const t = conVideo.currentTime;

        // 1초 ~ 4초(.first 직전)까지 .zero 표시
        if (btnZero) fadeBtn(btnZero, t >= 1 && t < 3.29);

        // 4 ~ 8.28초 사이에만 .first 표시
        fadeBtn(btnFirst, t >= 4 && t < 8.28);

        // 9.21초부터 .second 표시 (클릭해서 넘어갔으면 다시 안 나옴)
        if (!secondDismissed) fadeBtn(btnSecond, t >= 9.21);

    });

    // .second 클릭 → 사라지고 .third 등장
    btnSecond.addEventListener("click", (e) => {
        e.preventDefault();
        secondDismissed = true;
        fadeBtn(btnSecond, false);
        fadeBtn(btnThird, true);
    });

    // .third 클릭 → 사라짐 (비디오는 그대로 이어서 재생)
    btnThird.addEventListener("click", (e) => {
        e.preventDefault();
        fadeBtn(btnThird, false);
    });

    // 끝나면(루프 없음) 재생 버튼이 다시 나타난다
    conVideo.addEventListener("ended", () => {
        gsap.to(conPlay, { autoAlpha: 1, duration: 0.3 });
    });

}


// ===================================
// 미션 팝업 ? 버튼 (.pp_miss_info)
// - 아래위로 둥실둥실
// - 클릭 → 팝업 닫고 #project-experiment로 이동 (href는 HTML에)
// ===================================

const missInfo = document.querySelector(".pp_miss_info");

if (missInfo) {

    gsap.to(missInfo, {
        y: 5,
        duration: 1.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    missInfo.addEventListener("click", () => {
        // 앵커 이동은 기본 동작에 맡기고, 팝업만 닫는다
        closePopup(document.querySelector(".pop_mission"));
    });

}


// ===================================
// 구독 이메일 입력 (.pp_subs_box)
// 서버가 없는 정적 사이트라 입력값은 방문자 브라우저의
// localStorage("subscribers")에만 쌓인다.
// ★ 확인 방법: 같은 브라우저에서 F12 → Console 탭에
//   JSON.parse(localStorage.getItem("subscribers"))
//   입력 (또는 Application 탭 → Local Storage → subscribers)
// ★ 실제 서비스용(다른 사람 입력을 내가 받아보기)은
//   formspree.io 무료 폼을 만들어 아래 SUBSCRIBE_ENDPOINT에
//   "https://formspree.io/f/폼ID" 를 넣으면 이메일로 수신된다
// ===================================

const SUBSCRIBE_ENDPOINT = "https://formspree.io/f/mykqvndk"; // ← Formspree 엔드포인트 URL (비워두면 localStorage에만 저장)

// 페이지 언어 감지: <html lang="ko|en|ja"> 값을 문구 키(ko|en|jp)로 변환
// (이 파일은 ko/en/jp 세 페이지가 공유하므로, 안내 문구는 아래에서 언어별로 관리)
const SUBS_LANG = ({ ko: "ko", en: "en", ja: "jp" })[document.documentElement.lang] || "ko";

// 구독 입력칸에 표시되는 안내 문구 (★ 문구 수정은 여기서 — 세 언어 모두)
const SUBS_MSG = {
    invalid: {
        ko: "이메일 형식을 확인해주세요",
        en: "Please check your email address",
        jp: "メールアドレスをご確認ください"
    },
    thanks: {
        ko: "구독해주셔서 감사합니다 ♥",
        en: "Thank you for subscribing ♥",
        jp: "ご購読ありがとうございます ♥"
    }
};

const subsInput = document.querySelector(".pp_subs_box .email_input");
const subsBtn = document.querySelector(".pp_subs_box .enter_btn");

function submitSubscribe() {

    const email = subsInput.value.trim();

    // 간단한 이메일 형식 검사
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        subsInput.value = "";
        subsInput.placeholder = SUBS_MSG.invalid[SUBS_LANG];
        return;
    }

    // 1) localStorage에 저장 (방문자 브라우저에 누적)
    const list = JSON.parse(localStorage.getItem("subscribers") || "[]");
    list.push({ email: email, date: new Date().toISOString() });
    localStorage.setItem("subscribers", JSON.stringify(list));
    console.log("[subscribe] 저장됨:", list);

    // 2) Formspree 엔드포인트가 설정되어 있으면 전송
    if (SUBSCRIBE_ENDPOINT) {
        fetch(SUBSCRIBE_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ email: email })
        }).catch(() => { /* 전송 실패해도 localStorage에는 남아 있음 */ });
    }

    // 입력칸 비우고 감사 문구로
    subsInput.value = "";
    subsInput.placeholder = SUBS_MSG.thanks[SUBS_LANG];

}

if (subsInput && subsBtn) {

    subsBtn.addEventListener("click", submitSubscribe);

    subsInput.addEventListener("keydown", (e) => {
        if (e.isComposing) return; // 한글 조합 중 엔터 방지
        if (e.key === "Enter") submitSubscribe();
    });

}


// (구독 팝업 이미지: 드래그 팬 기능 제거 — 상자에 맞춰 표시, popup.css)
