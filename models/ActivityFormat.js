const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const ActivityFormat = sequelize.define  (
    "activity_formats",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING            
        },
        description: {
            type: DataTypes.STRING
        },
        prefix: {
            type: DataTypes.STRING
        }
    },
    {
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at'
    }
);

module.exports = ActivityFormat;