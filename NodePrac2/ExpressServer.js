const express = require("express"); // 웹 서버를 구축하기 위한 외부 모듈

// 서버 객체와 포트 설정
const app = express();
app.set('port', 8000);

// 사용자의 요청 처리
app.get('/', (req, res) => {
    console.log(req.ip); // 접속자의 ip를 콘솔에 출력 나는 ::1(IPv6), 127.0.0.1(IPv4)
    console.log(req.query) // 클라이언트 에서 보낸 메서드 요청에 대한 parameter값을 콘솔로 확인가능.
    res.sendFile(path.join(__dirname,'./ExpressServerTest.html'));
})

const path = require("path") // 현재 디렉토리에 대한 절대 경로를 알아내기 위한 경로관련 모듈

// 일다 위 로그 기록을 위안설정
const morgan = require("morgan") 
const FileStreamRotater = require("file-stream-rotator");
const fs = require("fs");

//로그 파일을 저장할 디렉터리 생성
const logDirectory = path.join (__dirname, 'log');

// 디렉터리 존재 여부 확인하고 디렉터리가 없으며 생성
fs.existsSync(logDirectory)||fs.mkdirSync(logDirectory);


// 하루 단위 로그 기록 설정
const accessLogStream = FileStreamRotater.getStream({
    date_format : "YYYYMMDD",
    filename:path.join(logDirectory, "access-%DATE%.log"),
    frequency:'daily',
    verbose:'true'
});

app.use(morgan('combined', {stream:accessLogStream}));

// 서버 구동
app.listen(app.get('port'), () =>{
    console.log(app.get('port'), '번 포트에서 대기 중');
});
