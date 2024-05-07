import express from 'express'
import ecpay_payment from 'ecpay_aio_nodejs'
import crypto from 'crypto'
import dotenv from 'dotenv'
import moment from 'moment'
import authenticate from '#middlewares/authenticate.js'
dotenv.config()
const { MERCHANTID, HASHKEY, HASHIV, EC_HOST } = process.env
const options = {
  OperationMode: 'Test', //Test or Production
  MercProfile: {
    MerchantID: MERCHANTID,
    HashKey: HASHKEY,
    HashIV: HASHIV,
  },
  IgnorePayment: [
    //    "Credit",
    //    "WebATM",
    //    "ATM",
    //    "CVS",
    //    "BARCODE",
    //    "AndroidPay"
  ],
  IsProjectContractor: false,
}
const ecpay = new ecpay_payment(options)
const router = express.Router()
import { getIdParam } from '#db-helpers/db-tool.js'
import { Op } from 'sequelize'
import fs from 'fs'
import multer from 'multer'
import { fileURLToPath } from 'url'
const upload = multer()

import { v4 as uuidv4 } from 'uuid'
import sequelize from '#configs/db.js'
import path from 'path'

const {
  Custom_Template_List,
  Custom_Template_Detail,
  Custom_Product_List,
  Custom_Favorite,
  Custom_Category,
  Share_Store,
  Share_Color,
  Share_Occ,
  Custom_Product_Variant,
  Custom_Order_List,
  Custom_Order_Detail,
  Share_Member,
  Share_Payment,
  Share_Payment_Status,
  Share_Shipping,
  Share_Shipping_Status,
  Share_Order_Status,
  Share_Invoice,
} = sequelize.models

// 在 Share_Color 模型中
Share_Color.hasMany(Custom_Product_Variant, {
  foreignKey: 'color_id',
  as: 'variants',
})

// 在 Custom_Order_Detail 模型中
Custom_Order_Detail.belongsTo(Custom_Product_List, {
  foreignKey: 'product_id',
  as: 'product',
})

Custom_Order_List.belongsTo(Share_Invoice, {
  as: 'invoiceType',
  foreignKey: 'invoice_id',
})
// 在 Custom_Product_List 模型中
Custom_Product_List.hasMany(Custom_Order_Detail, {
  foreignKey: 'product_id',
  as: 'orderDetails',
})

// Custom_Order_List 模型
Custom_Order_List.hasMany(Custom_Order_Detail, {
  foreignKey: 'order_id',
  as: 'orderDetails',
})

// Custom_Order_Detail 模型
Custom_Order_Detail.belongsTo(Custom_Order_List, { foreignKey: 'order_id' })
// Share_Member 模型
Share_Member.hasMany(Custom_Order_List, { foreignKey: 'member_id' })

// Order 模型
Custom_Order_List.belongsTo(Share_Member, {
  foreignKey: 'member_id',
  as: 'member',
})
Custom_Order_List.belongsTo(Share_Store, {
  foreignKey: 'store_id',
  as: 'store',
})
Custom_Order_List.belongsTo(Share_Payment, {
  foreignKey: 'payment_id',
  as: 'payment',
})
Custom_Order_List.belongsTo(Share_Shipping, {
  foreignKey: 'shipping_method',
  as: 'shipping',
})
Custom_Order_List.belongsTo(Share_Order_Status, {
  foreignKey: 'order_status',
  as: 'orderStatus',
})
Custom_Order_List.belongsTo(Share_Shipping_Status, {
  foreignKey: 'shipping_status',
  as: 'shippingStatus',
})
Custom_Order_List.belongsTo(Share_Payment_Status, {
  foreignKey: 'payment_status',
  as: 'paymentStatus',
})
// Product Variants 和 Categories
Custom_Product_Variant.belongsTo(Custom_Category, {
  foreignKey: 'category_id',
  as: 'category',
})
Custom_Template_List.belongsTo(Custom_Category, {
  foreignKey: 'category_id',
  as: 'category',
})
Custom_Product_Variant.belongsTo(Share_Color, {
  foreignKey: 'color_id',
  as: 'color',
})
Custom_Category.hasMany(Custom_Product_Variant, {
  foreignKey: 'category_id',
  as: 'variants',
})

// Product List 和 Variants
Custom_Product_List.belongsTo(Custom_Product_Variant, {
  foreignKey: 'variant_id',
  as: 'variant',
})
Custom_Product_Variant.hasMany(Custom_Product_List, {
  foreignKey: 'variant_id',
  as: 'products',
})

// Product List 和 Store
Custom_Product_List.belongsTo(Share_Store, {
  foreignKey: 'store_id',
  as: 'store',
})

// Template List 和 Store, Occ, Role, Color
Custom_Template_List.belongsTo(Share_Store, {
  foreignKey: 'store_id',
  as: 'store',
})
Custom_Template_List.belongsTo(Share_Occ, {
  foreignKey: 'occ_id',
  as: 'occ',
})

Custom_Template_List.belongsTo(Share_Color, {
  foreignKey: 'color_id',
  as: 'color',
})

// Template Details 和 Template List, Product List
Custom_Template_Detail.belongsTo(Custom_Template_List, {
  foreignKey: 'template_id',
  as: 'template',
})
Custom_Template_Detail.belongsTo(Custom_Product_List, {
  foreignKey: 'product_id',
  as: 'product',
})
Custom_Template_List.hasMany(Custom_Template_Detail, {
  foreignKey: 'template_id',
  as: 'details',
})

// router.get('/', async function (req, res) {
//   const sortField = req.query.sortField
//   const sortOrder = req.query.sortOrder || 'ASC'
//   const filterField = req.query.filterField
//   const filterValue = req.query.filterValue
//   let orderCriteria = [['template_id', sortOrder]] // default sorting

//   if (sortField === 'total_price') {
//     orderCriteria = [
//       [
//         sequelize.literal(
//           `(SELECT SUM(price) FROM custom_product_list WHERE product_id IN (SELECT product_id FROM custom_template_detail WHERE template_id = Custom_Template_List.template_id))`
//         ),
//         sortOrder,
//       ],
//     ]
//   }

//   // filterField=occs&roles&filterValue=2,4;2,3,6&sortField=template_id&sortOrder=asc
//   const whereCondition = {}
//   if (filterField && filterValue) {
//     const fields = filterField.split('&')
//     const values = filterValue.split(';').map((value) => value.split(','))

//     fields.forEach((field, index) => {
//       whereCondition[field] = { [Op.in]: values[index] }
//     })
//   }
//   try {
//     const customTemplateLists = await Custom_Template_List.findAll({
//       where: whereCondition,
//       order: orderCriteria,
//       include: [
//         {
//           model: Share_Store,
//           as: 'store',
//           attributes: ['store_name'],
//         },
//         {
//           model: Share_Occ,
//           as: 'occ',
//           attributes: ['occ'],
//         },
//         {
//           model: Flower_Type,
//           as: 'role',
//           attributes: ['role'],
//         },
//         {
//           model: Share_Color,
//           as: 'color',
//           attributes: ['name', 'code'],
//         },
//         {
//           model: Custom_Template_Detail,
//           as: 'details',
//           include: [
//             {
//               model: Custom_Product_List,
//               as: 'product',
//               attributes: ['price'],
//             },
//           ],
//           attributes: [],
//         },
//       ],
//       attributes: [
//         'template_id',
//         'template_name',
//         'image_url',
//         'discount',
//         [
//           sequelize.literal(`(
//             SELECT SUM(price)
//             FROM custom_product_list
//             WHERE product_id IN (
//               SELECT product_id
//               FROM custom_template_detail
//               WHERE template_id = Custom_Template_List.template_id
//             )
//           )`),
//         ],
//       ],
//       group: ['Custom_Template_List.template_id'],
//     })

