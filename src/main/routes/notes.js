const express = require('express');
const { buildSuccessResponse, buildErrorMessage } = require('./responseUtils');
const Joi = require('joi');
const { create, updateNotes, getByStudentId, getById, deleteById, getByBatchId } = require('../services/notesService');
const authMiddleware = require("../middleware/authMiddleware");
const { dateValidator } = require("../common/dateValidator");


const router = express.Router();
router.use(express.json());
router.use(authMiddleware);

const notesSchema = Joi.object({
    publishDate: Joi.string().custom(dateValidator).required().messages({ 'date.base': 'Publish date must be a valid date.' }),
    Title: Joi.string().max(500).required().messages({ 'string.max': 'Title should not exceed 500 characters.' }),
    listUrls: Joi.array().items(Joi.string().uri()).optional().messages({ 'string.uri': 'Attachment URLs must be valid URIs.' }),
    studentId: Joi.string().optional().messages({ 'string.guid': 'Student ID must be a valid UUID.' }),
    batchId: Joi.string().required().messages({ 'string.guid': 'Batch ID must be a valid UUID.' }),
    content: Joi.string().optional().messages({ 'string.base': 'Content must be a string.' }),
});

const notesUpdateSchema = Joi.object({
    publishDate: Joi.string().custom(dateValidator).optional().messages({ 'date.base': 'Publish date must be a valid date.' }),
    Title: Joi.string().max(500).optional().messages({ 'string.max': 'Title should not exceed 500 characters.' }),
    listUrls: Joi.array().items(Joi.string().uri()).optional().messages({ 'string.uri': 'Attachment URLs must be valid URIs.' }),
    studentId: Joi.string().optional().messages({ 'string.guid': 'Student ID must be a valid UUID.' }),
    batchId: Joi.string().optional().messages({ 'string.guid': 'Batch ID must be a valid UUID.' }),
    content: Joi.string().optional().messages({ 'string.base': 'Content must be a string.' }),
}).or(
    'publishDate', 'Title', 'listUrls', 'studentId', 'batchId', 'content'
).unknown(false);

var notes = '{' + ' "id": "550e8400-e29b-41d4-a716-446655440000", \n' + ' "publishDate": "2024-01-01T00:00:00.000Z",\n ' + ' "Title": "This is a sample note description.",\n' + ' "listUrls": [\n' + ' "http://example.com/resource1.pdf",\n' + ' "http://example.com/resource2.pdf"\n' + ' ],\n' +
    ' "studentId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",\n' + ' "batchId": "123e4567-e89b-12d3-a456-42661417400",\n' + ' "content": "This is the content of the note."\n' + '}';

router.get('/batch/:batchId', async (req, res) => {
    const notes = await getByBatchId(req.params.batchId);
    console.log('get notes by batch ', req.params.batchId)
    buildSuccessResponse(res, 200, notes);
});
router.get('/student/:studentId', async (req, res) => {
    const notes = await getByStudentId(req.params.studentId);
    console.log('get notes by notes ', req.params.studentId)
    buildSuccessResponse(res, 200, notes);
});

router.post('/', async (req, res) => {
    console.log(JSON.stringify(req.body));
    const { error } = notesSchema.validate(req.body);
    if (error) {
        console.log('Validation error:', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    let notesId = await create(req.body)
    buildSuccessResponse(res, 200, '{"id":"' + notesId + '"}')
    console.log('created notes {}', notesId);
});

router.put('/:id', async (req, res) => {
    const { error } = notesSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('updating notes {}', req.body);
    let updateResult = await updateNotes(req.params.id, req.body);
    buildSuccessResponse(res, 200, updateResult);
    console.log('updated notes {}', req.params.id);
});

router.get('/:id', async (req, res) => {
    const notes = await getById(req.params.id);
    console.log('Notes by id ', notes);
    buildSuccessResponse(res, 200, notes);
});
router.delete('/:id', (req, res) => {
    console.log('Deleting notes with id {}', req.params.id);
    let response = deleteById(req.params.id);
    buildSuccessResponse(res, 200, response);
    console.log('deleted notes{}', req.params.id);
});

module.exports = router;