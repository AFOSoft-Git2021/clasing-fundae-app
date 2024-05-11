const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const FundaeCourseExamActivity = sequelize.define  (
    "fundae_courses_exams_activities",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },            
        order: {
            type: DataTypes.SMALLINT,
            defaultValue: 0
        },
        activity_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        course_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at'
    }
);

module.exports = FundaeCourseExamActivity;