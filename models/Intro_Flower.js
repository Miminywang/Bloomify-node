import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Intro_Flower',
    {
      flower_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      flower_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      flower_engname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      flower_lang: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      flower_intro: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      flower_quotation: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      flower_message: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      flower_image_1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      flower_image_2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      flower_image_3: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      flower_href: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      flower_season: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'intro_flower', //直接提供資料表名稱
      timestamps: true, // 使用時間戳
      paranoid: false, // 軟性刪除
      underscored: true, // 所有自動建立欄位，使用snake_case命名
      createdAt: 'created_at', // 建立的時間戳
      updatedAt: 'updated_at', // 更新的時間戳 霹靂卡霹靂拉拉波波力那貝貝魯多
    }
  )
}
