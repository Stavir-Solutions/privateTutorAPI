const express = require('express');
const { buildSuccessResponse, buildErrorMessage } = require('./responseUtils');
const { create } = require('../services/teacherService');
const { createStudent } = require('../services/studentService');


const router = express.Router();
const Joi = require('joi');
const { generateAccessToken, buildTeacherPayload, buildStudentPayload } = require("../services/loginService");
router.use(express.json());

const teacherSchema = Joi.object({
    firstName: Joi.string().optional().messages({ 'string.max': 'First name should not exceed 50 characters.' }),
    lastName: Joi.string().optional().messages({ 'string.max': 'Last name should not exceed 50 characters.' }),
    userName: Joi.string().alphanum().min(3).max(30).required().messages({
        'string.alphanum': 'Username must be alphanumeric.',
        'string.min': 'Username must be at least 3 characters long.',
        'string.max': 'Username must not exceed 30 characters.'
    }),

    password: Joi.string().min(6).max(20).pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*()_+={}:;,.<>?`~|-]*$')).required().messages({
        'string.min': 'Password must be at least 6 characters long.',
        'string.max': 'Password must not exceed 20 characters.',
        'string.pattern.name': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    }),
    age: Joi.number().integer().min(18).optional().messages({
        'number.base': 'Age must be a number.',
        'number.min': 'Age must be at least 18.'
    }),
    gender: Joi.string().valid('male', 'female', 'do not reveal').messages({
        'any.only': 'Gender must be one of male, female, or do not reveal.'
    }).optional(),
    addressLine1: Joi.string().optional().messages({ 'string.base': 'Address line 1 must be a string.' }),
    addressCity: Joi.string().optional().messages({ 'string.base': 'City must be a string.' }),
    addressState: Joi.string().optional().messages({ 'string.base': 'State must be a string.' }),
    pinCode: Joi.number().optional().messages({ 'number.base': 'Pin code must be a number.' }),
    profilePicUrl: Joi.string().uri().optional().messages({ 'string.uri': 'Profile picture URL must be a valid URI.' }),
    email: Joi.string().email().optional().messages({ 'string.email': 'Email must be a valid email address.' }),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Phone number must be a valid 10-digit number.'
    }),
    upiId: Joi.string().optional().messages({ 'string.base': 'UPI ID must be a string.' }),
    accountNumber: Joi.string().optional().messages({ 'string.base': 'Account number must be a string.' }),
    accountName: Joi.string().optional().messages({ 'string.base': 'Account name must be a string.' }),
    ifscCode: Joi.string().optional().messages({ 'string.base': 'IFSC code must be a string.' }),

}).unknown(false);

const studentSchema = Joi.object({
    firstName: Joi.string().max(50).optional().messages({ 'string.max': 'First name should not exceed 50 characters.' }),
    lastName: Joi.string().max(50).optional().messages({ 'string.max': 'Last name should not exceed 50 characters.' }),
    userName: Joi.string().alphanum().min(3).max(30).required().messages({
        'string.alphanum': 'Username must be alphanumeric.',
        'string.min': 'Username must be at least 3 characters long.',
        'string.max': 'Username must not exceed 30 characters.'
    }),
    password: Joi.string().min(6).max(20).pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*()_+={}:;,.<>?`~|-]*$')).required().messages({
        'string.min': 'Password must be at least 6 characters long.',
        'string.max': 'Password must not exceed 20 characters.',
        'string.pattern.name': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    }),
    email: Joi.string().email().optional().messages({ 'string.email': 'Email must be a valid email address.' }),
    age: Joi.number().integer().optional().messages({
        'number.base': 'Age must be a number.',
        'number.integer': 'Age must be an integer.'
    }),
    addressLine1: Joi.string().optional().messages({ 'string.base': 'Address line 1 must be a string.' }),
    addressCity: Joi.string().optional().messages({ 'string.base': 'City must be a string.' }),
    addressState: Joi.string().optional().messages({ 'string.base': 'State must be a string.' }),
    pinCode: Joi.number().optional().messages({ 'number.base': 'Pin code must be a number.' }),
    profilePicUrl: Joi.string().uri().optional().messages({ 'string.uri': 'Profile picture URL must be a valid URI.' }),
    gender: Joi.string().valid('male', 'female', 'do not reveal').optional().messages({
        'any.only': 'Gender must be one of male, female, or do not reveal.'
    }),
    parent1Name: Joi.string().optional().messages({ 'string.base': 'Parent 1 name must be a string.' }),
    parent1Phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Parent 1 phone number must be a valid 10-digit number.'
    }),
    parent1Email: Joi.string().email().optional().messages({ 'string.email': 'Parent 1 email must be a valid email address.' }),
    parent2Name: Joi.string().optional().messages({ 'string.base': 'Parent 2 name must be a string.' }),
    parent2Phone: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
        'string.pattern.base': 'Parent 2 phone number must be a valid 10-digit number.'
    }),
    parent2Email: Joi.string().email().optional().messages({ 'string.email': 'Parent 2 email must be a valid email address.' }),
    batches: Joi.array().items(Joi.string()).optional().messages({ 'array.base': 'Batches must be an array of strings and strings are uuid of batchId' }),

}).unknown(false);


router.post('/teachers', async (req, res) => {
    console.log(JSON.stringify(req.body))
    const { error } = teacherSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('creating teacher {}', req.body);
    let teacherId = await create(req.body)
    buildSuccessResponse(res, 200, { token: await generateAccessToken(buildTeacherPayload(req.body, teacherId)) });
    console.log('created teacher {}', teacherId);
});


router.post('/students', async (req, res) => {
    console.log(JSON.stringify(req.body))
    const { error } = studentSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('creating student {}', req.body);
    let studentId = await createStudent(req.body)
    buildSuccessResponse(res, 200, { token: await generateAccessToken(buildStudentPayload(req.body, studentId)) });
    console.log('created student {}', studentId);
});

module.exports = router;