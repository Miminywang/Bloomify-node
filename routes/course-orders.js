import express from 'express'
import authenticate from '#middlewares/authenticate.js'
const router = express.Router()

// 檢查空物件, 轉換 req.params 為數字
import { getIdParam } from '#db-helpers/db-tool.js'

// 資料庫使用
import sequelize from '#configs/db.js'

const {
  Course_Order,
  Course_Order_Item,
  Course,
  Share_Payment,
  Share_Order_Status,
  Share_Payment_Status,
  Share_Invoice,
  Course_Image,
  Course_Datetime,
  Share_Store,
  Course_Review,
} = sequelize.models

// 課程訂單和課程訂單項目的關聯
Course_Order.hasMany(Course_Order_Item, {
  foreignKey: 'order_id',
  as: 'items',
})
Course_Order_Item.belongsTo(Course_Order, {
  foreignKey: 'order_id',
  as: 'order',
})

// 課程訂單項目和課程的關聯
Course.hasMany(Course_Order_Item, {
  foreignKey: 'course_id',
  as: 'orderItems',
})
Course_Order_Item.belongsTo(Course, {
  foreignKey: 'course_id',
  as: 'course',
})

// 課程訂單與付款方式、付款狀態、訂單狀態的關聯
Course_Order.belongsTo(Share_Payment, {
  as: 'payment',
  foreignKey: 'share_payment_id',
})
Course_Order.belongsTo(Share_Payment_Status, {
  as: 'payment_status',
  foreignKey: 'share_payment_status_id',
})
Course_Order.belongsTo(Share_Order_Status, {
  as: 'order_status',
  foreignKey: 'share_order_status_id',
})
Course_Order.belongsTo(Share_Invoice, {
  as: 'invoice',
  foreignKey: 'invoice_id',
})

// Course_Order_Item 和 Course
Course_Order_Item.belongsTo(Course, { foreignKey: 'course_id' })
Course.hasMany(Course_Order_Item, { foreignKey: 'course_id' })

// 路由建構 ---------------------------------

