const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');

const router = express.Router();
const Joi = require('joi');
router.use(express.json());

const teacherSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    userName: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(20).pattern(new RegExp('^[a-zA-Z0-9]{6,20}$')).required(),
    age: Joi.number().integer().min(18).optional(),
    gender: Joi.string().valid('male', 'female', 'do not reveal').required(),
    addressLine1: Joi.string().required(),
    addressCity: Joi.string().optional(),
    addressState: Joi.string().optional(),
    pinCode: Joi.number().required(),
    profilePicUrl: Joi.string().uri().optional(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
    upiId: Joi.string().required(),
    accountNumber: Joi.string().required(),
    accountName: Joi.string().required(),
    ifscCode: Joi.string().required()

});

var teacher = '{' + '  "id": "550e8400-e29b-41d4-a716-446655440000",\n' + '  "firstName": "John",\n' + '  "lastName": "Doe",\n' + '  "userName": "johndoe",\n' + '  "password": "password123",\n' + '  "age": 30,\n' + '  "gender": "male",\n' + '  "addressLine1": "123 Main St",\n' + '  "addressCity": "Anytown",\n' + '  "addressState": "Anystate",\n' + '  "pinCode": 123456,\n' + '  "profilePicUrl": "http://example.com/profile.jpg",\n' + '  "email": "john.doe@example.com",\n' + '  "phoneNumber": "1234567890",\n' + '  "upiId": "john@upi",\n' + '  "accountNumber": "1234567890",\n' + '  "accountName": "John Doe",\n' + '  "ifscCode": "IFSC0001234"\n' + '}';


router.get('/', (req, res) => {
    buildSuccessResponse(res, 200, '[' + teacher + ']');
});

router.get('/:id', (req, res) => {
    buildSuccessResponse(res, 200, teacher);
});


router.post('/', (req, res) => {
    console.log(JSON.stringify(req.body))
    const {error} = teacherSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('creating teacher {}', req.body);
    buildSuccessResponse(res, 200, '{"id":"550e8400-e29b-41d4-a716-446655440000"}')
    console.log('created teacher {}', "550e8400-e29b-41d4-a716-446655440000");
});


/* API to update the teacher */
router.put('/:id', (req, res) => {
    const {error} = teacherSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('updating teacher {}', req.body);
    buildSuccessResponse(res, 200, '{}')
    console.log('updated teacher {}', "550e8400-e29b-41d4-a716-446655440000");
});

router.delete('/:id', (req, res) => {
    console.log('Deleting teacher with id {}', req.params.id);
    buildSuccessResponse(res, 200, '{}')
    console.log('deleted teacher {}', "550e8400-e29b-41d4-a716-446655440000");
});


module.exports = router;