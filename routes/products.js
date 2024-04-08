import express from 'express'
const router = express.Router()

/* GET home page. */
// router.get('/', function (req, res, next) {
//   res.render('index', { title: 'products' })
// })

// 檢查空物件, 轉換req.params為數字
import { getIdParam } from '#db-helpers/db-tool.js'

// 資料庫使用
import sequelize from '#configs/db.js'
const { Product } = sequelize.models

// GET - 得到所有會員資料
router.get('/', async function (req, res) {
  const products = await Product.findAll({ logging: console.log })
  // 處理如果沒找到資料

  // 標準回傳JSON
  return res.json({ status: 'success', data: { products } })
})

// GET - 得到單筆資料(注意，有動態參數時要寫在GET區段最後面)
router.get('/:id', async function (req, res) {
  // 轉為數字
  const id = getIdParam(req)

  // 檢查是否為授權會員，只有授權會員可以存取自己的資料
  // if (req.user.id !== id) {
  //   return res.json({ status: 'error', message: '存取會員資料失敗' })
  // }

  const product = await Product.findByPk(id, {
    raw: true, // 只需要資料表中資料
  })

  // 不回傳密碼
  // delete user.password

  return res.json({ status: 'success', data: { product } })
})

export default router
