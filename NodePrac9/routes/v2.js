const express = require('express');
const { verifyToken, apiLimiter } = require('./middlewares');

const jwt = require('jsonwebtoken'); // json token 라이브러리
const {Domain, User, Post, Hashtag} = require('../models')// model 들 불러오기

const router = express.Router();

// 데이터를 반환하는 요청을 처리
router.get('/posts/my', apiLimiter, verifyToken, (req, res, next) => {
    Post.findAll({where:{userId:req.decoded.id}})
    .then((posts) => {
        console.log(posts);
        res.json({code:200, payload: posts}); // -> 렌더링 하지 않고 json 문자열로 파싱해서 데이터를 넘겨주면 API Server
    })
    .catch((error) => {
        console.error(error);
        return res.status(500).json({
            code: 500,
            message: '서버에러'
        })
    })
})

// 토큰 발급 처리
router.post('/token', async(req, res) => {
    const {clientSecret} = req.body;

    try{
        // 도메인 찾아오기
        const domain = await Domain.findOne({
            where:{clientSecret},
            include:{
                model:User,
                attribute:['nick', 'id']
            }
        });
        
        // 도메인이 등록되어 있지 않은 경우
        if(!domain){
            return res.status(401).json({
                code: 410 ,
                message: "등록되지 않은 도메인 입니다."
            })
        }

        // 등록된 도메인의 경우 토큰 생성
        const token = jwt.sign({
            id: domain.User.id,
            nick: domain.User.nick,
        }, process.env.JWT_SECRET,{
            expiresIn: '1m',    // 유효시간
            issuer : 'adam' // 발급자
        });

        return res.json({
            code: 200,
            message : '토큰인 발급되었습니다.',
            token
        })

    }catch(error){
        console.log(error)
        return res.status(500).json({
            code: 500,
            message: "서버에러"
        })
    }
})

// 토큰을 확인하기 위한 처리
router.get('/test', apiLimiter, verifyToken, (req, res, next) => {
    res.json(req.decoded);
    
})

module.exports = router;