const express = require('express');
const { buildSuccessResponse, buildErrorMessage } = require('./responseUtils');
const Joi = require('joi');
const {create,updateTest, getById, deletetestById,getallByBatch} = require('../main/services/testService');

const router = express.Router();
router.use(express.json());

const testSchema = Joi.object({
    name: Joi.string().max(500).required(),
    subject: Joi.string().max(100).required(),
    testDate: Joi.date().required(),
    resultPublishDate: Joi.date().required(),
    totalMarks: Joi.number().positive().required(),
    minimumPassMark: Joi.number().positive().less(Joi.ref('totalMarks')).required(),
    numberOfQuestions: Joi.number().positive().required(),
    batchId: Joi.string().required(),
});
   

const testUpdateSchema = Joi.object({
    name: Joi.string().max(500).required(), 
    subject: Joi.string().max(100).required(), 
    testDate: Joi.date().required(),
    resultPublishDate: Joi.date().required(),
    totalMarks: Joi.number().positive().required(), 
    minimumPassMark: Joi.number().positive().less(Joi.ref('totalMarks')).required(),
    numberOfQuestions: Joi.number().integer().positive().required(),
}).or(
    'name', 'subject',' testDate', 'resultPublishDate', 'totalMark', 'minimumPassMark', 'numberOfQuestions','batchId'
).unknown(false);

var test = '{ "id": "550e8400-e29b-41d4-a716-446655440000", "name": "Maths Test", "subject": "Mathematics", "testDate": "2024-02-01T00:00:00.000Z", "resultPublishDate": "2024-02-10T00:00:00.000Z", "totalMarks": 100, "minimumPassMark": 40, "numberOfQuestions": 20, "batchId": "123e4567-e89b-12d3-a456-426614174000" }';


router.get('/batches/:batchId', async (req, res) => {
    const test = await getallByBatch(req.params.batchId);
    console.log('get test by batch ', req.params.batchId)
    buildSuccessResponse(res, 200, test);
    });

router.get('/:id', async (req, res) => {
    const test = await  getById(req.params.id);
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
    console.log('created test {}',testId);
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
    console.log('deleted test{}', req.params.id );
});

module.exports = router;