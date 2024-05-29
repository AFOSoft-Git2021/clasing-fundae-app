const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const ActivityQuestionAnswer = sequelize.define  (
    "activitiy_questions",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        response: {
            type: DataTypes.STRING            
        },
        correct : {
            type: DataTypes.TINYINT,
            defaultValue: 0
        },
        order : {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    },
    {
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at'
    }
);

module.exports = ActivityQuestionAnswer;