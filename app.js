const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mysql = require('mysql')
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json())

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vue_login_register'
})

app.post('/api/login', (req, res) => {
  const { username, password } = req.body
  pool.query('SELECT * FROM users WHERE username = ?', username, (error, results) => {
    if (error) {
      console.log(error)
      res.status(500).json({ error: 'เซิร์ฟระเบิด' })
    } else if (results.length === 0) {
      res.status(401).json({ error: 'ข้อมูลผิดพลาด กรุณาตรวจสอบใหม่' })
    } else {
      const user = results[0]
      bcrypt.compare(password, user.password, (error, match) => {
        if (error) {
          console.log(error)
          res.status(500).json({ error: 'เซิร์ฟระเบิด' })
        } else if (match) {
          const accessToken = jwt.sign({ userId: user.id }, 'your-jwt-secret')
          res.json({ accessToken, username })
        } else {
          res.status(401).json({ error: 'ข้อมูลผิดพลาด กรุณาตรวจสอบใหม่' })
        }
      })
    }
  })
})

app.post('/api/register', (req, res) => {
  const { username, password } = req.body

  bcrypt.hash(password, 10, (error, hash) => {
    if (error) {
      console.log(error)
      res.status(500).json({ error: 'เซิร์ฟระเบิด' })
    } else {
      pool.query('INSERT INTO users SET ?', { username, password: hash }, (error, results) => {
        if (error) {
          console.log(error)
          res.status(500).json({ error: 'เซิร์ฟระเบิด' })
        } else {
          res.json({ message: 'สมัครสำเร็จ', username })
        }
      })
    }
  })
})

app.listen(3000, () => {
  console.log('Server started on port 3000')
})
