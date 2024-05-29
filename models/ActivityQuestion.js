const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const ActivityQuestion = sequelize.define  (
    "activity_questions",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        order : {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },
        question: {
            type: DataTypes.STRING            
        },
        explanation: {
            type: DataTypes.STRING
        },
        text: {
            type: DataTypes.STRING
        },
        question_image : {
            type: DataTypes.STRING,
            defaultValue: '0'
        },
        question_audio : {
            type: DataTypes.STRING,
            defaultValue: '0'
        },
        answers_image : {
            type: DataTypes.STRING,
            defaultValue: '0'
        },
        answers_image : {
            type: DataTypes.STRING,
            defaultValue: '0'
        }
    },
    {
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at'
    }
);

module.exports = ActivityQuestion;