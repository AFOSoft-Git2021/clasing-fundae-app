const { sequelize } = require ("../config/mysql");
const { DataTypes } = require ("sequelize");

const RegistrationModuleFile = sequelize.define  (
    "fundae_registrations_modules_files",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.INTEGER
        },
        viewed: {
            type: DataTypes.TINYINT,
            defaultValue: 0
        },
        order: {
            type: DataTypes.SMALLINT,
            defaultValue: 0
        },        
        file_id: {
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

module.exports = RegistrationModuleFile;