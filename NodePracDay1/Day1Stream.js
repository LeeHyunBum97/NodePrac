// 스트림을 이용한 읽기
const fs = require('fs');

// 읽기 전용 스트림 생성
const readStream = fs.createReadStream('./FileTest.txt', {highWaterMark:16}); // 16바이트 씩 잘라옴

// 데이터를 저장하기 위한 객체생성
const data = [];

// 읽는 동안 발생하는 이벤트를 처리한다.
readStream.on('data', (chunk) => {
    // 읽는 동안에는 읽어오는 데이터를 쌓아서 추가하는 것
    data.push(chunk);
    //console.log(chunk.toString()); // 16바이트 버퍼에 들어오는 내용 확인
});

// 읽기가 끝나면 발생하는 이벤트 처리
readStream.on('end',() => {
    // 지금까지 읽은 내용을 하나로 만들기
    let result = Buffer.concat(data);
    //console.log(result.toString());
});

// 에러 발생시 이벤트 처리
readStream.on('error', (error) => {
    //console.log(error.message);
});

// 스트림을 사용하는 이유 확인해보기 ---> 메모리 절약 ---> 파일이 커지면 메모리 내부의 버퍼도 커진다.

// const fs = require('fs');

// 파일 만들기 라서 주석처리
/* const file = fs.createWriteStream('./data.txt');

for(let i=0; i<10000000; i++){
    file.write("용량이 큰 파일 만들기\n");
}
file.end(); */

//스트림을 사용하지 않고 읽어서 쓰기
// const fs = require('fs');
console.log('스트림X 복사하기 전 메모리 사용량 : ' + process.memoryUsage().rss);

const data1 = fs.readFileSync('./data.txt');
fs.writeFileSync('./noStreamData.txt', data1);

console.log('스트림X 복사한 후 메모리 사용량 : ' + process.memoryUsage().rss);


// 스트림을 사용한 복사
console.log('스트림O 복사하기 전 메모리 사용량 : ' + process.memoryUsage().rss);

// 읽기와 쓰기 스트림 생성
const readStream2 = fs.createReadStream('./data.txt');
const writeStream2 = fs.createWriteStream("./useStreamData.txt");

// 읽고 쓰기
readStream2.pipe(writeStream2); 

readStream2.on('end', () => {
    console.log('스트림O 복사한 후 메모리 사용량 : ' + process.memoryUsage().rss);
});

