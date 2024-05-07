import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Custom_Order_List',
    {
      order_id: {
        type: DataTypes.STRING(255),
        allowNull: false,
        primaryKey: true,
      },
      bouquet_name: {
        type: DataTypes.STRING(255),
      },
      image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      delivery_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      delivery_time: {
        type: DataTypes.STRING(255),
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      store_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shipping_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sender_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      sender_tel: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      recipient_name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      recipient_tel: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      recipient_address: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shipping_method: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shipping_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      order_status: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      discount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      card_content: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      card_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      invoice_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      barcode: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: 'custom_order_list',
      timestamps: true,
      paranoid: false,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  )
}
