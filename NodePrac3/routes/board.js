const express = require("express");
const router = express.Router();
const path = require("path");
router.get('/', (req, res) => {
    res.send("Hello, Board");
});

router.get('/register', (req, res) => {
    res.send("게시판 글쓰기")
})

module.exports = router;