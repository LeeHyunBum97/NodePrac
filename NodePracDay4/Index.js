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
    frequency: 'daily',
    verbose: false
});

// 로그 기록 설정
app.use(morgan('combined', {stream: accessLogStream}));

// 압축해서 전송하는 옵션 설정
app.use(compression());

// POST 방식의 파라미터를 읽을 수 있도록 설정 GET 은 웹서버에서 처리해서 넘겨주지만 POST 방식은 본문에 담겨오고 이는 애플리케이션
// 서버에서 처리 되므로 따로 인코딩 처리 필요.
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Session을 DB에 저장하는 작업 데이터 베이스 접속 정보
let options = {
    host: process.env.HOST,
    port: process.env.MYSQLPORT,
    user: process.env.MYSQLUSER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
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
app.use(
    session({secret: process.env.COOKIE_SECRET, resave: false, saveUninitialized: true, store: new MariaDBStore(options)})
);

// 파일 업로드 설정
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            done(null, 'public/img')
        },
        filename(req, file, done) {
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        }
    }),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

//정적 파일의 경로를 설정
app.use('/', express.static('public'));

//파일 다운로드를 위한 모듈
let util = require('util');
let mime = require('mime');
const {json} = require("express");

//데이터베이스 연결
let connection = mysql.createConnection(options);
connection.connect((error) => {
    if (error) {
        console.log(error);
        throw error;
    }
})

// 기본 요청을 처리 -> /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.get('/item/all', (req, res) => {
    // HTML 출력 : res.sendFile(파일경로) - 서버의 데이터 출력 못함 서버의 데이터 출력 못함 - ajax 나 fetch
    // api를 이용해야 한다. 템플릿 엔진 : res.render(파일경로, 데이터) 템플릿 엔진에 넘겨주는 데이터는 프로그래밍 언어의 데이터
    // JSON 출력 : res.json(데이터) json 문자열의 형태로 데이터를 제공한다. FE 에서 데이터를 수신해서 출력하는 구조 2개
    // 이상의 데이터를 조회할 때는 정렬은 필수
    connection.query(
        "select * from goods order by itemid desc",
        (err, result, fields) => {
            if (err) {
                // 에러가 발생한 경우 에러가 발생했다고 데이터를 전송하지 않으면 안된다. 404 에러 즉, 클라이언트에서 잘못 요청한 경우를 제외하고는 BE
                // 에서 에러를 보여주면 안된다.
                res.json({'result': false})
            } else {
                // 정상 응답한 경우
                res.json({'result': true, 'list': result});
                //res.send(result);
            }

        }
    )
});

// 데이터 일부분 가져오기 - URL:/item/list , 파라미터는 pageno 1개 인데 없으면 1로 설정
app.get('/item/list', (req, res) => {
    // 파라미터 읽어오기
    let pageno = req.query.pageno;

    if (pageno == undefined) {
        pageno = 1;
    }
    // http://localhost:9000/item/list?pageno=2 브라우저에서 강제로 매개변수 넘겨주는 방식 넘어오는지
    // console로 확인
    //console.log(pageno);

    // item 테이블에서 itemid를 가지고 내림차순 정렬해서 페이지 단위로 데이터 가져오기 select * feom item order by
    // itemid desc limit 시작번호, 5 시작번호 = (pageno-1)*5 파라미터는 무조건 문자열이므로 산술연산이 필요하다면
    // 숫자로 형변환 해야한다. 성공여부
    let sucOrFail = true;
    // 성공했을 때 데이터를 저장
    let list;
    // 데이터 목록 가져오기
    connection.query(
        "select * from goods order by itemid desc limit ? , 5",
        [(parseInt(pageno) - 1) * 5],
        (err, result, fields) => {
            if (err) {
                console.log(err);
                sucOrFail = false;
            } else {
                list = result;
            }
        }
    );

    // 테이블의 전체 데이터 개수를 가져오기
    let dataCnt = 0;
    connection.query("select count(*) cnt from goods;", (err, result, fields) => {
        if (err) {
            // 에러 발생시 실행할 구문
            console.log(err);
        } else {
            // 쿼리 정상 실행 되었을 때 실행할 구문
            dataCnt = result[0].cnt;
        }
        // 응답 생성해서 전송
        if (sucOrFail === false) {
            res.json({"result": false});
        } else {
            res.json({"result": true, "list": list, "count": dataCnt});
        }
    });

});

// 에러 발생 시 처리하는 부분
app.use((err, req, res, next) => {
    console.log(err);
    res
        .status(500)
        .send(err.message);
});

// 서버 구동
app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중')
})