const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const Course = sequelize.define  (
    "courses",
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
        course_code: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at'
    }
);


module.exports = Course;