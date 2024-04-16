import express from 'express'
const router = express.Router()
import { getIdParam } from '#db-helpers/db-tool.js'

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
  Share_Role,
  Custom_Product_Variant,
} = sequelize.models

// 模型關聯
// Product Variants 和 Categories
Custom_Product_Variant.belongsTo(Custom_Category, {
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
Custom_Template_List.belongsTo(Share_Role, {
  foreignKey: 'role_id',
  as: 'role',
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

router.get('/', async function (req, res) {
  try {
    const customTemplateLists = await Custom_Template_List.findAll({
      include: [
        {
          model: Share_Store,
          as: 'store',
          attributes: ['store_name'],
        },
        {
          model: Share_Occ,
          as: 'occ',
          attributes: ['occ'],
        },
        {
          model: Share_Role,
          as: 'role',
          attributes: ['role'],
        },
        {
          model: Share_Color,
          as: 'color',
          attributes: ['name', 'code'],
        },
        {
          model: Custom_Template_Detail,
          as: 'details',
          include: [
            {
              model: Custom_Product_List,
              as: 'product',
              attributes: ['price'],
            },
          ],
          attributes: [],
        },
      ],
      attributes: [
        'template_id',
        'template_name',
        'image_url',
        'discount',
        [
          sequelize.literal(`(
            SELECT SUM(price)
            FROM custom_product_list
            WHERE product_id IN (
              SELECT product_id
              FROM custom_template_detail
              WHERE template_id = Custom_Template_List.template_id
            )
          )`),
          'total_price',
        ],
      ],
      group: ['Custom_Template_List.template_id'],
    })

    const formattedData = customTemplateLists.map((template) => ({
      id: template.template_id,
      src: template.image_url,
      name: template.template_name,
      store: template.store?.store_name,
      occ: template.occ?.occ,
      role: template.role?.role,
      color: template.color?.name,
      discount: template.discount,
      total_price: template.dataValues.total_price,
    }))

    return res.json({
      status: 'success',
      data: { customTemplateLists: formattedData },
    })
  } catch (error) {
    console.error('Error fetching template lists:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
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
  sro.role AS role,
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
LEFT JOIN
  Share_Role AS sro ON ctl.role_id = sro.role_id
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
      template_role: results[0].role,
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

  const sql = `
    SELECT 
      ss.store_id,
      ss.store_name,
      cat.category_name,
      GROUP_CONCAT(DISTINCT sc.name) AS colors,
      GROUP_CONCAT(DISTINCT cpv.image_url) AS urls
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
      ss.store_id = :store_id
    GROUP BY 
      cat.category_name
  `

  try {
    const results = await sequelize.query(sql, {
      replacements: { store_id: store_id },
      type: sequelize.QueryTypes.SELECT,
    })

    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: 'No products found for this store.' })
    }
    const formattedResults = results.map((result) => ({
      store_id: result.store_id,
      store_name: result.store_name,
      category_name: result.category_name,
      colors: result.colors.split(','),
      urls: result.urls.split(','),
    }))
    return res.json({
      status: 'success',
      data: formattedResults,
    })
  } catch (error) {
    console.error('Error fetching store products:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

export default router
