const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const Registration = sequelize.define  (
    "fundae_registrations",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        from_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        to_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        threshold: {
            type: DataTypes.TINYINT,
            defaultValue: 50
        },
        status: {
            type: DataTypes.TINYINT,            
            defaultValue: 0
        },
        exam_attempts: {
            type: DataTypes.TINYINT,            
            defaultValue: 0
        },
        exam1_score: {
            type: DataTypes.TINYINT,            
            defaultValue: 0
        },
        exam2_score: {
            type: DataTypes.TINYINT,            
            defaultValue: 0
        },
        course_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        user_id: {
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

/*Registration.associate = models => {
    Registration.hasOne(models.FundaeCourse, {
        foreignKey: 'course_id',
        targetKey: 'id'
    });
}*/

module.exports = Registration;