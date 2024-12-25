const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');

const router = express.Router();
const Joi = require('joi');
router.use(express.json());

const studentSchema = Joi.object({
    firstName: Joi.string().max(50).required(),
    lastName: Joi.string().max(50).optional(),
    age: Joi.number().integer().optional(),
    addressLine1: Joi.string().required(),
    addressCity: Joi.string().optional(),
    addressState: Joi.string().optional(),
    pinCode: Joi.number().required(),
    profilePicUrl: Joi.string().uri().optional(),
    gender: Joi.string().valid('male', 'female', 'do not disclose').required(),
    parent1Name: Joi.string().required(),
    parent1Phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    parent1Email: Joi.string().email().optional(),
    parent2Name: Joi.string().optional(),
    parent2Phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    parent2Email: Joi.string().email().optional()
});

var student = '{' + '  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",\n' + '  "firstName": "Jane",\n' + '  "lastName": "Doe",\n' + '  "age": 16,\n' + '  "addressLine1": "456 Elm St",\n' + '  "addressCity": "Othertown",\n' + '  "addressState": "Otherstate",\n' + '  "pinCode": 654321,\n' + '  "profilePicUrl": "http://example.com/profile.jpg",\n' + '  "gender": "female",\n' + '  "parent1Name": "John Doe",\n' + '  "parent1Phone": "9876543210",\n' + '  "parent1Email": "john.doe@example.com",\n' + '  "parent2Name": "Mary Doe",\n' + '  "parent2Phone": "0123456789",\n' + '  "parent2Email": "mary.doe@example.com"' + '}';

router.get('/', (req, res) => {
    buildSuccessResponse(res, 200, '[' + student + ']');
});

router.get('/:id', (req, res) => {
    console.log('get students by id  ', req.params.id)
    buildSuccessResponse(res, 200, student);
});

router.get('/batch/:batchId', (req, res) => {
    console.log('get students by batch ', req.params.batchId)
    buildSuccessResponse(res, 200, student);
});

router.post('/', (req, res) => {
    console.log(JSON.stringify(req.body))
    const {error} = studentSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('creating student {}', req.body);
    buildSuccessResponse(res, 200, '{"id":"f47ac10b-58cc-4372-a567-0e02b2c3d479"}')
    console.log('created student {}', "f47ac10b-58cc-4372-a567-0e02b2c3d479");
});


/* API to update the student */
router.put('/:id', (req, res) => {
    const {error} = studentSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('updating student {}', req.body);
    buildSuccessResponse(res, 200, '{}')
    console.log('updated student {}', "f47ac10b-58cc-4372-a567-0e02b2c3d479");
});

router.delete('/:id', (req, res) => {
    console.log('Deleting student with id {}', req.params.id);
    buildSuccessResponse(res, 200, '{}')
    console.log('deleted student {}', "550e8400-e29b-41d4-a716-446655440000");
});


module.exports = router;