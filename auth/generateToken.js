const jwt = require('jsonwebtoken')
const { createHmac,randomBytes } = require('node:crypto');


exports.generateAccessToken = (userData) => {
    const token = jwt.sign({ userData }, process.env.ACCESS_KEY, { expiresIn: '1d' })
    return token
}
exports.generateRefreshToken = () => {
    const token = randomBytes(64).toString('hex')
    return token
}
exports.hashFn = (token) => {
    const hashToken = createHmac('sha256', 'a secret').update(token).digest('hex');
    return hashToken
}