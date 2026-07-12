// 좌측 메뉴만

// 좌측 메뉴 데이터
const LEFT_UI = {

    hero:{
        page:"Hello, World!",
        title:"Nice To Meet You",
        icon:"./img/envelope_closed.webp"
    },

    works:{
        page:"Works",
        title:"What I've done so far",
        icon:"./img/envelope_open.webp"
    },

    cv:{
        page:"CV",
        title:"Cucumber Lover",
        icon:"./img/postcard.webp"
    },

    info:{
        page:"Info",
        title:"What's Next?",
        icon:"./img/letter.webp"
    }

};



// 액티브
function changeLeftUI(id){

    const data = LEFT_UI[id];

    if(!data) return;

    //--------------------------------
    // 제목
    //--------------------------------

    document.querySelector(".currentPage").textContent = data.page;

    document.querySelector(".title").textContent = data.title;

    document.querySelector(".icon").src = data.icon;


    //--------------------------------
    // Main Menu
    //--------------------------------

    document.querySelectorAll(".gnb>li").forEach(li => li.classList.remove("active"));

    const active = document.querySelector(`.gnb>li[data-page="${id}"]`);
    if (active) active.classList.add("active");


    //--------------------------------
    // Accordion
    //--------------------------------

    if(id==="works"){

        gsap.to(".sub",{

            maxHeight:260,

            duration:.45,

            ease:"power2.out"

        });

    }else{

        gsap.to(".sub",{

            maxHeight:0,

            duration:.35

        });

        document.querySelectorAll(".sub li").forEach(li => li.classList.remove("active"));

    }

}
