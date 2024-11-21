const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./user');
const Clothe = require('./clothe');

const Coordinate = sequelize.define('Coordinate', {
    Coordinate_ID: {
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
    Clothe_ID: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Clothe,
            key: 'Clothe_ID'
        }
    },
    MadeDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Coordinate',
    timestamps: false
});

module.exports = Coordinate;
