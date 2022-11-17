const express = require("express"); // 웹 서버를 구축하기 위한 외부 모듈
const path = require("path") // 현재 디렉토리에 대한 절대 경로를 알아내기 위한 경로관련 모듈

// 서버 객체와 포트 설정
const app = express();
app.set('port', 8000);

// 사용자의 요청 처리
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'./ExpressServerTest.html'));
})

// 서버 구동
app.listen(app.get('port'), () =>{
    console.log(app.get('port'), '번 포트에서 대기 중');
});