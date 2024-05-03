import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Intro_Data',
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
      engname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lang: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      intro: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      season: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      occ: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      flower_image_1: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      flower_image_2: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      flower_image_3: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      flower_href: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'intro_data', //直接提供資料表名稱
      timestamps: true, // 使用時間戳
      paranoid: false, // 軟性刪除
      underscored: true, // 所有自動建立欄位，使用snake_case命名
      createdAt: 'created_at', // 建立的時間戳
      updatedAt: 'updated_at', // 更新的時間戳 霹靂卡霹靂拉拉波波力那貝貝魯多
    }
  )
}
