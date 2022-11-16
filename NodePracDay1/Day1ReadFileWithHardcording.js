const fs = require("fs");
let data1 = fs.readFileSync('./ReadFileTest.txt');

console.log(data1.toString());

// Enter 단위로 분할해서 읽기
let ar1 = data1
    .toString()
    .split("\n");
console.log(ar1[0]);

fs.readFile('./FileTest.txt',(err, data) => { // 에러가 발생했는지 안했는지 구분해야 성공/비성공을 알 수 있다.
        if (err) {
            // 에러가 발생했을 때
            console.log(err.message);
        } else {
            // d에러가 발생하지 안했을 때
            console.log(data.toString());
        }
    }
);

console.log("파일 읽기 종료? -- 뒤에 출력되는 것이 바로 비동기 처리 --> if가 단순 출력보다 더 뒤에서 작업된다.(컴퓨터)");

// 위처럼 콜백함수를 사용해도 되지만 아래의 Promise 패턴으로 해도 가능하다.
fs.readFile('./FileTest.txt')
  .then((data) => {
      console.log(data.toString());
   })
  .catch((error) => {console.log(error.message)}
  );