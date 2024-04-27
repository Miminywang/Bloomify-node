import express from 'express'
const router = express.Router()

// 檢查空物件, 轉換req.params為數字
import { getIdParam } from '#db-helpers/db-tool.js'

// 引入 sequelize 和模型
// import authenticate from '#middlewares/authenticate.js'
import sequelize from '#configs/db.js'
const {
  Product,
  Product_Image,
  Share_Member,
  Product_Favorite,
  Share_Tag,
  Share_Store,
} = sequelize.models

// 外鍵定義
Product.belongsToMany(Share_Member, {
  through: Product_Favorite,
  foreignKey: 'product_id',
  otherKey: 'member_id',
  as: 'MembersWhoFavorited',
})

Share_Member.belongsToMany(Product, {
  through: Product_Favorite,
  foreignKey: 'member_id',
  otherKey: 'product_id',
  as: 'FavoriteProducts',
})

// 取得某個會員收藏的商品
router.get(
  '/',
  /* authenticate, */ async (req, res) => {
    try {
      const memberId = 1 // 先用member_id=1來試印

      const member = await Share_Member.findByPk(memberId, {
        include: [
          {
            model: Product,
            as: 'FavoriteProducts', // 確保這個別名與模型定義中的相符
            attributes: [
              'id',
              'name',
              'info',
              'price',
              'directory',
              'overall_review',
            ],
            include: [
              {
                model: Product_Image,
                as: 'images',
                attributes: ['id', 'url', 'is_thumbnail'],
              },
              {
                model: Share_Tag,
                as: 'tags',
                attributes: ['id', 'name'],
              },
              {
                model: Share_Store,
                as: 'stores',
                attributes: ['store_id', 'store_name'],
              },
            ],
          },
        ],
      })

      if (member) {
        // `member.FavoriteCourses` 包含該用戶收藏的所有課程
        res.json({ status: 'success', data: member.FavoriteProducts })
      } else {
        res.status(404).json({ status: 'error', message: 'Member not found' })
      }
    } catch (error) {
      console.error('Error fetching favorite courses:', error)
      res.status(500).json({ status: 'error', message: error.message })
    }
  }
)

export default router
