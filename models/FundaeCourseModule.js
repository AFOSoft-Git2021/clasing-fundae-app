const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const FundaeCourseModule = sequelize.define  (
    "fundae_courses_modules",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        threshold: {
            type: DataTypes.TINYINT,
            allowNull: false
        },
        order: {
            type: DataTypes.SMALLINT,
            defaultValue: 0
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

/*FundaeCourse.associate = models => {
    Course.hasMany(models.Registration, {
        foreignKey: 'course_id',
        targetKey: 'id'
    });
}*/

module.exports = FundaeCourseModule;