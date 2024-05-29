const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const Activity = sequelize.define  (
    "activities",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        code : {
            type: DataTypes.STRING
        },
        difficulty_level: {
            type: DataTypes.TINYINT,
            defaultValue: 0            
        },
        course_id: {
            type: DataTypes.INTEGER,
            allowNull :false
        },
        format_id: {
            type: DataTypes.INTEGER,
            allowNull :false
        }        
    },
    {
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at'
    }
);

module.exports = Activity;