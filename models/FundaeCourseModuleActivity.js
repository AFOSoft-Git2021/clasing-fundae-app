const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const FundaeCourseModuleActivity = sequelize.define  (
    "fundae_courses_modules_activities",
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

module.exports = FundaeCourseModuleActivity;