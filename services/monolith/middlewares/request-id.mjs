import {v4 as uuid} from 'uuid'

const requestId = async (req, res, next) => {
    console.log('auth')

    if (!req.headers['x-request-id']) {
        req.headers['x-request-id'] = uuid()
    }

    return next()
}

export default requestId
