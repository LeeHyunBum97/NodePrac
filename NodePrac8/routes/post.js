const express = require('express');

// 파일 업로드를 위한 모듈
const multer = require('multer');
const path = require("path");
const fs = require('fs');

// 데이터 삽입을 위한 모듈
const {Post, Hashtag} = require("../models");

// 로그인 여부 판단.
const {isLoggedIn} = require('./middlewares');

const router = express.Router();

// 파일을 업로드할 디렉토리가 없으면 생성
try{
    fs.readdirSync('public/img')
}catch(error){
    fs.mkdirSync('public/img')
}

// 파일 업로드 객체
const upload = multer({
    storage:multer.diskStorage({
        destination(req, file, cb){
            cb(null, 'public/img/');
        },
        filename(req, file, cb){
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
        }
    }), limits:{fileSize: 10 * 1024 * 1024}
})

// 이미지와 게시글을 업로드 하는 작업을 나눈다.

// 이미지 업로드
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    console.log(req.file);
    res.json({url: `/img/${req.file.filename}`})
});

// 게시글 업로드_DB연동은 무조건 비동기이므로 async-await
const upload2 = multer();
router.post('/', upload2.none(), async (req, res, next) => {
    try {
        // 게시글 업로드
        const post = await Post.create(
            {content: req.body.content, img: req.body.url, UserId: req.user.id}
        );

        // 해시태그 찾기
        // # 다음에 나오는 내용을 찾는다.
        const hashtags = req.body.content.match(/#[^\s#]*/g);

        // 해시태그가 있으면 삽입
        if(hashtags){
            // 전부 실행
            const result = await Promise.all(
                // map은 배열의 전체 데이터를 순서대로 대입해서 {}안의 내용을 수행한다.
                hashtags.map(tag => {
                    // ORM의 장점중 하나로 SQL을 사용하면 있는지 한번 확인 후 없다면 만드는 것으로 두번 작성이 필요하지만
                    // 아래와 같은 findOrCreate를 사용하면 없으면 만들어라 라는 의미의 메서드로 한번에 가능하다.
                    // 단점으로는 ORM에서 제공하는 메서드를 따로 알아야 한다는 점이 있다.
                    return Hashtag.findOrCreate({
                        // slice(1)은 #을 저장할 필요는 없기 때문에 사용하고 대소문자 구별이 필요없기 때문에 모두 소문자로 취급
                        where:{title : tag.slice(1).toLowerCase()}
                    })
                })
            );
            await post.addHashtags(result.map(r => [0]));
        }
        // 데이터 업로드에 성공한 후 메인 화면으로 이동
        res.redirect('/');
    } catch (error) {
        console.log(error);
        next(error);
    }
});

module.exports = router;