//     const formattedData = customTemplateLists.map((template) => ({
//       id: template.template_id,
//       src: template.image_url,
//       name: template.template_name,
//       store: template.store?.store_name,
//       occ: template.occ?.occ,
//       role: template.role?.role,
//       color: template.color?.name,
//       discount: template.discount,
//       total_price: template.dataValues.total_price,
//     }))

//     return res.json({
//       status: 'success',
//       data: { customTemplateLists: formattedData },
//     })
//   } catch (error) {
//     console.error('Error fetching template lists:', error)
//     return res
//       .status(500)
//       .json({ status: 'error', message: 'Internal server error' })
//   }
// })

// --------------
// router.get('/', async function (req, res) {
//   const sortField = req.query.sortField || 'template_id' // 默认排序字段
//   const sortOrder = req.query.sortOrder || 'ASC' // 默认排序顺序
//   const filterFields = req.query.filterField
//     ? req.query.filterField.split(';')
//     : []
//   const filterValues = req.query.filterValue
//     ? req.query.filterValue.split(';').map((v) => v.split(','))
//     : []

//   let whereConditions = []

//   // 动态构建 WHERE 子句
//   filterFields.forEach((field, index) => {
//     const values = filterValues[index].map((value) => `'${value}'`).join(',')
//     whereConditions.push(`${field} IN (${values})`)
//   })
//   const whereClause =
//     whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

//   const sql = `
//     SELECT
//       sco.occ_id,
//       sco.occ,
//       ctl.template_id,
//       ss.store_name AS store_name,
//       ctl.template_name,
//       ctl.image_url,
//       ctl.discount,
//       clr.color_id AS color_id,
//       cc.category_id AS category_id,
//       cc.category_name AS flower_type,
//       clr.name AS color_name,
//       clr.code AS color_code,
//       (
//         SELECT SUM(cpl.price)
//         FROM Custom_Template_Detail AS ctd
//         LEFT JOIN Custom_Product_List AS cpl ON ctd.product_id = cpl.product_id
//         WHERE ctd.template_id = ctl.template_id
//       ) AS total_price
//     FROM
//       Custom_Template_List AS ctl
//       LEFT JOIN Share_Store AS ss ON ctl.store_id = ss.store_id
//       LEFT JOIN Share_Occ AS sco ON ctl.occ_id = sco.occ_id
//       LEFT JOIN Share_Color AS clr ON ctl.color_id = clr.color_id
//       LEFT JOIN custom_category AS cc ON ctl.category_id = cc.category_id
//     ${whereClause}
//     ORDER BY ${sortField === 'total_price' ? `(SELECT SUM(cpl.price) FROM Custom_Template_Detail AS ctd LEFT JOIN Custom_Product_List AS cpl ON ctd.product_id = cpl.product_id WHERE ctd.template_id = ctl.template_id)` : `ctl.${sortField}`} ${sortOrder};
//   `

//   try {
//     const results = await sequelize.query(sql, {
//       type: sequelize.QueryTypes.SELECT,
//     })

//     const events = results.reduce((acc, item) => {
//       const occ = acc.find((occ) => occ.occ_id === item.occ_id)
//       if (!occ) {
//         acc.push({
//           occ_id: item.occ_id,
//           occ_name: item.occ,
//           products: [],
//         })
//       }
//       const occIndex = acc.findIndex((occ) => occ.occ_id === item.occ_id)
//       acc[occIndex].products.push({
//         template_id: item.template_id,
//         store_name: item.store_name,
//         template_name: item.template_name,
//         image_url: item.image_url,
//         discount: item.discount,
//         color_id: item.color_id,
//         category_id: item.category_id,
//         flower_type: item.flower_type,
//         color_name: item.color_name,
//         color_code: item.color_code,
//         total_price: item.total_price,
//       })
//       return acc
//     }, [])

