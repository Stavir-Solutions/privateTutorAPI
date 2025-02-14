const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');
const {create, getById, getAll, deleteById, update} = require('../services/teacherService');

const router = express.Router();
const Joi = require('joi');
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

const teacherUpdateSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    userName: Joi.string().alphanum().min(3).max(30).optional(),
    password: Joi.string().min(6).max(20).pattern(new RegExp('^[a-zA-Z0-9]{6,20}$')).optional(),
    age: Joi.number().integer().min(18).optional(),
    gender: Joi.string().valid('male', 'female', 'do not reveal').optional(),
    addressLine1: Joi.string().optional(),
    addressCity: Joi.string().optional(),
    addressState: Joi.string().optional(),
    pinCode: Joi.number().optional(),
    profilePicUrl: Joi.string().uri().optional(),
    email: Joi.string().email().optional(),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    upiId: Joi.string().optional(),
    accountNumber: Joi.string().optional(),
    accountName: Joi.string().optional(),
    ifscCode: Joi.string().optional()

}).or(
    'firstName', 'lastName', 'userName', 'password', 'age', 'gender', 'addressLine1',
    'addressCity', 'addressState', 'pinCode', 'profilePicUrl', 'phoneNumber',
    'upiId', 'accountNumber', 'accountName', 'ifscCode'
).unknown(false);


var teacher = '{' + '  "id": "550e8400-e29b-41d4-a716-446655440000",\n' + '  "firstName": "John",\n' + '  "lastName": "Doe",\n' + '  "userName": "johndoe",\n' + '  "password": "password123",\n' + '  "age": 30,\n' + '  "gender": "male",\n' + '  "addressLine1": "123 Main St",\n' + '  "addressCity": "Anytown",\n' + '  "addressState": "Anystate",\n' + '  "pinCode": 123456,\n' + '  "profilePicUrl": "http://example.com/profile.jpg",\n' + '  "email": "john.doe@example.com",\n' + '  "phoneNumber": "1234567890",\n' + '  "upiId": "john@upi",\n' + '  "accountNumber": "1234567890",\n' + '  "accountName": "John Doe",\n' + '  "ifscCode": "IFSC0001234"\n' + '}';


router.get('/', async (req, res) => {
    teachers = await getAll(req.params.id);
    console.log('teachers ', teachers);
    buildSuccessResponse(res, 200, teachers);
});

router.get('/:id', async (req, res) => {
    teacher = await getById(req.params.id);
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
    console.log('creating teacher {}', req.body);
    let teacherId = await create(req.body)
    buildSuccessResponse(res, 200, '{"id":"' + teacherId + '"}')
    console.log('created teacher {}', teacherId);
});


/* API to update the teacher */
router.put('/:id', async (req, res) => {
    const {error} = teacherUpdateSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('updating teacher {}', req.body);
    let updateResult = await update(req.params.id, req.body);
    buildSuccessResponse(res, 200, updateResult)
    console.log('updated teacher {}', req.params.id);
});

router.delete('/:id', (req, res) => {
    console.log('Deleting teacher with id {}', req.params.id);
    let response = deleteById(req.params.id);
    buildSuccessResponse(res, 200, response)
    console.log('deleted teacher {}', req.params.id);
});


module.exports = router;