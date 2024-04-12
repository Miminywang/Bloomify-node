import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Bloomify_Member',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phone: {
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
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      google_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      google_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      google_pic: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      google_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      join_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'bloomify_member', //直接提供資料表名稱
      timestamps: true, // 使用時間戳
      paranoid: false, // 軟性刪除
      underscored: true, // 所有自動建立欄位，使用snake_case命名
      createdAt: 'created_at', // 建立的時間戳
      updatedAt: 'updated_at', // 更新的時間戳
    }
  )
}
