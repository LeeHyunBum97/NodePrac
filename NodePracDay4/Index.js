const express = require("express");
const morgan = require("morgan");
const compression = require("compression");
const path = require("path");
const mysql = require("mysql");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const multer = require("multer");
const dotenv = require("dotenv");

// 자주쓰는 코드는 함수로 만들어 오기 일단은 fetchAPI 없이 get, post, .. 구현 설정파일 내용 가져오기
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

//데이터베이스 연결
let connection = mysql.createConnection(options);
connection.connect((error) => {
    if (error) {
        console.log(error);
        throw error;
    }
})

// sequelize를 이용한 데이터베이스 연결 require 할 때 디렉터리 이름을 기재하면 디렉터리 안의 index.js의 내용을
// impor
const {sequelize} = require('./models');
const {Good} = require('./models')

sequelize
    .sync({force: false})
    .then(() => {
        console.log("데이터 베이스 연결 성공")
    })
    .catch((err) => {
        console.log("데이터베이스 연결 실패")
    });

// 기본 요청을 처리 -> /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

// 전체 데이터 가져오기 1
/* app.get('/item/all', (req, res) => {
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
}); */

// 전체 데이터 가져오기 2
app.get('/item/all', async (req, res) => {
    // HTML 출력 : res.sendFile(파일경로) - 서버의 데이터 출력 못함 서버의 데이터 출력 못함 - ajax 나 fetch
    // api를 이용해야 한다. 템플릿 엔진 : res.render(파일경로, 데이터) 템플릿 엔진에 넘겨주는 데이터는 프로그래밍 언어의 데이터
    // JSON 출력 : res.json(데이터) json 문자열의 형태로 데이터를 제공한다. FE 에서 데이터를 수신해서 출력하는 구조 2개
    // 이상의 데이터를 조회할 때는 정렬은 필수
    try {
        let list = await Good.findAll();
        res.json({"result": true, "list": list});
    } catch (err) {
        console.log(err)
        res.json({"result": false})
    }
});

// 데이터 일부분 가져오기 - URL:/item/list , 파라미터는 pageno 1개 인데 없으면 1로 설정
/* app.get('/item/list', (req, res) => {
    // 파라미터 읽어오기
    let pageno = req.query.pageno;

    if (pageno == undefined) {
        pageno = 1;
    }
    // http://localhost:9000/item/list?pageno=2 브라우저에서 강제로 매개변수 넘겨주는 방식 넘어오는지
    // console로 확인 console.log(pageno); item 테이블에서 itemid를 가지고 내림차순 정렬해서 페이지 단위로 데이터
    // 가져오기 select * feom item order by itemid desc limit 시작번호, 5 시작번호 =
    // (pageno-1)*5 파라미터는 무조건 문자열이므로 산술연산이 필요하다면 숫자로 형변환 해야한다. 성공여부
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

}); */

// 데이터 일부분 가져오기2(페이지 단위) - URL:/item/list , 파라미터는 pageno 1개 인데 없으면 1로 설정
app.get('/item/list', async (req, res) => {
    // 파라미터 읽어오기
    let pageno = req.query.pageno;

    if (pageno == undefined) {
        pageno = 1;
    }

    try {
        // 테이블의 전체 데이터 개수를 가져오기
        let cnt = await Good.count();

        // 페이지 단위로 데이터 목록 가져오기
        let list = await Good.findAll({
            offset: (parseInt(pageno) - 1) * 5,
            limit: 5
        });
        res.json({"result": true, "list":list});
    } catch (err) {
        console.log(err);
        res.json({"result": false});
    }

});

// 상세보기 처리를 위한 코드
/* app.get('/item/detail/:itemid', (req, res) => {
    // 파라미터 읽기
    let itemid = req.params.itemid;

    // itemid를 이용해서 1개의 데이터를 찾아오는 SQL을 실생
    connection.query(
        "select * from goods where itemid = ?",
        [itemid],
        (err, result, fields) => {
            if (err) {
                console.log(err);
                res.json({"result": false});
            } else {
                res.json({"result": true, "item": result[0]});
            }
        }
    );
}); */

