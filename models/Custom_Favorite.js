import { DataTypes } from 'sequelize'

export default async function (sequelize) {
  return sequelize.define(
    'Custom_Favorite',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      template_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      tableName: 'custom_favorite',
      timestamps: true, // 啟用 Sequelize 自動時間戳管理，若設定這個為 true，需確認自動時間戳功能與手動定義的字段不衝突
      paranoid: false, // 不使用軟刪除
      underscored: true, // 確保使用 snake_case
      createdAt: 'created_at', // 自定義時間戳欄位名稱
      updatedAt: 'updated_at', // 自定義時間戳欄位名稱
    }
  )
}
