import express from 'express'
import authenticate from '#middlewares/authenticate.js'
const router = express.Router()

// 檢查空物件, 轉換 req.params 為數字
import { getIdParam } from '#db-helpers/db-tool.js'

// 資料庫使用
import sequelize from '#configs/db.js'
import { Op } from 'sequelize' // 從 Sequelize 引入操作符

const {
  Course,
  Course_Image,
  Course_Category,
  Share_Store,
  Course_News,
  Course_Datetime,
  Course_Review,
  Share_Member,
  Share_Tag,
  Course_Tag,
  Course_Favorite,
} = sequelize.models

// 外鍵 - 分類資料表定義
Course_Category.hasMany(Course, { foreignKey: 'category_id' })
Course.belongsTo(Course_Category, { foreignKey: 'category_id', as: 'category' })
// 外鍵 - 圖片資料表定義
Course.hasMany(Course_Image, { foreignKey: 'course_id', as: 'images' })
Course_Image.belongsTo(Course, { foreignKey: 'course_id' })
// 外鍵 - 商家資料表定義
Share_Store.hasMany(Course, { foreignKey: 'store_id' })
Course.belongsTo(Share_Store, { foreignKey: 'store_id', as: 'store' })
// 外鍵 - 最新消息資料表定義
Course.hasMany(Course_News, { foreignKey: 'course_id', as: 'news' })
Course_News.belongsTo(Course, { foreignKey: 'course_id' })
// 外鍵 - 上課日期資料表定義
Course.hasMany(Course_Datetime, { foreignKey: 'course_id', as: 'datetimes' })
Course_Datetime.belongsTo(Course, { foreignKey: 'course_id' })
// 外鍵 - 評價資料表定義
Course.hasMany(Course_Review, { foreignKey: 'course_id', as: 'reviews' })
Course_Review.belongsTo(Course, { foreignKey: 'course_id' })
// 外鍵 - 會員資料表定義
Share_Member.hasMany(Course_Review, { foreignKey: 'course_id' })
Course_Review.belongsTo(Share_Member, {
  foreignKey: 'member_id',
  as: 'member',
})
// 多對多 - 課程與標籤定義
Course.belongsToMany(Share_Tag, {
  through: Course_Tag,
  foreignKey: 'course_id',
  as: 'tags',
})
Share_Tag.belongsToMany(Course, {
  through: Course_Tag,
  foreignKey: 'tag_id',
})
// 多對多 - 會員與收藏
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

