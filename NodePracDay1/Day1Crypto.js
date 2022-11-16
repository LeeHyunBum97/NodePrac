// 단방향
// 암호화 모듈 가져오기
const crypto = require("crypto");

let password = '1234';

// 단방향 암호화 수행
let p1 = crypto
    .createHash("sha256")
    .update(password)
    .digest('base64');

console.log(p1);

 // 원문의 길이와 상관없이 암호화된 문장의 길이는 항상 같다.
let p2 = crypto
    .createHash("sha256")
    .update(password)
    .digest('base64');

console.log(p2);
console.log(p1 === p2); // => 같은 password에 대해 암호화 했으므로 그 값이 같다.

let str = "12345";
p2 = crypto.createHash("sha256").update(str).digest("base64");

console.log(p1 === p2);


// 양방향 - 암호화 ~ 복호화
// 암호화된 모듈 가져오기, 다른 파일이면 우선 모듈부터 가져옴
// const crypto = require("crypto");

const alg = "aes-256-cbc"; // 알고리즘은 정해진 알고리즘을 이용해야한다.

// node의 crypto 모듈에서는 key는 32자리 iv는 16자리로 임의 생성
// 문자열이 같아도 key와 iv 가 다르다면 값도 달라진다. (iv는 초기화 벡터로 16자리)
const key = "12345678901234567890123456789012";
const iv = "1234567890123456";

// 암호화 객체 생성
let cipher = crypto.createCipheriv(alg, key, iv);
let result = cipher.update('01033189397', 'utf-8', 'base64');
result += cipher.final('base64');
console.log(result);

cipher = crypto.createCipheriv(alg, key, iv);
result = cipher.update('01065669815', 'utf-8', 'base64');
result += cipher.final('base64');
console.log(result);

// 복호화
let decipher = crypto.createDecipheriv(alg, key, iv);
let result2 = decipher.update(result, 'base64', 'utf-8');
result2 += decipher.final('utf-8');
console.log(result2);

// 암/복호화에 대한 요소들은 하드코딩 절대금지로 다른파일 및 DB에서 관리