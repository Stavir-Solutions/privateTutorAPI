const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');
const {
    getStudentById,
    getAll,
    deleteById,
    updateStudent,
    getByBatchId,
    createStudent,
    getStudentByIdWithBatchName,
    getStudentByUsername
} = require('../services/studentService');


const router = express.Router();
const Joi = require('joi');
const authMiddleware = require("../middleware/authMiddleware");
router.use(express.json());
router.use(authMiddleware);

const studentSchema = Joi.object({
    firstName: Joi.string().max(50).optional().messages({'string.max': 'First name should not exceed 50 characters.'}),
    lastName: Joi.string().max(50).optional().messages({'string.max': 'Last name should not exceed 50 characters.'}),
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
    email: Joi.string().email().required().messages({'string.email': 'Email must be a valid email address.'}),
    age: Joi.number().integer().optional().messages({
        'number.base': 'Age must be a number.',
    }),
    addressLine1: Joi.string().optional().messages({'string.base': 'Address line 1 must be a string.'}),
    addressCity: Joi.string().optional().messages({'string.base': 'City must be a string.'}),
    addressState: Joi.string().optional().messages({'string.base': 'State must be a string.'}),
    pinCode: Joi.number().optional().messages({'number.base': 'Pin code must be a number.'}),
    profilePicUrl: Joi.string().uri().optional().messages({'string.uri': 'Profile picture URL must be a valid URI.'}),
    gender: Joi.string().valid('male', 'female', 'do not disclose').optional().messages({
        'string.base': 'gender must be a string.',
        'any.only': 'Gender must be : male, female, or do not disclose.',
    }),
    parent1Name: Joi.string().optional().messages({'string.base': 'Parent 1 name must be a string.'}),
    parent1Phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({

        'string.pattern.base': 'Parent 1 phone number must be a valid 10-digit number.'
    }),
    parent1Email: Joi.string().email().optional().messages({'string.email': 'Parent 1 email must be a valid email address.'}),
    parent2Name: Joi.string().optional().messages({'string.base': 'Parent 2 name must be a string.'}),
    parent2Phone: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
        'string.pattern.base': 'Parent 2 phone number must be a valid 10-digit number.'
    }),
    parent2Email: Joi.string().email().optional().messages({'string.email': 'Parent 2 email must be a valid email address.'}),
    batches: Joi.array().items(Joi.string()).optional().messages({'array.base': 'Batches must be an array of strings and strings are uuid of batchId'}),

}).unknown(false);

