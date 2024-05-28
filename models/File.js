const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const File = sequelize.define  (
    "files",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        code : {
            type: DataTypes.STRING
        },
        title: {
            type: DataTypes.STRING            
        }
    },
    {
        timestamps: true,
        updatedAt: 'updated_at',
        createdAt: 'created_at'
    }
);

module.exports = File;