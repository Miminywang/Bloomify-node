import express from 'express'
const router = express.Router()
// import { getIdParam } from '#db-helpers/db-tool.js'

// // 資料庫使用
// import sequelize from '#configs/db.js'

// // 從 sequelize 的模型集合中解構出五個資料表模型
// const {
//   Custom_Template_List,
//   Custom_Template_Detail,
//   Custom_Product_List,
//   Custom_Category,
//   Share_Store,
//   Share_Color,
//   Share_Occ,
//   Share_Role,
// } = sequelize.models

// Custom_Template_List.hasMany(Custom_Template_Detail, {
//   foreignKey: 'template_id',
//   as: 'details',
// })
// Custom_Template_Detail.belongsTo(Custom_Template_List, {
//   foreignKey: 'template_id',
//   as: 'template',
// })

// Custom_Template_Detail.belongsTo(Custom_Product_List, {
//   foreignKey: 'product_id',
//   as: 'product',
// })
// Custom_Product_List.hasMany(Custom_Template_Detail, {
//   foreignKey: 'product_id',
//   as: 'templateDetails',
// })

// Custom_Product_List.belongsTo(Custom_Category, {
//   foreignKey: 'category_id',
//   as: 'category',
// })
// Custom_Category.hasMany(Custom_Product_List, {
//   foreignKey: 'category_id',
//   as: 'products',
// })

// Custom_Template_List.belongsTo(Share_Store, {
//   foreignKey: 'store_id',
//   as: 'store',
// })
// Share_Store.hasMany(Custom_Template_List, {
//   foreignKey: 'store_id',
//   as: 'templates',
// })

// Custom_Template_List.belongsTo(Share_Color, {
//   foreignKey: 'color_id',
//   as: 'color',
// })
// Share_Color.hasMany(Custom_Template_List, {
//   foreignKey: 'color_id',
//   as: 'templates',
// })

// Custom_Template_List.belongsTo(Share_Occ, { foreignKey: 'occ_id', as: 'occ' })
// Share_Occ.hasMany(Custom_Template_List, {
//   foreignKey: 'occ_id',
//   as: 'templates',
// })

// Custom_Template_List.belongsTo(Share_Role, {
//   foreignKey: 'role_id',
//   as: 'role',
// })
// Share_Role.hasMany(Custom_Template_List, {
//   foreignKey: 'role_id',
//   as: 'templates',
// })

// Custom_Product_List.belongsTo(Share_Store, {
//   foreignKey: 'store_id',
//   as: 'store',
// })
// Custom_Product_List.belongsTo(Share_Color, {
//   foreignKey: 'color_id',
//   as: 'color',
// })

// // router.get('/', async function (req, res) {
// //   try {
// //     const customTemplateLists = await Custom_Template_List.findAll({
// //       // 使用 findAll 方法查詢所有 Custom_Template_List 的數據，包括關聯的 Share_Store、Share_Color 和 Custom_Template_Detail
// //       include: [
// //         {
// //           model: Share_Store,
// //           as: 'store',
// //           attributes: ['store_name'], // 只查詢 Share_Store裡的 store_name 屬性
// //         },
// //         {
// //           model: Share_Occ,
// //           as: 'occ',
// //           attributes: ['occ'], // 只查詢 Share_Store裡的 store_name 屬性
// //         },
// //         {
// //           model: Share_Role,
// //           as: 'role',
// //           attributes: ['role'], // 只查詢 Share_Store裡的 store_name 屬性
// //         },
// //         {
// //           model: Share_Color,
// //           as: 'color',
// //           attributes: ['name', 'code'], // 只查詢 Share_Color name 和 code 屬性
// //         },
// //         // 這一段是從Custom_Template_List 連進去 Custom_Template_Detail 再連進去 Custom_Product_List 做關聯 !!
// //         {
// //           model: Custom_Template_Detail,
// //           as: 'details',
// //           include: [
// //             {
// //               model: Custom_Product_List,
// //               as: 'product',
// //               attributes: [], // 不查詢任何屬性  因為我是要做加總金額 我如果擷取的話會很耗消能(ex:mysql原語法把三個表都接起來並顯示欄位)
// //             },
// //           ],
// //           attributes: [], // 不查詢任何屬性 只是關聯起來等等計算
// //         },
// //       ],
// //       attributes: [
// //         'template_id',
// //         'template_name',
// //         'image_url',
// //         'discount',

