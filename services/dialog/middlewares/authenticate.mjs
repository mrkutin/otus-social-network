import axios from 'axios'

const MONOLITH_HOST = process.env.MONOLITH_HOST || '0.0.0.0'
const MONOLITH_PORT = process.env.MONOLITH_PORT || 3000

const authenticate = async (req, res, next) => {
    console.log('auth req.headers.authorization:', req.headers.authorization)

    if (req.headers.authorization) {
        try {
            const {data: user} = await axios.post(
                `http://${MONOLITH_HOST}:${MONOLITH_PORT}/user/authenticate`,
                {},
                {
                    headers: {
                        authorization: req.headers.authorization,
                        'x-request-id': req.headers['x-request-id']
                    }
                }
            )
            req.user = user
        } catch (e) {
            req.user = null
            console.log(e)
        }
    }

    return next()
}

export default authenticate
