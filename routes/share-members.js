// login,logout功能

import express from 'express'
const router = express.Router()

import jsonwebtoken from 'jsonwebtoken'
// 中介軟體，存取隱私會員資料用
import authenticate from '#middlewares/authenticate.js'

// 存取`.env`設定檔案使用
import 'dotenv/config.js'

// 資料庫使用
import sequelize from '#configs/db.js'
const { Share_Member } = sequelize.models

// 驗証加密密碼字串用
import { compareHash } from '#db-helpers/password-hash.js'

// GET - 得到所有會員資料
router.get('/', async function (req, res) {
  const share_members = await Share_Member.findAll({ logging: console.log })
  // 處理如果沒找到資料

  // 標準回傳JSON
  return res.json({ status: 'success', data: { share_members } })
})

// 檢查登入狀態用
router.get('/check', authenticate, async (req, res) => {
  // 查詢資料庫目前的資料
  const user = await Share_Member.findByPk(req.user.id, {
    raw: true, // 只需要資料表中資料
  })

  // 不回傳密碼值
  delete user.password
  return res.json({ status: 'success', data: { user } })
})

export default router