// //         [
// //           sequelize.literal(
// //             `(SELECT SUM(product_price) FROM custom_product_list WHERE custom_product_list.product_id IN (SELECT product_id FROM custom_template_detail WHERE custom_template_detail.template_id = Custom_Template_List.template_id))`
// //           ),
// //           'totalPrice',
// //         ],
// //       ],
// //       group: ['Custom_Template_List.template_id'],
// //       logging: console.log,
// //     })

// //     // 因為我一開始前端預設的資料為 再這裡有重新整理我的格式

// //     // const productList = [
// //     //
// //     //   {
// //     //     src: '/custom/custom/flowers/0c19e718edd2ba4ed62b185ba0d958c8.jpg',
// //     //     name: '百合花束',
// //     //     store: '店家名稱',
// //     //     price: '1320',
// //     //     discount: '150',
// //     //     colors: ['pink', 'black', 'red'],
// //     //   },
// //     ///   {
// //     //     src: '/custom/custom/flowers/5925d3602969b5e1a4e547075168af80.jpg',
// //     //     name: '鬱金香花束',
// //     //     store: '店家名稱',
// //     //     price: '700',
// //     //     discount: '100',
// //     //     colors: ['pink', 'yellow'],
// //     //   },
// //     // ]
// //     const formattedData = customTemplateLists.map((template) => ({
// //       id: template.template_id,
// //       src: template.image_url,
// //       name: template.template_name,
// //       store: template.store?.store_name,
// //       occ: template.occ?.occ,
// //       role: template.role?.role,
// //       color: template.color?.name,
// //       discount: template.discount,
// //       price: template.dataValues.totalPrice,
// //     }))

// //     return res.json({
// //       status: 'success',
// //       data: { customTemplateLists: formattedData },
// //     })
// //   } catch (error) {
// //     console.error('Error fetching template lists:', error)
// //     return res
// //       .status(500)
// //       .json({ status: 'error', message: 'Internal server error' })
// //   }
// // })

// // router.get('/:id', async function (req, res) {
// //   const template_id = req.params.id

// //   const sql = `
// //     SELECT
// //       ctl.template_id,
// //       ss.store_name AS store_name,
// //       ctl.template_name,
// //       ctl.image_url,
// //       cp.product_id,
// //       cp.product_name,
// //       cp.product_price,
// //       cc.category_name AS product_category,
// //       sco.occ AS occasion,
// //       sro.role AS role,
// //       (SELECT COUNT(*)
// //        FROM custom_template_detail
// //        WHERE template_id = ctl.template_id AND product_id = cp.product_id) AS quantity
// //     FROM
// //       Custom_Template_List AS ctl
// //     LEFT JOIN
// //       Share_Store AS ss ON ctl.store_id = ss.store_id
// //     LEFT JOIN
// //       Custom_Template_Detail AS ctd ON ctl.template_id = ctd.template_id
// //     LEFT JOIN
// //       Custom_Product_List AS cp ON ctd.product_id = cp.product_id
// //     LEFT JOIN
// //       Custom_Category AS cc ON cp.category_id = cc.category_id
// //     LEFT JOIN
// //       Share_Occ AS sco ON ctl.occ_id = sco.occ_id
// //     LEFT JOIN
// //       Share_Role AS sro ON ctl.role_id = sro.role_id
// //     WHERE
// //       ctl.template_id = :template_id
// //     GROUP BY
// //       ctl.template_id, cp.product_id, cc.category_id, sco.occ_id, sro.role_id;
// //   `

// //   try {
// //     // 使用 sequelize.query() 执行原生 SQL 查询
// //     const results = await sequelize.query(sql, {
// //       replacements: { template_id: template_id },
// //       type: sequelize.QueryTypes.SELECT,
// //     })

// //     // 检查结果是否存在
// //     if (results.length === 0) {
// //       return res.status(404).json({ message: 'Product not found' })
// //     }

// //     // 结构化数据
// //     const productDetails = {
// //       template_id: template_id,
// //       template_occ: results[0].occasion, // 使用别名 access occasion
// //       template_role: results[0].role, // 使用别名 access role
// //       store_name: results[0].store_name,
// //       template_name: results[0].template_name,
// //       image_url: results[0].image_url,
// //       products: results.map((result) => ({
// //         product_name: result.product_name,
// //         product_price: result.product_price,
// //         product_color: result.product_color,
// //         quantity: result.quantity,
// //       })),
// //     }

