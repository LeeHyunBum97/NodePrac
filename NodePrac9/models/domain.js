const Sequelize = require('sequelize');

module.exports = class Post extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            host: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            clientSecret: {
                type: Sequelize.STRING(36),
                allowNull: false
            },
            type: {
                type: Sequelize.ENUM('free', 'premium'),
                allowNull: false
            }
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Domain',
            tableName: 'domains',
            paranoid: true,
        });
    }
    static associate(db) {
        // User와 Domain 은 1:N
        // User의 기본키가 Domain에 외래키로 저장된다.
        db.Domain.belongsTo(db.User);
    }
};
