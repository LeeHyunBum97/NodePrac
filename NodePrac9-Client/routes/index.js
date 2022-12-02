const express = require('express');
const axios = require('axios');

const router = express.Router();

// 매번 동일한 요청을 위한 URL을 상수로 설정
// 구버전 v1으로의 요청 차단
/* const URL = "http://localhost:8000/v1"; */

// 매번 동일한 요청을 위한 URL을 상수로 설정
// 새버전 v2로 요청 돌리기
const URL = "http://localhost:8000/v2";


// AJAX 요청을 할 때 누가 요청했는지 확인해주기 위해서 origin header를 추가한다.
axios.defaults.headers.origin = 'http://localhost:4000';

// token 발급 동작 TEST
router.get('/test', async(req, res, next) => {
    try{
        if(!req.session.jwt){
            const tokenResult = await axios.post("http://localhost:8000/v1/token", {
                clientSecret : process.env.CLIENT_SECRET
            });

            if(tokenResult.data && tokenResult.data.code == 200){
                // 토큰 발급 성공
                req.session.jwt = tokenResult.data.token;
            }else{
                // 토큰 발급 실패
                return res.json(tokenResult.data)
            }
        }
        // 토큰 내용확인
        const result = await axios.get('http://localhost:8000/v1/test', {
            headers: {authorization:req.session.jwt}
        })
        return res.json(result.data);

    }catch(error){
        console.error(error);
        return next(error);
    }
});

// 토큰 발급 코드
const request = async(req, api) => {
    try{
        if(!req.session.jwt){
            const tokenResult = await axios.post(`${URL}/token`, {
                clientSecret : process.env.CLIENT_SECRET
            });
            req.session.jwt = tokenResult.data.token;
        }
        // 토큰 내용확인
        const result = await axios.get(`${URL}/${api}`, {
            headers: {authorization:req.session.jwt}
        })
        return result;

    }catch(error){
        // 토큰 유효기간이 만료되면
        if(error.response.status === 419){
            // 기존 토큰 삭제
            delete req.session.jwt;
            // 다시 토큰을 생성해달라고 요청
            return request(req, api);
        }
        return error.response;
    }
}

router.get('/my/post', async(req, res, next) => {
    try{
        // NodePrac9의 /routes/v1.js에서 설정한 주소와 동일한 주소로 요청
        const result = await request(req, '/posts/my');
        res.json(result.data);
    }catch(error){
        console.error(error);
        return next(error)
    }
})

module.exports = router;