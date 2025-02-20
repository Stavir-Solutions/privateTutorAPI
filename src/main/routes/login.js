const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');
const {
    getTeacherIfPasswordMatches,
    getStudentIfPasswordMatches,
    generateToken,
    buildTeacherPayload,
    buildStudentPayload
} = require('../services/loginService');

const router = express.Router();
const Joi = require('joi');
router.use(express.json());

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

    buildSuccessResponse(res, 200, {token: await generateToken(buildTeacherPayload(teacher))  });

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

    buildSuccessResponse(res, 200, {token: await generateToken(buildStudentPayload(student)) });

    console.log('{} logged in', req.body.userName);
});

module.exports = router;