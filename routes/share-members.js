// login,logout功能

import express from 'express'
const router = express.Router()

import jsonwebtoken from 'jsonwebtoken'
// 中介軟體，存取隱私會員資料用
import authenticate from '#middlewares/authenticate.js'

// 存取`.env`設定檔案使用
import 'dotenv/config.js'

// 資料庫使用
// 使用 sequelize 物件中的 models 屬性來取得 User 模型
import sequelize from '#configs/db.js'
const { Share_Member } = sequelize.models

// 驗証加密密碼字串用
// bcrypt 比對明文密碼和儲存在資料庫中的雜湊值是否相符
import { compareHash } from '#db-helpers/password-hash.js'

// 定義安全的私鑰字串 .env檔案
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

// post-login
// 新增修改參考routes/users.js
router.post('/login', async function (req, res) {
  // 處理如果沒找到資料
  // 從前端來的資料 req.body = { username:'xxxx', password :'xxxx'}
  const loginUser = req.body
  console.log(loginUser)

  // 檢查從前端來的資料哪些為必要
  // 已在前端input欄位必須填寫才能送出表單
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
      // 只核對帳號
      username: loginUser.username,
    },
    // 設置了 raw: true，則 findOne 方法將會返回一個普通的 JavaScript 物件，而不是 Sequelize 模型的實例
    raw: true, // 只需要資料表中資料
  })

  console.log(user)

  // user=null代表不存在
  if (!user) {
    return res.json({ status: 'error', message: '使用者不存在' })
  }

  // else {
  //   // 標準回傳JSON
  //   return res.json({ status: 'success', data: { user } })
  // }

  // 密碼驗證
  // compareHash(登入時的密碼純字串, 資料庫中的密碼hash) 比較密碼正確性
  // isValid=true 代表正確
  const isVaild = await compareHash(loginUser.password, user.password)

  if (!isVaild) {
    return res.json({ status: 'error', message: '密碼錯誤' })
  }

  // 存取令牌(access token)只需要id和username就足夠，其它資料可以再向資料庫查詢
  // google_uid
  const returnUser = {
    id: user.id,
    username: user.username,
  }
  // 創建JWT
  // 產生存取令牌(access token)，其中包含會員資料
  // expiresIn: '3d' 有效期限為3天
  const accessToken = jsonwebtoken.sign(returnUser, accessTokenSecret, {
    expiresIn: '3d',
  })
  // 驗證在middlewares的authenticate.js裡面

  // 使用httpOnly cookie來讓瀏覽器端儲存access token
  // res.cookie(name, value [, options])
  res.cookie('accessToken', accessToken, { httpOnly: true })

  // 傳送access token回應(例如react可以儲存在state中使用)
  // res.json後才能在瀏覽器cookies看到資料
  // 前端由
  res.json({
    status: 'success',
    data: { accessToken },
  })
})

//  post-logout
router.post('/logout', authenticate, (req, res) => {
  // 清除cookie
  // res.clearCookie(name [, options])
  res.clearCookie('accessToken', { httpOnly: true })
  res.json({ status: 'success', data: null })
})

export default router
