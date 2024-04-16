import { DataTypes } from 'sequelize'

export default function (sequelize) {
  return sequelize.define(
    'Custom_Product_Variant',
    {
      variant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      variant_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      color_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: 'custom_product_variant', // 表名
      timestamps: true, // 啟用時間戳
      paranoid: false,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )
}
