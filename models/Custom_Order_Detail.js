import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Custom_Order_Detail',
    {
      detail_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      top: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      left: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      z_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rotate: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'custom_order_detail', //直接提供資料表名稱
      timestamps: true, // 使用時間戳
      paranoid: false, // 軟性刪除
      underscored: true, // 所有自動建立欄位，使用snake_case命名
      createdAt: 'created_at', // 建立的時間戳
      updatedAt: 'updated_at', // 更新的時間戳
    }
  )
}
