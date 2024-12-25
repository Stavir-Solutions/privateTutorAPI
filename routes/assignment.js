const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');

const router = express.Router();
const Joi = require('joi');
router.use(express.json());

const assignmentSchema = Joi.object({
    publishDate: Joi.date().required(),
    submissionDate: Joi.date().required(),
    batchId: Joi.string().guid({version: 'uuidv4'}).required(),
    studentId: Joi.string().guid({version: 'uuidv4'}).optional(),
    title: Joi.string().max(100).required(),
    details: Joi.string().max(1000).optional(),
    attachmentUrls: Joi.array().items(Joi.string().uri()).optional()
});

var assigment = '{\n' + '  "id": "e7b8a9c2-4b1e-4d3a-8a1e-2b3b4c5d6e7f",\n' + '  "publishDate": "2024-01-01T00:00:00.000Z",\n' + '  "submissionDate": "2024-01-15T23:59:59.999Z",\n' + '  "batchId": "550e8400-e29b-41d4-a716-446655440000",\n' + '  "studentId": "550e8400-e29b-41d4-a716-446655440001",\n' + '  "title": "Math Assignment 1",\n' + '  "details": "Solve the algebra problems in the attached document.",\n' + '  "attachmentUrls": [\n' + '    "http://example.com/assignment1.pdf",\n' + '    "http://example.com/assignment2.pdf"\n' + '  ]\n' + '}';


router.get('/batch/:batchId', (req, res) => {
    buildSuccessResponse(res, 200, '[' + assigment + ']');
});

router.get('/batch/:batchId/student/:studentId', (req, res) => {
    buildSuccessResponse(res, 200, '[' + assigment + ']');
});

router.get('/:id', (req, res) => {
    buildSuccessResponse(res, 200, assigment);
});

router.post('/', (req, res) => {
    console.log(JSON.stringify(req.body))
    const {error} = assignmentSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('creating assigment {}', req.body);
    buildSuccessResponse(res, 200, '{"id":"e7b8a9c2-4b1e-4d3a-8a1e-2b3b4c5d6e7f"}')
    console.log('created assigment {}', "e7b8a9c2-4b1e-4d3a-8a1e-2b3b4c5d6e7f");
});


/* API to update the assigment */
router.put('/:id', (req, res) => {
    const {error} = assignmentSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('updating assigment {}', req.body);
    buildSuccessResponse(res, 200, '{}')
    console.log('updated assigment {}', "e7b8a9c2-4b1e-4d3a-8a1e-2b3b4c5d6e7f");
});

router.delete('/:id', (req, res) => {
    console.log('Deleting assigment with id {}', req.params.id);
    buildSuccessResponse(res, 200, '{}')
    console.log('deleted assigment {}', "e7b8a9c2-4b1e-4d3a-8a1e-2b3b4c5d6e7f");
});


module.exports = router;