// 상세보기 처리를 위한 코드 2
app.get('/item/detail/:itemid', async(req, res) => {
    // 파라미터 읽기
    let itemid = req.params.itemid;

    try{
        let item = await Good.findOne({
            where:{
                itemid:itemid
            }
        });
        res.json({"result":true, "item":item})
    }catch(err){
        console.log(err);
        console.log({"result":false});
    }
});

//이미지 다운로드 처리
app.get('/img/:pictureurl', (req, res) => {
    let pictureurl = req.params.pictureurl;
    //이미지 파일의 절대경로를 생성
    let file = "C:\VSC\KakaoCloud\NodePrac\NodePracDay4\public\img/" +
            pictureurl;
    console.log(__dirname);
    //파일 이름을 가지고 타입을 생성
    let mimetype = mime.lookup(pictureurl);
    res.setHeader('Content-disposition', 'attachment; filename=' + pictureurl);
    res.setHeader('Content-type', mimetype);
    //파일의 내용을 읽어서 res에 전송
    let filestream = fs.createReadStream(file);
    filestream.pipe(res);
});

// 현재 날짜를 문자열로 반환하는 함수 요즘 등장하는 JS 라이브러리 샘플 예제는 특별한 경우가 아니면 fucntion을 사용하지 않는다.
const getDate = () => {
    let date = new Date();

    let year = date.getFullYear();

    // 월은 +1을 해야 우리가 사용하는 월이 된다.
    let month = date.getMonth() + 1;
    let day = date.getDate();

    month = month >= 10
        ? month
        : '0' + month;
    day = day >= 10
        ? day
        : '0' + day;

    return year + "-" + month + "-" + day;
}

// 날짜와 시간을 반환하는 함수
const getTime = () => {
    let date = new Date();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    hour = hour >= 10
        ? hour
        : '0' + hour;
    minute = minute >= 10
        ? minute
        : '0' + minute;
    second = second >= 10
        ? second
        : '0' + second;

    return getDate() + " " + hour + ":" + minute + ":" + second
}

// 데이터 삽입을 처리해주는 함수
/* app.post('/item/insert', upload.single('pictureurl'),
    (req, res) => {
    //파라미터 읽어오기
    const itemname = req.body.itemname;
    const description = req.body.description;
    const price = req.body.price;

    //파일 이름 - 업로드하는 파일이 없으면 default.jpg
    let pictureurl;
    if(req.file){
        pictureurl = req.file.filename
    }else{
        pictureurl = 'default.jpg';
    }

    //가장 큰 itemid 찾기
    connection.query("select max(itemid) maxid from goods",
    [], (err, results, fields) => {
        let itemid;
        //최대값이 있으면 + 1 하고 없으면 1로 설정
        if(results.length > 0 ){
            itemid = results[0].maxid + 1;
        }else{
            itemid = 1;
        }

        //데이터 삽입
        connection.query("insert into goods(" +
            "itemid, itemname, price, description,"
            + "pictureurl, updatedate) values(?, ?, ?, ?, ?, ?)",
            [itemid, itemname, price, description, pictureurl,
            getDate()], (err, results, fields) => {
            if(err){
                console.log(err);
                res.json({"result":false});
            }else{
                //현재 날짜 및 시간을 update.txt에 기록
                const writeStream = fs.createWriteStream('./update.txt');
                writeStream.write(getTime());
                writeStream.end();

                res.json({"result":true});
            }
        })
    });
}); */

// 데이터 삽입을 처리해주는 함수2(async-await)
app.post('/item/insert', upload.single('pictureurl'),
// async 추가
async (req, res) => {
    //파라미터 읽어오기
    const itemname = req.body.itemname;
    const description = req.body.description;
    const price = req.body.price;

    //파일 이름 - 업로드하는 파일이 없으면 default.jpg
    let pictureurl;
    if (req.file) {
        pictureurl = req.file.filename
    } else {
        pictureurl = 'default.jpg';
    }

    //가장 큰 itemid 찾기
    let itemid = 1;
    try {
        let x = await Good.max('itemid');
        itemid = x + 1;
    } catch (err) {
        console.log(err);
    }

    // 데이터 삽입
    Good.create({
        itemid: itemid,
        itemname: itemname,
        price: price,
        description: description,
        pictureurl: pictureurl,
        updatedate: getDate()
    });

    //현재 날짜 및 시간을 update.txt에 기록
    const writeStream = fs.createWriteStream('./update.txt');
    writeStream.write(getTime());
    writeStream.end();

    res.json({"result": true});
});

