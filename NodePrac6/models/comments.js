const Sequelize = require('sequelize');

module.exports = class Comment extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            comment:{
                type:Sequelize.STRING(100),
                allowNull:false,
            }
        }, { 
            sequelize,
            timestamps:true,
            underscored:false,
            tableName:'comments',
            modelName:'Comment',
            paranoid:true,
            charset:'utf8',
            collate:'utf8_general_ci'
        })
    }
    static associate(db){
        // 외래키에 대한 설정 N측
        // users(User)로 부터 가져온 commenter와 매핑되는 외래키 id 컬럼을 생성
        db.Comment.belongsTo(db.User, {foreignKey:'commenter', targetKey:'id'}); 
    }
}