// 路由建構 ---------------------------------
// GET - 得到所有課程
router.get('/', async function (req, res) {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: Course_Image, // 引入圖片資料表
          as: 'images', // 確保在模型定義中使用這個別名
          attributes: ['id', 'path', 'is_main'],
        },
      ],
      attributes: [
        'id',
        'store_id',
        'category_id',
        'name',
        'intro',
        'price',
        'average_stars',
        'min_capacity',
        'max_capacity',
        'created_at',
      ],
      nest: true,
      limit: 8,
    })
    return res.json({
      status: 'success',
      data: { courses },
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

// GET - 得到最新課程
router.get('/latest', async function (req, res) {
  try {
    const latestCourses = await Course.findAll({
      include: [
        {
          model: Course_Image,
          as: 'images',
          attributes: ['id', 'path', 'is_main'],
        },
      ],
      order: [['created_at', 'DESC']],
      nest: true,
      limit: 8,
    })

    return res.json({
      status: 'success',
      data: { courses: latestCourses },
    })
  } catch (error) {
    console.error('Error fetching latest courses:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

// GET - 得到隨機課程 (8張)
router.get('/random', async function (req, res) {
  try {
    const randomCourses = await Course.findAll({
      include: [
        {
          model: Course_Image,
          as: 'images',
          attributes: ['id', 'path', 'is_main'],
        },
      ],
      order: sequelize.random(), // 隨機函數
      nest: true,
      limit: 8,
    })
    return res.json({ status: 'success', data: { courses: randomCourses } })
  } catch (error) {
    console.error('Error fetching latest courses:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

// GET - 得到隨機課程 (9張)
router.get('/random-sm', async function (req, res) {
  try {
    const randomCourses = await Course.findAll({
      include: [
        {
          model: Course_Image,
          as: 'images',
          attributes: ['id', 'path', 'is_main'],
        },
      ],
      order: sequelize.random(), // 隨機函數
      nest: true,
      limit: 9,
    })
    return res.json({ status: 'success', data: { courses: randomCourses } })
  } catch (error) {
    console.error('Error fetching latest courses:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

// GET - 根據篩選條件得到課程
router.get('/search', async function (req, res) {
  // 從查詢參數中獲取 category_id 和 store_id
  const { category_id, store_id, keyword, min_price, max_price, sort } =
    req.query

  // 建立查詢條件
  const whereConditions = {}
  // 課程分類
  if (category_id) {
    whereConditions.category_id = category_id
  }
  // 商家分類
  if (store_id) {
    whereConditions.store_id = store_id
  }

  // 價格區間
  if (min_price && max_price) {
    whereConditions.price = { [Op.gte]: min_price, [Op.lte]: max_price }
  }

  // 關鍵字搜尋
  if (keyword) {
    whereConditions[Op.or] = [
      {
        name: { [Op.like]: `%${keyword}%` },
      },
      {
        intro: { [Op.like]: `%${keyword}%` },
      },
    ]
  }
  // 排序選項
  let orderOptions = [['created_at', 'DESC']] // 最新的(預設)
  if (sort === 'oldest') {
    orderOptions = [['created_at', 'ASC']] // 最舊的
  }
  if (sort === 'expensive') {
    orderOptions = [['price', 'DESC']] // 最貴的
  }
  if (sort === 'cheapest') {
    orderOptions = [['price', 'ASC']] // 最便宜的
  }
  if (sort === 'highestRated') {
    orderOptions = [['average_stars', 'DESC']] // 評價最高的
  }

  try {
    const courses = await Course.findAll({
      where: whereConditions, // 使用篩選條件
      include: [
        {
          model: Course_Image, // 引入圖片資料表
          as: 'images', // 確保在模型定義中使用這個別名
          attributes: ['id', 'path', 'is_main'],
        },
      ],
      order: orderOptions,
      nest: true,
    })

    return res.json({ status: 'success', data: { courses } })
  } catch (error) {
    console.error('Error fetching filtered courses:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

// GET - 得到所有課程分類
router.get('/categories', async function (req, res) {
  console.log('Fetching categories...')
  try {
    const categories = await Course_Category.findAll({
      attributes: ['id', 'name', 'path'],
      order: [['id', 'ASC']],
      raw: true,
      nest: true,
    })
    return res.json({ status: 'success', data: { categories } })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

// GET - 取得某個會員收藏的課程
router.get('/get-fav', authenticate, async (req, res) => {
  // console.log(req.user)
  if (!req.user || !req.user.id) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }
  const memberId = req.user.id

  // 取得id,名稱,介紹,價格,主圖
  const sql = `
      SELECT
          cf.id,
          cf.course_id,
          c.name,
          c.intro,
          c.price,
          c.average_stars,
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
router.post('/add-fav/:courseId', authenticate, async (req, res) => {
  console.log(req.user)
  if (!req.user || !req.user.id) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }
  const memberId = req.user.id
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
router.delete('/remove-fav/:courseId', authenticate, async (req, res) => {
  console.log(req.user)
  if (!req.user || !req.user.id) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }
  const memberId = req.user.id
  const courseId = parseInt(req.params.courseId)

  try {
    // 檢查這個收藏是否存在
    const favorite = await Course_Favorite.findOne({
      where: { member_id: memberId, course_id: courseId },
    })
    if (!favorite) {
      // 如果不存在，返回一个 404 錯誤
      return res.status(404).json({ message: 'Favorite not found.' })
    }

    // 存在的話，刪除這個收藏
    await favorite.destroy()

    res.json({ message: 'Favorite deleted successfully.' })
  } catch (error) {
    console.error('Error removing course from favorites:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

// GET - 得到單筆資料(注意，有動態參數時要寫在GET區段最後面)
router.get('/:id', async function (req, res) {
  // 轉為數字
  const id = getIdParam(req)

  const course = await Course.findByPk(id, {
    include: [
      {
        model: Course_Category,
        as: 'category', // 確保在模型定義中使用這個別名
        attributes: ['id', 'name'],
      },
      {
        model: Course_Image,
        as: 'images', // 確保在模型定義中使用這個別名
        attributes: ['id', 'path', 'is_main'],
      },
      {
        model: Share_Store,
        as: 'store',
        attributes: ['store_id', 'store_name', 'store_address', 'store_tel'],
      },
      {
        model: Course_News,
        as: 'news',
        attributes: ['id', 'title', 'content', 'created_at'],
      },
      {
        model: Course_Datetime,
        as: 'datetimes',
        attributes: ['id', 'period', 'date', 'start_time', 'end_time'],
      },
      {
        model: Course_Review,
        as: 'reviews',
        attributes: ['id', 'member_id', 'stars', 'comment', 'created_at'],
        include: [
          {
            model: Share_Member,
            as: 'member',
            attributes: ['name'],
          },
        ],
      },
      {
        model: Share_Tag,
        as: 'tags',
        attributes: ['id', 'name'],
        through: { attributes: [] },
      },
    ],
    nest: true,
    order: [[{ model: Course_Review, as: 'reviews' }, 'created_at', 'DESC']],
  })

  return res.json({ status: 'success', data: { course } })
})

export default router