//데이터를 삭제하는 함수
/* app.post('/item/delete', (req, res) => {
    //post 방식으로 전송된 데이터 읽기
    let itemid = req.body.itemid;

    //itemid를 받아서 goods 테이블에서 삭제하기
    connection.query(
        "delete from goods where itemid=?",
        [itemid],
        (err, results, fields) => {
            if (err) {
                console.log(err);
                res.json({"result": false});
            } else {
                //현재 날짜 및 시간을 update.txt에 기록
                const writeStream = fs.createWriteStream('./update.txt');
                writeStream.write(getTime());
                writeStream.end();
                res.json({"result": true});
            }
        }
    );
}); */

//데이터를 삭제하는 함수2
app.post('/item/delete', async(req, res) => {
    //post 방식으로 전송된 데이터 읽기
    let itemid = req.body.itemid;

    try{
        // 실제로 삭제하는 것이 아님 DB에 가면 존재하는데 DeletedAt에 컬럼에만 표시해두어
        // find 할 때 찾아오지 않는 것.
        // await 이하의 내용을 let deletedItem과 같은 변수에 담으면 Sequelize 삽/삭/갱은 작업이 이뤄진 데이터를 반환하기 때문에
        // 무엇이 바꼈는지 알 수 있다.
        await Good.destroy({ 
            where: {
                itemid: itemid
            }
        })
    }catch(err){
        console.log(err);
        console.log({"result":false})
    }
});

// 수정을 get으로 요청했을 때 - 수정 화면으로 이동하게 한다.
app.get('/item/update', (req, res) => {
    // public 디렉터리의 update.html을 읽어내서 반환
    fs.readFile('./public/update.html', (err, data) => {
        res.end(data);
    })
});


// 수정을 처리하는 코드 1
/* app.post('/item/update', upload.single('pictureurl'), (req, res) => {
    //파라미터 가져오기
    const itemid = req.body.itemid;
    const itemname = req.body.itemname;
    const price = req.body.price;
    const description = req.body.description;
    //예전 파일 이름
    const oldpictureurl = req.body.oldpictureurl;

    //수정할 파일 이름 만들기
    let pictureurl;
    //새로 선택한 파일이 있다면
    if (req.file) {
        pictureurl = req.file.filename;
    } else {
        pictureurl = oldpictureurl;
    }
    //데이터베이스 작업
    connection.query(
        "update goods set itemname=?, price=?,description=?, pictureurl=?, updatedate=?" +
                " where itemid=?",
        [
            itemname,
            price,
            description,
            pictureurl,
            getDate(),
            itemid
        ],
        (error, results, fields) => {
            //console.log(results); console.log(fields);
            if (error) {
                //에러가 발생한 경우
                console.log(error);
                res.json({"result": false});
            } else {
                //성공했을 때 처리
                const writeStream = fs.createWriteStream("./update.txt");
                writeStream.write(getTime());
                writeStream.end();
                res.json({"result": true});
            }
        }
    )

}); */

// 수정을 처리하는 코드 1
app.post('/item/update', upload.single('pictureurl'), async(req, res) => {
    //파라미터 가져오기
    const itemid = req.body.itemid;
    const itemname = req.body.itemname;
    const price = req.body.price;
    const description = req.body.description;
    //예전 파일 이름
    const oldpictureurl = req.body.oldpictureurl;

    //수정할 파일 이름 만들기
    let pictureurl;
    //새로 선택한 파일이 있다면
    if (req.file) {
        pictureurl = req.file.filename;
    } else {
        pictureurl = oldpictureurl;
    }
    //데이터베이스 작업
    try{
        await Good.update({
            itemname:itemname,
            price:price,
            description:description,
            pictureurl:pictureurl,
            updatedate:getDate()
        }, {where : {itemid:itemid}})
        res.json({"result":true})
    }catch(err){
        console.log(err);
        console.log({"result":false})
    }

});

app.get('/item/updatedate', (req, res) => {
    fs.readFile('./update.txt', (error, data) => {
        res.json({'result': data.toString()});
    })
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