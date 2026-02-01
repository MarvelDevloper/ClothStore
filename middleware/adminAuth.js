const { ApiError } = require("./errorHandler")
const User=require('../model/userModel')

exports.adminAuth=async(req,res,next)=>{
    const userId=req.userId

    if(!userId){
        throw new ApiError('userId not found!',404)
    }

    const existUser=await User.findById(userId)

    if(existUser.role!=='admin'){
        return res.status(200).json({success:'unauthorized',msg:'only admin can perform this action!'})
    }
    next()
}