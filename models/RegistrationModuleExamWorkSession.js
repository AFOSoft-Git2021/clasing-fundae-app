const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const FundaeRegistrationModuleExamWorkSession = sequelize.define  (
    "fundae_registrations_modules_exams_work_sessions",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },            
        json_data: {
            type: DataTypes.STRING
        },
        score: {
            type: DataTypes.TINYINT,
            defaultValue: 0
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

module.exports = FundaeRegistrationModuleExamWorkSession;