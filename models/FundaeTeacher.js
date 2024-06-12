const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const FundaeTeacher = sequelize.define  (
    "fundae_teachers",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING
        },
        title: {
            type: DataTypes.STRING,
        },
        availability: {
            type: DataTypes.STRING,
        },
        response_time: {
            type: DataTypes.STRING,
        },
        description: {
            type: DataTypes.STRING,
        },
        avatar: {
            type: DataTypes.STRING,
        },
        language: {
            type: DataTypes.STRING,
        },
        skills: {
            type: DataTypes.STRING,
        },
        messages_number: {
            type: DataTypes.SMALLINT,
            defaultValue: 0
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

module.exports = FundaeTeacher;