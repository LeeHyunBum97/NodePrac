// export에서 내보내 내용 가져오기
const {odd, even} = require("./var");

const checkOddOrEven = (num) =>{
    if(num % 2){
        return odd;
    } else {
        return even;
    }
}

// 아래와 같이 내보내면 가져올 때는 아무이름이나 사용해도 된다.
module.exports = checkOddOrEven;