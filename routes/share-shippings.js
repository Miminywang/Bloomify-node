import express from 'express'
const router = express.Router()

// 資料庫使用
import sequelize from '#configs/db.js'

const { Share_Shipping } = sequelize.models

// GET - 得到所有顏色
router.get('/', async function (req, res) {
  try {
    const shippings = await Share_Shipping.findAll()
    return res.json({ status: 'success', data: { shippings } })
  } catch (error) {
    console.error('Error fetching shipping:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

export default router