const studentUpdateSchema = Joi.object({
    firstName: Joi.string().max(50).optional().messages({'string.max': 'First name should not exceed 50 characters.'}),
    lastName: Joi.string().max(50).optional().messages({'string.max': 'Last name should not exceed 50 characters.'}),
    userName: Joi.string().alphanum().min(3).max(30).optional().messages({
        'string.alphanum': 'Username must be alphanumeric.',
        'string.min': 'Username must be at least 3 characters long.',
        'string.max': 'Username must not exceed 30 characters.'
    }),
    password: Joi.string().min(6).max(20).pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*()_+={}:;,.<>?`~|-]*$')).optional().messages({
        'string.min': 'Password must be at least 6 characters long.',
        'string.max': 'Password must not exceed 20 characters.',
        'string.pattern.name': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    }),
    age: Joi.number().integer().optional().messages({
        'number.base': 'Age must be a number.',
        'number.integer': 'Age must be an integer.'
    }),
    addressLine1: Joi.string().optional().messages({'string.base': 'Address line 1 must be a string.'}),
    addressCity: Joi.string().optional().messages({'string.base': 'City must be a string.'}),
    addressState: Joi.string().optional().messages({'string.base': 'State must be a string.'}),
    pinCode: Joi.number().optional().messages({'number.base': 'Pin code must be a number.'}),
    profilePicUrl: Joi.string().uri().optional().messages({'string.uri': 'Profile picture URL must be a valid URI.'}),
    gender: Joi.string().valid('male', 'female', 'do not disclose').optional().messages({
        'string.base': 'geneder must be a string.',
        'any.only': 'Gender must be : male, female, or do not disclose.',
    }),


    parent1Name: Joi.string().optional().messages({'string.base': 'Parent 1 name must be a string.'}),
    parent1Phone: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
        'string.pattern.base': 'Parent 1 phone number must be a valid 10-digit number.'
    }),
    parent1Email: Joi.string().email().optional().messages({'string.email': 'Parent 1 email must be a valid email address.'}),
    parent2Name: Joi.string().optional().messages({'string.base': 'Parent 2 name must be a string.'}),
    parent2Phone: Joi.string().pattern(/^[0-9]{10}$/).optional().messages({
        'string.pattern.base': 'Parent 2 phone number must be a valid 10-digit number.'
    }),
    parent2Email: Joi.string().email().optional().messages({'string.email': 'Parent 2 email must be a valid email address.'}),
    batches: Joi.array().items(Joi.string()).optional().messages({'array.base': 'Batches must be an array of strings and strings are uuid of batchId'}),
}).or(
    'firstName', 'lastName', 'age', 'addressLine1', 'addressCity', 'addressState', 'pinCode',
    'profilePicUrl', 'gender', 'parent1Name', 'parent1Phone', 'parent1Email', 'parent2Name',
    'parent2Phone', 'parent2Email', 'batches', 'userName', 'password'
).unknown(false);

var student = '{' + '  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",\n' + '  "firstName": "Jane",\n' + ' "username": "JaneDoe",\n' + '  "password: "password123",\n' + '  "email": ""jane.doe@example.com"",\n' + '   "lastName": "Doe",\n' + '  "age": 16,\n' + '  "addressLine1": "456 Elm St",\n' + '  "addressCity": "Othertown",\n' + '  "addressState": "Otherstate",\n' + '  "pinCode": 654321,\n' + '  "profilePicUrl": "http://example.com/profile.jpg",\n' + '  "gender": "female",\n' + '  "parent1Name": "John Doe",\n' + '  "parent1Phone": "9876543210",\n' + '  "parent1Email": "john.doe@example.com",\n' + '  "parent2Name": "Mary Doe",\n' + '  "parent2Phone": "0123456789",\n' + '  "parent2Email": "mary.doe@example.com"' + '}';
router.get('/', async (req, res) => {
    students = await getAll(req.params.id);
    console.log('students ', students);
    buildSuccessResponse(res, 200, students);
});

router.get('/:id', async (req, res) => {
    student = await getStudentByIdWithBatchName(req.params.id);
    console.log('student by id ', student);
    buildSuccessResponse(res, 200, student);
});

router.get('/batch/:batchId', async (req, res) => {
    const students = await getByBatchId(req.params.batchId);
    console.log('get students by batch ', req.params.batchId)
    buildSuccessResponse(res, 200, students);
});

router.post('/', async (req, res) => {
    console.log(JSON.stringify(req.body))
    const {error} = studentSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    try {

        let studentId = await createStudent(req.body)
        buildSuccessResponse(res, 200, '{"id":"' + studentId + '"}')
        console.log('created student {}', studentId);
    } catch
        (err) {
        {
            if (err.message === 'userName already exists') {
                return buildErrorMessage(res, 409, 'Username already exists');
            }
        }

    }
});


/* API to update the student */
router.put('/:id', async (req, res) => {
    const {error} = studentUpdateSchema.validate(req.body);
    if (error) {
        console.log('Validation error:', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }

    try {
        console.log('Updating student with data:', req.body);
        let updateResult = await updateStudent(req.params.id, req.body);
        console.log('Updated student:', req.params.id);
        return buildSuccessResponse(res, 200, updateResult);
    } catch (err) {
        {
            if (err.message === 'userName already exists') {
                return buildErrorMessage(res, 409, 'Username already exists');
            }
        }
    }

});

router.delete('/:id', async (req, res) => {
    console.log('Deleting student with id {}', req.params.id);
    let response = deleteById(req.params.id);
    buildSuccessResponse(res, 200, response)
    console.log('deleted student {}', req.params.id);
});

router.get('/userName/:userName', async (req, res) => {

    const {userName} = req.params;

    try {
        const user = await getStudentByUsername(userName);

        if (user) {
            return res.status(200).json({message: ` ${userName} exist`});
        }
        return res.status(404).json({message: ` ${userName} does not exist`});

    } catch (err) {
        console.error('Error checking Student userName:', err);
        return res.status(500).json({error: 'Internal server error'});
    }
});


module.exports = router;