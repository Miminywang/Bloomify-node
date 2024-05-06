// 資料庫查詢處理函式
import { generateToken } from '#configs/otp.js'

// 資料庫使用
import { QueryTypes } from 'sequelize'
import sequelize from '#configs/db.js'
const { Share_Member, Otp } = sequelize.models

// 判斷token是否到期, true代表到期
// const hasExpired = (expTimestamp) => {
//   return Date.now() > expTimestamp
// }

// 判斷是否可以重設token, true代表可以重設
const shouldReset = (expTimestamp, exp, limit = 60) => {
  const createdTimestamp = expTimestamp - exp * 60 * 1000
  return Date.now() - createdTimestamp > limit * 1000
}

// exp = 是 30 分到期,  limit = 60 是 60秒內不產生新的token
const createOtp = async (username, exp = 30, limit = 60) => {
  // 方式二: 使用模型查詢
  // 檢查使用者username是否存在

  // 要記得先註冊帳號
  const user = await Share_Member.findOne({
    where: {
      username,
    },
    raw: true, // 只需要資料表中資料
  })
  console.log(user)

  if (!user) {
    console.log('ERROR - 使用者帳號不存在'.bgRed)
    return {}
  }
  // 檢查otp是否已經存在
  const foundOtp = await Otp.findOne({
    where: {
      username,
    },
    raw: true, // 只需要資料表中資料
  })

  // 找到記錄，因為在60s(秒)內限制，所以"不能"產生新的otp token
  if (foundOtp && !shouldReset(foundOtp.exp_timestamp, exp, limit)) {
    console.log('ERROR - 60s(秒)內要求重新產生otp'.bgRed)
    return {}
  }

  // 找到記錄，超過60s(秒)內限制，所以可以產生新的otp token
  if (foundOtp && shouldReset(foundOtp.exp_timestamp, exp, limit)) {
    // 以使用者輸入的username作為secret產生otp token
    const token = generateToken(username)

    // 到期時間 預設 exp = 30 分鐘到期
    const exp_timestamp = Date.now() + exp * 60 * 1000

    // 修改Otp
    await Otp.update(
      { token, exp_timestamp },
      {
        where: {
          username,
        },
      }
    )

    return {
      ...foundOtp,
      exp_timestamp,
      token,
    }
  }

  // 以下為"沒找到otp記錄"
  // 以使用者輸入的username作為secret產生otp token
  const token = generateToken(username)
  console.log(token)
  // 到期時間 預設 exp = 30 分鐘到期
  const exp_timestamp = Date.now() + exp * 60 * 1000

  // 建立otp物件
  const newOtp = {
    user_id: user.id,
    username,
    token,
    exp_timestamp,
  }

  // 建立新記錄
  const otp = await Otp.create(newOtp)
  // console.log(otp.dataValues)

  return otp.dataValues
}

// 更新密碼
const updatePassword = async (username, token, password) => {
  // 檢查otp是否已經存在
  const foundOtp = await Otp.findOne({
    where: {
      username,
      token,
    },
    raw: true, // 只需要資料表中資料
  })

  // 沒找到回傳false
  if (!foundOtp) {
    console.log('ERROR - OTP Token資料不存在'.bgRed)
    return false
  }

  // 計算目前時間比對是否超過，到期的timestamp
  if (Date.now() > foundOtp.exp_timestamp) {
    console.log('ERROR - OTP Token已到期'.bgRed)
    return false
  }

  // 修改密碼
  await Share_Member.update(
    { password },
    {
      where: {
        id: foundOtp.user_id,
      },
      individualHooks: true, // 密碼進資料表前要加密 trigger the beforeUpdate hook
    }
  )

  // 移除otp記錄
  await Otp.destroy({
    where: {
      id: foundOtp.id,
    },
  })

  return true
}

export { createOtp, updatePassword }
