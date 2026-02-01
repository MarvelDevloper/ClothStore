const express=require('express')
const userController = require('../controller/userController')
const userRoute=express.Router()

userRoute.post('/signup',userController.signup)
userRoute.post('/login',userController.login)
userRoute.post('/refresh',userController.verifyRefreshToken)


module.exports=userRoute