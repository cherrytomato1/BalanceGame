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
        like: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
        },
        comment_count: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
        },
        report: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
        },
        views: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
        },
        img_left: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        img_right: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        description_left: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        description_right: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        score_left: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
        },
        score_right: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 0,
        },
    }, {
        timestamps: true,
        paranoid: true,
    })
);