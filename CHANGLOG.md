# Change log

## TODO

- [ ] downsize Product sample data
- [ ] line pay feature refactor
- [ ] deprecated `models/base.js`
- [ ] clear up `data` and other nouse files
- [ ] add base db sample crud route X 2(one for sample origin node+mysql2, one for sequalize)
- [ ] remove pg npm for test

## FIXME


## OTHERS

> db.js

```js
// for postgresql test
const sequelize = new Sequelize(
  process.env.PG_DB_DATABASE,
  process.env.PG_DB_USERNAME,
  process.env.PG_DB_PASSWORD,
  {
    host: process.env.PG_DB_HOST,
    port: process.env.PG_DB_PORT,
    dialect: 'postgres',
    logging: false,
    define: {
      freezeTableName: true,
      charset: 'utf8',
      collate: 'utf8_general_ci',
    },
  }
)
```

> .env

```text
# TEST FOR pgsql
PG_DB_HOST=127.0.0.1
PG_DB_PORT=5432
PG_DB_DATABASE=test
PG_DB_USERNAME=test
PG_DB_PASSWORD=12345
```

## LOG

### 231105

- (test) ? 10k products data maybe squelize seed function max limit
- (u) products route add brand_ids query string for brand query(as cat_ids)
- (u) products route refactor
- (a) user model add avatar and upload-avatar route
- (u) jwt access token change include user id, google_uid, line_uid, username. and expiresIn change to '3d'

### 231104

- (a) user register/update(profile) feature
- (u) refactor test all reset-password(otp) feature
- (a) db password hashing with bcrypt
- (a) node import alias for root(##)

### 231028

- (u) sequelize raw query for model/base.js
- (u) dynamic import routes
- (a) pg, pg-hstore, mariadb npm mods for test
- remove express-fileupload and only use multer

### 231024

- (d) models/users change router/user db funcs
- (d) docs
- (d) auth, facebook-login

### 231023-

- OTP workflow
- +nodemailer + Google SMTP
- +[faker](https://github.com/faker-js/faker)
- fixed create table issue(executeQuery only one query each time) drop if exist then create
- es6 import wo babel 
- auth route (session-cookie should use?... no, use jwt)

### 230604

- get: all, byId is ok
- post: insertOne is ok

### 230606

- json2db(create db and insert data) ok
- db backup tool ok
- create, drop, TRUNCATE db.... should need another TEST db?