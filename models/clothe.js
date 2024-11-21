const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./user');  // Userモデルをインポートして外部キーに利用

const Clothe = sequelize.define('Clothe', {
    Clothe_ID: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    User_ID: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: User,
            key: 'User_ID'
        }
    },
    ClotheTag: {
        type: DataTypes.STRING,
        allowNull: true
    },
    Cloth_Image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    RegisterDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    Fav: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'Clothe',
    timestamps: false
});

module.exports = Clothe;
