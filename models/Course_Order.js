import { DataTypes, UUIDV4 } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Course_Order',
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
      total_cost: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      payment_amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      discount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      share_payment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      share_payment_status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      share_order_status_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      invoice_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mobile_barcode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 'course_order', //直接提供資料表名稱
      timestamps: true, // 使用時間戳
      paranoid: false, // 軟性刪除
      underscored: true, // 所有自動建立欄位，使用snake_case命名
      createdAt: 'created_at', // 建立的時間戳
      updatedAt: 'updated_at', // 更新的時間戳
    }
  )
}
