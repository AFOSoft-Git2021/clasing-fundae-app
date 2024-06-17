const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const FundaeCourse = sequelize.define  (
    "fundae_courses",
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
            defaultValue: 50
        },
        course_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        teacher_id: {
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

module.exports = FundaeCourse;