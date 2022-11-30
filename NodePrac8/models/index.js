const Sequelize = require('sequelize');

// .env 에 config 파일에 development를 대신해서 올려두고 사용하는 것이 더 좋다.
// JS가 수정될 때 마다 서버를 재시작 하지만 .env나 html은 그대로 사용된다.
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config)

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// 모델들 가져오기
const User = require("./User");
const Post = require("./Post");
const HashTag = require("./HashTag");

db.User = User;
db.Post = Post
db.HashTag = HashTag;

// 초기화 작업
User.init(sequelize);
Post.init(sequelize);
HashTag.init(sequelize);

// 초기화 후 관계 설정 _ 관계설정은 무조건 초기화 이후
User.associate(db);
Post.associate(db);
HashTag.associate(db);

module.exports = db;
