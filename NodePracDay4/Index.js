const express = require("express");
const morgan = require("morgan");
const compression = require("compression");
const path = require("path");
const mysql = require("mysql");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const multer = require("multer");
const dotenv = require("dotenv");

// 설정파일 내용 가져오기
dotenv.config();

// 서버 설정
const app = express();
app.set('port', process.env.PORT || 9000);

// 로그를 매일 기록하기 위한 설정
let FileStreamRotator = require("file-stream-rotator");
let fs = require("fs");

// 로그를 기록할 디렉토리 경로 생성
let logDirctory = path.join(__dirname, 'log');

// log 디렉토리 없으면 생성
fs.existsSync(logDirctory) || fs.mkdirSync(logDirctory);

// 로그 파일 옵션을 설정
let accessLogStream = FileStreamRotator.getStream({
    date_format: "YYYYMMDD",
    filename: path.join(logDirctory, 'access-%DATE%.log'),
    frequency:'daily',
    verbose: false
});

// 로그 기록 설정
app.use(morgan('combined', {stream: accessLogStream}));

// 압축해서 전송하는 옵션 설정
app.use(compression());

// POST 방식의 파라미터를 읽을 수 있도록 설정
// GET 은 웹서버에서 처리해서 넘겨주지만 POST 방식은 본문에 담겨오고 이는 애플리케이션 서버에서 처리 되므로 따로 인코딩 처리 필요.
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Session을 DB에 저장하는 작업
// 데이터 베이스 접속 정보
let options = {
    host : process.env.HOST,
    port : process.env.MYSQLPORT,
    user : process.env.MYSQLUSER,
    password : process.env.PASSWORD,
    database : process.env.DATABASE
}
/* const dbConnOp = fs.readFileSync('./DBConnection.json');
const connOp = JSON.parse(dbConnOp);
let options = {
    host : connOp.host,
    port : connOp.mysqlport,
    user : connOp.username,
    password : connOp.password,
    database : connOp.database
} */

// 세션을 저장하기 위한 MySQL DB 저장소 생성
const MariaDBStore = require('express-mysql-session')(session);

// 세션 설정
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave : false,
    saveUninitialized : true,
    store : new MariaDBStore(options)
}));

// 파일 업로드 설정
const upload = multer({
    storage : multer.diskStorage({
        destination(req, file, done){
            done(null, 'public/img')
        },
        filename(req, file, done){
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        }
    }),
    limits: {fileSize: 10*1024*1024}
});

//정적 파일의 경로를 설정
app.use('/', express.static('public'));

//파일 다운로드를 위한 모듈
let util = require('util');
let mime = require('mime');
const { json } = require("express");

//데이터베이스 연결
let connection = mysql.createConnection(options);
connection.connect((error) => {
    if(error){
        console.log(error);
        throw error;
    }
})

// 기본 요청을 처리 -> /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.get('/item/all', (req, res) => {
    // HTML 출력 : res.sendFile(파일경로) - 서버의 데이터 출력 못함
    // 템플릿 엔진 : res.render(파일경로, 데이터)
    // JSON 출력 : res.json(데이터)
});

// 에러 발생 시 처리하는 부분
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send(err.message);
});

// 서버 구동
app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중')
})