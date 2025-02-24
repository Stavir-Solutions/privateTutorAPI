const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');
const {create} = require('../services/teacherService');

const router = express.Router();
const Joi = require('joi');
const {generateToken, buildTeacherPayload} = require("../services/loginService");
router.use(express.json());

const teacherSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    userName: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(20).pattern(new RegExp('^[a-zA-Z0-9]{6,20}$')).required(),
    age: Joi.number().integer().min(18).optional(),
    gender: Joi.string().valid('male', 'female', 'do not reveal').optional(),
    addressLine1: Joi.string().optional(),
    addressCity: Joi.string().optional(),
    addressState: Joi.string().optional(),
    pinCode: Joi.number().optional(),
    profilePicUrl: Joi.string().uri().optional(),
    email: Joi.string().email().optional(),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
    upiId: Joi.string().optional(),
    accountNumber: Joi.string().optional(),
    accountName: Joi.string().optional(),
    ifscCode: Joi.string().optional()

}).unknown(false);


router.post('/teachers', async (req, res) => {
    console.log(JSON.stringify(req.body))
    const {error} = teacherSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('creating teacher {}', req.body);
    let teacherId = await create(req.body)
    buildSuccessResponse(res, 200, {token: await generateToken(buildTeacherPayload(req.body))  });
    console.log('created teacher {}', teacherId);
});


module.exports = router;