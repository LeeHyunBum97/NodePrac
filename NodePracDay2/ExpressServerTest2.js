// express 모듈을 가져오고 이를 다룰 수 있는 객체를 생성
const express = require("express");
const app = express();

// 포트 설정
app.set('port', 8000);

//사용자의 요청 처리
app.get("/session", (req, res) => {
    // 단순 내용 환면 출력
    res.send("세션관리");
})

// 서버 실행 시키고 사용자의 요청을 처리
app.listen(app.get('port'), () => {
    console.log("서버 대기중");
})