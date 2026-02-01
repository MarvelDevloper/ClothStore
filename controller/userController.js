const { generateAccessToken, generateRefreshToken, hashFn } = require('../auth/generateToken')
const { asyncHandler, ApiError } = require('../middleware/errorHandler')
const User = require('../model/userModel')
const bcryptjs = require('bcryptjs')
const redis = require('../redisConfig/redis')

const userController = {
    signup: asyncHandler(async (req, res) => {
        const { email, password, name, address, role,phone} = req.body

        if (!name || !email || !password || !address) {
            throw new ApiError('all fields required', 400)
        }

        const existUser = await User.findOne({ email: email })

        if (existUser) {
            throw new ApiError('account already exist', 400)
        }

        const hashPassword = await bcryptjs.hash(password, 10)

        const user = new User({
            name, email, password: hashPassword, address, role: role || 'user',phone
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
    })
}

module.exports = userController