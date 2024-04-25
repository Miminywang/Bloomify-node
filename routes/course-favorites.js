import express from 'express'
const router = express.Router()

// 檢查空物件, 轉換req.params為數字
import { getIdParam } from '#db-helpers/db-tool.js'

// 引入 sequelize 和模型
// import authenticate from '#middlewares/authenticate.js'
import sequelize from '#configs/db.js'
const { Course, Share_Member, Course_Favorite } = sequelize.models

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

// GET - 取得某個會員收藏的課程
// router.get(
//   '/',
//   /* authenticate, */ async (req, res) => {
//     try {
//       const memberId = 1 // 先用member_id=1來試印

//       const member = await Share_Member.findByPk(memberId, {
//         include: [
//           {
//             model: Course,
//             as: 'FavoriteCourses', // 確保這個別名與模型定義中的相符
//             attributes: ['id', 'name', 'intro', 'price'],
//             include: [
//               {
//                 model: Course_Image,
//                 as: 'images',
//                 attributes: ['id', 'path', 'is_main'],
//                 where: { is_main: true },
//               },
//             ],
//           },
//         ],
//       })

//       if (member) {
//         // `member.FavoriteCourses` 包含該用戶收藏的所有課程
//         res.json({ status: 'success', data: member.FavoriteCourses })
//       } else {
//         res.status(404).json({ status: 'error', message: 'Member not found' })
//       }
//     } catch (error) {
//       console.error('Error fetching favorite courses:', error)
//       res.status(500).json({ status: 'error', message: error.message })
//     }
//   }
// )

// GET - 取得某個會員收藏的課程
router.get('/', async (req, res) => {
  const memberId = 1 // 實際應用應從 JWT 中取得

  // 取得id,名稱,介紹,價格,主圖
  const sql = `
      SELECT 
          cf.id,
          cf.course_id, 
          c.name,
          c.intro,
          c.price,
          ci.path AS image_path,
          ci.is_main
      FROM 
          course_favorite AS cf
      JOIN 
          course AS c ON cf.course_id = c.id
      LEFT JOIN
          course_image AS ci ON c.id = ci.course_id AND ci.is_main = 1
      WHERE 
          cf.member_id = :memberId
      ORDER BY 
          cf.course_id ASC;
  `

  try {
    // 執行 SQL 查詢
    const results = await sequelize.query(sql, {
      replacements: { memberId: memberId },
      type: sequelize.QueryTypes.SELECT,
    })

    // 發送結果
    res.json({ status: 'success', data: results })
  } catch (error) {
    console.error('Error fetching favorite courses:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

// POST - 新增收藏的課程
router.post('/:courseId', async (req, res) => {
  // const memberId = req.user.id // 獲取用户ID
  const memberId = 1
  const courseId = parseInt(req.params.courseId)

  try {
    // 檢查
    const existing = await Course_Favorite.findOne({
      where: { member_id: memberId, course_id: courseId },
    })

    if (existing) {
      // 如果已存在，可選擇更新紀錄或返回已收藏
      return res.status(409).json({ message: 'Course already favorited.' })
    }

    // 插入新的收藏紀錄
    const newFavorite = await Course_Favorite.create({
      member_id: memberId,
      course_id: courseId,
    })

    res
      .status(201)
      .json({ message: 'Course favorited successfully.', data: newFavorite })
  } catch (error) {
    console.error('Error adding course to favorites:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

// DELETE - 删除收藏的课程
router.delete('/:courseId', async (req, res) => {
  const memberId = 1 // 實際應用應從 JWT 中取得
  const courseId = parseInt(req.params.courseId)

  try {
    // 檢查這個收藏是否存在
    const favorite = await Course_Favorite.findOne({
      where: { member_id: memberId, course_id: courseId },
    })

    if (!favorite) {
      // 如果不存在，返回一个 404 错误
      return res.status(404).json({ message: 'Favorite not found.' })
    }

    // 存在的话，删除这个收藏
    await favorite.destroy()

    res.json({ message: 'Favorite deleted successfully.' })
  } catch (error) {
    console.error('Error removing course from favorites:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

export default router
