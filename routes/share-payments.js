import express from 'express'
const router = express.Router()

// 資料庫使用
import sequelize from '#configs/db.js'

const { Share_Payment } = sequelize.models

// GET - 得到所有顏色
router.get('/', async function (req, res) {
  try {
    const payments = await Share_Payment.findAll()
    return res.json({ status: 'success', data: { payments } })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

export default router
