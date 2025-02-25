const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');
const {create} = require('../services/teacherService');
const {createStudent} = require('../services/studentService');


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


const studentSchema = Joi.object({
    firstName: Joi.string().max(50).optional(),
    lastName: Joi.string().max(50).optional(),
    userName: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(20).pattern(new RegExp('^[a-zA-Z0-9]{6,20}$')).required(),
    email: Joi.string().email().optional(),
    age: Joi.number().integer().optional(),
    addressLine1: Joi.string().optional(),
    addressCity: Joi.string().optional(),
    addressState: Joi.string().optional(),
    pinCode: Joi.number().optional(),
    profilePicUrl: Joi.string().uri().optional(),
    gender: Joi.string().valid('male', 'female', 'do not disclose').optional(),
    parent1Name: Joi.string().optional(),
    parent1Phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    parent1Email: Joi.string().email().optional(),
    parent2Name: Joi.string().optional(),
    parent2Phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    parent2Email: Joi.string().email().optional(),
    batches: Joi.array().items(Joi.string()).optional(),

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
    buildSuccessResponse(res, 200, {token: await generateToken(buildTeacherPayload(req.body, teacherId)) });
    console.log('created teacher {}', teacherId);
});


router.post('/students', async (req, res) => {
    console.log(JSON.stringify(req.body))
    const {error} = studentSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('creating student {}', req.body);
    let studentId = await createStudent(req.body)
    buildSuccessResponse(res, 200, {token: await generateToken(buildTeacherPayload(req.body,studentId)) });
    console.log('created student {}', studentId);
});

module.exports = router;