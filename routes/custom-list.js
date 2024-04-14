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
  Share_Store,
  Share_Color,
} = sequelize.models
// 定義 Custom_Template_List 和 Custom_Template_Detail 之間的一對多關係
Custom_Template_List.hasMany(Custom_Template_Detail, {
  foreignKey: 'template_id', //指定外鍵為 template_id
  as: 'details', // 別名為 details
})
Custom_Template_Detail.belongsTo(Custom_Product_List, {
  foreignKey: 'product_id', // 指定外鍵為 product_id
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
      // 使用 findAll 方法查詢所有 Custom_Template_List 的數據，包括關聯的 Share_Store、Share_Color 和 Custom_Template_Detail
      include: [
        {
          model: Share_Store,
          as: 'store',
          attributes: ['store_name'], // 只查詢 Share_Store裡的 store_name 屬性
        },
        {
          model: Share_Color,
          as: 'color',
          attributes: ['name', 'code'], // 只查詢 Share_Color name 和 code 屬性
        },
        // 這一段是從Custom_Template_List 連進去 Custom_Template_Detail 再連進去 Custom_Product_List 做關聯 !!
        {
          model: Custom_Template_Detail,
          as: 'details',
          include: [
            {
              model: Custom_Product_List,
              as: 'product',
              attributes: [], // 不查詢任何屬性  因為我是要做加總金額 我如果擷取的話會很耗消能(ex:mysql原語法把三個表都接起來並顯示欄位)
            },
          ],
          attributes: [], // 不查詢任何屬性 只是關聯起來等等計算
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

    // 因為我一開始前端預設的資料為 再這裡有重新整理我的格式

    // const productList = [
    //
    //   {
    //     src: '/custom/custom/flowers/0c19e718edd2ba4ed62b185ba0d958c8.jpg',
    //     name: '百合花束',
    //     store: '店家名稱',
    //     price: '1320',
    //     discount: '150',
    //     colors: ['pink', 'black', 'red'],
    //   },
    ///   {
    //     src: '/custom/custom/flowers/5925d3602969b5e1a4e547075168af80.jpg',
    //     name: '鬱金香花束',
    //     store: '店家名稱',
    //     price: '700',
    //     discount: '100',
    //     colors: ['pink', 'yellow'],
    //   },
    // ]
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
