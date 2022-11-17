// 서버생성, 포트번호는 일반적으로 1024번까지는 예약되어 있으므로 사용X, 1521, 3306, 27017 번은 DB에서 사용하고 있음
// 8080은 tomcat 같은 webcontainer가 사용,
// 80번을 사용할 경우 http 경우 포트 번호 생략
// 433번을 사용할 경우 https라면 포트번호 생략
/* http.createServer((request, response) =>{
    // 응답생성
    response.writeHead(200, {'Content-type':'text/html;charset=utf-8'});
    response.write("<h1> 처음만든 웹 서버</h1>");
    response.end('<p>http 모듈 사용</p>')
}).listen(8000, () => {
    console.log('8000번 포트에서 서버 대기 중');
}); */

const fs = require("fs").promises;
const http = require("http");
http.createServer(async(request, response) =>{
    try{
        //파일의 내용을 읽어서 data에 저장
        // 다음 명령은 이명령이 끝난 뒤시행
        
        const data = await fs.readFile("./HttpServerIndex.html");
        response.writeHead(200, {'Content-type' : 'text/html; charset=utf-8'});
        response.end(data);
    } catch(errro){
        const data = await fs.readFile("./HttpServerIndex.html");
        response.writeHead(500, {'Content-type' : 'text/html; charset=utf-8'});
        response.end(error.message);
    }

}).listen(8000, () => {
    console.log('8000번 포트에서 서버 대기 중');
});