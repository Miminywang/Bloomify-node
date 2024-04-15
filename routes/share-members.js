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

// post - 登入驗證
router.post('/login', async function (req, res) {
  // 處理如果沒找到資料
  // 從前端來的資料 req.body = { username:'xxxx', password :'xxxx'}
  const loginUser = req.body
  console.log(loginUser)
  // 檢查從前端來的資料哪些為必要
  if (!loginUser.username || !loginUser.password) {
    return res.json({ status: 'fail', data: null })
  }

  // 查詢資料庫，是否有這帳號與密碼的使用者資料
  // 方式一: 使用直接查詢
  // const user = await sequelize.query(
  //   'SELECT * FROM user WHERE username=? LIMIT 1',
  //   {
  //     replacements: [loginUser.username], //代入問號值
  //     type: QueryTypes.SELECT, //執行為SELECT
  //     plain: true, // 只回傳第一筆資料
  //     raw: true, // 只需要資料表中資料
  //     logging: console.log, // SQL執行呈現在console.log
  //   }
  // )

  // 方式二: 使用模型查詢
  const user = await Share_Member.findOne({
    where: {
      username: loginUser.username,
    },
    raw: true, // 只需要資料表中資料
  })

  console.log(user)

  // user=null代表不存在
  if (!user) {
    return res.json({ status: 'error', message: '使用者不存在' })
  } else {
    // 標準回傳JSON
    return res.json({ status: 'success', data: { user } })
  }
})

export default router
