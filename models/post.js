module.exports = (sequelize, DataTypes) => (
    sequelize.define('post', {
        title: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
        board_type: {
            type: DataTypes.ENUM('free', 'vs'),
        },
    }, {
        timestamps: true,
        paranoid: true,
    })
);