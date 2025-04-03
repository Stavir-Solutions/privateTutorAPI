const express = require('express');
const { buildSuccessResponse, buildErrorMessage } = require('./responseUtils');
const { create, getByBatchIdAndStudentId, getById, deleteById, updateAssignment, getByBatchId } = require('../services/assignmentService');
const { dateValidator } = require('../common/dateValidator')


const router = express.Router();
const Joi = require('joi');
const authMiddleware = require("../middleware/authMiddleware");
router.use(express.json());
router.use(authMiddleware);

const assignmentSchema = Joi.object({
    publishDate: Joi.string().custom(dateValidator).required().messages({ 'date.base': 'Publish date must be a valid date.' }),
    submissionDate: Joi.string().custom(dateValidator).required().messages({ 'date.base': 'Submission date must be a valid date.' }),
    batchId: Joi.string().guid({ version: 'uuidv4' }).required().messages({ 'string.guid': 'Batch ID must be a valid UUID.' }),
    studentId: Joi.string().guid({ version: 'uuidv4' }).optional().messages({ 'string.guid': 'Student ID must be a valid UUID.' }),
    title: Joi.string().max(100).required().messages({ 'string.max': 'Title must not exceed 100 characters.' }),
    details: Joi.string().max(1000).optional().messages({ 'string.max': 'Details must not exceed 1000 characters.' }),
    attachmentUrls: Joi.array().items(Joi.string().uri()).optional().messages({ 'string.uri': 'Attachment URLs must be valid URIs.' }),
});


const assignmentUpdateSchema = Joi.object({
    publishDate: Joi.string().custom(dateValidator).optional().messages({ 'date.base': 'Publish date must be a valid date.' }),
    submissionDate: Joi.string().custom(dateValidator).optional().messages({ 'date.base': 'Submission date must be a valid date.' }),
    batchId: Joi.string().guid({ version: 'uuidv4' }).optional().messages({ 'string.guid': 'Batch ID must be a valid UUID.' }),
    studentId: Joi.string().guid({ version: 'uuidv4' }).optional().messages({ 'string.guid': 'Student ID must be a valid UUID.' }),
    title: Joi.string().max(100).optional().messages({ 'string.max': 'Title must not exceed 100 characters.' }),
    details: Joi.string().max(1000).optional().messages({ 'string.max': 'Details must not exceed 1000 characters.' }),
    attachmentUrls: Joi.array().items(Joi.string().uri()).optional().messages({ 'string.uri': 'Attachment URLs must be valid URIs.' }),
}).or(
    'publishDate', 'submissionDate', 'batchId', 'studentId', 'title', 'details', 'attachmentUrls'
).unknown(false);

var assigment = '{\n' + '  "id": "e7b8a9c2-4b1e-4d3a-8a1e-2b3b4c5d6e7f",\n' + '  "publishDate": "2024-01-01T00:00:00.000Z",\n' + '  "submissionDate": "2024-01-15T23:59:59.999Z",\n' + '  "batchId": "550e8400-e29b-41d4-a716-446655440000",\n' + '  "studentId": "550e8400-e29b-41d4-a716-446655440001",\n' + '  "title": "Math Assignment 1",\n' + '  "details": "Solve the algebra problems in the attached document.",\n' + '  "attachmentUrls": [\n' + '    "http://example.com/assignment1.pdf",\n' + '    "http://example.com/assignment2.pdf"\n' + '  ]\n' + '}';

router.get('/batch/:batchId', async (req, res) => {
    const assignment = await getByBatchId(req.params.batchId);
    console.log('get assignments by batch ', req.params.batchId)
    buildSuccessResponse(res, 200, assignment);
});

router.get('/batch/:batchId/student/:studentId', async (req, res) => {
    const { batchId, studentId } = req.params;
    console.log('get assignments by batch and student', batchId, studentId);
    const assignment = await getByBatchIdAndStudentId(batchId, studentId);
    buildSuccessResponse(res, 200, assignment);
});

router.get('/:id', async (req, res) => {
    const assignment = await getById(req.params.id);
    console.log('assignment by id ', assignment);
    buildSuccessResponse(res, 200, assignment);
});

router.post('/', async (req, res) => {
    console.log(JSON.stringify(req.body))
    const { error } = assignmentSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    let assignmentId = await create(req.body)
    buildSuccessResponse(res, 200, '{"id":"' + assignmentId + '"}')
    console.log('created assignment {}', assignmentId);
});
/* API to update the assigment */
router.put('/:id', async (req, res) => {
    const { error } = assignmentUpdateSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('updating assigment {}', req.body);
    let updateResult = await updateAssignment(req.params.id, req.body);
    buildSuccessResponse(res, 200, updateResult)
    console.log('updated assigment {}', req.params.id);
});

router.delete('/:id', async (req, res) => {
    console.log('Deleting assigment with id {}', req.params.id);
    let response = await deleteById(req.params.id);
    buildSuccessResponse(res, 200, response)
    console.log('deleted assigment {}', req.params.id);
});


module.exports = router;