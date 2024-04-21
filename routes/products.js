import express from 'express'
const router = express.Router()
import { Op } from 'sequelize'

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
  Product_Review,
  Share_Star,
  Member,
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
      // limit: 15,
      // offset: 0,
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
// Importing required models and other necessary libraries may be assumed here.

// Define a GET route handler for the '/filter' endpoint.
router.get('/filter', async function (req, res) {
  const limit = 6 // Set the limit for each page
  const page = parseInt(req.query.page) || 1 // Get the page number from query parameter or default to 1
  const offset = (page - 1) * limit // Calculate the offset
  // Extract parent_id from the query parameters of the request.
  const { parent_id, keyword, sort } = req.query

  // Initialize an object to hold conditions for the database query.
  const whereConditions = {}

  // If a parent_id is provided, use it to determine the specific categories to filter by.
  if (parent_id) {
    // Map parent categories to their child category IDs.
    const parentToCategoryMap = {
      1: [5, 6, 7, 8, 9, 10], // All categories
      2: [5, 6], // Specific subcategories for parent_id = 2
      3: [7, 8], // Specific subcategories for parent_id = 3
      4: [9, 10], // Specific subcategories for parent_id = 4
    }
    // Retrieve the category IDs that correspond to the given parent_id.
    const categoryIds = parentToCategoryMap[parent_id]
    // If the parent_id is valid and has corresponding category IDs, set them in the conditions.
    if (categoryIds) {
      whereConditions.product_category_id = categoryIds
    }
  }

  if (keyword) {
    // 添加 OR 條件到 whereConditions 以進行關鍵字搜索
    whereConditions[Op.or] = [
      {
        name: { [Op.like]: `%${keyword}%` }, // 在 name 欄位中搜索 keyword
      },
    ]
  }

  let orderOptions = [['created_at', 'DESC']] // 最新的(預設)
  if (sort === 'latest') {
    orderOptions = [['created_at', 'DESC']]
  }
  if (sort === 'oldest') {
    orderOptions = [['created_at', 'ASC']] // 最舊的
  }
  if (sort === 'expensive') {
    orderOptions = [['price', 'DESC']] // 最貴的
  }
  if (sort === 'cheapest') {
    orderOptions = [['price', 'ASC']] // 最便宜的
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
      order: orderOptions,
      nest: true, // Enable nested loading of related models.
      limit: limit,
      offset: offset,
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
