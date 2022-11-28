const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            name:{
                type:Sequelize.STRING(20),
                allowNull:false,
                unique:true
            },
            age:{
                type:Sequelize.INTEGER.UNSIGNED,
                allowNull:true
            }
        }, { 
            sequelize,
            timestamps:true,
            underscored:false,
            tableName:'users',
            modelName:'User',
            paranoid:true,
            charset:'utf8',
            collate:'utf8_general_ci'
        })
    }
    static associate(db){
        // 외래 키에 대한 설정 1측
        // Comment 테이블의 commenter에 해당 users테이블의 id 컬럼을 사용
        db.User.hasMany(db.Comment, {foreignKey: 'commenter', sourceKey:'id'}); 
    }
}