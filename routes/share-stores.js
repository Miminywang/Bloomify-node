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
    // 獲得查詢字串中的fields參數，可以選擇要什麼欄位
    const fields = req.query.fields ? req.query.fields.split(',') : null
    // 設置查詢參數
    const queryOptions = {
      attributes: fields,
      raw: true,
      nest: true,
    }

    // 選擇是否排除admin
    if (req.query.exclude_id) {
      const excludeId = parseInt(req.query.exclude_id)
      queryOptions.where = {
        store_id: {
          [Op.ne]: excludeId, // 使用Sequelize的ne（不等於）運算符
        },
      }
    }

    const stores = await Share_Store.findAll(queryOptions)
    return res.json({ status: 'success', data: { stores } })
  } catch (error) {
    console.error('Error fetching stores:', error)
    return res
      .status(500)
      .json({ status: 'error', message: 'Internal server error' })
  }
})
// 商家如果要印成下拉式選單可以用這支
// http://localhost:3005/api/share-stores?fields=store_id,store_name&exclude_id=1

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
