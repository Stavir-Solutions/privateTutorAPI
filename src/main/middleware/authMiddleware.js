const {validateToken} = require('../services/loginService');
const {buildErrorMessage} = require('../routes/responseUtils');

async function authMiddleware(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    let isValid = await validateToken(token);
    console.log('isValid ', isValid);
    if (!isValid) {
        return buildErrorMessage(res, 401, 'invalid token. send your login response token as bearer <token>');
    }
    next();
}

module.exports = authMiddleware;

