import jsonwebtoken from 'jsonwebtoken'

// 存取`.env`設定檔案使用
import 'dotenv/config.js'

// 獲得加密用字串
// 從環境變數中取得存取令牌的密鑰
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET

// 中介軟體middleware，用於檢查授權(authenticate)
export default function authenticate(req, res, next) {
  // const token = req.headers['authorization']

  // 從HTTP請求的cookies中獲取存取令牌
  const token = req.cookies.accessToken
  // console.log(token)

  // if no token
  if (!token) {
    return res.json({
      status: 'error',
      message: '授權失敗，沒有存取令牌',
    })
  }

  // 驗證JWT
  // verify的callback會帶有decoded payload(解密後的有效資料)，就是user的資料
  jsonwebtoken.verify(token, accessTokenSecret, (err, user) => {
    if (err) {
      return res.json({
        status: 'error',
        message: '不合法的存取令牌',
      })
    }

    // 將user資料加到req中
    // 將解密後的用戶資料存放在HTTP請求物件req的user屬性中
    req.user = user
    next()
  })
}
