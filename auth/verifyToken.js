const jwt = require('jsonwebtoken')


exports.verifyAccessToken = (req, res, next) => {
    const token = req.cookies.accesstoken

    if (!token) {
        return res.status(401).json({ success: 'unauthorized', msg: 'Token not found' })
    }
    jwt.verify(token, process.env.ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ success: 'unauthorized', msg: 'Token is not valid:- ', err })
        }
        req.userId = user.userData.id
        next()
    })
}