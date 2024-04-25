import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Share_Store',
    {
      store_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      store_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      store_account: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      store_password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      store_intro: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      store_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      store_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      store_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      store_tel: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sub_date: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sub_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      permission_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      logo_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      store_info: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      district: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'share_store', //直接提供資料表名稱
      timestamps: true, // 使用時間戳
      paranoid: false, // 軟性刪除
      underscored: true, // 所有自動建立欄位，使用snake_case命名
      createdAt: 'created_at', // 建立的時間戳
      updatedAt: 'updated_at', // 更新的時間戳
    }
  )
}
