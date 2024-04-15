import bcrypt from 'bcrypt'

const saltRounds = 10

// 生成密碼的雜湊
export const generateHash = async (plainPassword) => {
  return await bcrypt.hash(plainPassword, saltRounds)
}

// 比對明文密碼和儲存在資料庫中的雜湊值是否相符
// hash is store in db
export const compareHash = async (plainPassword, hash) => {
  return await bcrypt.compare(plainPassword, hash)
}
