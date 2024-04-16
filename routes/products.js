import express from 'express'
const router = express.Router()

// 檢查空物件, 轉換req.params為數字
import { getIdParam } from '#db-helpers/db-tool.js'

// 資料庫使用
import sequelize from '#configs/db.js'

const {
  Product,
  Product_Image,
  Product_Tag,
  Share_Tag,
  Product_Category,
  Share_Store,
  Share_Color,
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
          attributes: ['name'], // 指定需要的屬性
        },
        {
          model: Share_Store,
          as: 'stores',
          attributes: ['store_name'],
        },
        {
          model: Share_Color,
          as: 'colors',
          attributes: ['name', 'code'],
        },
      ],
      // raw: true,
      nest: true,
      limit: 189,
    })
    return res.json({ status: 'success', data: { products } })
  } catch (error) {
    console.error('Error fetching Products:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

// GET - 得到單筆資料(注意，有動態參數時要寫在GET區段最後面)
router.get('/:id', async function (req, res) {
  const id = getIdParam(req) // Ensure that `id` is properly parsed and validated

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
          model: Share_Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] },
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
