const User = require('./user');
const Clothe = require('./clothe');
const Coordinate = require('./coordinate');

// 関連付け
User.hasMany(Clothe, { foreignKey: 'User_ID' });
Clothe.belongsTo(User, { foreignKey: 'User_ID' });

User.hasMany(Coordinate, { foreignKey: 'User_ID' });
Coordinate.belongsTo(User, { foreignKey: 'User_ID' });

Clothe.hasMany(Coordinate, { foreignKey: 'Clothe_ID' });
Coordinate.belongsTo(Clothe, { foreignKey: 'Clothe_ID' });

module.exports = {
    User,
    Clothe,
    Coordinate
};
