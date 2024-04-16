import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Custom_Category',
    {
      category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      category_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category_en_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      category_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'custom_category', //直接提供資料表名稱
      timestamps: true, // 使用時間戳
      paranoid: false, // 軟性刪除
      underscored: true, // 所有自動建立欄位，使用snake_case命名
      createdAt: 'created_at', // 建立的時間戳
      updatedAt: 'updated_at', // 更新的時間戳
    }
  )
}
