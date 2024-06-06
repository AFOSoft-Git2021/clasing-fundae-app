const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const Skill = sequelize.define  (
    "skills",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name : {
            type: DataTypes.STRING
        },
        abbreviation: {
            type: DataTypes.STRING            
        }
    },
    {
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at'
    }
);

module.exports = Skill;