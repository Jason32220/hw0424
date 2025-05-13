const { sequelize, DataTypes } = require('../orm');

const Department = sequelize.define('Department', {
  Department_ID: {
    type: DataTypes.STRING(5),
    primaryKey: true
  },
  Name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  College: {
    type: DataTypes.STRING(30)
  },
  Location: {
    type: DataTypes.STRING(30)
  },
  Phone: {
    type: DataTypes.STRING(15)
  },
  
  Established_Year: {
    type: DataTypes.INTEGER // 假設這是儲存年份，選擇 INTEGER
  }
}, {
  tableName: 'DEPARTMENT',
  timestamps: false // 禁用 Sequelize 自動生成的時間戳欄位
});

module.exports = Department;
