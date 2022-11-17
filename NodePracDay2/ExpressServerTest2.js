// express 모듈을 가져오고 이를 다룰 수 있는 객체를 생성
const express = require("express");
const app = express();

// 포트 설정
app.set('port', 8000);

// 세션을 사용하기 위한 미들웨어 설정
// 세션은 클라이언트에 키를 만들어서 매핑하는 이때, key의 값을 알아보기 어렵게 하기 위해서 연산을 수행할 값을 주게 되는 값이 secret
const session = require('express-session');
app.use(session({
    secret : "keyboard cat",
    resave : false,
    saveUninitialized:true
}));

let num = 1;

// user마다의 요청에 대한 처리 외부의 변수는 모든 사용자가 동시에 공유하게 된다. -> 접속자 수 정도만 이런식으로 설정
//사용자의 요청 처리


app.get("/session", (req, res) => {
    // 세션의 num의 값이 없으면 1로 초기화하고 있다면 1 증가
    if(!req.session.num){
        req.session.num = 1;
    } else {
        req.session.num += 1;
    }
    num += 1;
    // 내용을 화면에 출력
    res.send("num: " + num + "<br/> session의 num : " + req.session.num);
 
});

// 서버 실행 시키고 사용자의 요청을 처리
app.listen(app.get('port'), () => {
    console.log("서버 대기중");
})