const express = require('express');
const { buildSuccessResponse, buildErrorMessage } = require('./responseUtils');
const { create, getByBatchIdAndStudentId, getbyBatchId, getById, deleteById, updateFeeRecord } = require('../services/feeRecordService');


const router = express.Router();
const Joi = require('joi');
const { getByBatchId } = require("../services/messageService");
const authMiddleware = require("../middleware/authMiddleware");
router.use(express.json());
router.use(authMiddleware);

const FeeRecordStatus = Object.freeze({
    PAID: 'paid', PENDING: 'pending'
});

const feeRecordCreateSchema = Joi.object({
    batchId: Joi.string().guid().required().messages({ 'string.guid': 'Batch ID must be a valid UUID.' }),
    studentId: Joi.string().guid().required().messages({ 'string.guid': 'Student ID must be a valid UUID.' }),
    dueDate: Joi.date().required().messages({ 'date.base': 'Due date must be a valid date.' }),
    paymentDate: Joi.date().required().messages({ 'date.base': 'Payment date must be a valid date.' }),
    month: Joi.string().max(50).required().messages({ 'string.max': 'Month should not exceed 50 characters.' }),
    amount: Joi.number().required().messages({ 'number.base': 'Amount must be a number.' }),
    status: Joi.string().valid(...Object.values(FeeRecordStatus)).required().messages({
        'any.only': `Status must be one of the following: ${Object.values(FeeRecordStatus).join(', ')}`
    }),
    notes: Joi.string().max(500).optional().messages({ 'string.max': 'Notes should not exceed 500 characters.' }),
    attachmentUrl: Joi.string().uri().optional().messages({ 'string.uri': 'Attachment URL must be a valid URI.' }),
    teacherAcknowledgement: Joi.boolean().optional().messages({ 'boolean.base': 'Teacher acknowledgement must be a boolean.' })
});


const feeRecordUpdateSchema = Joi.object({
    dueDate: Joi.date().optional().messages({ 'date.base': 'Due date must be a valid date.' }),
    month: Joi.string().max(50).optional().messages({ 'string.max': 'Month should not exceed 50 characters.' }),
    paymentDate: Joi.date().optional().messages({ 'date.base': 'Payment date must be a valid date.' }),
    status: Joi.string().valid(...Object.values(FeeRecordStatus)).optional().messages({
        'any.only': `Status must be one of the following: ${Object.values(FeeRecordStatus).join(', ')}`
    }),
    notes: Joi.string().max(500).optional().messages({ 'string.max': 'Notes should not exceed 500 characters.' }),
    attachmentUrl: Joi.string().uri().optional().messages({ 'string.uri': 'Attachment URL must be a valid URI.' }),
    teacherAcknowledgement: Joi.boolean().optional().messages({ 'boolean.base': 'Teacher acknowledgement must be a boolean.' }),
}).or('dueDate', 'paymentDate', 'status', 'notes', 'attachmentUrl', 'teacherAcknowledgement');

var feeRecord = '{\n' + '  "id": "d3b07384-d9a0-4c9b-8a0d-6e5b5d6e5b5d",\n' + '  "batchId": "550e8400-e29b-41d4-a716-446655440000",\n' + '  "studentId": "550e8400-e29b-41d4-a716-446655440001",\n' + '  "dueDate": "2024-12-31T23:59:59.999Z",\n' + '  "paymentDate": "2024-12-25T12:34:56.789Z",\n' + '  "amount": 1500.00,\n' + '  "status": "paid",\n' + '  "notes": "Payment received in full.",\n' + '  "attachmentUrl": "http://example.com/receipt.pdf",\n' + '  "teacherAcknowledgement": true\n' + '}';


router.get('/batches/:batchId', async (req, res) => {
    const feeRecords = await getbyBatchId(req.params.batchId);
    console.log('get  by batch ', req.params.batchId)
    buildSuccessResponse(res, 200, feeRecords);
});

router.get('/batch/:batchId/student/:studentId', async (req, res) => {
    const { batchId, studentId } = req.params;
    console.log('getting feeRecords for student {} in a batch {}', req.params.studentId, req.params.batchId);
    const feeRecord = await getByBatchIdAndStudentId(batchId, studentId);
    buildSuccessResponse(res, 200, feeRecord);
});

router.get('/:id', async (req, res) => {
    const feeRecord = await getById(req.params.id);
    console.log('feeRecord by id ', feeRecord);
    buildSuccessResponse(res, 200, feeRecord);
});

router.post('/', async (req, res) => {
    console.log(JSON.stringify(req.body))
    const { error } = feeRecordCreateSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('creating feeRecord {}', req.body);
    let feeRecordId = await create(req.body)
    buildSuccessResponse(res, 200, '{"id":" ' + feeRecordId + '"}')
    console.log('created feeRecord {}', feeRecordId);
});


/* API to update the feeRecord */
router.patch('/:id', async (req, res) => {
    const { error } = feeRecordUpdateSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('updating feeRecord {}', req.body);
    let updateResult = await updateFeeRecord(req.params.id, req.body);
    buildSuccessResponse(res, 200, updateResult)
    console.log('updated feeRecord {}', req.params.id);
});

router.delete('/:id', (req, res) => {
    console.log('Deleting feeRecord with id {}', req.params.id);
    let response = deleteById(req.params.id);
    buildSuccessResponse(res, 200, response)
    console.log('deleted feeRecord {}', req.params.id);
});


module.exports = router;