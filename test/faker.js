// eslint-disable-next-line
import { fakerZH_TW as faker } from '@faker-js/faker'

// 專用處理sql字串的工具，主要format與escape，防止sql injection
// import sqlString from 'sqlstring'

// 讓console.log可以呈現檔案與行號, 呈現顏色用
import { extendLog, toKebabCase } from '#utils/tool.js'
import 'colors'
extendLog()

import { readJsonFile, writeJsonFile } from '#utils/tool.js'
import { countries, townships, postcodes } from '#data/tw-township.js'
import _ from 'lodash'
import moment from 'moment'

const genUser = () => {
  // let generator = new FakeDataGenerator()

  // 隨機地址用
  let countryIndex = _.random(0, countries.length - 1)
  let townshipIndex = _.random(0, townships[countryIndex].length - 1)

  const postcode = postcodes[countryIndex][townshipIndex]
  const address =
    countries[countryIndex] +
    townships[countryIndex][townshipIndex] +
    faker.location.street() +
    _.random(1, 500) +
    '號' +
    _.random(1, 20) +
    '樓'

  return {
    name: faker.person.fullName(),
    username: faker.internet.userName(),
    password: '55555',
    email: faker.internet.email(),
    sex: faker.person.sex() === 'female' ? '女' : '男',
    birth_date: moment(
      faker.date.birthdate({ min: 15, max: 80, mode: 'age' })
    ).format('YYYY-MM-DD'),
    phone: faker.phone.number('09########'),
    postcode,
    address,
  }
}

// 產生大量資料用
const createUsers = async (num = 1, filename = 'User.json') => {
  const users = Array(num)
    .fill(1)
    .map((v, i) => {
      return genUser()
    })

  await writeJsonFile(filename, users)
}

// 品牌名稱，為了要取名稱設為全域
const brands = ['Nike', 'adidas', 'PUMA', 'New Balance']
// 以下建立分類用 模型Category
const mainCats = ['服飾', '鞋類', '配件']
const subCats = [
  ['短袖上衣', '短褲', '長袖上衣', '長褲', '外套'],
  ['慢跑鞋', '籃球鞋'],
  ['包款', '帽類'],
]
// 所有分類，為了要取名稱設為全域
let allCats = []

const createCats = async (filename = 'Category.json') => {
  const mCats = mainCats.map((v, i) => {
    return { id: i + 1, name: v, parent_id: null }
  })

  allCats = [...mCats]
  let idIndex = mCats.length + 1

  for (let i = 0; i < subCats.length; i++) {
    for (let j = 0; j < subCats[i].length; j++) {
      const item = { id: idIndex, name: subCats[i][j], parent_id: i + 1 }
      allCats.push(item)
      idIndex++
    }
  }

  await writeJsonFile(filename, allCats)
}

// 以下建立產品用 模型Product
const genProduct = () => {
  const photos = Array(3)
    .fill(1)
    .map((v, i) => faker.image.url())
    .join(',')

  const brand_id = faker.number.int({ min: 1, max: 4 })
  const cat_id = faker.number.int({ min: 4, max: 12 })
  const name = `${faker.commerce.productName()} - ${brands[brand_id - 1]} ${
    allCats[cat_id - 1].name
  }`

  return {
    sn: faker.string.uuid(),
    name,
    photos,
    stock: faker.number.int({ min: 1, max: 10 }) * 10,
    price: faker.number.int({ min: 15, max: 150 }) * 100,
    info: faker.commerce.productDescription(),
    brand_id,
    cat_id: faker.number.int({ min: 4, max: 12 }),
    color: faker.helpers.arrayElements([1, 2, 3, 4], { min: 1, max: 4 }),
    tag: faker.helpers.arrayElements([1, 2, 3, 4], {
      min: 1,
      max: 3,
    }),
    size: faker.helpers.arrayElements([1, 2, 3, 4], {
      min: 1,
      max: 4,
    }),
  }
}

const createProducts = async (num = 1, filename = 'Product.json') => {
  const products = Array(num)
    .fill(1)
    .map((v, i) => {
      return genProduct()
    })

  await writeJsonFile(filename, products)
}

//await createUsers(17)
await createCats()
await createProducts(500)

// console.log(faker.lorem.lines({ min: 1, max: 3 }))

// 訊息
console.log('範例檔案已建立完成'.bgBlue)
// eslint-disable-next-line
process.exit()
