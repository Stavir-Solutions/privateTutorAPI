const express = require('express');
const { buildSuccessResponse, buildErrorMessage } = require('./responseUtils');
const Joi = require('joi');
const { create, updateTestResult, getById, deleteById, getAllByStudentId, getAllByTestId } = require('../services/testResultService');
const authMiddleware = require("../middleware/authMiddleware");
const { marshall } = require('@aws-sdk/util-dynamodb');

const router = express.Router();
router.use(express.json());
router.use(authMiddleware);const testResultSchema = Joi.object({
    testId: Joi.string().guid({ version: 'uuidv4' }).required().messages({
        'string.guid': 'Test ID must be a valid UUID.'
    }),
    marks: Joi.number().positive().required().messages({
        'number.base': 'Total marks must be a positive number.',
        'number.positive': 'Total marks must be greater than 0.'
    }),
    studentId: Joi.string().guid({ version: 'uuidv4' }).required().messages({
        'string.guid': 'Student ID must be a valid UUID.'
    }),
    attestedByParent: Joi.boolean().required().messages({
        'boolean.base': 'Attested by Parent must be a boolean value.'
    }),
});

const testResultUpdateSchema = Joi.object({
    marks: Joi.number().positive().required().messages({
        'number.base': 'Total marks must be a positive number.',
        'number.positive': 'Total marks must be greater than 0.'
    }),
    studentId: Joi.string().guid({ version: 'uuidv4' }).required().messages({
        'string.guid': 'Student ID must be a valid UUID.'
    }),
    attestedByParent: Joi.boolean().required().messages({
        'boolean.base': 'Attested by Parent must be a boolean value.'
    }),
}).or(
    'testId', 'marks', 'attestedByParent', 'studentId'
).unknown(false);

var testResult = '{ "id": "550e8400-e29b-41d4-a716-446655440000","testId": "550e8400-e29b-41d4-a716-476755440000" ,"marks": "90"," attestedByParent": "true","studentId": "123e4567-e89b-12d3-a456-426614174000" }';


router.get('/students/:studentId', async (req, res) => {
    const testResult = await getAllByStudentId(req.params.studentId);
    console.log('get testResult by student ', req.params.studentId)
    buildSuccessResponse(res, 200, testResult);
});
router.get('/tests/:testId', async (req, res) => {
    const testResult = await getAllByTestId(req.params.testId);
    console.log('get testResult by testId ', req.params.testId)
    buildSuccessResponse(res, 200, testResult);
});

router.get('/:id', async (req, res) => {
    const test = await getById(req.params.id);
    console.log('TestResult by id ', testResult);
    buildSuccessResponse(res, 200, testResult);
});

router.post('/', async (req, res) => {
    console.log(JSON.stringify(req.body));
    const { error } = testResultSchema.validate(req.body);
    if (error) {
        console.log('Validation error:', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    let testResultId = await create(req.body)
    buildSuccessResponse(res, 200, '{"id":"' + testResultId + '"}')
    console.log('created testResult {}', testResultId);
});

router.put('/:id', async (req, res) => {
    const { error } = testResultUpdateSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('updating testResult {}', req.body);
    let updateResult = await updateTestResult(req.params.id, req.body);
    buildSuccessResponse(res, 200, updateResult);
    console.log('updated testResult {}', req.params.id);
});

router.delete('/:id', (req, res) => {
    console.log('Deleting testResult with id {}', req.params.id);
    let response = deleteById(req.params.id);
    buildSuccessResponse(res, 200, response);
    console.log('deleted testResult {}', req.params.id);
});

module.exports = router;