// 로컬 로그인 관련 기능 구현
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user');

module.exports = () => {
    passport.use(new LocalStrategy({
        // ID에 해당하는 컬럼
        usernameField: 'email',

        // PW에 해당하는 컬럼
        passwordField: 'password'
    }, async(email, password, done) => {
        try{
            // 로그인 처리를 위해서 email에 해당하는 데이터 찾기
            const exUser = await User.findOne({where:{email}});
            if(exUser){
                // 이메일이 있는 경우 ->  비밀 번호 비교
                const result = await bcrypt.compare(password, exUser.password);

                if(result) {
                    // 로그인 성공
                    done(null, exUser);
                }else{
                    done(null, false, {message: "비밀번호 틀림"})
                }
            }else{
                done(null, false, {message: "존재하지 않는 이메일"})
            }
        }catch(error){
            console.log(error);
            done(error);
        }
    }))
}