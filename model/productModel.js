const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        min: [1, 'negative values not allowed'],
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        default: 0
    },
    sizes:[
        {
            size:{
                type:String,
                required:true,
            },
            stock:{
                type:Number,
                required:true,
            }
        }
    ],
    images: [
        {
            key: {
                type: String,
                required: true,
            }
        }
    ],
})

const Product = mongoose.model("Product", productSchema)

module.exports = Product