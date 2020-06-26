const express = require('express')
const sequelize = require('./models').sequelize
const bodyParser = require('body-parser')

const authRouter = require('./router/auth')

const app = express();
const port = 5001;

sequelize.sync()
app.use(bodyParser.json())

app.use('/auth', authRouter)

app.get('/', (req, res) => {
  res.json('hello world');
})

app.listen(port, () => { console.log('listening...') })