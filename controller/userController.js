const { generateAccessToken, generateRefreshToken, hashFn } = require('../auth/generateToken')
const { asyncHandler, ApiError } = require('../middleware/errorHandler')
const User = require('../model/userModel')
const bcryptjs = require('bcryptjs')
const redis = require('../redisConfig/redis')
const Cart = require('../model/cartModel')
const Product = require('../model/productModel')

const userController = {
    signup: asyncHandler(async (req, res) => {
        const { email, password, name, address, role, phone } = req.body

        if (!name || !email || !password || !address) {
            throw new ApiError('all fields required', 400)
        }

        const existUser = await User.findOne({ email: email })

        if (existUser) {
            throw new ApiError('account already exist', 400)
        }

        const hashPassword = await bcryptjs.hash(password, 10)

        const user = new User({
            name, email, password: hashPassword, address, role: role || 'user', phone
        })

        await user.save()

        return res.status(200).json({ success: true, msg: 'user register successfully done!' })
    }),
    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body

        if (!email || !password) {
            throw new ApiError('all fields required', 400)
        }

        const existUser = await User.findOne({ email: email })

        if (!existUser) {
            throw new ApiError('invalid password or email', 400)
        }

        const isValid = await bcryptjs.compare(password, existUser.password)

        if (!isValid) {
            throw new ApiError('invalid password or email', 400)
        }

        const access = generateAccessToken({ id: existUser.id })
        const refresh = generateRefreshToken()

        console.log(hashFn("Hello world"))

        await redis.set(`refresh:${hashFn(refresh)}`, existUser.id, "EX", 7 * 24 * 60 * 60)

        res.cookie('accesstoken', access, {
            httpOnly: true,
            sameSite: "lax",
            secure: true,
            maxAge: 15 * 60 * 1000
        })

        res.cookie('refreshtoken', refresh, {
            httpOnly: true,
            sameSite: "lax",
            path: '/auth/refresh',
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(200).json({ success: true, msg: "login successfully done", token: access })
    }),
    verifyRefreshToken: asyncHandler(async (req, res) => {
        const token = req.cookies.refreshtoken

        if (!token) {
            throw new ApiError('Token Not found!', 403)
        }

        const userId = await redis.get(`refresh:${hashFn(token)}`)

        if (!userId) {
            throw new ApiError('session expired please login again', 401)
        }

        await redis.del(`refresh:${hashFn(token)}`)

        const newRefreshtoken = generateRefreshToken()
        const newAccesstoken = generateAccessToken({ id: userId })

        await redis.set(`refresh:${hashFn(newRefreshtoken)}`, userId, "EX", 7 * 24 * 60 * 60)

        res.cookie('accesstoken', newAccesstoken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 15 * 60 * 1000
        })

        res.cookie('refreshtoken', newRefreshtoken, {
            httpOnly: true,
            sameSite: "None",
            path: '/auth/refresh',
            secure: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({ success: true, token: newAccesstoken })
    }),
    change_password: asyncHandler(async (req, res) => {
        const userId = req.userId
        const { oldpassword, newPassword } = req.body

        if (!oldpassword || !newPassword) {
            throw new ApiError('all fields required', 400)
        }
        const existUser = await User.findById(userId)

        if (!existUser) {
            throw new ApiError('user not found', 400)
        }

        const isValid = await bcryptjs.compare(oldpassword, existUser.password)

        if (!isValid) {
            throw new ApiError('invalid password', 401)
        }
        const newHashPassword = await bcryptjs.hash(newPassword, 10)

        existUser.password = newHashPassword

        await existUser.save()

        return res.status(200).json({ success: true, msg: 'password successfully updated' })
    }),
    get_profile: asyncHandler(async (req, res) => {
        const userId = req.userId

        if (!userId) {
            throw new ApiError("userId found!", 400)
        }

        const existUser = await User.findById(userId).select('name email address phone role')

        if (!existUser) {
            throw new ApiError("user not found!", 400)
        }

        return res.status(200).json({ success: true, profile: existUser })
    }),
    update_Profile: asyncHandler(async (req, res) => {
        const userId = req.userId

        if (!userId) {
            throw new ApiError('user not found!', 400)
        }

        const updateUserProfile = await User.findByIdAndUpdate(userId, req.body, { new: true })

        if (!updateUserProfile) {
            throw new ApiError('failed to update profile!', 400)
        }

        return res.status(200).json({ sucess: true, msg: 'profile updated successfully', updateUserProfile })
    }),
    addCart: asyncHandler(async (req, res) => {
        const { cart } = req.body
        const userId = req.userId

        if (!cart || cart.length === 0) {
            throw new ApiError('all fields required', 400)
        }

        const productIds = cart.map((product) => {
            return product.productId
        })

        // console.log(cart)
        const data = await Promise.all(productIds.map(async (productId, index) => {
            const Price = await Product.findById(productId).select('price')
            cart[index].price = Price.price
            return cart.price
        }))

        const existCart = await Cart.findOne({ userId: userId })

        if (existCart) {
            cart.forEach((product) => {
                const index = existCart.cart.findIndex((existProduct) => {
                    return (existProduct.productId.toString() === product.productId.toString())
                })

                if (index > -1) {
                    existCart.cart[index].quantity += product.quantity
                    existCart.cart[index].price = product.price
                } else {
                    existCart.cart.push(product)
                }
            })
            existCart.totalPrice = existCart.cart.reduce((acc, product) => {
                return acc = acc + (product.price * product.quantity)
            }, 0)

            await existCart.save()

            return res.status(200).json({ success: true, msg: "cart updated successfully!" })
        }
        const totalprice = cart.reduce((acc, product) => {
            return acc = acc + (product.price * product.quantity)
        }, 0)
        const cartItems = new Cart({
            userId,
            cart,
            totalPrice: totalprice
        })

        await cartItems.save()

        return res.status(201).json({ success: true, msg: 'product added to cart!' })
    }),
}

module.exports = userController