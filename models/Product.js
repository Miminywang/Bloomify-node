import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      product_category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      directory: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      share_color_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      purchase_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      info: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      share_store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      size: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      note: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      overall_review: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      product_review_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'product', //直接提供資料表名稱
      timestamps: true, // 使用時間戳
      paranoid: false, // 軟性刪除
      underscored: true, // 所有自動建立欄位，使用snake_case命名
      createdAt: 'created_at', // 建立的時間戳
      updatedAt: 'updated_at', // 更新的時間戳
    }
  )
}
