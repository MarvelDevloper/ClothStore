const express=require('express')
const userController = require('../controller/userController')
const { verifyAccessToken } = require('../auth/verifyToken')
const userRoute=express.Router()

userRoute.post('/signup',userController.signup)
userRoute.post('/login',userController.login)
userRoute.post('/refresh',userController.verifyRefreshToken)
userRoute.post('/add-cart',verifyAccessToken,userController.addCart)


module.exports=userRoute