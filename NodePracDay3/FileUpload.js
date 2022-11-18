const express = require("express"); // 웹 서버를 구축하기 위한 외부 모듈
const path = require("path") // 현재 디렉토리 관련 경로 외부 모듈
const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, __dirname + '-' + Date.now())
    }
  });
  
  const upload = multer({ storage: storage })



// 서버 객체와 포트 설정
const app = express();
app.set('port', 8000);

// 사용자의 요청 처리
app.get('/FileUpload', (req, res) => {
    res.sendFile(path.join(__dirname,'./FileUpload.html'));
});

// 하나의 파일 업로드 처리
app.post("/FileUpload", upload.single('image'), (req, res) =>{
    
    // title 파라미터 읽기 -> post 방식에서의 파라미터는 req.body.파라미터 로 접근한다.

    console.log(req.body.title);
    res.send("성공");
})




// 서버 구동
app.listen(app.get('port'), () =>{
    console.log(app.get('port'), '번 포트에서 대기 중');
});
