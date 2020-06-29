const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const { verifyToken } = require('../middleware')

const User = require('../models').User

const router = express.Router()

router.post('/check', verifyToken, (req, res) => {
  const { id, user } = req.decoded;
  console.log('checking... user');
  console.log(req.headers);
  console.log(req.headers.authorization);
  console.log(req.body);
  return res.json({ userId: id, user: user, message: 'check success' })
})

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

router.get('/refresh', verifyToken, (req, res) => {
  let refreshToken = req.headers.authorization
  const { id, user, exp } = req.decoded

  const accessToken = jwt.sign({ id: id }, process.env.JWT_PASSWORD, { expiresIn: '15m' })

  // TODO: certain condition update refresh token
  if (true) {
    refreshToken = jwt.sign({ id: id, user: user }, process.env.JWT_PASSWORD, { expiresIn: '60d' })
  }
  return res.json({
    message: 'refresh success',
    accessToken,
    refreshToken
  })

})

router.post('/login', async(req, res) => {
  const { email, password } = req.body

  if (email && password) {
    try {
      const user = await User.findOne({ where: { email: email } });
      console.log(user);
      if (await bcrypt.compare(password, user.password)) {
        const accessToken = jwt.sign({ id: user.id, user: user.name }, process.env.JWT_PASSWORD, { expiresIn: '15m' })
        const refreshToken = jwt.sign({ id: user.id, user: user.name }, process.env.JWT_PASSWORD, { expiresIn: '1d' })

        return res.json({
          message: 'login success',
          accessToken,
          refreshToken
        })

      } else {
        return res.status(403).send('password incorrect')
      }
    } catch (err) {
      return res.status(404).send('user not found')
    }
  } else {
    return res.status(400).send('bad request')
  }
})


module.exports = router