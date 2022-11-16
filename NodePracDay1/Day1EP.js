const {odd, even} = require('./var'); // {}로 묶어서 내보낸 것은 이름을 맞추어서 받아야한다.

// 하나만을 내보낸 모듈의 이름을 사용할 때는 바꿔서 사용가능
// func에서 export한 것을 가져와서 checkNumber라는 이름을 붙인것.
const checkNumber = require('./Day1Func');

console.log(checkNumber(5));

// os객체를 사용해 메모리 확인
const os = require('os');
console.log(os.freemem());

const path = require("path");
// 현재 디렉터리 확인
console.log(__dirname);

// 현재 디렉터리 내의 public 디렉토리 경로확인
console.log(path.join(__dirname, "public"));

const url = require("url");
const addr = "https://www.naver.com/login?id=hb9397";
const p = url.parse(addr); // url모듈로 가져온 url.parse("")에 문자열이 가면 그냥 바로 url로 인식한다
console.log(p);

// addr에서 parameter 부분 (query string) 만 가져오기
// searchParams 속성을 호출하면 파라미터 부분에 해당되는 객체를 반환

const address = new URL( "https://www.naver.com/login?id=hb9397"); // 변수에 바로 url로 인식시키려면 URL객체로 만들어 줘야한다.
console.log(address.searchParams); // => key, value 모두 추출
// id 값만 추출하려면
console.log(address.searchParams.get("id"));