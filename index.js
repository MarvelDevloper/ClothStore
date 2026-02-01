const express = require('express')
require('dotenv').config()
const DBconnection = require('./DBconnection/DBconnection')
const redis = require('./redisConfig/redis')
const userRoute = require('./route/userRoute')
const { globalErrorHandler } = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const productRoute = require('./route/productRoute')
const app = express()


// DB connection 
DBconnection()

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use('/auth', userRoute)
app.use('/product', productRoute)

app.use(globalErrorHandler)


const port = process.env.PORT || 5000
app.listen(port, () => {
    console.log(`Server Started At Port ${port}`)
})