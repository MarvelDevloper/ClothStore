const express=require('express')
const productController = require('../controller/productController')
const { adminAuth } = require('../middleware/adminAuth')
const { verifyAccessToken } = require('../auth/verifyToken')
const productRoute=express.Router()

productRoute.post('/put-object',verifyAccessToken,adminAuth,productController.putObject)
productRoute.post('/add-product',verifyAccessToken,adminAuth,productController.addProduct)
productRoute.get('/get-product',verifyAccessToken,productController.getObject)
productRoute.delete('/delete-product',verifyAccessToken,adminAuth,productController.deleteProduct)
productRoute.patch('/update-product',verifyAccessToken,adminAuth,productController.updateProduct)

module.exports=productRoute