const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');
const {create, getStudentById, getAll, deleteById, updateStudent, getByBatchId, createStudent} = require('../services/studentService');


const router = express.Router();
const Joi = require('joi');
const authMiddleware = require("../middleware/authMiddleware");
router.use(express.json());
router.use(authMiddleware);

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

const studentUpdateSchema = Joi.object({
    firstName: Joi.string().max(50).optional(),
    lastName: Joi.string().max(50).optional(),
    userName: Joi.string().alphanum().min(3).max(30).optional(),
    password: Joi.string().min(6).max(20).pattern(new RegExp('^[a-zA-Z0-9]{6,20}$')).required(),
    age: Joi.number().integer().optional(),
    addressLine1: Joi.string().optional(),
    addressCity: Joi.string().optional(),
    addressState: Joi.string().optional(),
    pinCode: Joi.number().optional(),
    profilePicUrl: Joi.string().uri().optional(),
    gender: Joi.string().valid('male', 'female', 'do not disclose').optional(),
    parent1Name: Joi.string().optional(),
    parent1Phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    parent1Email: Joi.string().email().optional(),
    parent2Name: Joi.string().optional(),
    parent2Phone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    parent2Email: Joi.string().email().optional(),
    batches: Joi.array().items(Joi.string()).optional(),
}).or(
    'firstName', 'lastName', 'age', 'addressLine1', 'addressCity', 'addressState', 'pinCode',
    'profilePicUrl', 'gender', 'parent1Name', 'parent1Phone', 'parent1Email', 'parent2Name',
    'parent2Phone', 'parent2Email', 'batches', 'userName', 'password'
).unknown(false);

var student = '{' + '  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",\n' + '  "firstName": "Jane",\n' + ' "username": "JaneDoe",\n' + '  "password: "password123",\n' + '  "email": ""jane.doe@example.com"",\n' + '   "lastName": "Doe",\n' + '  "age": 16,\n' + '  "addressLine1": "456 Elm St",\n' + '  "addressCity": "Othertown",\n' + '  "addressState": "Otherstate",\n' + '  "pinCode": 654321,\n' + '  "profilePicUrl": "http://example.com/profile.jpg",\n' + '  "gender": "female",\n' + '  "parent1Name": "John Doe",\n' + '  "parent1Phone": "9876543210",\n' + '  "parent1Email": "john.doe@example.com",\n' + '  "parent2Name": "Mary Doe",\n' + '  "parent2Phone": "0123456789",\n' + '  "parent2Email": "mary.doe@example.com"'  +  '}';
router.get('/', async (req, res) => {
    students = await getAll(req.params.id);
    console.log('students ', students);
    buildSuccessResponse(res, 200, students);
});

router.get('/:id', async (req, res) => {
    student = await getStudentById(req.params.id);
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
    let studentId = await createStudent(req.body)
    buildSuccessResponse(res, 200, '{"id":"' + studentId + '"}')
    console.log('created student {}', studentId);
});


/* API to update the student */
router.put('/:id', async (req, res) => {
    const {error} = studentUpdateSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('updating student {}', req.body);
    let updateResult = await updateStudent(req.params.id, req.body);
    buildSuccessResponse(res, 200, updateResult)
    console.log('updated student {}', req.params.id);
});

router.delete('/:id', async (req, res) => {
    console.log('Deleting student with id {}', req.params.id);
    let response = deleteById(req.params.id);
    buildSuccessResponse(res, 200, response)
    console.log('deleted student {}', req.params.id);
});


module.exports = router;