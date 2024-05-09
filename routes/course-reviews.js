import express from 'express'
const router = express.Router()

// 檢查空物件, 轉換req.params為數字
import { getIdParam } from '#db-helpers/db-tool.js'

// 引入 sequelize 和模型
// import authenticate from '#middlewares/authenticate.js'
import sequelize from '#configs/db.js'
import authenticate from '##/middlewares/authenticate.js'
const { Course, Share_Member, Course_Review } = sequelize.models

// 外鍵定義
// 主表定義過了

// 函數建構 ---------------------------------
// 更新課程平均星數
async function updateCourseAverageStars(courseId) {
  console.log('Updating average stars for course:', courseId) // 添加日誌
  try {
    const reviews = await Course_Review.findAll({
      where: { course_id: courseId },
      attributes: ['stars'],
    })
    console.log('Fetched reviews:', reviews.length) // 查看獲取到的評價數量
    if (reviews.length > 0) {
      const totalStars = reviews.reduce((acc, review) => acc + review.stars, 0)
      const averageStars = totalStars / reviews.length
      console.log('Calculated average stars:', averageStars) // 打印計算的平均量級
      await Course.update(
        { average_stars: averageStars },
        { where: { id: courseId } }
      )
    } else {
      await Course.update({ average_stars: null }, { where: { id: courseId } })
    }
  } catch (error) {
    console.error('Error updating course average stars:', error)
  }
}

// 路由建構 ---------------------------------
// GET - 獲取課程評價
router.get('/', async function (req, res) {
  console.log('Fetching Reivews...')
  try {
    const reviews = await Course_Review.findAll({
      raw: true,
      nest: true,
      order: [['created_at', 'DESC']], // 預設由新到舊排序
    })

    return res.json({ status: 'success', data: { reviews } })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

// POST - 添加課程評價
router.post('/add/:courseId', authenticate, async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }

  const courseId = req.params.courseId
  const memberId = req.user.id
  const { stars, comment } = req.body

  try {
    await Course_Review.create({
      course_id: courseId,
      member_id: memberId,
      stars: stars,
      comment: comment,
    })

    // 更新課程平均星級
    await updateCourseAverageStars(courseId)

    res
      .status(201)
      .json({ status: 'success', message: 'Review added successfully.' })
  } catch (error) {
    console.error('Error adding review:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

export default router
