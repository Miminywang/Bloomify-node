import express from 'express'
const router = express.Router()
import { getIdParam } from '#db-helpers/db-tool.js'

// 資料庫使用
import sequelize from '#configs/db.js'

const {
  Custom_Template_List,
  Custom_Template_Detail,
  Custom_Product_List,
  Share_Store,
  Share_Color,
} = sequelize.models
// Model associations
// 在 Custom_Template_List 和 Custom_Template_Detail 之间
Custom_Template_List.hasMany(Custom_Template_Detail, {
  foreignKey: 'template_id',
  as: 'details',
})
Custom_Template_Detail.belongsTo(Custom_Product_List, {
  foreignKey: 'product_id',
  as: 'product',
})

Custom_Product_List.hasMany(Custom_Template_Detail, {
  foreignKey: 'product_id',
})

Custom_Template_List.belongsTo(Share_Store, {
  foreignKey: 'store_id',
  as: 'store',
})
Custom_Template_List.belongsTo(Share_Color, {
  foreignKey: 'color_id',
  as: 'color',
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
              attributes: [],
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
          sequelize.literal(
            `(SELECT SUM(product_price) FROM custom_product_list WHERE custom_product_list.product_id IN (SELECT product_id FROM custom_template_detail WHERE custom_template_detail.template_id = Custom_Template_List.template_id))`
          ),
          'totalPrice',
        ],
      ],
      group: ['Custom_Template_List.template_id'],
      logging: console.log,
    })

    const formattedData = customTemplateLists.map((template) => ({
      id: template.template_id,
      src: template.image_url,
      name: template.template_name,
      store: template.store?.store_name,
      color: template.color?.name,
      discount: template.discount,
      price: template.dataValues.totalPrice,
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

export default router
