import express from 'express'
const router = express.Router()
import { getIdParam } from '#db-helpers/db-tool.js'
import { Op } from 'sequelize'

// 資料庫使用
import sequelize from '#configs/db.js'

// 從 sequelize 的模型集合中解構出五個資料表模型
const {
  Custom_Template_List,
  Custom_Template_Detail,
  Custom_Product_List,
  Custom_Category,
  Share_Store,
  Share_Color,
  Share_Occ,
  Custom_Product_Variant,
  Custom_Order_List,
  Custom_Order_Detail,
  Share_Member,
  Share_Payment,
  Share_Shipping,
  Share_Shipping_Status,
  Share_Order_Status,
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
  foreignKey: 'payment_method',
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

  const sql = `
    SELECT
      sco.occ_id,
      sco.occ as occ_name,
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
        LEFT JOIN Custom_Product_List AS cpl ON ctd.product_id = cpl.product_id
        WHERE ctd.template_id = ctl.template_id
      ) AS total_price
    FROM
      Custom_Template_List AS ctl
      LEFT JOIN Share_Store AS ss ON ctl.store_id = ss.store_id
      LEFT JOIN Share_Occ AS sco ON sco.occ_id = ctl.occ_id
      LEFT JOIN Share_Color AS clr ON clr.color_id = ctl.color_id
      LEFT JOIN Custom_Category AS cc ON cc.category_id = ctl.category_id
    ${whereClause}
    ORDER BY ${sortField === 'total_price' ? `(SELECT SUM(cpl.price) FROM Custom_Template_Detail AS ctd LEFT JOIN Custom_Product_List AS cpl ON ctd.product_id = cpl.product_id WHERE ctd.template_id = ctl.template_id)` : `ctl.${sortField}`} ${sortOrder};
  `

  try {
    const results = await sequelize.query(sql, {
      type: sequelize.QueryTypes.SELECT,
    })

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
                      attributes: ['category_name'], // 拉取分類名稱
                    },
                  ],
                  attributes: ['image_url'], // 包括圖片URL
                },
              ],
              attributes: ['product_id'], // 只包括產品ID
            },
          ],
        },
      ],
      attributes: [
        'order_id',
        'bouquet_name',
        'image_url',
        'order_date',
        'delivery_date',
        'total_amount',
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
      order_date: order.order_date,
      delivery_date: order.delivery_date,
      total_amount: order.total_amount,
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
      products: order.orderDetails.map((detail) => ({
        product_id: detail.product?.product_id,
        image_url: detail.product?.variant?.image_url,
        color_name: detail.product?.variant?.color?.name,
        category_name: detail.product?.variant?.category?.category_name, // 包括分類名稱
      })),
    }))

    res.json({ status: 'success', data: formattedOrders })
  } catch (error) {
    console.error('Failed to retrieve orders:', error)
    res.status(500).json({ status: 'error', message: 'Internal server error' })
  }
})

router.get('/flower-type', async (req, res) => {
  try {
    // 使用 Sequelize 查詢 category_type 為 'main' 的資料
    const flowerTypes = await Custom_Category.findAll({
      attributes: ['category_id', 'category_name', 'category_type'], // 指定要返回的字段
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
router.get('/:template_id', async function (req, res) {
  const template_id = req.params.template_id

  const sql = `
    SELECT
    ctl.template_id,
    ss.store_name AS store_name,
    ctl.template_name,
    ctl.image_url,
    ctl.discount,
    sco.occ AS occasion,
   
    clr.name AS base_color,
    cat.category_name ,
    clr.name AS color_name,
    SUM(cpl.price) AS total_price,
    COUNT(*) AS quantity
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
    ctl.template_id = :template_id
  GROUP BY
    cat.category_name, clr.name, cpv.variant_name;

    `

  try {
    const results = await sequelize.query(sql, {
      replacements: { template_id: template_id },
      type: sequelize.QueryTypes.SELECT,
    })
    if (results.length === 0) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const productDetails = {
      template_id: template_id,
      template_occ: results[0].occasion,

      store_name: results[0].store_name,
      template_name: results[0].template_name,
      image_url: results[0].image_url,
      color: results[0].base_color,
      discount: results[0].discount,

      products: results.map((result) => ({
        category_name: result.category_name,
        color: result.color_name,
        product_name: result.product_name,
        product_price: result.total_price / result.quantity,
        quantity: result.quantity,
      })),
      total_price: results.reduce(
        (acc, curr) => acc + parseFloat(curr.total_price),
        0
      ),
    }

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
cpv.image_url AS image_url
FROM
Share_Store ss
JOIN
Custom_Product_List cpl ON ss.store_id = cpl.store_id
JOIN
Custom_Product_Variant cpv ON cpl.variant_id = cpv.variant_id
JOIN
Custom_Category cat ON cpv.category_id = cat.category_id  -- 正確聯結 Custom_Category
JOIN
Share_Color sc ON cpv.color_id = sc.color_id
WHERE
ss.store_id = :store_id
GROUP BY
cat.category_name, sc.name, cpv.image_url;
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

    // Reformat the results to match the desired output
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
            },
          ],
        })
      } else {
        // 檢查是否已存在相同的顏色和 URL 組合
        const existingAttribute = category.attributes.find(
          (a) => a.color === cur.color_name && a.url === cur.image_url
        )
        if (!existingAttribute) {
          category.attributes.push({
            color: cur.color_name,
            url: cur.image_url,
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

export default router
