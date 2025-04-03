const express = require('express');
const { buildSuccessResponse, buildErrorMessage } = require('./responseUtils');
const Joi = require('joi');
const { create, updateTest, getById, deletetestById, getallByBatch } = require('../services/testService');
const authMiddleware = require("../middleware/authMiddleware");
const {dateValidator} = require("../common/dateValidator");

const router = express.Router();
router.use(express.json());
router.use(authMiddleware);

const testSchema = Joi.object({
    name: Joi.string().max(500).required().messages({ 'string.max': 'Name should not exceed 50 characters.' }),
    subject: Joi.string().max(100).required().messages({ 'string.max': 'Subject should not exceed 50 characters.' }),
    testDate: Joi.string().custom(dateValidator).required().messages({ 'date.base': 'Test date must be a valid date.' }),
    resultPublishDate: Joi.string().custom(dateValidator).required().messages({ 'date.base': 'Result Publish Date must be a valid date.' }),
    totalMarks: Joi.number().positive().required().messages({
        'number.base': 'Total marks must be a positive number.',
        'number.positive': 'Total marks must be greater than 0.'
    }),
    minimumPassMark: Joi.number().positive().less(Joi.ref('totalMarks')).required().messages({
        'number.base': 'Minimum pass mark must be a positive number.',
        'number.positive': 'Minimum pass mark must be greater than 0.',
        'number.less': 'Minimum pass mark must be less than the total marks.',
    }),
    numberOfQuestions: Joi.number().positive().required().messages({
        'number.base': 'Number of questions must be a positive number.',
        'number.positive': 'Number of questions must be greater than 0.',
    }),
    batchId: Joi.string().required().messages({ 'string.base': 'Batch ID must be a string.', }),
});


const testUpdateSchema = Joi.object({
    name: Joi.string().max(500).required().messages({ 'string.max': 'Name should not exceed 50 characters.' }),
    subject: Joi.string().max(100).required().messages({ 'string.max': 'Subject should not exceed 50 characters.' }),
    testDate: Joi.string().custom(dateValidator).required().messages({ 'date.base': 'Test date must be a valid date.' }),
    resultPublishDate: Joi.string().custom(dateValidator).required().messages({ 'date.base': 'Result Publish Date must be a valid date.' }),
    totalMarks: Joi.number().positive().required().messages({
        'number.base': 'Total marks must be a positive number.',
        'number.positive': 'Total marks must be greater than 0.'
    }),
    minimumPassMark: Joi.number().positive().less(Joi.ref('totalMarks')).required().messages({
        'number.base': 'Minimum pass mark must be a positive number.',
        'number.positive': 'Minimum pass mark must be greater than 0.',
        'number.less': 'Minimum pass mark must be less than the total marks.',
    }),
    numberOfQuestions: Joi.number().positive().required().messages({
        'number.base': 'Number of questions must be a positive number.',
        'number.positive': 'Number of questions must be greater than 0.',
    }),
    batchId: Joi.string().required().messages({ 'string.base': 'Batch ID must be a string.', }),
}).or(
    'name', 'subject', ' testDate', 'resultPublishDate', 'totalMark', 'minimumPassMark', 'numberOfQuestions', 'batchId'
).unknown(false);

var test = '{ "id": "550e8400-e29b-41d4-a716-446655440000", "name": "Maths Test", "subject": "Mathematics", "testDate": "2024-02-01T00:00:00.000Z", "resultPublishDate": "2024-02-10T00:00:00.000Z", "totalMarks": 100, "minimumPassMark": 40, "numberOfQuestions": 20, "batchId": "123e4567-e89b-12d3-a456-426614174000" }';


router.get('/batches/:batchId', async (req, res) => {
    const test = await getallByBatch(req.params.batchId);
    console.log('get test by batch ', req.params.batchId)
    buildSuccessResponse(res, 200, test);
});

router.get('/:id', async (req, res) => {
    const test = await getById(req.params.id);
    console.log('Test by id ', test);
    buildSuccessResponse(res, 200, test);
});

router.post('/', async (req, res) => {
    console.log(JSON.stringify(req.body));
    const { error } = testSchema.validate(req.body);
    if (error) {
        console.log('Validation error:', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    let testId = await create(req.body)
    buildSuccessResponse(res, 200, '{"id":"' + testId + '"}')
    console.log('created test {}', testId);
});

router.put('/:id', async (req, res) => {
    const { error } = testUpdateSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('updating test {}', req.body);
    let updateResult = await updateTest(req.params.id, req.body);
    buildSuccessResponse(res, 200, updateResult);
    console.log('updated test {}', req.params.id);
});

router.delete('/:id', (req, res) => {
    console.log('Deleting test with id {}', req.params.id);
    let response = deletetestById(req.params.id);
    buildSuccessResponse(res, 200, response);
    console.log('deleted test{}', req.params.id);
});

module.exports = router;