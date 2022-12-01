const passport = require("passport");
const kakaoStrategy = require("passport-kakao").Strategy;

// 유저정보 가져오기
const User = require('../models/user');

// 카카오 로그인 
module.exports = () =>{
    passport.use(new kakaoStrategy({
        clientID: process.env.KAKAO_ID,

        // kakaoDveloper의 카카오 로그인의 리다이렉트 URL 확인해서 작성
        callbackURL: '/auth/kakao/callback'
    }, async(accessToken, refreshToken, profile, done) => {
        // kakaoDveloper의 카카오 로그인의 동의 항목에서 동의한 정보들을 profile에 가져온다.
        console.log(profile);

        try{
            // 이전에 로그인 한 적이 있는지 찾기 위해서 카카오 아이디와 provider가 kako로 되어있는 데이터가 있는지 조회
            const exUser = await (User.findOne({
                // provider는 model의 user 테이블이 갖고있는 로그인 방식 컬럼을 선택하는 것
                where:{snsId:profile.id, provider:'kakao'}
            }));

            // 이전에 kakao 로 로그인 한적이 있으면
            if(exUser) {
                done(null, exUser);
                // 그냥 넘어간다.
            }else{
                // 이전에 로그인 한 적이 없으면 데이터를 저장한다.
                const newUser = await User.create({
                    email:profile._json.kakao_account.email,
                    nick: profile.displayName,
                    snsId:profile.id,
                    provider: 'kakao'
                });
                done(null, newUser); // 저장하고 넘기기
            }
        }catch(error){
            console.log(error);
            done(error);
        }
    }));
}