const mongoose = require('mongoose')

const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    cart:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product"
        },
        price:{
            type:Number,
            required:true,
        },
        quantity:{
            type:Number,
            default:1
        }
    }],
    totalPrice:{
        type:Number
    }
},{
    timestamps:true
})

const Cart=mongoose.model("Cart",cartSchema)

module.exports=Cart