// //     return res.json({
// //       status: 'success',
// //       data: productDetails,
// //     })
// //   } catch (error) {
// //     console.error('Error fetching product details:', error)
// //     return res
// //       .status(500)
// //       .json({ status: 'error', message: 'Internal server error' })
// //   }
// // })

// // router.get('/custom/:store_id', async function (req, res) {
// //   const store_id = req.params.store_id

// //   const query = `
// //     SELECT
// //         s.store_id,
// //         s.store_name,
// //         c.category_name,
// //         p.product_name,
// //         GROUP_CONCAT(col.name ORDER BY col.name SEPARATOR ',') AS colors
// //     FROM
// //         custom_product_list p
// //     JOIN share_store s ON p.store_id = s.store_id
// //     JOIN custom_category c ON p.category_id = c.category_id
// //     JOIN share_color col ON col.id = p.color_id
// //     WHERE
// //         s.store_id = :store_id
// //     GROUP BY
// //     s.store_id, s.store_name, c.category_id, c.category_name, p.product_id, p.product_name
// //   `

// //   try {
// //     const results = await sequelize.query(query, {
// //       replacements: { store_id: store_id },
// //       type: sequelize.QueryTypes.SELECT,
// //     })

// //     // Reformat results to match expected structure
// //     const structuredResult = {
// //       store_id: store_id,
// //       store_name: results.length > 0 ? results[0].store_name : '',
// //       products: {},
// //     }
// //     if (results.length === 0) {
// //       return res.status(404).json({ message: 'Product not found' })
// //     }
// //     results.forEach((row) => {
// //       if (!structuredResult.products[row.category_name]) {
// //         structuredResult.products[row.category_name] = {
// //           category_name: row.category_name,
// //           items: [],
// //         }
// //       }
// //       structuredResult.products[row.category_name].items.push({
// //         name: row.product_name,
// //         colors: row.colors,
// //       })
// //     })

// //     res.json(structuredResult)
// //     return res.json({
// //       status: 'success',
// //       data: structuredResult,
// //     })
// //   } catch (error) {
// //     console.error('Error fetching product details:', error)
// //     return res
// //       .status(500)
// //       .json({ status: 'error', message: 'Internal server error' })
// //   }
// // })

// // router.get('/custom/:store_id', async function (req, res) {
// //   const store_id = req.params.store_id

// //   const query = `
// //     SELECT
// //         s.store_id,
// //         s.store_name,
// //         c.en_name as category_en_name,
// //         c.category_name,
// //         p.product_name,
// //         GROUP_CONCAT(col.name ORDER BY col.name SEPARATOR ',') AS colors
// //     FROM
// //         custom_product_list p
// //     JOIN share_store s ON p.store_id = s.store_id
// //     JOIN custom_category c ON p.category_id = c.category_id
// //     JOIN share_color col ON col.id = p.color_id
// //     WHERE
// //         s.store_id = :store_id
// //     GROUP BY
// //         s.store_id, s.store_name, c.category_id, c.category_name, p.product_id, p.product_name
// //   `

// //   try {
// //     const results = await sequelize.query(query, {
// //       replacements: { store_id: store_id },
// //       type: sequelize.QueryTypes.SELECT,
// //     })

// //     if (results.length === 0) {
// //       return res.status(404).json({ message: 'Product not found' })
// //     }

// //     // Reformat results to match expected structure
// //     const structuredResult = {
// //       store_id: store_id,
// //       store_name: results.length > 0 ? results[0].store_name : '',
// //     }

// //     results.forEach((row) => {
// //       if (!structuredResult[row.category_en_name]) {
// //         structuredResult[row.category_en_name] = {
// //           category_name: row.category_name,
// //           items: [],
// //         }
// //       }
// //       structuredResult[row.category_en_name].items.push({
// //         name: row.product_name,
// //         colors: row.colors.split(','), // 將顏色字串轉換為陣列
// //       })
// //     })

