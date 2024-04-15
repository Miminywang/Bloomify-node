import express from 'express'
const router = express.Router()

// 資料庫使用
import sequelize from '#configs/db.js'

const { Share_Payment_Status } = sequelize.models

// GET - 得到所有顏色
router.get('/', async function (req, res) {
  try {
    const payment_statuses = await Share_Payment_Status.findAll()
    return res.json({ status: 'success', data: { payment_statuses } })
  } catch (error) {
    console.error('Error fetching payment statuses:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

export default router
