const express = require('express');
const path = require('path');

const app = express();
app.set('port', process.env.PORT || 3000);

// sequelize 연결
const {sequelize} = require('./models');
sequelize
    .sync({force: false})
    .then(() => {
        console.log("데이터베이스 연결 성공");
    })
    .catch((err) => {
        console.log("데이터 베이스 연결 실패");
    });

const User = require('./models/users');
const Comment = require('./models/comments');
app.get('/', (res, req) => {
    const user = User.create({
        name:'군계',
        age : 44
    });
    console.log(user)
})

app.listen(app.get('port'), () => {
    console.log(app.get('port'), "번 포트에서 서버 대기 증)");
})