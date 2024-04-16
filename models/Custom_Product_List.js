import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Custom_Product_List',
    {
      product_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      variant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'custom_product_list', //資料表名稱
      timestamps: true, // 使用時間戳
      paranoid: false, // 軟性刪除
      underscored: true, // 所有自動建立欄位，使用snake_case命名
      createdAt: 'created_at', // 建立的時間戳
      updatedAt: 'updated_at', // 更新的時間戳
    }
  )
}
