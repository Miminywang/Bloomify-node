import express from 'express'
const router = express.Router()

// 資料庫使用
import sequelize from '#configs/db.js'
const { Intro_Data } = sequelize.models

// GET - 得到所有資料
router.get('/', async function (req, res) {
  const datas = await Intro_Data.findAll({ logging: console.log })
  // 處理如果沒找到資料

  // 標準回傳JSON
  return res.json({ status: 'success', data: { datas } })
})

export default router
