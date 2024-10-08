
const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const RegistrationModuleExamActivity = sequelize.define  (
    "fundae_registrations_modules_exams_activities",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        result: {
            type: DataTypes.TINYINT,
            defaultValue: 0
        },
        in_use: {
            type: DataTypes.TINYINT,
            defaultValue: 0
        },
        order: {
            type: DataTypes.SMALLINT,
            defaultValue: 0
        },   
        skill_id: {
            type: DataTypes.INTEGER,
            defaultValue: 1
        },     
        activity_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },        
        module_id: {
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

/*FundaeCourse.associate = models => {
    Course.hasMany(models.Registration, {
        foreignKey: 'course_id',
        targetKey: 'id'
    });
}*/

module.exports = RegistrationModuleExamActivity;