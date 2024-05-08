import express from 'express'
const router = express.Router()
import authenticate from '#middlewares/authenticate.js'
import db from '../utils/connect-mysql.js'

// 檢查空物件, 轉換req.params為數字
import { getIdParam } from '#db-helpers/db-tool.js'

// 資料庫使用
import sequelize from '#configs/db.js'

// Line Pay
import axios from 'axios'
import Base64 from 'crypto-js/enc-base64.js'
import pkg from 'crypto-js'
const { HmacSHA256 } = pkg
const {
  LINE_PAY_CHANNEL_ID,
  LINE_PAY_VERSION,
  LINE_PAY_SITE,
  LINE_PAY_CHANNEL_SECRET,
  LINE_PAY_RETURN_HOST,
  REACT_REDIRECT_CONFIRM_URL,
  REACT_REDIRECT_CANCEL_URL,
} = process.env

// Line Pay
const {
  Product,
  Product_Image,
  Product_Tag,
  Share_Tag,
  Product_Category,
  Share_Store,
  Share_Color,
  Product_Review,
  Share_Star,
  Member,
  Product_Favorite,
  Product_Order_Detail,
  Product_Order_Item,
} = sequelize.models

// 建立一對多關聯：圖片資料表定義
Product.hasMany(Product_Image, { foreignKey: 'product_id', as: 'images' })
Product_Image.belongsTo(Product, { foreignKey: 'product_id', as: 'product' })

// 建立多對多關聯：產品與共享標籤
Product.belongsToMany(Share_Tag, {
  through: Product_Tag,
  foreignKey: 'product_id',
  as: 'tags',
})
Share_Tag.belongsToMany(Product, {
  through: Product_Tag,
  foreignKey: 'share_tag_id',
})

// 在 Product 模型中建立多對一關聯
Product.belongsTo(Share_Store, { foreignKey: 'share_store_id', as: 'stores' })
// 在 Share_Store 模型中建立一對多關聯
Share_Store.hasMany(Product, { foreignKey: 'share_store_id', as: 'products' })

// 建立一對多關聯：產品類別表定義
Product_Category.hasMany(Product, {
  foreignKey: 'product_category_id',
  as: 'products',
})
Product.belongsTo(Product_Category, {
  foreignKey: 'product_category_id',
  as: 'category',
})

// 建立一對多關聯：顏色表定義
Share_Color.hasMany(Product, { foreignKey: 'share_color_id', as: 'product' })
Product.belongsTo(Share_Color, { foreignKey: 'share_color_id', as: 'colors' })

// 建立一對多關聯：一個商品，多個評論；一個評論，一個商品
Product.hasMany(Product_Review, {
  foreignKey: 'product_id',
  as: 'reviews',
})
Product_Review.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
})

// 建立商品評論與共享星等關聯
// models/Product_Review.js
Product_Review.belongsTo(Share_Star, {
  foreignKey: 'share_star_id',
  as: 'star',
})

// models/Share_Star.js
Share_Star.hasMany(Product_Review, {
  foreignKey: 'share_star_id',
  as: 'reviews',
})

// 建立商品評論與會員關聯
Product_Review.belongsTo(Member, {
  foreignKey: 'member_id',
  as: 'member',
})

Member.hasMany(Product_Review, {
  foreignKey: 'member_id',
  as: 'reviews',
})