// //     return res.json({
// //       status: 'success',
// //       data: structuredResult,
// //     })
// //   } catch (error) {
// //     console.error('Error fetching product details:', error)
// //     return res
// //       .status(500)
// //       .json({ status: 'error', message: 'Internal server error' })
// //   }
// // })

// // router.get('/custom/:store_id', async function (req, res) {
// //   const store_id = req.params.store_id

// //   const query = `
// //     SELECT
// //         s.store_id,
// //         s.store_name,
// //         c.en_name as category_en_name,
// //         c.category_name,
// //         p.product_name,
// //         GROUP_CONCAT(col.name ORDER BY col.name SEPARATOR ',') AS colors
// //     FROM
// //         custom_product_list p
// //     JOIN share_store s ON p.store_id = s.store_id
// //     JOIN custom_category c ON p.category_id = c.category_id
// //     JOIN share_color col ON col.id = p.color_id
// //     WHERE
// //         s.store_id = :store_id
// //     GROUP BY
// //         s.store_id, s.store_name, c.category_id, c.category_name, p.product_id, p.product_name
// //   `

// //   try {
// //     const results = await sequelize.query(query, {
// //       replacements: { store_id: store_id },
// //       type: sequelize.QueryTypes.SELECT,
// //     })

// //     if (results.length === 0) {
// //       return res.status(404).json({ message: 'Product not found' })
// //     }

// //     // Reformat results to match expected structure
// //     const structuredResult = {
// //       store_id: store_id,
// //       store_name: results.length > 0 ? results[0].store_name : '',
// //     }

// //     results.forEach((row) => {
// //       if (!structuredResult[row.category_en_name]) {
// //         structuredResult[row.category_en_name] = {
// //           category_name: row.category_name,
// //           items: [],
// //         }
// //       }
// //       structuredResult[row.category_en_name].items.push({
// //         name: row.product_name,
// //         colors: row.colors.split(','), // 將顏色字串轉換為陣列
// //       })
// //     })

// //     return res.json({
// //       status: 'success',
// //       data: structuredResult,
// //     })
// //   } catch (error) {
// //     console.error('Error fetching product details:', error)
// //     return res
// //       .status(500)
// //       .json({ status: 'error', message: 'Internal server error' })
// //   }
// // })

// // router.get('/custom/:store_id', async function (req, res) {
// //   const store_id = req.params.store_id

// //   const query = `
// //     SELECT
// //         s.store_id,
// //         s.store_name,
// //         c.en_name AS category_en_name,
// //         c.category_name,
// //         p.product_name,
// //         p.image_url AS product_image,
// //         col.name AS color_name
// //     FROM
// //         custom_product_list p
// //     JOIN share_store s ON p.store_id = s.store_id
// //     JOIN custom_category c ON p.category_id = c.category_id
// //     JOIN share_color col ON col.id = p.color_id
// //     WHERE
// //         s.store_id = :store_id
// //   `

// //   try {
// //     const results = await sequelize.query(query, {
// //       replacements: { store_id },
// //       type: sequelize.QueryTypes.SELECT,
// //     })

// //     if (results.length === 0) {
// //       return res.status(404).json({ message: 'Product not found' })
// //     }

// //     // Reformat results to match expected structure
// //     const structuredResult = {
// //       store_id: store_id,
// //       store_name: results.length > 0 ? results[0].store_name : '',
// //     }

// //     results.forEach((row) => {
// //       if (!structuredResult[row.category_en_name]) {
// //         structuredResult[row.category_en_name] = {
// //           category_name: row.category_name,
// //           items: [],
// //         }
// //       }

// //       if (!structuredResult[row.category_en_name].items[row.product_name]) {
// //         structuredResult[row.category_en_name].items[row.product_name] = {
// //           url: row.product_image,
// //           colors: [],
// //         }
// //       }

// //       structuredResult[row.category_en_name].items[
// //         row.product_name
// //       ].colors.push(row.color_name)
// //     })

// //     return res.json({
// //       status: 'success',
// //       data: structuredResult,
// //     })
// //   } catch (error) {
// //     console.error('Error fetching product details:', error)
// //     return res
// //       .status(500)
// //       .json({ status: 'error', message: 'Internal server error' })
// //   }
// // })
// // router.get('/custom/:store_id', async function (req, res) {
// //   const store_id = req.params.store_id

