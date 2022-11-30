const Sequelize = require('sequelize');
module.exports = class Post extends Sequelize.Model {
    static init(sequelize) {

        // 테이블에 대한 설정
        return super.init({
            content: {
                type: Sequelize.STRING(140),
                allowNull: false
            },
            img: {
                type: Sequelize.STRING(200),
                allowNull: true
            }
        }, {
            // 테이블에 대한 설정
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Post',
            tableName: 'posts',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci'
        });
    }
    // 관계에 대한 설정
    static associate(db) {
        // User 와의 관계는 1:N
        db.Post.belongsTo(db.User);

        // HashTag 와는 N:M
        // 다대다 관계는 테이블이 생성되는데 through 가 테이블 이름
        db.Post.belongsToMany(db.Hashtag, {through: 'PostHashtag'});
    }
};