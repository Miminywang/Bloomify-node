import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Product_Order_Detail',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_cost: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_buyer_recipient: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recipient_name: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recipient_phone: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recipient_address: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      estimated_delivery: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      actual_delivery: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      share_shipping_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      share_shipping_status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      share_payment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      share_payment_status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payment_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      has_confirmed: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      discount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      invoice_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      share_order_status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'product_order_detail', //直接提供資料表名稱
      timestamps: true, // 使用時間戳
      paranoid: false, // 軟性刪除
      underscored: true, // 所有自動建立欄位，使用snake_case命名
      createdAt: 'created_at', // 建立的時間戳
      updatedAt: 'updated_at', // 更新的時間戳
    }
  )
}
