const Sequelize = require('sequelize');
module.exports = class Hashtag extends Sequelize.Model {
    static init(sequelize) {
        // 테이블에 대한 설정
        return super.init({
            // 컬럼에 대한 설정
            title: {
                type: Sequelize.STRING(15),
                allowNull: false,
                unique: true
            }
        }, {
            // 테이블에 대한 설정
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Hashtag',
            tableName: 'hashtags',
            paranoid: false,
            charset: 'utf8mb4',// 이모티콘 ㄱㄴ
            collate: 'utf8mb4_general_ci'
        });
    }
    // 관계에 대한 설정
    static associate(db) {
        // HashTag 와는 N:M
        // 다대다 관계는 테이블이 생성되는데 through 가 테이블 이름

        db.Hashtag.belongsToMany(db.Post, {through: 'PostHashtag'});
    }
};