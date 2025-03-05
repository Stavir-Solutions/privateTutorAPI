const {validateToken} = require('../services/loginService');
const {buildErrorMessage} = require('../routes/responseUtils');
const UserType = require("../common/UserType");

const teacherOnlyUrls = ["/teachers/"] //TODO add more.
const studentOnlyUrls = ["/students/"] //TODO add more.

function isTeacherUrl(req) {
    for (const url of teacherOnlyUrls) {
        if (req.originalUrl.includes(url)) {
            console.log('a teacher url')
            return true;
        }
    }
    return false;
}

function isStudentUrl(req) {
    for (const url of studentOnlyUrls) {
        if (req.originalUrl.includes(url)) {
            console.log('a student url')
            return true;
        }
    }
    return false;
}

async function authMiddleware(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    let decodedToken = await validateToken(token);


    console.log('decodedToken', decodedToken);
    if (!decodedToken) {
        return buildErrorMessage(res, 401, 'invalid token. send your login response token as bearer <token>');
    }


    // THE following commented code will be revisisted later
    // console.log('req.originalUrl', req.originalUrl);
    //
    // if (isTeacherUrl(req) && decodedToken.userType !== UserType.TEACHER) {
    //     return buildErrorMessage(res, 403, 'Forbidden. You are not authorized to access this teacher resource');
    //     // TODO make sure that a teacher can access only his data
    // }
    //
    // if (isStudentUrl(req) && decodedToken.userType !== UserType.STUDENT) {
    //     return buildErrorMessage(res, 403, 'Forbidden. You are not authorized to access this teacher resource');
    //     // TODO make sure that a student can access only his data
    // }
    next();

}

module.exports = authMiddleware;

