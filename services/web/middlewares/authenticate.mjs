import users from '../data-layer/users.mjs'

const authenticate = async (req, res, next) => {
    if (!req.headers.authorization) {
        return next()
    }
    const token = req.headers.authorization.substring(7)
    req.user = await users.findByToken(token)
    return next()
}

export default authenticate