// //   const query = `
// //     SELECT
// //         s.store_id,
// //         s.store_name,
// //         c.en_name AS category_en_name,
// //         c.category_name,
// //         p.product_name,
// //         p.image_url AS product_image,
// //         col.name AS color_name
// //     FROM
// //         custom_product_list p
// //     JOIN share_store s ON p.store_id = s.store_id
// //     JOIN custom_category c ON p.category_id = c.category_id
// //     JOIN share_color col ON col.id = p.color_id
// //     WHERE
// //         s.store_id = :store_id
// //   `

// //   try {
// //     const results = await sequelize.query(query, {
// //       replacements: { store_id },
// //       type: sequelize.QueryTypes.SELECT,
// //     })

// //     if (results.length === 0) {
// //       return res.status(404).json({ message: 'Product not found' })
// //     }

// //     // Reformat results to match expected structure
// //     const structuredResult = {
// //       store_id: store_id,
// //       store_name: results.length > 0 ? results[0].store_name : '',
// //     }

// //     results.forEach((row) => {
// //       if (!structuredResult[row.category_en_name]) {
// //         structuredResult[row.category_en_name] = {
// //           category_name: row.category_name,
// //           items: [],
// //         }
// //       }

// //       // Find an existing item with the same name and url, or create a new one
// //       let item = structuredResult[row.category_en_name].items.find(
// //         (item) =>
// //           item.name === row.product_name && item.url === row.product_image
// //       )
// //       if (!item) {
// //         item = {
// //           name: row.product_name,
// //           url: row.product_image,
// //           color: row.color_name,
// //         }
// //         structuredResult[row.category_en_name].items.push(item)
// //       }
// //     })

// //     return res.json({
// //       status: 'success',
// //       data: structuredResult,
// //     })
// //   } catch (error) {
// //     console.error('Error fetching product details:', error)
// //     return res
// //       .status(500)
// //       .json({ status: 'error', message: 'Internal server error' })
// //   }
// // })
// router.get('/custom/:store_id', async function (req, res) {
//   const store_id = req.params.store_id

//   const query = `
//     SELECT
//         s.store_id,
//         s.store_name,
//         c.en_name AS category_en_name,
//         c.category_name,
//         p.product_name,
//         p.image_url AS product_image,
//         p.flower_img AS flower_image,
//         col.name AS color_name
//     FROM
//         custom_product_list p
//     JOIN share_store s ON p.store_id = s.store_id
//     JOIN custom_category c ON p.category_id = c.category_id
//     JOIN share_color col ON col.id = p.color_id
//     WHERE
//         s.store_id = :store_id
//   `

//   try {
//     const results = await sequelize.query(query, {
//       replacements: { store_id },
//       type: sequelize.QueryTypes.SELECT,
//     })

//     if (results.length === 0) {
//       return res.status(404).json({ message: 'Product not found' })
//     }

//     // Reformat results to match expected structure
//     const structuredResult = {
//       store_id: store_id,
//       store_name: results.length > 0 ? results[0].store_name : '',
//       products: {},
//     }

//     results.forEach((row) => {
//       if (!structuredResult.products[row.category_en_name]) {
//         structuredResult.products[row.category_en_name] = {
//           category_name: row.category_name,
//           items: {},
//         }
//       }

//       if (
//         !structuredResult.products[row.category_en_name].items[row.product_name]
//       ) {
//         structuredResult.products[row.category_en_name].items[
//           row.product_name
//         ] = {
//           name: row.product_name,
//           img: row.flower_image,
//           urls: [row.product_image],
//           colors: [row.color_name],
//         }
//       } else {
//         const item =
//           structuredResult.products[row.category_en_name].items[
//             row.product_name
//           ]
//         if (!item.colors.includes(row.color_name)) {
//           item.colors.push(row.color_name)
//         }
//         if (!item.urls.includes(row.product_image)) {
//           item.urls.push(row.product_image)
//         }
//       }
//     })

//     // Convert items objects into arrays
//     for (const categoryName in structuredResult.products) {
//       const category = structuredResult.products[categoryName]
//       category.items = Object.values(category.items)
//     }

//     return res.json({
//       status: 'success',
//       data: structuredResult,
//     })
//   } catch (error) {
//     console.error('Error fetching product details:', error)
//     return res
//       .status(500)
//       .json({ status: 'error', message: 'Internal server error' })
//   }
// })

export default router
