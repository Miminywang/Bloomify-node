import express from 'express'
const router = express.Router()

// 檢查空物件, 轉換req.params為數字
import { getIdParam } from '#db-helpers/db-tool.js'

// 引入 sequelize 和模型
// import authenticate from '#middlewares/authenticate.js'
import sequelize from '#configs/db.js'
const { Course, Course_Image, Share_Member, Course_Favorite } = sequelize.models

// 外鍵定義
Course.belongsToMany(Share_Member, {
  through: Course_Favorite,
  foreignKey: 'course_id',
  otherKey: 'member_id',
  as: 'MembersWhoFavorited',
})

Share_Member.belongsToMany(Course, {
  through: Course_Favorite,
  foreignKey: 'member_id',
  otherKey: 'course_id',
  as: 'FavoriteCourses',
})

// 取得某個會員收藏的課程
router.get(
  '/',
  /* authenticate, */ async (req, res) => {
    try {
      const memberId = 1 // 先用member_id=1來試印

      const member = await Share_Member.findByPk(memberId, {
        include: [
          {
            model: Course,
            as: 'FavoriteCourses', // 確保這個別名與模型定義中的相符
            attributes: ['id', 'name', 'intro', 'price'],
            include: [
              {
                model: Course_Image,
                as: 'images',
                attributes: ['id', 'path', 'is_main'],
              },
            ],
          },
        ],
      })

      if (member) {
        // `member.FavoriteCourses` 包含該用戶收藏的所有課程
        res.json({ status: 'success', data: member.FavoriteCourses })
      } else {
        res.status(404).json({ status: 'error', message: 'Member not found' })
      }
    } catch (error) {
      console.error('Error fetching favorite courses:', error)
      res.status(500).json({ status: 'error', message: error.message })
    }
  }
)

// 獲得某會員id的有加入到我的最愛清單中的商品id們
// 此路由只有登入會員能使用
// router.get(
//   '/',
//   /* authenticate, */ async (req, res) => {
//     const memberId = 1

//     const cids = await Course_Favorite.findAll({
//       attributes: ['course_id'],
//       where: {
//         member_id: memberId,
//       },
//       include: [
//         {
//           model: Course,
//           as: 'course',
//           attributes: ['id', 'name'],
//         },
//       ],
//       // raw: true,
//     })

//     // 將結果中的pid取出變為一個純資料的陣列
//     const favorites = cids.map((v) => v.cid)

//     res.json({ status: 'success', data: { favorites } })
//   }
// )

// router.put(
//   '/:id',
//   /* authenticate, */ async (req, res, next) => {
//     const pid = getIdParam(req)
//     const uid = req.user.id

//     const existFav = await Favorite.findOne({ where: { pid, uid } })
//     if (existFav) {
//       return res.json({ status: 'error', message: '資料已經存在，新增失敗' })
//     }

//     const newFav = await Favorite.create({ pid, uid })

//     // console.log(newFav.id)

//     // 沒有新增到資料
//     if (!newFav.id) {
//       return res.json({
//         status: 'error',
//         message: '新增失敗',
//       })
//     }

//     return res.json({ status: 'success', data: null })
//   }
// )

// router.delete(
//   '/:id',
//   /* authenticate, */ async (req, res, next) => {
//     const pid = getIdParam(req)
//     const uid = req.user.id

//     const affectedRows = await Favorite.destroy({
//       where: {
//         pid,
//         uid,
//       },
//     })

//     // 沒有刪除到任何資料 -> 失敗或沒有資料被刪除
//     if (!affectedRows) {
//       return res.json({
//         status: 'error',
//         message: '刪除失敗',
//       })
//     }

//     // 成功
//     return res.json({ status: 'success', data: null })
//   }
// )

export default router
