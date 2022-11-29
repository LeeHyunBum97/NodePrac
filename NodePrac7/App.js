const express = require('express');
const morgan = require('morgan');
const path = require('path');
const multer = require('multer');
const fs = require('fs')

// express web application server 를 9000번 포트로 생성
const app = express();
app.set('port', process.env.PORT || 9000);

// 로그를 화면에 출력
app.use(morgan('dev'));


// form이 아닌 형태의 POST 방식의 파라미터를 읽기 위한 설정
// client에서 모든 데이터를 form 에 담아 보낸다면 필요없음.
let bodyParser = require('body-parser')
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

// 파일 다운로드를 구현하기 위한 모듈
let util = require('util')
let mime = require('mime')

// 파일 업로드를 위한 디렉터리를 없으면 생성하는 것을 처리하는 코드
try {
    fs.readdirSync('img');
} catch (error) {
    console.error('img 폴더가 없어 img 폴더를 생성합니다.');
    fs.mkdirSync('img');
}

// 파일 업로드 설정
const upload = multer({
    storage: multer.diskStorage({

        // destination 이 업로드 할 디렉토리를 설정하는 역할
        destination(req, file, done) {
            done(null, 'img/');
        },
        // filenaname이 업로드 될 때 파일 이름 설정
        filename(req, file, done) {
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        }
    }),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// 템플릿엔진(서버의 데이터를 html에 출력하기 위한 모듈) 설정
// 이번엔 ejs 사용해서 html로 출력하도록 설정한 것.
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Mongo DB 사용을 위한 모듈 가져오기
let MongoClient = require('mongodb').MongoClient

// 접속할 DB URL 설정
let databaseUrl = 'mongodb://localhost:27017/';

// node DB의 item 컬렉션에 존재하는 모든 데이터를 반환한다.
app.get('/item/all', (req, res) => {
    // 데이터 베이스 연결
    MongoClient.connect(databaseUrl, {useNewUrlParser:true}, (error, database) => {
        if(error){
            console.log(error);

            // 절대로 client 입자에서는 튕겨버리지 않고 그냥 에러나 실패를 출력하는 편이 나음
            // 404 에러이면 "죄송합니다, 요청하신 페이지를 찾을 수 없습니다." 라고 출력하는 것이 낫다.
            res.json({"result":false, "message":"이유"});
        } else {
            // 데이터 베이스 가져오기
            // database.db('사용할 DB이름')
            let db = database.db('node')

            // item 컬렉션의 모든 데이터 가져오기
            db.collection("item").find().sort({itemid:-1}).toArray((error, items) => {
                if(error){
                    console.log(error);
                    res.json({"result":false, "message":"이유"});
                }else{
                    res.json({"result":true, "list":items, "count":items.length});
                }
            });
        }
    })
});

// node 데이터 베이스의 item 컬렉션의 데이터를 페이지 단위로 가져오기
// 데이터베이스에서 페이지 단위로 데이터를 가져올 때는 건너뛸 개수와 가져올 데이터 개수가 필요

// 클라이언트에서 넘겨주는 데이터 : 페이지 번호와 데이터 개수
app.get('/item/paging', (req, res) => {
    // 클라이언트의 데이터 받아오기
    // 페이지 번호와 같아 ?변수=값 으로 올 때는  query로 받고 :속성 경로로 값이 오면 params로 post방식으로 값이 넘어오면 body로 받는다.
    let pageno = req.query.pageno; // 페이지 번호
    let count = req.query.count; // 한 번에 가쟈올 데이터 개수

    // 건너뛸 개수 계산
    if(pageno == undefined){
        pageno = 1;
    }
    if(count == undefined){
        count = 2;
    }

    let start = (parseInt(pageno) - 1) * parseInt(count);

    // 데이터 베이스 연결
    MongoClient.connect(databaseUrl, {useNewUrlParser:true}, (error, database) => {
        if(error){
            console.log(error);

            // 절대로 client 입자에서는 튕겨버리지 않고 그냥 에러나 실패를 출력하는 편이 나음
            // 404 에러이면 "죄송합니다, 요청하신 페이지를 찾을 수 없습니다." 라고 출력하는 것이 낫다.
            res.json({"result":false, "message":"이유"});
        } else {
            // 데이터 베이스 가져오기
            // database.db('사용할 DB이름')
            let db = database.db('node')

            // item 컬렉션의 모든 데이터 가져오기
            db.collection("item").find().sort({itemid:-1}).skip(start).limit(parseInt(count)).toArray((error, items) => {
                if(error){
                    console.log(error);
                    res.json({"result":false, "message":"이유"});
                }else{
                    res.json({"result":true, "list":items, "count":items.length});
                }
            })
        }
    })
});

// 상세보기
// 기본키 하나의 데이터를 필요로 하는 경우가 많고
// 결과는 하나의 데이러를 반환하는 경우도 많으며 그 이외의 주위의 3~10개 정도의 같이 반환하는 경우가 많다.
// 예시로 게시글 같은 경우 하나의 게시글을 읽을 때, 사용자는 다음 게시글, 이전 게시글 혹은 해당 게시글의 가까운 게시글을 읽을 가능성이 높다.
app.get('/item/:itemid', (req, res) => {
    // 클라이언트의 데이터 받아오기
    // 페이지 번호와 같아 ?변수=값 으로 올 때는 query로 받고 :속성 경로로 값이 오면 params로 post방식으로 값이 넘어오면 body로 받는다.
    let itemid = req.params.itemid

    // 데이터 베이스 연결
    MongoClient.connect(databaseUrl, {useNewUrlParser:true}, (error, database) => {
        if(error){
            console.log(error);

            // 절대로 client 입자에서는 튕겨버리지 않고 그냥 에러나 실패를 출력하는 편이 나음
            // 404 에러이면 "죄송합니다, 요청하신 페이지를 찾을 수 없습니다." 라고 출력하는 것이 낫다.
            res.json({"result":false, "message":"이유"});
        } else {
            // 데이터 베이스 가져오기
            // database.db('사용할 DB이름')
            let db = database.db('node')

            // item 컬렉션의 모든 데이터 가져오기
            db.collection("item").findOne({"itemid":Number(itemid)}, (error, item) => {
                if(error){
                    console.log(error);
                    res.json({"result":false, "message":"이유"});
                }else{
                    res.json({"result":true, "item":item});
                }
            });
        }
    });
});

//에러 처리를 위한 부분
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).send(message);
});

// 서버 동작
app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});