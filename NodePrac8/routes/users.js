const express = require('express');
const User = require('../models/user');
const {isLoggedIn} = require('./middlewares');

const router = express.Router();

router.post('/:id/follow', isLoggedIn, async(req, res, next) => {
    // 네트워크, DB 작업은 비동기로 수행되기 때문에 async-await 혹은 promise나 FetchAPI
    try{
        const user = await User.findOne({where : {id:req.user.id}});
        if(user) {
            // 팔로우 추가(팔로잉)
            // 아이디를 10진수로 전환해서 팔로우 목록에 추가
            await user.addFollowing(parseInt(req.params.id, 10));
        }else{
            res.status(404).send('no user');
        }
    }catch(error){
        console.log(error);
        next(error)
    }
});

module.exports = router;