//     return res.json({
//       status: 'success',
//       data: { events: events }, // 封装成期望的格式
//     })
//   } catch (error) {
//     console.error('Error fetching template lists:', error)
//     res.status(500).json({ status: 'error', message: 'Internal server error' })
//   }
// })
router.get('/', async function (req, res) {
  const sortField = req.query.sortField || 'template_id'
  const sortOrder = req.query.sortOrder || 'ASC'
  const filterFields = req.query.filterField
    ? req.query.filterField.split(';')
    : []
  const filterValues = req.query.filterValue
    ? req.query.filterValue.split(';').map((v) => v.split(','))
    : []

  let whereConditions = []

  filterFields.forEach((field, index) => {
    const values = filterValues[index].map((value) => `'${value}'`).join(',')
    const prefix =
      field === 'color_id' ? 'clr' : field === 'category_id' ? 'cc' : 'sco'
    whereConditions.push(`${prefix}.${field} IN (${values})`)
  })
  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

  // const sql = `
  //   SELECT
  //     sco.occ_id,
  //     sco.occ as occ_name,
  //     ctl.template_id,
  //     ss.store_name AS store_name,
  //     ctl.template_name,
  //     ctl.image_url,
  //     ctl.discount,
  //     clr.color_id AS color_id,
  //     cc.category_id AS category_id,
  //     cc.category_name AS flower_type,
  //     clr.name AS color_name,
  //     clr.code AS color_code,
  //     (
  //       SELECT SUM(cpl.price)
  //       FROM Custom_Template_Detail AS ctd
  //       LEFT JOIN Custom_Product_List AS cpl ON ctd.product_id = cpl.product_id
  //       WHERE ctd.template_id = ctl.template_id
  //     ) AS total_price
  //   FROM
  //     Custom_Template_List AS ctl
  //     LEFT JOIN Share_Store AS ss ON ctl.store_id = ss.store_id
  //     LEFT JOIN Share_Occ AS sco ON sco.occ_id = ctl.occ_id
  //     LEFT JOIN Share_Color AS clr ON clr.color_id = ctl.color_id
  //     LEFT JOIN Custom_Category AS cc ON cc.category_id = ctl.category_id
  //   ${whereClause}
  //   ORDER BY ${sortField === 'total_price' ? `(SELECT SUM(cpl.price) FROM Custom_Template_Detail AS ctd LEFT JOIN Custom_Product_List AS cpl ON ctd.product_id = cpl.product_id WHERE ctd.template_id = ctl.template_id)` : `ctl.${sortField}`} ${sortOrder};
  // `

  const sql = `SELECT
    sco.occ_id,
    sco.occ AS occ_name,
    ctl.template_id,
    ss.store_name AS store_name,
    ctl.template_name,
    ctl.image_url,
    ctl.discount,
    clr.color_id AS color_id,
    cc.category_id AS category_id,
    cc.category_name AS flower_type,
    clr.name AS color_name,
    clr.code AS color_code,
    (
      SELECT SUM(cpl.price)
      FROM Custom_Template_Detail AS ctd
      JOIN Custom_Product_List AS cpl ON ctd.product_id = cpl.product_id
      WHERE ctd.template_id = ctl.template_id
    ) AS total_price,
    GROUP_CONCAT(
      CONCAT(
        '{"product_id": "', ctd.product_id,
        '", "top": "', ctd.top,
        '", "left": "', ctd.left,
        '", "rotate": "', ctd.rotate,
        '", "z_index": "', ctd.z_index, '"}'
      ) SEPARATOR ','
    ) AS products_json
  FROM
    Custom_Template_List AS ctl
    LEFT JOIN Share_Store AS ss ON ctl.store_id = ss.store_id
    LEFT JOIN Share_Occ AS sco ON sco.occ_id = ctl.occ_id
    LEFT JOIN Share_Color AS clr ON clr.color_id = ctl.color_id
    LEFT JOIN Custom_Category AS cc ON cc.category_id = ctl.category_id
    LEFT JOIN Custom_Template_Detail AS ctd ON ctd.template_id = ctl.template_id
  ${whereClause}
  GROUP BY ctl.template_id
  ORDER BY ${sortField === 'total_price' ? 'total_price' : `ctl.${sortField}`} ${sortOrder};
  `

  try {
    const results = await sequelize.query(sql, {
      type: sequelize.QueryTypes.SELECT,
    })

    // const events = results.reduce((acc, item) => {
    //   const occ = acc.find((occ) => occ.occ_id === item.occ_id) || {
    //     occ_id: item.occ_id,
    //     occ_name: item.occ_name,
    //     products: [],
    //   }
    //   if (!acc.includes(occ)) {
    //     acc.push(occ)
    //   }
    //   occ.products.push({
    //     template_id: item.template_id,
    //     store_name: item.store_name,
    //     template_name: item.template_name,
    //     image_url: item.image_url,
    //     discount: item.discount,
    //     color_id: item.color_id,
    //     category_id: item.category_id,
    //     flower_type: item.flower_type,
    //     color_name: item.color_name,
    //     color_code: item.color_code,
    //     total_price: item.total_price,
    //   })
    //   return acc
    // }, [])

    const events = results.reduce((acc, item) => {
      const occ = acc.find((occ) => occ.occ_id === item.occ_id) || {
        occ_id: item.occ_id,
        occ_name: item.occ_name,
        products: [],
      }

      if (!acc.includes(occ)) {
        acc.push(occ)
      }

      occ.products.push({
        template_id: item.template_id,
        store_name: item.store_name,
        template_name: item.template_name,
        image_url: item.image_url,
        discount: item.discount,
        color_id: item.color_id,
        category_id: item.category_id,
        flower_type: item.flower_type,
        color_name: item.color_name,
        color_code: item.color_code,
        total_price: item.total_price,
      })

      return acc
    }, [])
    res.json({
      status: 'success',
      data: { events },
    })
  } catch (error) {
    console.error('Error fetching template lists:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})
// router.get('/orders', async (req, res) => {
//   try {
//     const orders = await Custom_Order_List.findAll({
//       include: [
//         {
//           model: Share_Member,
//           as: 'member', // 確保使用了正確的別名
//           attributes: ['name', 'phone'],
//         },
//         {
//           model: Share_Store,
//           as: 'store', // 確保使用了正確的別名
//           attributes: ['store_name'],
//         },
//         {
//           model: Share_Payment,
//           as: 'payment', // 確保使用了正確的別名
//           attributes: ['name'],
//         },
//         {
//           model: Share_Shipping,
//           as: 'shipping', // 確保使用了正確的別名
//           attributes: ['name', 'cost'],
//         },
//         {
//           model: Share_Shipping_Status,
//           as: 'shippingStatus', // 確保使用了正確的別名
//           attributes: ['name'],
//         },
//         {
//           model: Share_Order_Status,
//           as: 'orderStatus', // 確保使用了正確的別名
//           attributes: ['name'],
//         },
//       ],
//       attributes: [
//         'order_id',
//         'image_url',
//         'order_date',
//         'delivery_date',
//         'total_amount',
//         'discount',
//         'card_content',
//         'card_url',
//         'recipient_name',
//         'recipient_tel',
//         'recipient_address',
//       ],
//     })

//     const formattedOrders = orders.map((order) => ({
//       order_id: order.order_id,
//       image_url: order.image_url,
//       order_date: order.order_date,
//       delivery_date: order.delivery_date,
//       total_amount: order.total_amount,
//       discount: order.discount,
//       card_content: order.card_content,
//       card_url: order.card_url,
//       recipient_name: order.recipient_name,
//       recipient_tel: order.recipient_tel,
//       recipient_address: order.recipient_address,
//       member_name: order.member?.name,
//       member_phone: order.member?.phone,
//       store_name: order.store?.store_name,
//       payment_name: order.payment?.name,
//       shipping_name: order.shipping?.name,
//       shipping_cost: order.shipping?.cost,
//       shipping_status: order.shippingStatus?.name,
//       order_status: order.orderStatus?.name,
//     }))

//     res.json({ status: 'success', data: formattedOrders })
//   } catch (error) {
//     console.error('Failed to retrieve orders:', error)
//     res.status(500).json({ status: 'error', message: 'Internal server error' })
//   }
// })

// router.get('/orders', async (req, res) => {
//   try {
//     const orders = await Custom_Order_List.findAll({
//       include: [
//         {
//           model: Share_Member,
//           as: 'member',
//           attributes: ['name', 'phone'],
//         },
//         {
//           model: Share_Store,
//           as: 'store',
//           attributes: ['store_name'],
//         },
//         {
//           model: Share_Payment,
//           as: 'payment',
//           attributes: ['name'],
//         },
//         {
//           model: Share_Shipping,
//           as: 'shipping',
//           attributes: ['name', 'cost'],
//         },
//         {
//           model: Share_Shipping_Status,
//           as: 'shippingStatus',
//           attributes: ['name'],
//         },
//         {
//           model: Share_Order_Status,
//           as: 'orderStatus',
//           attributes: ['name'],
//         },
//         {
//           model: Custom_Order_Detail,
//           as: 'orderDetails',
//           include: [
//             {
//               model: Custom_Product_List,
//               as: 'product',
//               include: [
//                 {
//                   model: Custom_Product_Variant,
//                   as: 'variant',
//                   include: [
//                     {
//                       model: Share_Color,
//                       as: 'color',
//                       attributes: ['name'], // 包括顏色名稱
//                     },
//                   ],
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//       attributes: [
//         'order_id',
//         'image_url',
//         'order_date',
//         'delivery_date',
//         'total_amount',
//         'discount',
//         'card_content',
//         'card_url',
//         'recipient_name',
//         'recipient_tel',
//         'recipient_address',
//       ],
//     })

//     const formattedOrders = orders.map((order) => ({
//       order_id: order.order_id,
//       image_url: order.image_url,
//       order_date: order.order_date,
//       delivery_date: order.delivery_date,
//       total_amount: order.total_amount,
//       discount: order.discount,
//       card_content: order.card_content,
//       card_url: order.card_url,
//       recipient_name: order.recipient_name,
//       recipient_tel: order.recipient_tel,
//       recipient_address: order.recipient_address,
//       member_name: order.member?.name,
//       member_phone: order.member?.phone,
//       store_name: order.store?.store_name,
//       payment_name: order.payment?.name,
//       shipping_name: order.shipping?.name,
//       shipping_cost: order.shipping?.cost,
//       shipping_status: order.shippingStatus?.name,
//       order_status: order.orderStatus?.name,
//       products: order.orderDetails.map((detail) => ({
//         product_name: detail.product?.template_name,
//         color_name: detail.product?.variant?.color?.name,
//       })),
//     }))

//     res.json({ status: 'success', data: formattedOrders })
//   } catch (error) {
//     console.error('Failed to retrieve orders:', error)
//     res.status(500).json({ status: 'error', message: 'Internal server error' })
//   }
// })
router.get('/orders', async (req, res) => {
  try {
    const orders = await Custom_Order_List.findAll({
      include: [
        {
          model: Share_Member,
          as: 'member',
          attributes: ['name', 'phone'],
        },
        {
          model: Share_Store,
          as: 'store',
          attributes: ['store_name'],
        },
        {
          model: Share_Payment,
          as: 'payment',
          attributes: ['name'],
        },
        {
          model: Share_Shipping,
          as: 'shipping',
          attributes: ['name', 'cost'],
        },
        {
          model: Share_Shipping_Status,
          as: 'shippingStatus',
          attributes: ['name'],
        },
        {
          model: Share_Order_Status,
          as: 'orderStatus',
          attributes: ['name'],
        },
        {
          model: Custom_Order_Detail,
          as: 'orderDetails',
          include: [
            {
              model: Custom_Product_List,
              as: 'product',
              include: [
                {
                  model: Custom_Product_Variant,
                  as: 'variant',
                  include: [
                    {
                      model: Share_Color,
                      as: 'color',
                      attributes: ['name'], // 包括顏色名稱
                    },
                    {
                      model: Custom_Category,
                      as: 'category', // 確保這裡使用的別名與模型定義一致
                      attributes: ['category_name', 'category_type'], // 拉取分類名稱
                    },
                  ],
                  attributes: ['image_url'], // 包括圖片URL
                },
              ],
              attributes: ['product_id', 'price'],
            },
          ],
        },
      ],
      attributes: [
        'order_id',
        'bouquet_name',
        'image_url',
        'created_at',
        'delivery_date',
        'total',
        'discount',
        'card_content',
        'card_url',
        'recipient_name',
        'recipient_tel',
        'recipient_address',
      ],
    })

    const formattedOrders = orders.map((order) => ({
      order_id: order.order_id,
      bouquet: order.bouquet_name,
      image_url: order.image_url,
      order_date: order.created_at,
      delivery_date: order.delivery_date,
      total: order.total,
      discount: order.discount,
      card_content: order.card_content,
      card_url: order.card_url,
      recipient_name: order.recipient_name,
      recipient_tel: order.recipient_tel,
      recipient_address: order.recipient_address,
      member_name: order.member?.name,
      member_phone: order.member?.phone,
      store_name: order.store?.store_name,
      payment_name: order.payment?.name,
      shipping_name: order.shipping?.name,
      shipping_cost: order.shipping?.cost,
      shipping_status: order.shippingStatus?.name,
      order_status: order.orderStatus?.name,
      products: order.orderDetails.reduce((acc, detail) => {
        const foundIndex = acc.findIndex(
          (item) => item.product_id === detail.product?.product_id
        )
        if (foundIndex >= 0) {
          // 如果這個 product_id 已經存在於累加器中，增加其計數
          acc[foundIndex].count += 1
        } else {
          // 如果這是首次遇到這個 product_id，新增到累加器
          acc.push({
            product_id: detail.product?.product_id,
            image_url: detail.product?.variant?.image_url,
            color_name: detail.product?.variant?.color?.name,
            category_name: detail.product?.variant?.category?.category_name,
            category_type: detail.product?.variant?.category?.category_type,
            product_price: detail.product?.price,
            count: 1, // 初始化計數
          })
        }
        return acc
      }, []), // 初始化空陣列作為累加器
    }))

    res.json({ status: 'success', data: formattedOrders })
  } catch (error) {
    console.error('Failed to retrieve orders:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

router.get('/flower-type', async (req, res) => {
  try {
    const flowerTypes = await Custom_Category.findAll({
      attributes: ['category_id', 'category_name', 'category_type'],
      where: {
        category_type: 'main',
      },
    })

    return res.json({
      status: 'success',
      data: { flowertype: flowerTypes },
    })
  } catch (error) {
    console.error('Fetching main custom categories failed:', error)
    res.status(500).send({
      message: "Error retrieving categories with type 'main'",
    })
  }
})
// router.get('/:template_id', async function (req, res) {
//   const template_id = req.params.template_id

//   const sql = `
//     SELECT
//     ctl.template_id,
//     ss.store_name AS store_name,
//     ctl.template_name,
//     ctl.image_url,
//     ctl.discount,
//     sco.occ AS occasion,
//     clr.name AS base_color,
//     cat.category_name ,
//     clr.name AS color_name,
//     SUM(cpl.price) AS total_price,
//     COUNT(*) AS quantity
//   FROM
//     Custom_Template_List AS ctl
//   LEFT JOIN
//     Share_Store AS ss ON ctl.store_id = ss.store_id
//   LEFT JOIN
//     Custom_Template_Detail AS ctd ON ctl.template_id = ctd.template_id
//   LEFT JOIN
//     Custom_Product_List AS cpl ON ctd.product_id = cpl.product_id
//   LEFT JOIN
//     Custom_Product_Variant AS cpv ON cpl.variant_id = cpv.variant_id
//   LEFT JOIN
//     Custom_Category AS cat ON cpv.category_id = cat.category_id
//   LEFT JOIN
//     Share_Color AS clr ON cpv.color_id = clr.color_id
//   LEFT JOIN
//     Share_Occ AS sco ON ctl.occ_id = sco.occ_id

//   WHERE
//     ctl.template_id = :template_id
//   GROUP BY
//     cat.category_name, clr.name, cpv.variant_name;

//     `

//   try {
//     const results = await sequelize.query(sql, {
//       replacements: { template_id: template_id },
//       type: sequelize.QueryTypes.SELECT,
//     })
//     if (results.length === 0) {
//       return res.status(404).json({ message: 'Product not found' })
//     }

//     const productDetails = {
//       template_id: template_id,
//       template_occ: results[0].occasion,
//       store_name: results[0].store_name,
//       template_name: results[0].template_name,
//       image_url: results[0].image_url,
//       color: results[0].base_color,
//       discount: results[0].discount,
//       products: results.map((result) => ({
//         category_name: result.category_name,
//         color: result.color_name,
//         product_name: result.product_name,
//         product_price: result.total_price / result.quantity,
//         quantity: result.quantity,
//       })),
//       total_price: results.reduce(
//         (acc, curr) => acc + parseFloat(curr.total_price),
//         0
//       ),
//     }

//     return res.json({
//       status: 'success',
//       data: productDetails,
//     })
//   } catch (error) {
//     console.error('Error fetching product details:', error)
//     return res
//       .status(500)
//       .json({ status: 'error', message: 'Internal server error' })
//   }
// })
// router.get('/:template_id', async function (req, res) {
//   const template_id = req.params.template_id

//   // const sql = `
//   //   SELECT
//   //     ctl.template_id,
//   //     ss.store_name AS store_name,
//   //     ss.store_id AS store_id,
//   //     ss.store_address AS store_address,
//   //     ctl.template_name,
//   //     ctl.image_url,
//   //     ctl.discount,
//   //     sco.occ AS occasion,
//   //     clr.name AS base_color,
//   //     cat.category_name,
//   //     clr.name AS color_name,
//   //     cpl.product_id,

//   //     cpl.price,
//   //     ctd.top,
//   //     ctd.left,
//   //     ctd.z_index AS zIndex,
//   //     ctd.rotate
//   //   FROM
//   //     Custom_Template_List AS ctl
//   //   LEFT JOIN
//   //     Share_Store AS ss ON ctl.store_id = ss.store_id
//   //   LEFT JOIN
//   //     Custom_Template_Detail AS ctd ON ctl.template_id = ctd.template_id
//   //   LEFT JOIN
//   //     Custom_Product_List AS cpl ON ctd.product_id = cpl.product_id
//   //   LEFT JOIN
//   //     Custom_Product_Variant AS cpv ON cpl.variant_id = cpv.variant_id
//   //   LEFT JOIN
//   //     Custom_Category AS cat ON cpv.category_id = cat.category_id
//   //   LEFT JOIN
//   //     Share_Color AS clr ON cpv.color_id = clr.color_id
//   //   LEFT JOIN
//   //     Share_Occ AS sco ON ctl.occ_id = sco.occ_id
//   //   WHERE
//   //     ctl.template_id = :template_id;

//   // `

//   const sql = `
//     SELECT
//       ctl.template_id,
//       ss.store_name AS store_name,
//       ss.store_id AS store_id,
//       ss.store_address AS store_address,
//       ctl.template_name,
//       ctl.image_url AS template_image_url,
//       ctl.discount,
//       sco.occ AS occasion,
//       clr.name AS base_color,
//       cat.category_name,
//       clr.name AS color_name,
//       cpl.product_id,
//       cpl.price,
//       cpv.image_url AS product_image_url,
//       ctd.left,
//       ctd.z_index AS zIndex,
//       ctd.rotate
//     FROM
//       Custom_Template_List AS ctl
//     LEFT JOIN
//       Share_Store AS ss ON ctl.store_id = ss.store_id
//     LEFT JOIN
//       Custom_Template_Detail AS ctd ON ctl.template_id = ctd.template_id
//     LEFT JOIN
//       Custom_Product_List AS cpl ON ctd.product_id = cpl.product_id
//     LEFT JOIN
//       Custom_Product_Variant AS cpv ON cpl.variant_id = cpv.variant_id
//     LEFT JOIN
//       Custom_Category AS cat ON cpv.category_id = cat.category_id
//     LEFT JOIN
//       Share_Color AS clr ON cpv.color_id = clr.color_id
//     LEFT JOIN
//       Share_Occ AS sco ON ctl.occ_id = sco.occ_id
//     WHERE
//       ctl.template_id = :template_id;
// `

//   try {
//     const results = await sequelize.query(sql, {
//       replacements: { template_id: template_id },
//       type: sequelize.QueryTypes.SELECT,
//     })

//     if (results.length === 0) {
//       return res.status(404).json({ message: 'Product not found' })
//     }

//     let productDetails = {
//       template_id: template_id,
//       template_occ: results[0].occasion,
//       store_name: results[0].store_name,
//       store_id: results[0].store_id,
//       store_address: results[0].store_address,
//       template_name: results[0].template_name,
//       image_url: results[0].template_image_url,
//       color: results[0].base_color,
//       discount: results[0].discount,
//       products: [],
//       total_price: 0,
//     }

//     // results.forEach((result) => {
//     //   let product = productDetails.products.find(
//     //     (p) => p.product_id === result.product_id
//     //   )
//     //   if (!product) {
//     //     product = {
//     //       product_id: result.product_id,
//     //       category_name: result.category_name,
//     //       color: result.color_name,
//     //       price: result.price,
//     //       product_url: result.product_image_url,
//     //       positions: [],
//     //     }
//     //     productDetails.products.push(product)
//     //   }
//     //   product.positions.push({
//     //     top: result.top,
//     //     left: result.left,
//     //     zIndex: result.zIndex,
//     //     rotate: result.rotate,
//     //   })
//     //   productDetails.total_price += parseFloat(result.price)
//     // })
//     results.forEach((result) => {
//       let product = productDetails.products.find(
//         (p) => p.product_id === result.product_id
//       )
//       if (!product) {
//         product = {
//           product_id: result.product_id,
//           category_name: result.category_name,
//           color: result.color_name,
//           price: result.price,
//           product_url: result.product_image_url,
//           top: result.top,
//           left: result.left,
//           zIndex: result.zIndex,
//           rotate: result.rotate,
//         }
//         productDetails.products.push(product)
//       }

//       productDetails.total_price += parseFloat(result.price)
//     })

//     return res.json({
//       status: 'success',
//       data: productDetails,
//     })
//   } catch (error) {
//     console.error('Error fetching product details:', error)
//     return res
//       .status(500)
//       .json({ status: 'error', message: 'Internal server error' })
//   }
// })
router.get('/:template_id', async function (req, res) {
  const template_id = req.params.template_id

  const sql = `
    SELECT
      ctl.template_id,
      ss.store_name AS store_name,
      ss.store_id AS store_id,
      ss.store_address AS store_address,
      ctl.template_name,
      ctl.image_url AS template_image_url,  
      ctl.discount,
      sco.occ AS occasion,
      clr.name AS base_color,
      cat.category_name,
      clr.name AS color_name,
      cpl.product_id,
      cpl.price,
      cpv.image_url AS product_image_url, 
      ctd.left,
      ctd.top,
      ctd.z_index AS zIndex,
      ctd.rotate
    FROM
      Custom_Template_List AS ctl
    LEFT JOIN
      Share_Store AS ss ON ctl.store_id = ss.store_id
    LEFT JOIN
      Custom_Template_Detail AS ctd ON ctl.template_id = ctd.template_id
    LEFT JOIN
      Custom_Product_List AS cpl ON ctd.product_id = cpl.product_id
    LEFT JOIN
      Custom_Product_Variant AS cpv ON cpl.variant_id = cpv.variant_id
    LEFT JOIN
      Custom_Category AS cat ON cpv.category_id = cat.category_id
    LEFT JOIN
      Share_Color AS clr ON cpv.color_id = clr.color_id
    LEFT JOIN
      Share_Occ AS sco ON ctl.occ_id = sco.occ_id
    WHERE
      ctl.template_id = :template_id;
`

  try {
    const results = await sequelize.query(sql, {
      replacements: { template_id: template_id },
      type: sequelize.QueryTypes.SELECT,
    })

    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' })
    }

    let productDetails = {
      template_id: template_id,
      template_occ: results[0].occasion,
      store_name: results[0].store_name,
      store_id: results[0].store_id,
      store_address: results[0].store_address,
      template_name: results[0].template_name,
      image_url: results[0].template_image_url,
      color: results[0].base_color,
      discount: results[0].discount,
      products: [],
      total_price: 0,
    }

    results.forEach((result) => {
      let product = productDetails.products.find(
        (p) => p.product_id === result.product_id
      )
      if (!product) {
        product = {
          product_id: result.product_id,
          category_name: result.category_name,
          color: result.color_name,
          price: result.price,
          product_url: result.product_image_url,
          positions: [],
        }
        productDetails.products.push(product)
      }
      product.positions.push({
        top: result.top,
        left: result.left,
        zIndex: result.zIndex,
        rotate: result.rotate,
      })
      productDetails.total_price += parseFloat(result.price)
    })

    return res.json({
      status: 'success',
      data: productDetails,
    })
  } catch (error) {
    console.error('Error fetching product details:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

// router.post('/submit-order', upload.none(), async (req, res) => {
//   const {
//     image_url, // 從客戶端傳來的Base64圖片數據
//     products, // 包含產品資訊的陣列
//     bouquet_name,
//     delivery_date,
//     delivery_time,
//     member_id,
//     store_id,
//     shipping_id,
//     sender_name,
//     sender_tel,
//     recipient_name,
//     recipient_tel,
//     recipient_address,
//     total,
//     payment_id,
//     shipping_method,
//     shipping_status,
//     order_status,
//     discount,
//     card_content,
//     card_url,
//   } = req.body

//   // const decodeAndSaveImage = (base64Data, directory, filename) => {
//   //   console.log(base64Data.slice(0, 50)) // 輸出Base64數據的前50個字符來檢查格式

//   //   const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
//   //   if (!matches || matches.length !== 3) {
//   //     console.error('Failed to match Base64 pattern', base64Data.slice(0, 100))
//   //     throw new Error('Invalid base64 image data')
//   //   }

//   //   console.log('Matched MIME type:', matches[1]) // 輸出匹配到的MIME類型
//   //   const imageBuffer = Buffer.from(matches[2], 'base64')
//   //   const relativePath = path.join(directory, filename)
//   //   const fullPath = path.join(process.cwd(), relativePath)

//   //   if (!fs.existsSync(path.dirname(fullPath))) {
//   //     fs.mkdirSync(path.dirname(fullPath), { recursive: true })
//   //   }

//   //   fs.writeFileSync(fullPath, imageBuffer)
//   //   return relativePath
//   //
//   // const decodeAndSaveImage = (base64Data, directory, filename) => {
//   //   console.log(base64Data.slice(0, 50)) // 輸出Base64數據的前50個字符來檢查格式

//   //   const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
//   //   if (!matches || matches.length !== 3) {
//   //     console.warn(
//   //       'Base64 pattern not fully matched, continuing anyway:',
//   //       base64Data.slice(0, 100)
//   //     )

//   //     if (!matches) return
//   //   }

//   //   console.log('Matched MIME type:', matches[1])
//   //   const imageBuffer = Buffer.from(matches[2], 'base64')
//   //   const relativePath = path.join('uploads', filename)
//   //   const fullPath = path.join(process.cwd(), 'public', relativePath)

//   //   if (!fs.existsSync(path.dirname(fullPath))) {
//   //     fs.mkdirSync(path.dirname(fullPath), { recursive: true })
//   //   }

//   //   fs.writeFileSync(fullPath, imageBuffer)
//   //   return '/' + relativePath
//   // }

//   const __filename = fileURLToPath(import.meta.url)

//   const decodeAndSaveImage = (base64Data, filename) => {
//     const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
//     if (!matches || matches.length !== 3) {
//       console.warn(
//         'Base64 pattern not fully matched, continuing anyway:',
//         base64Data.slice(0, 100)
//       )
//       return
//     }

//     const imageBuffer = Buffer.from(matches[2], 'base64')
//     const serverPath = path.join('public', 'uploads', filename)
//     if (!fs.existsSync(path.dirname(serverPath))) {
//       fs.mkdirSync(path.dirname(serverPath), { recursive: true })
//     }

//     fs.writeFileSync(serverPath, imageBuffer)
//     return `/uploads/${filename}`
//   }

//   try {
//     const imageName = `${uuidv4()}.png`
//     const cardImageName = `${uuidv4()}.png`

//     const imagePath = decodeAndSaveImage(image_url, imageName)
//     const cardImagePath = decodeAndSaveImage(card_url, cardImageName)

//     const orderId = uuidv4()
//     const result = await sequelize.transaction(async (t) => {
//       const order = await Custom_Order_List.create(
//         {
//           order_id: orderId,
//           bouquet_name,
//           image_url: imagePath, // 儲存簡化的路徑到資料庫
//           delivery_date,
//           delivery_time,
//           member_id,
//           store_id,
//           shipping_id,
//           sender_name,
//           sender_tel,
//           recipient_name,
//           recipient_tel,
//           recipient_address,
//           total,
//           payment_id,
//           shipping_method,
//           shipping_status,
//           order_status,
//           discount: discount || 0, // 使用預設值
//           card_content,
//           card_url: `/${cardImagePath}`,
//         },
//         { transaction: t }
//       )

//       const orderItems = products.map((product) => ({
//         detail_id: product.detail_id, // 假設產品資料中包含此欄位
//         order_id: orderId,
//         product_id: product.product_id,
//         top: product.top,
//         left: product.left,
//         z_index: product.z_index,
//         rotate: product.rotate,
//       }))

//       await Custom_Order_Detail.bulkCreate(orderItems, { transaction: t })

//       return order
//     })

//     // const orderStatusDetails = await Share_Order_Status.findByPk(order_status)
//     // const paymentDetails = await Share_Payment.findByPk(payment_id)
//     // res.json({
//     //   status: 'success',
//     //   message: '訂單建立成功!',
//     //   data: {
//     //     order_id: result.order_id,
//     //     total: `NT$${total}`,
//     //     // created_at: result.createdAt.toISOString(),
//     //     // order_status: orderStatusDetails.name,
//     //     // payment_id: paymentDetails.name,
//     //     payment_status: '已付款', // 假設付款狀態直接為已付款
//     //     invoice: '載具',
//     //   },
//     // })

//     res.redirect(`/initiate-payment/${result.order_id}`)
//   } catch (error) {
//     console.error('訂單建立失敗:', error)
//     res.status(500).send({ message: 'Failed to place order' })
//   }
// })
const paymentMethods = {
  綠界: 1,
  'Line Pay': 2,
  現金: 3,
}
const getPaymentId = (methodName) => {
  return paymentMethods[methodName] || null
}
router.post('/submit-order', upload.none(), async (req, res) => {
  const {
    image_url,
    products,
    bouquet_name,
    delivery_date,
    delivery_time,
    member_id,
    store_id,
    shipping_id,
    sender_name,
    sender_tel,
    recipient_name,
    recipient_tel,
    recipient_address,
    total,
    payment_method,
    payment_status,
    shipping_method,
    shipping_status,
    order_status,
    discount,
    card_content,
    card_url,
    invoice_id,
  } = req.body

  const decodeAndSaveImage = async (base64Data, filename) => {
    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/)
    if (!matches || matches.length !== 3) {
      console.warn(
        'Base64 pattern not fully matched, continuing anyway:',
        base64Data.slice(0, 100)
      )
      return null
    }
    const imageBuffer = Buffer.from(matches[2], 'base64')
    const serverPath = path.join('public', 'uploads', filename)
    if (!fs.existsSync(path.dirname(serverPath))) {
      fs.mkdirSync(path.dirname(serverPath), { recursive: true })
    }
    fs.writeFileSync(serverPath, imageBuffer)
    return `/uploads/${filename}`
  }

  try {
    const imageName = `${uuidv4()}.png`
    const cardImageName = `${uuidv4()}.png`
    const imagePath = await decodeAndSaveImage(image_url, imageName)
    const cardImagePath = await decodeAndSaveImage(card_url, cardImageName)
    const payment_id = getPaymentId(payment_method)
    const orderId = uuidv4()
    const result = await sequelize.transaction(async (t) => {
      const order = await Custom_Order_List.create(
        {
          order_id: orderId,
          bouquet_name,
          image_url: imagePath,
          delivery_date,
          delivery_time,
          member_id,
          store_id,
          shipping_id,
          sender_name,
          sender_tel,
          recipient_name,
          recipient_tel,
          recipient_address,
          total,
          payment_id,
          payment_status,
          shipping_method,
          shipping_status,
          order_status,
          discount: discount || 0,
          card_content,
          card_url: cardImagePath,
          invoice_id,
        },
        { transaction: t }
      )

      const orderItems = products.map((product) => ({
        detail_id: product.detail_id,
        order_id: orderId,
        product_id: product.product_id,
        top: product.top,
        left: product.left,
        z_index: product.z_index,
        rotate: product.rotate,
      }))

      await Custom_Order_Detail.bulkCreate(orderItems, { transaction: t })
      return order
    })

    res.json({
      status: 'success',
      message: '訂單建立成功!',
      data: {
        order_id: result.order_id,
        total: `NT$${total}`,

        payment_status: '已付款',
        invoice: '載具',
      },
    })
  } catch (error) {
    console.error('Order Creation Failed:', error)
    res.status(500).send({ message: 'Failed to place order', error })
  }
})

const getOrderDetails = async (orderId) => {
  try {
    const order = await Custom_Order_List.findByPk(orderId)
    if (!order) {
      console.log('沒找到訂單')
      return null
    }
    return {
      orderId: order.order_id,
      totalAmount: order.total,
      tradeDesc: order.bouquet_name,
      itemName: order.bouquet_name,
    }
  } catch (error) {
    console.error('查詢有問題:', error)
    throw error
  }
}

// const generatePaymentFormData = (orderDetails) => {
//   const { orderId, totalAmount } = orderDetails
//   const formData = {
//     // MerchantID: '2000132',
//     MerchantTradeNo: orderId.replace(/-/g, '').substring(0, 20),
//     MerchantTradeDate: new Date()
//       .toLocaleString('zh-TW', {
//         year: 'numeric',
//         month: '2-digit',
//         day: '2-digit',
//         hour: '2-digit',
//         minute: '2-digit',
//         second: '2-digit',
//         hour12: false,
//         timeZone: 'Asia/Taipei',
//       })
//       .replace(/\//g, '/')
//       .replace(',', ''),
//     TotalAmount: parseInt(totalAmount, 10),
//     TradeDesc: '客製花束',
//     ItemName: '客製花束',
//     ReturnURL: 'https://yourdomain.com/api/custom/payment-callback',
//     ClientBackURL: 'https://yourdomain.com/api/custom/clientReturn',
//     ChoosePayment: 'ALL',
//     EncryptType: '1',
//   }

//   return formData
// }
const generatePaymentFormData = (orderDetails) => {
  const { orderId, totalAmount } = orderDetails
  const base_param = {
    MerchantID: MERCHANTID,
    MerchantTradeNo: orderId.replace(/-/g, '').substring(0, 20),
    MerchantTradeDate: moment().format('YYYY/MM/DD HH:mm:ss'),
    PaymentType: 'aio',
    TotalAmount: `${totalAmount}`,
    TradeDesc: '客製花束',
    ItemName: '客製花束',
    ReturnURL: `${EC_HOST}/api/custom/payment-callback/${orderId}`,
    ChoosePayment: 'ALL',
    EncryptType: 1,
    ClientBackURL: `http://localhost:3000/cart/payment-successful?source=flower&orderId=${orderId}`,
  }

  return base_param
}
const generateCheckMacValue = (params, hashKey, hashIV) => {
  const keys = Object.keys(params).sort()
  const baseString = keys.map((key) => `${key}=${params[key]}`).join('&')

  const stringToEncode = `HashKey=${hashKey}&${baseString}&HashIV=${hashIV}`

  let encodedString = encodeURIComponent(stringToEncode).toLowerCase()

  encodedString = encodedString
    .replace(/%2d/g, '-')
    .replace(/%5f/g, '_')
    .replace(/%2e/g, '.')
    .replace(/%21/g, '!')
    .replace(/%2a/g, '*')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%20/g, '+')

  // 對最終的字符串進行 SHA256 哈希計算，然後轉換為大寫
  const hash = crypto.createHash('sha256')
  hash.update(encodedString)
  return hash.digest('hex').toUpperCase()
}

router.get('/initiate-payment/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params
    const orderDetails = await getOrderDetails(orderId)
    const paymentFormData = generatePaymentFormData(orderDetails)
    const checkMacValue = generateCheckMacValue(
      paymentFormData,
      HASHKEY,
      HASHIV
    )
    console.log(checkMacValue)
    if (checkMacValue) {
      const form = `<form action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5" method="POST" name="payment" style="display: none;">
      <input name="MerchantID" value="${paymentFormData.MerchantID}"/>
      <input name="MerchantTradeNo" value="${paymentFormData.MerchantTradeNo}" />
      <input name="MerchantTradeDate" value="${paymentFormData.MerchantTradeDate}" />
      <input name="PaymentType" value="${paymentFormData.PaymentType}" />
      <input name="TotalAmount" value="${paymentFormData.TotalAmount}" />
      <input name="TradeDesc" value="${paymentFormData.TradeDesc}" />
      <input name="ItemName" value="${paymentFormData.ItemName}" />
      <input name="ReturnURL" value="${paymentFormData.ReturnURL}" />
      <input name="ChoosePayment" value="${paymentFormData.ChoosePayment}" />
      <input name="EncryptType" value="${paymentFormData.EncryptType}" />
      <input name="ClientBackURL" value="${paymentFormData.ClientBackURL}" />
      <input name="CheckMacValue" value="${checkMacValue}" />
      <button type="submit">Submit</button>
    </form>`

      const formHtml = form.replace(/\s+/g, ' ').trim()

      res.json({
        status: 'success',
        data: formHtml,
      })
    }
  } catch (error) {
    console.error('Error in initiate-payment:', error)
    res.status(500).json({ success: false, message: 'Internal Server Error' })
  }
})
// router.get('/initiate-payment/:orderId', async (req, res) => {
//   const { orderId } = req.params
//   const orderDetails = await getOrderDetails(orderId)
//   const paymentFormData = generatePaymentFormData(orderDetails)
//   const html = ecpay.payment_client.aio_check_out_all(paymentFormData)
//   // res.render('payment', { title: 'Initiate Payment', html })
//   res.send(html)
// })

// router.post('/payment-callback', async (req, res) => {
//   // console.log('req.body:', req.body)

//   const data = { ...req.body }
//   const receivedCheckMacValue = data.CheckMacValue
//   delete data.CheckMacValue // 刪除CheckMacValue以便重新計算

//   const create = new ecpay_payment(options)
//   const calculatedCheckMacValue =
//     create.payment_client.helper.gen_chk_mac_value(data)

//   console.log(
//     '確認交易正確性：',
//     receivedCheckMacValue === calculatedCheckMacValue
//   )

//   if (receivedCheckMacValue === calculatedCheckMacValue) {
//     res.send('1|OK') // 確認收到的數據無誤，告知綠界
//   } else {
//     res.status(400).send('CheckMacValue validation failed')
//   }
// })
// router.post('/payment-callback/:orderId', async (req, res) => {
//   console.log(req.body)
//   const { orderId } = req.params
//   const data = { ...req.body }
//   const receivedCheckMacValue = data.CheckMacValue
//   delete data.CheckMacValue
//   const create = new ecpay_payment(options)
//   const calculatedCheckMacValue =
//     create.payment_client.helper.gen_chk_mac_value(data)
//   console.log(
//     '确认交易正确性：',
//     receivedCheckMacValue === calculatedCheckMacValue
//   )
//   try {
//     if (receivedCheckMacValue === calculatedCheckMacValue) {
//       if (data.RtnCode === '1') {
//         // 支付成功，RtnCode '1' 表示成功
//         await Custom_Order_List.update(
//           {
//             payment_status: 1, // 假设支付成功状态为 'paid'
//             updated_at: new Date(), // 可以根据需要记录支付成功的确切时间
//           },
//           {
//             where: { order_id: orderId }, // 确保字段名正确，这里使用 order_id 匹配
//           }
//         )
//         res.send('1|OK') // 告知绿界支付成功
//       } else {
//         await Custom_Order_List.update(
//           {
//             payment_status: 2, // 假设支付失败状态为 'failed'
//             updated_at: new Date(),
//           },
//           {
//             where: { order_id: orderId },
//           }
//         )
//         res.status(200).send('Payment failed')
//       }
//     } else {
//       res.status(400).send('CheckMacValue validation failed')
//     }
//   } catch (error) {
//     console.error('Payment callback handling error:', error)
//     res.status(500).send('Internal Server Error')
//   }
// })

router.post('/payment-callback/:orderId', async (req, res) => {
  const { orderId } = req.params
  const { RtnCode, PaymentDate } = req.body

  console.log('Received callback for orderId:', orderId)
  console.log('Request body:', req.body)
  console.log('Request headers:', req.headers)

  try {
    if (RtnCode === '1') {
      await Custom_Order_List.update(
        {
          payment_status: 1,
          updated_at: new Date(PaymentDate),
        },
        {
          where: { order_id: orderId },
        }
      )
      res.send('1|OK')
    } else {
      await Custom_Order_List.update(
        {
          payment_status: 2,
          updated_at: new Date(PaymentDate),
        },
        {
          where: { order_id: orderId },
        }
      )
      res.status(200).send('Payment failed')
    }
  } catch (error) {
    console.error('Payment callback handling error:', error)
    res.status(500).send('Internal Server Error')
  }
})

router.get('/order-result/:orderId', async (req, res) => {
  const { orderId } = req.params

  try {
    const orderDetails = await Custom_Order_List.findOne({
      where: { order_id: orderId },
      attributes: ['order_id', 'total', 'created_at'],
      include: [
        {
          model: Share_Order_Status,
          as: 'orderStatus',
          attributes: ['name'],
        },
        {
          model: Share_Payment,
          as: 'payment',
          attributes: ['name'],
        },
        {
          model: Share_Payment_Status,
          as: 'paymentStatus',
          attributes: ['name'],
        },
        {
          model: Share_Invoice,
          as: 'invoiceType',
          attributes: ['name'],
        },
      ],
    })

    if (!orderDetails) {
      res.status(404).json({ status: 'error', message: 'Order not found' })
      return
    }

    const formattedCreatedAt = moment(orderDetails.created_at).format(
      'YYYY-MM-DD HH:mm:ss'
    )

    const shortOrderId = orderDetails.order_id.slice(-10)
    res.json({
      status: 'success',
      message: '訂單建立成功!',
      data: {
        orderId: shortOrderId,
        total: orderDetails.total,
        createdAt: formattedCreatedAt,
        orderStatus: orderDetails.orderStatus
          ? orderDetails.orderStatus.name
          : 'Unknown',
        paymentMethod: orderDetails.payment
          ? orderDetails.payment.name
          : 'Unknown',
        paymentStatus: orderDetails.paymentStatus
          ? orderDetails.paymentStatus.name
          : 'Unknown',
        invoiceType: orderDetails.invoiceType
          ? orderDetails.invoiceType.name
          : 'Unknown',
      },
    })
  } catch (error) {
    console.error('Error fetching order details:', error)
    throw error
  }
})
// ------------------------------------------------------------------------------------------

router.get('/custom/:store_id', async function (req, res) {
  const store_id = req.params.store_id

  //   const sql = `
  //   SELECT
  //   ss.store_id,
  //   ss.store_name,
  //   cat.category_name,
  //   cat.category_url,
  //   cat.category_type,
  //   sc.name AS color_name,
  //   cpv.image_url AS image_url
  // FROM
  //   Share_Store ss
  // JOIN
  //   Custom_Product_List cpl ON ss.store_id = cpl.store_id
  // JOIN
  //   Custom_Product_Variant cpv ON cpl.variant_id = cpv.variant_id

  // JOIN
  //   Share_Color sc ON cpv.color_id = sc.color_id
  // WHERE
  //   ss.store_id = :store_id
  // GROUP BY
  //   cat.category_name, sc.name, cpv.image_url

  //   `
  const sql = `SELECT
  ss.store_id,
  ss.store_name,
  cat.category_name,
  cat.category_url,
  cat.category_type,
  sc.name AS color_name,
  cpv.image_url AS image_url,
  cpv.variant_name AS variant_name,
  cpl.price AS price,
  cpl.product_id AS product_id  
  FROM
  Share_Store ss
  JOIN
  Custom_Product_List cpl ON ss.store_id = cpl.store_id
  JOIN
  Custom_Product_Variant cpv ON cpl.variant_id = cpv.variant_id
  JOIN
  Custom_Category cat ON cpv.category_id = cat.category_id
  JOIN
  Share_Color sc ON cpv.color_id = sc.color_id
  WHERE
  ss.store_id =:store_id
  GROUP BY
  cat.category_name, sc.name, cpv.image_url, cpl.product_id;
`
  try {
    const results = await sequelize.query(sql, {
      replacements: { store_id },
      type: sequelize.QueryTypes.SELECT,
    })

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: 'No products found for this store.' })
    }

    const output = results.reduce((acc, cur) => {
      const type = cur.category_type
      if (!acc[type]) {
        acc[type] = []
      }
      const category = acc[type].find(
        (c) => c.category_name === cur.category_name
      )
      if (!category) {
        acc[type].push({
          category_name: cur.category_name,
          category_url: cur.category_url,
          attributes: [
            {
              color: cur.color_name,
              url: cur.image_url,
              product_id: cur.product_id,
              product_category: cur.category_type,
              product_price: cur.price,
              variant_name: cur.variant_name,
            },
          ],
        })
      } else {
        const existingAttribute = category.attributes.find(
          (a) => a.color === cur.color_name && a.url === cur.image_url
        )
        if (!existingAttribute) {
          category.attributes.push({
            color: cur.color_name,
            url: cur.image_url,
            product_id: cur.product_id,
            product_category: cur.category_type,
            product_price: cur.price,
            variant_name: cur.variant_name,
          })
        }
      }
      return acc
    }, {})

    const formattedResults = {
      store_id: results[0].store_id,
      store_name: results[0].store_name,
      items: output,
    }

    return res.json({ status: 'success', data: formattedResults })
  } catch (error) {
    console.error('Error fetching store products:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})
// // GET - 根據篩選條件得到課程
// router.get('/search', async function (req, res) {
//   // 從查詢參數中獲取 category_id 和 store_id
//   const { category_id, store_id } = req.query

//   // 建立查詢條件
//   const whereConditions = {}
//   if (category_id) {
//     whereConditions.category_id = category_id
//   }
//   if (store_id) {
//     whereConditions.store_id = store_id
//   }

//   try {
//     const customTemplateLists = await Custom_Template_List.findAll({
//       where: whereConditions, // 使用篩選條件
//       include: [
//         {
//           model: Course_Image, // 引入圖片資料表
//           as: 'images', // 確保在模型定義中使用這個別名
//           attributes: ['id', 'path', 'is_main'],
//         },
//       ],
//       nest: true,
//     })
//     return res.json({ status: 'success', data: { courses } })
//   } catch (error) {
//     console.error('Error fetching filtered courses:', error)
//     return res
//       .status(500)
//       .json({ status: 'error', message: 'Internal server error' })
//   }
// })

// router.get('/templates', async (req, res) => {
//   const { sortBy = 'created_at', sortOrder = 'asc' } = req.query
//   try {
//     const templates = await Custom_Template_List.findAll({
//       order: [[sortBy, sortOrder.toUpperCase()]],
//     })
//     res.json(templates)
//   } catch (error) {
//     console.error('Failed to fetch templates:', error)
//     res.status(500).send('Internal Server Error')
//   }
// })

router.get('/custom-favorite/:member_id', async (req, res) => {
  const memberId = req.params.member_id
  if (!memberId) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }

  const sql = `
  SELECT
    ctl.template_id,
    ss.store_name AS store_name,
    ctl.template_name,
    ctl.image_url,
    ctl.discount,
    sco.occ AS occasion,
    custom_category.category_name AS flower_type,
    clr.name AS color_name,
    (
      SELECT SUM(cpl.price)
      FROM Custom_Template_Detail AS ctd
      LEFT JOIN Custom_Product_List AS cpl ON ctd.product_id = cpl.product_id
      WHERE ctd.template_id = ctl.template_id
    ) AS total_price
  FROM
    Custom_Favorite AS cf
  INNER JOIN
    Custom_Template_List AS ctl ON cf.template_id = ctl.template_id
  INNER JOIN
    Share_Store AS ss ON ctl.store_id = ss.store_id
  LEFT JOIN
    Share_Color AS clr ON ctl.color_id = clr.color_id
  LEFT JOIN
    Share_Occ AS sco ON ctl.occ_id = sco.occ_id
  LEFT JOIN
    Custom_Category  ON ctl.category_id = Custom_Category.category_id
  WHERE
    cf.member_id = :memberId
  GROUP BY
    ctl.template_id, ss.store_name, ctl.template_name, ctl.image_url, ctl.discount, sco.occ, custom_category.category_name, clr.name;
  `

  try {
    const results = await sequelize.query(sql, {
      replacements: { memberId: memberId },
      type: sequelize.QueryTypes.SELECT,
    })

    if (results.length === 0) {
      return res
        .status(404)
        .json({ status: 'error', message: 'No favorites found' })
    }

    res.json({ status: 'success', data: results })
  } catch (error) {
    console.error('Error fetching favorite templates:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

router.post('/add-favorite/:templateId', authenticate, async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }
  const memberId = req.user.id
  const templateId = req.params.templateId

  try {
    const existing = await Custom_Favorite.findOne({
      where: { member_id: memberId, template_id: templateId },
    })

    if (existing) {
      return res
        .status(409)
        .json({ message: 'Template already favorited.', status: 'unchanged' })
    }

    const newFavorite = await Custom_Favorite.create({
      member_id: memberId,
      template_id: templateId,
    })

    res.status(201).json({
      message: 'Template favorited successfully.',
      data: newFavorite,
      status: 'success',
    })
  } catch (error) {
    console.error('Error adding template to favorites:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

router.delete(
  '/remove-favorite/:templateId',
  authenticate,
  async (req, res) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' })
    }
    const memberId = req.user.id
    const templateId = req.params.templateId

    try {
      const favorite = await Custom_Favorite.findOne({
        where: { member_id: memberId, template_id: templateId },
      })
      if (!favorite) {
        return res
          .status(404)
          .json({ message: 'Favorite not found.', status: 'filed' })
      }

      // 存在的話，刪除這個收藏
      await favorite.destroy()

      res.json({ message: 'Favorite deleted successfully.', status: 'success' })
    } catch (error) {
      console.error('Error removing template from favorites:', error)
      res
        .status(500)
        .json({ status: 'error', message: 'Internal server error' })
    }
  }
)

export default router
