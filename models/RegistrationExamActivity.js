const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const RegistrationExamActivity = sequelize.define  (
    "fundae_registrations_exams_activities",
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
        activity_id: {
            type: DataTypes.INTEGER,
            allowNull: false
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

module.exports = RegistrationExamActivity;