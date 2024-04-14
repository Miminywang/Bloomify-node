import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Custom_Template_Detail',
    {
      template_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      product_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      position_top: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      position_left: {
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
      tableName: 'custom_template_detail',
      timestamps: true, // 使用時間戳
      paranoid: false, // 軟性刪除
      underscored: true, // 所有自動建立欄位，使用snake_case命名
      createdAt: 'created_at', // 建立的時間戳
      updatedAt: 'updated_at', // 更新的時間戳
    }
  )
}
