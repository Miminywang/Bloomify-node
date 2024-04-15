import express from 'express'
const router = express.Router()

// 資料庫使用
import sequelize from '#configs/db.js'

const { Product_Category } = sequelize.models

// GET - 得到所有顏色
router.get('/', async function (req, res) {
  try {
    const categories = await Product_Category.findAll()
    return res.json({ status: 'success', data: { categories } })
  } catch (error) {
    console.error('Error fetching colors:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

export default router
