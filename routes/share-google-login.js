import express from 'express'
const router = express.Router()

import sequelize from '#configs/db.js'
const { Share_Member } = sequelize.models

import jsonwebtoken from 'jsonwebtoken'
// 存取`.env`設定檔案使用
import 'dotenv/config.js'

// 定義安全的私鑰字串
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

router.post('/', async function (req, res, next) {
  // providerData = req.body
  console.log(JSON.stringify(req.body))

  // 檢查從react來的資料
  if (!req.body.providerId || !req.body.uid) {
    return res.json({ status: 'error', message: '缺少google登入資料' })
  }

  const { uid, displayName, email, photoURL } = req.body
  const google_uid = uid
  const avatar = photoURL.startsWith('http')
    ? photoURL
    : `http://localhost:3005/member/avatar/${photoURL}`
  console.log(req.body)

  // 以下流程:
  // 1. 先查詢資料庫是否有同google_uid的資料
  // 2-1. 有存在 -> 執行登入工作
  // 2-2. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有google來的資料 -> 執行登入工作

  // 1. 先查詢資料庫是否有同google_uid的資料
  const total = await Share_Member.count({
    where: {
      google_uid,
    },
  })
  console.log(total)
  // 要加到access token中回傳給前端的資料
  // 存取令牌(access token)只需要id和username就足夠，其它資料可以再向資料庫查詢
  let returnUser = {
    id: 0,
    username: '',
    google_uid: '',
  }

  if (total) {
    // 2-1. 有存在 -> 從資料庫查詢會員資料
    const dbUser = await Share_Member.findOne({
      where: {
        google_uid,
      },
      raw: true, // 只需要資料表中資料
    })

    // 回傳給前端的資料
    returnUser = {
      id: dbUser.id,
      username: dbUser.google_name,
      google_uid: dbUser.google_uid,
    }
  } else {
    // 2-2. 不存在 -> 建立一個新會員資料(無帳號與密碼)，只有google來的資料 -> 執行登入工作
    // google來的資料直接放入name,username,avatar
    const user = {
      name: displayName,
      username: email,
      google_uid,
      avatar: avatar,
    }
    // 新增會員資料
    const newUser = await Share_Member.create(user)

    // 回傳給前端的資料
    returnUser = {
      id: newUser.id,
      username: '',
      google_uid: newUser.google_uid,
    }
  }

  // 產生存取令牌(access token)，其中包含會員資料
  const accessToken = jsonwebtoken.sign(returnUser, accessTokenSecret, {
    expiresIn: '3d',
  })

  // 使用httpOnly cookie來讓瀏覽器端儲存access token
  res.cookie('accessToken', accessToken, { httpOnly: true })

  // 傳送access token回應(react可以儲存在state中使用)
  return res.json({
    status: 'success',
    data: {
      accessToken,
    },
  })
})

export default router
