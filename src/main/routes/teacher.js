const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');
const {
    create,
    getTeacherById,
    getAll,
    deleteById,
    update,
    getTeacherByUserName
} = require('../services/teacherService');
const {validateToken} = require('../services/loginService')
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const Joi = require('joi');
router.use(express.json());
router.use(authMiddleware);

const teacherSchema = Joi.object({
    firstName: Joi.string().optional().messages({'string.max': 'First name should not exceed 50 characters.'}),
    lastName: Joi.string().optional().messages({'string.max': 'Last name should not exceed 50 characters'}),
    userName: Joi.string().alphanum().min(3).max(30).required().messages({
        'string.alphanum': 'userName must be alphanumeric.',
        'string.min': 'userName must be at least 3 characters long.',
        'string.max': 'userName must not exceed 30 characters.'
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
    gender: Joi.string().valid('male', 'female', 'do not reveal').optional().messages({
        'string.base': 'Gender must be a string.',
        'any.only': 'Gender must be one of the following: male, female, or do not reveal.'
    }),
    addressLine1: Joi.string().optional().messages({
        'string.base': 'Address line 1 must be a string.'
    }),
    addressCity: Joi.string().optional().messages({
        'string.base': 'City must be a string.'
    }),
    addressState: Joi.string().optional().messages({
        'string.base': 'State must be a string.'
    }),
    pinCode: Joi.number().optional().messages({
        'number.base': 'Pin code must be a number.'
    }),
    profilePicUrl: Joi.string().uri().optional().messages({
        'string.uri': 'Profile picture URL must be a valid URI.'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address.'
    }),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Phone number must be a valid 10-digit number.'
    }),
    upiId: Joi.string().optional().messages({
        'string.base': 'UPI ID must be a string.'
    }),
    accountNumber: Joi.string().optional().messages({
        'string.base': 'Account number must be a string.'
    }),
    accountName: Joi.string().optional().messages({
        'string.base': 'Account name must be a string.'
    }),
    ifscCode: Joi.string().optional().messages({
        'string.base': 'IFSC code must be a string.'
    }),

}).unknown(false);


const teacherUpdateSchema = Joi.object({
    firstName: Joi.string().optional().messages({'string.max': 'First name should not exceed 50 characters.'}),
    lastName: Joi.string().optional().messages({'string.max': 'Last name should not exceed 50 characters.'}),
    userName: Joi.string().alphanum().min(3).max(30).optional().messages({
        'string.alphanum': 'userName must be alphanumeric.',
        'string.min': 'userName must be at least 3 characters long.',
        'string.max': 'userName must not exceed 30 characters.'
    }),
    password: Joi.string().min(6).max(20).pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*()_+={}:;,.<>?`~|-]*$')).optional().messages({
        'string.min': 'Password must be at least 6 characters long.',
        'string.max': 'Password must not exceed 20 characters.',
        'string.pattern.name': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    }),
    age: Joi.number().integer().min(18).optional().messages({
        'number.base': 'Age must be a number.',
        'number.min': 'Age must be at least 18.'
    }),
    gender: Joi.string().valid('male', 'female', 'do not reveal').optional().messages({
        'string.base': 'Gender must be a string.',
        'any.only': 'Gender must be one of the following: male, female, or do not reveal.'
    }),
    addressLine1: Joi.string().optional().messages({
        'string.base': 'Address line 1 must be a string.'
    }),
    addressCity: Joi.string().optional().messages({
        'string.base': 'City must be a string.'
    }),
    addressState: Joi.string().optional().messages({
        'string.base': 'State must be a string.'
    }),
    pinCode: Joi.number().optional().messages({
        'number.base': 'Pin code must be a number.'
    }),
    profilePicUrl: Joi.string().uri().optional().messages({
        'string.uri': 'Profile picture URL must be a valid URI.'
    }),
    email: Joi.string().email().optional().messages({
        'string.email': 'Email must be a valid email address.'
    }),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Phone number must be a valid 10-digit number.'
    }),
    upiId: Joi.string().optional().messages({
        'string.base': 'UPI ID must be a string.'
    }),
    accountNumber: Joi.string().optional().messages({
        'string.base': 'Account number must be a string.'
    }),
    accountName: Joi.string().optional().messages({
        'string.base': 'Account name must be a string.'
    }),
    ifscCode: Joi.string().optional().messages({
        'string.base': 'IFSC code must be a string.'
    }),

}).or('firstName', 'lastName', 'userName', 'password', 'age', 'gender', 'addressLine1', 'addressCity', 'addressState', 'pinCode', 'profilePicUrl', 'phoneNumber', 'upiId', 'accountNumber', 'accountName', 'ifscCode').unknown(false);

router.get('/', async (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];
    let isValid = await validateToken(token);
    console.log('isValid ', isValid);
    if (!isValid) {
        buildErrorMessage(res, 401, 'invalid token send your login response token as bearer <token>');
        return;
    }
    teachers = await getAll(req.params.id);
    console.log('teachers ', teachers);
    buildSuccessResponse(res, 200, teachers);
});

router.get('/:id', async (req, res) => {
    teacher = await getTeacherById(req.params.id);
    console.log('teacher by id ', teacher);
    buildSuccessResponse(res, 200, teacher);
});


router.post('/', async (req, res) => {
    console.log(JSON.stringify(req.body))
    const {error} = teacherSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    try {
        console.log('creating teacher {}', req.body);
        let teacherId = await create(req.body)
        buildSuccessResponse(res, 200, '{"id":"' + teacherId + '"}')
        console.log('created teacher {}', teacherId);
    } catch (err) {
        if (err.message === 'userName already exists') {
            return buildErrorMessage(res, 409, 'Username already exists');
        }
    }
});

/* API to update the teacher */
router.put('/:id', async (req, res) => {
    const {error} = teacherUpdateSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    try {
        console.log('updating teacher {}', req.body);
        let updateResult = await update(req.params.id, req.body);
        buildSuccessResponse(res, 200, updateResult)
        console.log('updated teacher {}', req.params.id);

    } catch (err) {
        {
            if (err.message === 'userName already exists') {
                return buildErrorMessage(res, 409, 'Username already exists');
            }
        }
    }

});

router.delete('/:id', (req, res) => {
    console.log('Deleting teacher with id {}', req.params.id);
    let response = deleteById(req.params.id);
    buildSuccessResponse(res, 200, response)
    console.log('deleted teacher {}', req.params.id);
});

router.get('/userName/:userName', async (req, res) => {

    const {userName} = req.params;

    try {
        const user = await getTeacherByUserName(userName);

        if (user) {
            return res.status(200).json({message: ` ${userName} exist`});
        }
        return res.status(404).json({message: ` ${userName} does not exist`});

    } catch (err) {
        console.error('Error checking teacher userName:', err);
        return res.status(500).json({error: 'Internal server error'});
    }
});


module.exports = router;
