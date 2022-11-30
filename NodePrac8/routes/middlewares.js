// 로그인 했을 경우를 판단
exports.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        next();
    }else {
        res.status(403).send('로그인 필요');
    }
}

// 로그인 하지 않은 경우를 판단
exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        next();
    }else {
        // 메시지를 생성하는 query string(parameter)로 사용할 것이라서 encoding을 해줘야 한다.
        const message = encodeURIComponent('로그인 한 상태 입니다.');

        // 이전 request 객체의 내용을 모두 삭제하고 새로운 요청 흐름을 만드는 것이다.
        // 새로 고침을 하면 결과 화면만 새로고침 된다.
        res.redirect(`/?error=${message}`);
    }
}