import { DataTypes } from 'sequelize'
// 加密密碼字串用
import { generateHash } from '#db-helpers/password-hash.js'

export default async function (sequelize) {
  return sequelize.define(
    'Member',
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
      google_uid: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      google_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      google_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      google_pic: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      join_date: {
        type: DataTypes.DATE,
        // type: DataTypes.DATEONLY  //只需要日期  會報錯
        allowNull: true,
      },
    },
    {
      hooks: {
        // 建立時產生密碼加密字串用
        // seeds檔案 JSON導入時為明碼，導入資料庫時自動加密
        // 註冊登入時都是用明碼
        // 驗證密碼時需要特別的函式 db-helpers => password-hash.js

        // 有加密的情況下，驗證密碼無法用 sql 直接where找符合的帳號密碼組合，
        // 而是先找到帳號，進而拿到密碼 routes=>auth.js
        beforeCreate: async (user) => {
          if (user.password) {
            user.password = await generateHash(user.password)
          }
        },
        // 更新時產生密碼加密字串用
        beforeUpdate: async (user) => {
          if (user.password) {
            user.password = await generateHash(user.password)
          }
        },
      },
      tableName: 'member', //直接提供資料表名稱
      timestamps: true, // 使用時間戳
      paranoid: false, // 軟性刪除
      underscored: true, // 所有自動建立欄位，使用snake_case命名
      createdAt: 'created_at', // 建立的時間戳
      updatedAt: 'updated_at', // 更新的時間戳
    }
  )
}
