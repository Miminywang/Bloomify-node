import { DataTypes, UUIDV4 } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Product_Order_Detail',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_number: {
        type: DataTypes.UUID,
        defaultValue: UUIDV4, // 設定默認值為UUIDV4生成的UUID
        allowNull: false,
        unique: true,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subtotal: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      total_cost: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sender_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sender_phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sender_mail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      recipient_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      recipient_phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      delivery_option: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      delivery_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      delivery_cost: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      payment_method: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      coupon_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      discount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      invoice_option: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      order_status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      store_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      store_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      store_address: {
        type: DataTypes.STRING,
        allowNull: true,
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
