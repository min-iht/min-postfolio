gsap.registerPlugin(ScrollTrigger);


// ===================================
// Lenis 관성 스크롤 (수웅수웅)
// - duration을 키우면 더 미끄러지고, 줄이면 즉각적
// - 앵커(#) 이동도 Lenis가 부드럽게 처리 (anchors: true)
// - 히어로/슬라이드 잠금 시 lenis.stop() / 해제 시 lenis.start()
// ===================================

const lenis = new Lenis({
    duration: 1.2,
    anchors: true
});

window.lenis = lenis; // 다른 파일(hero.js 등)에서 접근용

// GSAP ticker로 구동 (공식 통합 패턴)
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

lenis.on("scroll", ScrollTrigger.update);

// 히어로 애니메이션 동안은 스크롤 정지 (hero.js unlockScroll에서 start)
if (document.body.classList.contains("is_locked")) lenis.stop();


// ===================================
// #hero → #works로 스크롤하는 동안 엽서(봉투 무대)가
// 스크롤 양에 비례해 서서히 사라진다 (되돌아오면 다시 나타남)
// ===================================

gsap.to(".envelope_stage", {

    autoAlpha: 0,

    ease: "none",

    scrollTrigger: {

        trigger: "#hero",

        start: "top top",
        // 스크롤을 시작하자마자 fade 시작

        end: "bottom 45%",
        // 히어로 하단이 화면 45% 지점에 오면 완전히 사라짐

        scrub: true

    }

});



// Hero

["hero","works","cv","info"].forEach(id=>{

    ScrollTrigger.create({

        trigger:"#"+id,

        start:"top center",

        end:"bottom center",

        onEnter(){

            changeLeftUI(id);

        },

        onEnterBack(){

            changeLeftUI(id);

        }

    });

});



// 서브메뉴

gsap.utils.toArray(".project").forEach((section)=>{


    ScrollTrigger.create({

        trigger:section,

        start:"top center",

        end:"bottom center",


        onEnter(){

            changeSub(section.id);

        },


        onEnterBack(){

            changeSub(section.id);

        }


    });


});



function changeSub(id){

    document.querySelectorAll(".sub li").forEach(li => li.classList.remove("active"));

    const link = document.querySelector(`.sub a[href="#${id}"]`);

    if (link) link.parentElement.classList.add("active");

}