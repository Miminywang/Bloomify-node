import express from 'express'
const router = express.Router()

// 資料庫使用
import sequelize from '#configs/db.js'

const { Share_Order_Status } = sequelize.models

// GET - 得到所有顏色
router.get('/', async function (req, res) {
  try {
    const order_statuses = await Share_Order_Status.findAll()
    return res.json({ status: 'success', data: { order_statuses } })
  } catch (error) {
    console.error('Error fetching order statuses:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

export default router
