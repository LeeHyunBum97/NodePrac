const express = require("express");

const router = express.Router();

// 공통된 처리 - 무조건 수행되는 일
router.use((req, res) => {
    // 로그인한 유저 정보
    res.locals.user = null;

    // 게시글을 follow하고 되고 있는 개수
    res.locals.follwCount = 0;
    res.locals.follwingCount = 0;

    // 개시글을 follow하고 있는 유정들의 목록
    res.locals.follwerIdList = [];

    next();
})

// 메인 화면
router.get('/', (req, res) => {
    const twits = [];

    // 템플릿 엔진을 이용한 출력
    // res.render('뷰이름', 데이터);
    // views 디렉토리의 main.html 로 출력된다.
    res.render('main', {title:"Node Authentication", twits});
});

// 회원가입
router.get('/join', (res, req, next) => {
    res.render('join', {title : "회원가입 - Node Authentication"})
});

// 프로필 화면 처리
router.get('/profile', (res, req, next) => {
    res.render('join', {title : "나의 정보 - Node Authentication"})
});

module.exports = router;