// GET - 得到所有商品
router.get('/', async function (req, res) {
  try {
    const products = await Product.findAll({
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
          through: { attributes: [] },
        },
        {
          model: Product_Category,
          as: 'category',
          attributes: ['id', 'name', 'parent_id'], // 指定需要的屬性
        },
        {
          model: Share_Store,
          as: 'stores',
          attributes: ['store_id', 'store_name', 'store_info'],
        },
        {
          model: Share_Color,
          as: 'colors',
          attributes: ['name', 'code'],
        },
        {
          model: Product_Review,
          as: 'reviews',
          attributes: [
            'id',
            'member_id',
            'share_star_id',
            'comment',
            'created_at',
            'updated_at',
          ],
          include: [
            {
              model: Share_Star,
              as: 'star',
              attributes: ['id', 'name', 'numbers'],
            },
            {
              model: Member,
              as: 'member',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      raw: true,
      nest: true,
    })
    return res.json({ status: 'success', data: { products } })
  } catch (error) {
    console.error('Error fetching Products:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

// 篩選子項目
// Define a GET route handler for the '/filter' endpoint.
router.get('/filter', async function (req, res) {
  const { parent_id } = req.query

  // Initialize an object to hold conditions for the database query.
  const whereConditions = {}

  // If a parent_id is provided, use it to determine the specific categories to filter by.
  if (parent_id) {
    // Map parent categories to their child category IDs.
    const parentToCategoryMap = {
      1: [5, 6, 7, 8, 9, 10],
      2: [5, 6],
      3: [7, 8],
      4: [9, 10],
    }
    // Retrieve the category IDs that correspond to the given parent_id.
    const categoryIds = parentToCategoryMap[parent_id]
    // If the parent_id is valid and has corresponding category IDs, set them in the conditions.
    if (categoryIds) {
      whereConditions.product_category_id = categoryIds
    }
  }

  try {
    // Perform a database query to find all products matching the whereConditions.
    const { rows: products, count } = await Product.findAndCountAll({
      where: whereConditions, // Conditions used for filtering the products.
      include: [
        // Include related models and specify the attributes to retrieve.
        {
          model: Product_Image,
          as: 'images',
          attributes: ['id', 'url', 'is_thumbnail'],
          required: false,
        },
        {
          model: Share_Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }, // Do not retrieve attributes from the join table.

          required: false,
        },
        {
          model: Product_Category,
          as: 'category',
          attributes: ['name', 'parent_id'], // Include parent_id for additional context.
          required: false,
        },
        {
          model: Share_Store,
          as: 'stores',
          attributes: ['store_id', 'store_name', 'store_info'],
          required: false,
        },
        {
          model: Share_Color,
          as: 'colors',
          attributes: ['name', 'code'],
          required: false,
        },
        {
          model: Product_Review,
          as: 'reviews',
          attributes: [
            'id',
            'member_id',
            'share_star_id',
            'comment',
            'created_at',
            'updated_at',
          ],
          include: [
            // Include nested relations within reviews.
            {
              model: Share_Star,
              as: 'star',
              attributes: ['id', 'name', 'numbers'],
              required: false,
            },
            {
              model: Member,
              as: 'member',
              attributes: ['id', 'name'],
              required: false,
            },
          ],
          required: false,
        },
      ],
      // order: orderOptions,
      nest: true, // Enable nested loading of related models.
    })
    // If the query is successful, return the products in the response.
    return res.json({ status: 'success', data: { products, count } })
  } catch (error) {
    // If there's an error during the database query, log the error and return a server error response.
    console.error('Error fetching Products:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

// GET - 取得某個會員收藏的商品
router.get('/get-fav', authenticate, async (req, res) => {
  console.log(req.user)
  if (!req.user || !req.user.id) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }
  const memberId = req.user.id

  // 取得id,名稱,介紹,價格,主圖
  const sql = `
      SELECT
          pf.id,
          pf.product_id,
          p.name,
          p.info,
          p.price,
          pi.url AS url,
          pi.is_thumbnail
      FROM
          product_favorite AS pf
      JOIN
          product AS p ON pf.product_id = p.id
      LEFT JOIN
          product_image AS pi ON p.id = pi.product_id AND pi.is_thumbnail = 1
      WHERE
          pf.member_id = :memberId
      ORDER BY
          pf.product_id ASC;
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
    console.error('Error fetching favorite products:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

// POST - 新增收藏的商品
router.post('/add-fav/:productId', authenticate, async (req, res) => {
  console.log(req.user)
  if (!req.user || !req.user.id) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }
  const memberId = req.user.id
  const productId = parseInt(req.params.productId)

  try {
    // 檢查
    const existing = await Product_Favorite.findOne({
      where: { member_id: memberId, product_id: productId },
    })

    if (existing) {
      // 如果已存在，可選擇更新紀錄或返回已收藏
      return res.status(409).json({ message: 'Product already favorited.' })
    }

    // 插入新的收藏紀錄
    const newFavorite = await Product_Favorite.create({
      member_id: memberId,
      product_id: productId,
    })

    res
      .status(201)
      .json({ message: 'Product favorited successfully.', data: newFavorite })
  } catch (error) {
    console.error('Error adding product to favorites:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

// DELETE - 刪除收藏的商品
router.delete('/remove-fav/:productId', authenticate, async (req, res) => {
  console.log(req.user)
  if (!req.user || !req.user.id) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }
  const memberId = req.user.id
  const productId = parseInt(req.params.productId)

  try {
    // 檢查這個收藏是否存在
    const favorite = await Product_Favorite.findOne({
      where: { member_id: memberId, product_id: productId },
    })
    if (!favorite) {
      // 如果不存在，返回一個 404 錯誤
      return res.status(404).json({ message: 'Favorite not found.' })
    }

    // 存在的话，刪除这个收藏
    await favorite.destroy()

    res.json({ message: 'Favorite deleted successfully.' })
  } catch (error) {
    console.error('Error removing product from favorites:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})
// 收藏結束

// GET - 取得訂單和單筆商品明細
router.get('/get-all-order-details', authenticate, async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }
  const memberId = req.user.id

  try {
    // Query to get order details
    const sqlOrderDetails = `
      SELECT
          pod.*
      FROM
          product_order_detail AS pod
      WHERE
          pod.member_id = :memberId;
    `
    const orderDetails = await sequelize.query(sqlOrderDetails, {
      replacements: { memberId: memberId },
      type: sequelize.QueryTypes.SELECT,
    })
    const sqlOrderItems = `
      SELECT
          poi.*,
          p.name,
          p.price,
          p.directory,
          pi.url AS thumbnail_url,
          ss.store_name
      FROM
          product_order_item AS poi
      JOIN
          product_order_detail AS pod ON pod.id = poi.product_order_detail_id
      JOIN
          product AS p ON poi.product_id = p.id
      LEFT JOIN
          product_image AS pi ON p.id = pi.product_id AND pi.is_thumbnail = 1
      LEFT JOIN
          Share_Store AS ss ON p.share_store_id = ss.store_id
      WHERE
          pod.member_id = :memberId;
    `
    const orderItems = await sequelize.query(sqlOrderItems, {
      replacements: { memberId: memberId },
      type: sequelize.QueryTypes.SELECT,
    })

    res.json({
      status: 'success',
      orderDetails: orderDetails,
      orderItems: orderItems,
    })
  } catch (error) {
    console.error('Error fetching order data:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

// POST - 儲存訂單明細
router.post('/save-order-details', authenticate, async (req, res) => {
  // console.log('Received body:', req.body)
  if (!req.user || !req.user.id) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }
  const memberId = req.user.id
  const { products, detail, store711, subtotal, totalAmount, orderStatus } =
    req.body
  try {
    // 插入新的訂單明細紀錄
    const newOrderDetail = await Product_Order_Detail.create({
      member_id: memberId,
      subtotal: subtotal,
      total_cost: totalAmount,
      sender_name: detail.senderName,
      sender_phone: detail.senderNumber,
      sender_mail: detail.senderEmail,
      recipient_name: detail.recipientName,
      recipient_phone: detail.recipientNumber,
      delivery_option: detail.deliveryOption,
      delivery_address: detail.deliveryAddress,
      delivery_cost: detail.deliveryShipping,
      payment_method: detail.paymentMethod,
      coupon_code: detail.couponCode,
      discount: detail.discount,
      invoice_option: detail.invoiceOption,
      order_status: orderStatus,
      store_id: store711.storeid,
      store_name: store711.storename,
      store_address: store711.storeaddress,
    })
    for (const item of products) {
      await Product_Order_Item.create({
        product_order_detail_id: newOrderDetail.id,
        product_id: item.id,
        quantity: item.quantity,
      })
    }

    res.status(201).json({
      message: 'new order detail saves successfully.',
      data: newOrderDetail,
    })
  } catch (error) {
    console.error('Error adding new order detail:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

// Line Pay
// 跟 LINE Pay 串接的 API
router.post('/create-line-pay-order', async (req, res) => {
  const { orderId, linePayOrder, total_amount } = req.body

  console.log('Order ID:', orderId)
  console.log('Line Pay Order:', linePayOrder)
  console.log('Total Amount:', total_amount)

  linePayOrder.orderId = orderId
  linePayOrder.amount = total_amount

  console.log('create-line-pay-order', linePayOrder)

  try {
    const linePayBody = {
      ...linePayOrder,
      redirectUrls: {
        confirmUrl: `${LINE_PAY_RETURN_HOST}${REACT_REDIRECT_CONFIRM_URL}`,
        cancelUrl: `${LINE_PAY_RETURN_HOST}${REACT_REDIRECT_CANCEL_URL}`,
      },
    }
    // console.log(linePayBody)

    // Line Pay 路徑
    const uri = '/payments/request'
    const headers = createSignature(uri, linePayBody)

    // 準備送給 LINE Pay 的資訊
    // console.log(linePayBody, headers)
    const url = `${LINE_PAY_SITE}/${LINE_PAY_VERSION}${uri}` // 發出請求的路徑

    const linePayRes = await axios.post(url, linePayBody, { headers })
    console.log('linePayResDataInfo', linePayRes.data)

    if (linePayRes?.data?.returnCode === '0000') {
      res.json(linePayRes?.data?.info?.paymentUrl.web)
      // res.redirect(linePayRes?.data?.info.paymentUrl.web) //cors error 不能直接讓前端轉址
    }
  } catch (error) {
    console.log(error)
    // 錯誤的回饋
    res.end()
  }
})

// 本地端頁面，轉回來的路由
// 確認支付是否成功
router.get('/line-pay/confirm', async (req, res) => {
  const { transactionId, orderId } = req.query
  console.log('Transaction ID:', transactionId, 'Order ID:', orderId)
  // 查詢訂單詳情
  const sql = `SELECT * FROM product_order_detail WHERE order_number = ?`
  const [order] = await db.query(sql, [orderId])

  if (!order.length) {
    return res.status(404).json({ success: false, message: 'Order not found' })
  }
  const orderDetails = order[0]

  try {
    // 比對本地端訂單
    const linePayBody = {
      amount: orderDetails.subtotal,
      currency: 'TWD',
    }
    const uri = `/payments/${transactionId}/confirm`
    const headers = createSignature(uri, linePayBody)

    const url = `${LINE_PAY_SITE}/${LINE_PAY_VERSION}${uri}`
    console.log(url)
    // 向 LINE Pay 發送確認請求
    const linePayRes = await axios.post(url, linePayBody, { headers })
    // console.log('linePayRes', linePayRes)

    // 付款成功後
    if (linePayRes.data.returnCode === '0000') {
      const updateSql = `UPDATE product_order_detail SET order_status = '處理中' WHERE order_number = ?`
      await db.query(updateSql, [orderId])
      res.json({ success: true, message: 'Payment confirmed' })
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment confirmation failed',
        error: linePayRes.data.returnMessage,
      })
    }
  } catch (error) {
    console.log(error)
    return res.json({
      success: false,
      error: 'An error occurred while processing the payment',
    })
  }
})

// LinePay function：創建 Line Pay 簽章
function createSignature(uri, linePayBody) {
  const nonce = parseInt(new Date().getTime() / 1000)
  const string = `${LINE_PAY_CHANNEL_SECRET}/${LINE_PAY_VERSION}${uri}${JSON.stringify(
    linePayBody
  )}${nonce}`

  const signature = Base64.stringify(
    HmacSHA256(string, LINE_PAY_CHANNEL_SECRET)
  )

  const headers = {
    'X-LINE-ChannelId': LINE_PAY_CHANNEL_ID,
    'Content-Type': 'application/json',
    'X-LINE-Authorization-Nonce': nonce,
    'X-LINE-Authorization': signature,
  }
  return headers
}

// Line Pay

// 7-11 店到店：與資料庫無關，單純轉向使用
const callback_url = process.env.SHIP_711_STORE_CALLBACK_URL

router.post('/711', function (req, res) {
  console.log(req.body)
  res.redirect(callback_url + '?' + new URLSearchParams(req.body).toString())
  // const queryString = QueryString.stringify(req.body)
  // console.log(queryString)
  // res.redirect(callback_url + '?' + queryString)
})

// GET - 得到單筆資料(注意，有動態參數時要寫在GET區段最後面)
router.get('/:id', async function (req, res) {
  const id = getIdParam(req)
  try {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Product_Image,
          as: 'images', // Ensure that this alias matches the one defined in the association
          attributes: ['id', 'url', 'is_thumbnail'], // Select only necessary fields
        },
        {
          model: Product_Category,
          as: 'category',
          attributes: ['name'], // 指定需要的屬性
        },
        {
          model: Share_Store,
          as: 'stores',
          attributes: ['store_id', 'store_name', 'store_info'],
        },
        {
          model: Share_Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
        {
          model: Product_Review,
          as: 'reviews',
          attributes: [
            'id',
            'member_id',
            'share_star_id',
            'comment',
            'created_at',
            'updated_at',
          ],
          include: [
            {
              model: Share_Star,
              as: 'star',
              attributes: ['id', 'name', 'numbers'],
            },
            {
              model: Member,
              as: 'member',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      nest: true, // This option enables a nested return structure that's easier to work with
    })

    if (product) {
      return res.json({ status: 'success', data: { product } })
    } else {
      return res
        .status(404)
        .json({ status: 'error', message: 'Product not found' })
    }
  } catch (error) {
    console.error('Error fetching Product:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})
export default router
