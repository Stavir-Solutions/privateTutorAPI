const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');
const {
    getTeacherIfPasswordMatches,
    getStudentIfPasswordMatches,
    generateAccessToken,
    generateRefreshToken,
    buildStudentRefreshTokenPayload,
    buildTeacherRefreshTokenPayload,
    buildTeacherPayload,
    buildStudentPayload,
    validateToken,
    generateNewTokenFromRefreshToken
} = require('../services/loginService');
const {REFRESH_TOKEN_HEADER} = require('../common/config');
const router = express.Router();
const Joi = require('joi');
router.use(express.json());
const {resetPasswordRequest, resetPasswordWithRequestId} = require('../services/loginService');

const loginSchema = Joi.object({
    userName: Joi.string().alphanum().required(), password: Joi.string().required()
});

router.post('/teacher', async (req, res) => {
    console.log(JSON.stringify(req.body))
    const {error} = loginSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    // validate the username password from the database
    const teacher = await getTeacherIfPasswordMatches(req.body.userName, req.body.password);
    console.log('teacher {}', teacher);
    if (null == teacher) {
        return buildErrorMessage(res, 401, 'Invalid username or password');
    }

    buildSuccessResponse(res, 200, {
        token: await generateAccessToken(buildTeacherPayload(teacher, teacher.id)),
        refreshToken: await generateRefreshToken(buildTeacherRefreshTokenPayload(teacher.id))
    });

    console.log('{} logged in', req.body.userName);
});

router.post('/student', async (req, res) => {
    console.log(JSON.stringify(req.body))
    const {error} = loginSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    // validate the username password from the database
    const student = await getStudentIfPasswordMatches(req.body.userName, req.body.password);
    console.log('student {}', student);
    if (null == student) {
        return buildErrorMessage(res, 401, 'Invalid username or password');
    }

    buildSuccessResponse(res, 200, {
        token: await generateAccessToken(buildStudentPayload(student, student.id)),
        refreshToken: await generateRefreshToken(buildStudentRefreshTokenPayload(student.id))
    });

    console.log('{} logged in', req.body.userName);
});


router.get("/refresh", async (req, res) => {
    const refreshToken = req.get(REFRESH_TOKEN_HEADER);

    if (!refreshToken) {
        return buildErrorMessage(res, 401, 'Invalid refreshToken');
    }
    const payload = await validateToken(refreshToken);
    if (null == payload) {
        return buildErrorMessage(res, 401, 'Refresh token expired or not valid, login again');
    }

    return await generateNewTokenFromRefreshToken(payload, res, refreshToken);
});
router.get('/new-password/:userName/:userType', async (req, res) => {
    const {userName, userType} = req.params;

    if (!userName || !userType) {
        return buildErrorMessage(res, 400, 'Missing userName or userType');
    }

    try {
        const result = await resetPasswordRequest(userName, userType);
        buildSuccessResponse(res, 200, result);
    } catch (err) {
        console.error(err);
        return buildErrorMessage(res, 500, 'user email not found ');
    }
});
router.get('/reset-password/:requestId', async (req, res) => {
    const requestId = req.params.requestId;

    if (!requestId) {
        return res.status(400).json({error: 'Missing requestId'});
    }

    try {
        const result = await resetPasswordWithRequestId(requestId);
        res.json(result);
    } catch (err) {
        res.status(400).json({error: err.message});
    }
});

module.exports = router;