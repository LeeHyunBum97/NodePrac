const crypto = require("crypto");

const pass = 'pass';
const salt = 'salt';
const start = Date.now();

// ThreadPool은 4개씩 Thread를 만들어서 사용하게 되어있고 특별히 갯수를 정할거라면 최대 서버의 코어수 까지 하는 것이 유의미 하다.

crypto.pbkdf2(pass, salt, 1000000, 128, 'sha512', ()=>{
    console.log("1 : ", Date.now() - start);
})
crypto.pbkdf2(pass, salt, 1000000, 128, 'sha512', ()=>{
    console.log("2 : ", Date.now() - start);
})
crypto.pbkdf2(pass, salt, 1000000, 128, 'sha512', ()=>{
    console.log("3 : ", Date.now() - start);
})
crypto.pbkdf2(pass, salt, 1000000, 128, 'sha512', ()=>{
    console.log("4 : ", Date.now() - start);
})
crypto.pbkdf2(pass, salt, 1000000, 128, 'sha512', ()=>{
    console.log("5 : ", Date.now() - start);
})
crypto.pbkdf2(pass, salt, 1000000, 128, 'sha512', ()=>{
    console.log("6 : ", Date.now() - start);
})
crypto.pbkdf2(pass, salt, 1000000, 128, 'sha512', ()=>{
    console.log("7 : ", Date.now() - start);
})
crypto.pbkdf2(pass, salt, 1000000, 128, 'sha512', ()=>{
    console.log("8 : ", Date.now() - start);
})