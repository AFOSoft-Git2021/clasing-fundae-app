const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const RegistrationModule = sequelize.define  (
    "fundae_registrations_modules",
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
        threshold_exam: {
            type: DataTypes.TINYINT,
            allowNull: false
        },
        order: {
            type: DataTypes.SMALLINT,
            defaultValue: 0
        },
        status: {
            type: DataTypes.TINYINT,
            defaultValue: 0
        },
        score: {
            type: DataTypes.TINYINT,
            defaultValue: 0
        },
        score_exam: {
            type: DataTypes.TINYINT,
            defaultValue: 0
        },
        registration_id: {
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

module.exports = RegistrationModule;