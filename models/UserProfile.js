const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const UserProfile = sequelize.define  (
    "user_profile",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        expiration_date: {
            type: DataTypes.DATE
        },
        type: {
            type: DataTypes.TINYINT,
            defaultValue: 0
        },
        offer_name: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.TINYINT,
            defaultValue: 0
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        number_hours: {
            type: DataTypes.STRING
        },
        code_course: {
            type: DataTypes.STRING
        },
        reseller_user_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        subscription_id: {
            type: DataTypes.TINYINT,
            allowNull: false
        },
        course_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        path_id: {
            type: DataTypes.TINYINT,
            allowNull: false
        },
        reseller_id: {
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

module.exports = UserProfile;