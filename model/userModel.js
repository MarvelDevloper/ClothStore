const mongoose = require('mongoose')
const validator=require('validator')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique:true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value)
            },
            message: "Invalid email format"
        },
        lowercase:true
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'password is not strong'],
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        maxlength: [10, 'please enter the valid phone number'],
        validate: {
            validator: function (value) {
                return validator.isMobilePhone(value)
            },
            message: "Invalid phone number"
        },
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    totalPrice: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema)


module.exports = User