// GET - 得到所有訂單
router.get('/', authenticate, async (req, res) => {
  // console.log(req.user)
  if (!req.user || !req.user.id) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }
  const memberId = req.user.id

  try {
    const orders = await Course_Order.findAll({
      where: { member_id: memberId },
      include: [
        {
          model: Course_Order_Item, // 引入課程項目資料表
          as: 'items',
          attributes: ['id', 'order_id', 'course_id', 'period'],
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['name', 'price'],
              include: [
                {
                  model: Course_Image,
                  as: 'images',
                  attributes: ['path'],
                  where: {
                    is_main: 1, // 只包含主圖
                  },
                  required: false,
                },
                {
                  model: Course_Datetime,
                  as: 'datetimes',
                  where: {
                    period: sequelize.col('items.period'), // 這裡嘗試對應外層的period，但好像沒用
                  },
                  required: false,
                  attributes: [
                    'id',
                    'period',
                    'date',
                    'start_time',
                    'end_time',
                  ],
                },
                {
                  model: Course_Review,
                  as: 'reviews',
                  required: false,
                  where: { member_id: memberId },
                },
                {
                  model: Share_Store,
                  as: 'store',
                  attributes: ['store_id', 'store_name', 'store_address'],
                },
              ],
            },
          ],
        },
        { model: Share_Payment, as: 'payment', attributes: ['name'] },
        {
          model: Share_Payment_Status,
          as: 'payment_status',
          attributes: ['name'],
        },
        {
          model: Share_Order_Status,
          as: 'order_status',
          attributes: ['name'],
        },
        {
          model: Share_Invoice,
          as: 'invoice',
          attributes: ['name'],
        },
      ],
      order: [['created_at', 'DESC']], // 預設由新到舊排序
      nest: true,
    })

    // 過濾datetimes
    // TODO:
    const filteredOrders = orders.map((order) => ({
      ...order.get({ plain: true }), // 轉換為簡單對象
      items: order.items.map((item) => ({
        ...item.get({ plain: true }),
        course: {
          ...item.course.get({ plain: true }),
          datetimes: item.course.datetimes.filter(
            (datetime) => datetime.period === item.period
          ),
        },
      })),
    }))

    // 返回處理後的數據
    res.json({
      status: 'success',
      data: filteredOrders,
    })
  } catch (error) {
    console.error('Error retrieving orders:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

// POST - 新增訂單
router.post('/add', authenticate, async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }

  // 提取所有相關資料 ( 在前端先設定好 )
  const memberId = req.user.id
  const {
    total_cost,
    discount,
    payment_amount,
    share_payment_id,
    share_payment_status_id,
    share_order_status_id,
    invoice_id,
    courses,
  } = req.body

  // 使用事務處理創建訂單和訂單項目
  try {
    const result = await sequelize.transaction(async (t) => {
      // 創建新訂單
      const newOrder = await Course_Order.create(
        {
          member_id: memberId,
          total_cost,
          discount,
          payment_amount,
          share_payment_id,
          share_payment_status_id,
          share_order_status_id,
          invoice_id,
        },
        { transaction: t }
      )

      // 為每個課程創建訂單項目
      const orderItems = courses.map((course) => ({
        order_id: newOrder.id,
        course_id: course.course_id, // 確保字段名稱一致
        period: course.period,
      }))
      await Course_Order_Item.bulkCreate(orderItems, { transaction: t })

      return newOrder
    })

    res
      .status(201)
      .json({ message: 'Order created successfully.', data: result })
  } catch (error) {
    console.error('Error processing order:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

// DELETE - 刪除訂單

// GET - 得到單張訂單資料(注意，有動態參數時要寫在GET區段最後面)
router.get('/:orderNumber', authenticate, async function (req, res) {
  // console.log(req.user)
  // 檢查用戶身份
  if (!req.user || !req.user.id) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }
  const memberId = req.user.id

  // 從 URL 中獲取orderNumber
  const orderNumber = req.params.orderNumber
  console.log(orderNumber)

  if (!orderNumber) {
    return res.status(400).json({ message: 'Order Number is required' })
  }

  try {
    const orderDetails = await Course_Order.findOne({
      where: { order_number: orderNumber },
      include: [
        {
          model: Course_Order_Item, // 引入課程項目資料表
          as: 'items',
          attributes: ['id', 'order_id', 'course_id', 'period'],
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['name', 'price'],
              include: [
                {
                  model: Course_Image,
                  as: 'images',
                  attributes: ['path'],
                  where: {
                    is_main: 1, // 只包含主圖
                  },
                  required: false,
                },
                {
                  model: Course_Datetime,
                  as: 'datetimes',
                  where: {
                    period: sequelize.col('items.period'), // 這裡嘗試對應外層的period，但好像沒用
                  },
                  required: false,
                  attributes: [
                    'id',
                    'period',
                    'date',
                    'start_time',
                    'end_time',
                  ],
                },
                {
                  model: Share_Store,
                  as: 'store',
                  attributes: ['store_id', 'store_name', 'store_address'],
                },
              ],
            },
          ],
        },
        { model: Share_Payment, as: 'payment', attributes: ['name'] },
        {
          model: Share_Payment_Status,
          as: 'payment_status',
          attributes: ['name'],
        },
        {
          model: Share_Order_Status,
          as: 'order_status',
          attributes: ['name'],
        },
        {
          model: Share_Invoice,
          as: 'invoice',
          attributes: ['name'],
        },
      ],
      nest: true,
    })

    if (!orderDetails) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // 過濾出對應 period 的 datetimes
    const filteredOrder = {
      ...orderDetails.get({ plain: true }),
      items: orderDetails.items.map((item) => ({
        ...item.get({ plain: true }),
        course: {
          ...item.course.get({ plain: true }),
          datetimes: item.course.datetimes.filter(
            (datetime) => datetime.period === item.period
          ),
        },
      })),
    }

    // 返回處理後的數據
    res.json({
      message: 'Order details fetched successfully',
      data: filteredOrder,
    })
  } catch (error) {
    console.error('Error retrieving orders:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

export default router
