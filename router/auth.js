const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const { verifyToken } = require('../middleware')

const User = require('../models').User
const Token = require('../models').Token

const router = express.Router()

router.post('/register', async(req, res) => {
  const { username, email, password } = req.body

  if (username && email && password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await User.create({
        name: username,
        email: email,
        password: hashedPassword
      });
      res.status(200).json({
        message: 'success',
        username: username,
        id: result.id
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError')
        return res.status(400).json({ message: 'user already exist' });
      res.status(400).json({ message: 'register err' })
    }
  } else {
    res.status(400).json({
      message: 'bad request'
    })
  }
})

router.get('/refresh', verifyToken, async(req, res) => {
  let { refreshToken } = req.headers.authorization
  const { id } = req.decoded

  try {
    const exToken = await Token.findOne({ where: { id: id } })
    if (await bcrypt.compare(refreshToken, exToken.token)) {
      const token = jwt.sign({ id: id }, process.env.JWT_PASSWORD, { expiresIn: '15m' })
      const dateNow = new Date();

      if (refreshToken.exp + 30 * 24 * 60 * 1000 < dateNow.getTime() / 1000) {
        refreshToken = jwt.sign({ id: id }, process.env.JWT_PASSWORD, { expiresIn: '365d' })
        Token.update({
          token: refreshToken,
        }, {
          where: { id: id }
        })
      }

      res.json({
        message: 'refresh success',
        token,
        refreshToken
      })

    } else {
      res.status(400).json({
        message: 'bad refresh token'
      })
    }
  } catch (err) {
    console.log(err)
    res.send(err)
  }

})

router.post('/login', async(req, res) => {
  const { email, password } = req.body

  if (email && password) {
    try {
      const user = await User.findOne({ where: { email: email } });

      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_PASSWORD, { expiresIn: '15m' })
        const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_PASSWORD, { expiresIn: '365d' })

        // save refresh token to database
        const hashedToken = await bcrypt.hash(refreshToken, 10);
        await Token.create({ id: id, token: hashedToken })

        res.json({
          message: 'login success',
          token,
          refreshToken
        });
      } else {
        res.status(403).send('password incorrect')
      }
    } catch (err) {
      res.status(404).send('user not found')
    }
  } else {
    res.status(400).send('bad request')
  }
})

router.get('/logout', (req, res) => {

})

module.exports = router