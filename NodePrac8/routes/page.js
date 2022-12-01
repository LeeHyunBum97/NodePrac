const express = require('express');

// middleware 에 작성한 isLoggedIn, isNotLoggedIn 불러오기
const {isLoggedIn, isNotLoggedIn} = require('./middlewares');
const{Post, User, Hashtag} = require('../models');

const router = express.Router();

// 공통된 처리 - 무조건 수행
router.use((req, res, next) => {
    // 로그인한 유저 정보
    // 유저 정보를 res.locals.user에 저장
    res.locals.user = req.user;
    // 게시글을 follow하고 되고 있는 개수
    res.locals.followerCount = req.user ? req.user.Followers.length : 0;
    res.locals.followingCount = req.user ? req.user.Followings.length : 0;
    // 게시글을 follow 하고 이는 유저들의 목록
    res.locals.followerIdList = req.user ? req.user.Followings.map(f=>f.id):[];
    next();
});

router.get('/hashtag', async(req, res, next) => {
    // 파라미터 읽어오기
    const query = req.query.hashtag;
    if(!query){
        return res.redirect('/');
    }
    try{
        const hashtag = await Hashtag.findOne({where:{title:query}});
        let posts = []
        if(hashtag){
            posts = await Hashtag.getPosts({include:[{model:User}]});
        }
        return res.render('main', {title:`${query} | NodeAuthentication`, twits:posts})
    }catch(error){
        console.log(error);
        return next(error);
    }
})


// 메인 화면
router.get('/', async (req, res, next) => {
    try {
        const posts = await Post.findAll({
            include: {
                model: User,
                attributes: ['id', 'nick']
            },
            order: [['createdAt', 'DESC']]
        });

        // 템플릿 엔진을 이용한 출력 views 디렉토리의 main.html로 출력
        res.render('main', {
            title: "Node Authentication",
            twits: posts
        });

    } catch (error) {
        console.log(error);
        next(error);
    }
})

/* //메인화면
router.get('/',(req, res, next) => {
    const twits = [];
    // 템플릿 엔진을 이용한 출력
    // views 디렉토리의 main.html로 출력
    res.render('main', {title:"Node Authentication", twits});
}); */

//회원가입 - 로그인이 되어있지 않은 경우에만 수행
router.get('/join', isNotLoggedIn, (req, res, next) => {
    res.render('join', {title: "회원가입 - Node Authencation"});
});

//프로필 화면 처리 - 로그인 되어 있는 경우에만 수행
router.get('/profile', isLoggedIn, (req, res, next) => {
    res.render('profile', {title: "나의 정보 - Node Authencation"});
});

module.exports = router;