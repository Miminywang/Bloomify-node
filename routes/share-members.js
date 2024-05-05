// login,logout功能
// register,edit

import express from 'express'
const router = express.Router()

import jsonwebtoken from 'jsonwebtoken'
// 中介軟體，存取隱私會員資料用
import authenticate from '#middlewares/authenticate.js'

// 檢查空物件, 轉換req.params為數字
import { getIdParam } from '#db-helpers/db-tool.js'

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

// 上傳檔案用使用multer
import path from 'path'
import multer from 'multer'

// 靜態文件存放目錄
router.use(express.static('/member/avatar'))

// multer的設定值 - START
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    // 存放目錄
    callback(null, 'public/member/avatar/') // 設定檔案存放的目錄，此處為 public/member/avatar/
  },
  fileFilter(req, file, cb) {
    // 只接受三種圖片格式
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      cb(new Error('Please upload an image'))
    }
    cb(null, true)
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname)

    // 經授權後，req.user帶有會員的id
    // const newFilename = req.user.id
    // 新檔名由表單傳來的req.body.newFilename決定
    // callback(null, newFilename + path.extname(file.originalname))
  },
})

// 設定 Multer 使用上述的 storage
const upload = multer({ storage: storage })
// multer的設定值 - END

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
    name: user.name,
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
    user: { user },
  })
})

//  post-logout
router.post('/logout', authenticate, (req, res) => {
  // 清除cookie
  // res.clearCookie(name [, options])
  res.clearCookie('accessToken', { httpOnly: true })
  res.json({ status: 'success', data: null })
})

// get-check
// 檢查登入狀態用
router.get('/check', authenticate, async (req, res) => {
  // 查詢資料庫目前的資料
  const user = await Share_Member.findByPk(req.user.id, {
    raw: true, // 只需要資料表中資料
  })

  console.log(user)
  // 使用者未登入 => authenticate 會判定沒有token

  // 不回傳密碼值
  delete user.password
  return res.json({ status: 'success', data: { user } })
})

// GET - 得到所有會員資料
router.get('/', async function (req, res) {
  const users = await Share_Member.findAll({ logging: console.log })
  // 處理如果沒找到資料

  // 標準回傳JSON
  return res.json({ status: 'success', data: { users } })
})

// GET - 得到單筆資料(注意，有動態參數時要寫在GET區段最後面)
// http://localhost:3005/api/share-members/:id
router.get('/:id', authenticate, async function (req, res) {
  // 轉為數字
  const id = getIdParam(req)

  // 檢查是否為授權會員，只有授權會員可以存取自己的資料
  if (req.user.id !== id) {
    return res.json({ status: 'error', message: '存取會員資料失敗' })
  }

  const user = await Share_Member.findByPk(id, {
    raw: true, // 只需要資料表中資料
  })

  // 不回傳密碼
  delete user.password

  return res.json({ status: 'success', data: { user } })
})

// PUT - 更新會員資料(排除更新密碼)
// http://localhost:3005/api/share-members/center/1/profile
router.put('/center/:id/profile', authenticate, async function (req, res) {
  const id = getIdParam(req)
  console.log(id)
  // 檢查是否為授權會員，只有授權會員可以存取自己的資料
  if (req.user.id !== id) {
    return res.json({ status: 'error', message: '存取會員資料失敗' })
  }

  // user為來自前端的會員資料(準備要修改的資料)
  const user = req.body
  console.log(user)
  // 檢查從前端瀏覽器來的資料，哪些為必要(name, ...)
  if (
    !id ||
    !user.name ||
    !user.phone ||
    !user.city ||
    !user.district ||
    !user.address
  ) {
    return res.json({ status: 'error', message: '缺少必要資料' })
  }

  // 查詢資料庫目前的資料
  const dbUser = await Share_Member.findByPk(id, {
    raw: true, // 只需要資料表中資料
  })

  // null代表不存在
  if (!dbUser) {
    return res.json({ status: 'error', message: '使用者不存在' })
  }

  // 有些特殊欄位的值沒有時要略過更新，不然會造成資料庫錯誤
  // if (!user.birth_date) {
  //   delete user.birth_date
  // }

  // 對資料庫執行update
  const [affectedRows] = await Share_Member.update(user, {
    where: {
      id,
    },
  })
  // 沒有更新到任何資料 -> 失敗或沒有資料被更新
  if (!affectedRows) {
    return res.json({ status: 'error', message: '更新失敗或沒有資料被更新' })
  }

  // 更新成功後，找出更新的資料，updatedUser為更新後的會員資料
  const updatedUser = await Share_Member.findByPk(id, {
    raw: true, // 只需要資料表中資料
  })

  // password資料不需要回應給瀏覽器
  delete updatedUser.password
  //console.log(updatedUser)
  // 回傳
  return res.json({ status: 'success', data: { user: updatedUser } })
})

// POST - 可同時上傳與更新會員檔案用，使用multer(設定值在此檔案最上面)
router.post(
  '/upload-avatar',
  authenticate,
  upload.single('avatar'), // 上傳來的檔案(這是單個檔案，表單欄位名稱為avatar)
  async function (req, res) {
    // req.file 即上傳來的檔案(avatar這個檔案)
    // req.body 其它的文字欄位資料…
    console.log(req.file, req.body)

    if (req.file) {
      console.log(req.file)
      const id = req.user.id
      const data = {
        avatar: `http://localhost:3005/member/avatar/${req.file.filename}`,
      }

      // 對資料庫執行update
      const [affectedRows] = await Share_Member.update(data, {
        where: {
          id,
        },
      })
      console.log(data)
      // 沒有更新到任何資料 -> 失敗或沒有資料被更新
      if (!affectedRows) {
        return res.json({
          status: 'error',
          message: '更新失敗或沒有資料被更新',
        })
      }

      return res.json({
        status: 'success',
        data: { avatar: req.file.filename },
      })
    } else {
      return res.json({ status: 'fail', data: null })
    }
  }
)

// register
// POST - 新增會員資料
router.post('/register', async function (req, res) {
  // req.body資料範例
  // {
  //     "username":"ginny@test.com",
  //     "password":"12345"
  // }

  // 要新增的會員資料
  const newUser = req.body

  // 檢查從前端來的資料哪些為必要(name, username...)
  if (!newUser.username || !newUser.password) {
    return res.json({ status: 'error', message: '缺少必要資料' })
  }

  // 執行後user是建立的會員資料，created為布林值
  // where指的是不可以有相同的資料，如username與email不能有相同的
  // defaults用於建立新資料用
  const [user, created] = await Share_Member.findOrCreate({
    where: { username: newUser.username },
    defaults: {
      password: newUser.password,
    },
  })

  // 新增失敗 created=false 代表沒新增
  if (!created) {
    return res.json({ status: 'error', message: '建立會員失敗' })
  }

  // 成功建立會員的回應
  // 狀態`201`是建立資料的標準回應，
  // 如有必要可以加上`Location`會員建立的uri在回應標頭中，或是回應剛建立的資料
  // res.location(`/users/${user.id}`)
  return res.status(201).json({
    status: 'success',
    data: null,
  })
})

export default router
