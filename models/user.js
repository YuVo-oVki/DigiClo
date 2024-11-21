const { DataTypes } = require('sequelize');
const sequelize = require('../db');  // データベース接続インスタンス

const User = sequelize.define('User', {
    User_ID: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    User_Name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'User',
    timestamps: false  // createdAtとupdatedAtを無効にする
});

module.exports = User;
