const express = require("express");
const path = require("path");
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

module.exports = router;

/* 라우팅 해주는 파일로 각 비지니스 로직을 가진 서버 파일들로 라우팅해준다 ---> user.js, board.js */