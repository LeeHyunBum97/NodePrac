const express = require('express');

const passport = require("passport");
const bcrypt = require("bcrypt");

const {isLoggedIn, isNotLoggedIn} = require("./middlewares")

const User = require('../models/user');

const router = express.Router();

// 회원 가입 처리
// 원래 /auth/join 인데 라우팅 할 때 처리 할 때 /auth 추가
router.post('/join', async(req, res, next) => {
    // 데이터 찾아오기
    /* const email = req.body.email;
    const nick = req.body.nick;
    const password = req.body.password; */

    // 데이터 찾아오기 - 구조적 분해할당
    // req.body에서 email, nick, password를 찾아서 대입, 순서는 상관없으나 client에서 넘겨주는 속성이름과 같아야한다.
    const {email, nick, password} = req.body;

    try{
        // email 존재 여부 확인
        const exUser = await User.findOne({where:{email}});

        // 이미 존재하는 이메일
        if(exUser){
            // 회원 가입 페이지로 리다이렉트 하는데
            // error 키에 메시지를 가지고 이동
            return res.redirect('/join?error=exist')
        }else {
            // 비밀번호를 해싱
            const hash = await bcrypt.hash(password, 12);
            // 저장
            await User.create({
                email, nick, password:hash
            })
            return res.redirect('/')
        }
    } catch(error){
        console.error(error);
        return next(error);
    }
});

// 로그인 처리
router.post('/login', isNotLoggedIn, (req, res, next) => {
    // passport 모듈을 이용해서 로그인
    passport.authenticate('local', (authError, user, ingo) => {
        if(authError){
            console.log(authError);
            return next(authError);
        }

        // 일치 하는 User가 없을 때
        if(!user){
            return res.redirect(`/?loginError=${info.message}`)
        }

        return req.login(user, (loginError) => {
            if(loginError){
                console.error(loginError);
                return next(loginError);
            }
            // 로그인 성공하면 메인 페이지로 이동
            return res. redirect('/');
        })
    })(req, res, next);
});

// 로그아웃 처리
router.get('/logout', isLoggedIn, (req, res, next) => {
    req.logout((error) => {
        if(error){
            return next(error);
        }

        // 로그 아웃시 세션 초기화
        req.session.destroy();
        res.redirect('/');
    })
});

module.exports = router;