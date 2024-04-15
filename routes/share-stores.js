import express from 'express'
const router = express.Router()

// 檢查空物件, 轉換req.params為數字
import { getIdParam } from '#db-helpers/db-tool.js'

// 資料庫使用
import sequelize from '#configs/db.js'
import { Op } from 'sequelize'

const { Share_Store } = sequelize.models

// GET - 得到所有商家
router.get('/', async function (req, res) {
  try {
    const stores = await Share_Store.findAll({
      raw: true,
      nest: true,
    })
    return res.json({ status: 'success', data: { stores } })
  } catch (error) {
    console.error('Error fetching stores:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

// GET - 得到課程首頁需要的商家(指定id範圍)
router.get('/course-index', async function (req, res) {
  try {
    const stores = await Share_Store.findAll({
      where: {
        store_id: { [Op.between]: [2, 9] }, // store_id:2~9
      },
      raw: true,
      nest: true,
      attributes: ['store_id', 'store_name', 'logo_path'], // 需要的屬性
    })
    return res.json({ status: 'success', data: { stores } })
  } catch (error) {
    console.error('Error fetching stores:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})

export default router
