let today = new Date();
/* console.log(today);
console.log(today.getFullYear());
console.log(today.getMonth());
console.log(today.getDate()); */
// 오늘 날짜로 된 디렉터리(20221116)가 없으면 생성

let dirStr = `${today.getFullYear()}${today.getMonth()+1}${today.getDate()}`;
//console.log(typeof(dirStr));

// 디렉터리 존재 여부 확인
const fs = require('fs');

fs.access(dirStr, (err) => {
    if(err){
        console.log("디렉터리 만들기");
        fs.mkdir(dirStr, (err) => {
            if(err){
                console.log("디렉토리 만들기 실패");
            } else{
                console.log("디렉토리 만들기 성공");
            }
        })
    }else{
        console.log("디렉토리 존재");
    }
})