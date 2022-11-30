const express = require('express');
const router = express.Router();

// 공통된 처리 - 무조건 수행
router.use((req, res, next) => {
    // 로그인한 유저 정보
    res.locals.user = null;
    // 게시글을 follow하고 되고 있는 개수
    res.locals.followCount = 0;
    res.locals.followingCount = 0;
    // 게시글을 follow 하고 이는 유저들의 목록
    res.locals.followIdList = [];

    next();
})

//메인화면
router.get('/',(req, res, next) => {
    const twits = [];
    // 템플릿 엔진을 이용한 출력
    // views 디렉토리의 main.html로 출력
    res.render('main', {title:"Node Authentication", twits});
});

//회원가입
router.get('/join', (req, res, next) => {
    res.render('join', {title: "회원가입 - Node Authencation"});
});

//프로필 화면 처리
router.get('/profile', (req, res, next) => {
    res.render('profile', {title: "나의 정보 - Node Authencation"});
});

module.exports = router;