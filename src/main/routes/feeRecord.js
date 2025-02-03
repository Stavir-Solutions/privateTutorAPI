const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');
const {create, getByBatchIdAndStudentId , getById, deleteById, updateFeeRecord} = require('../services/feeRecordService');


const router = express.Router();
const Joi = require('joi');
router.use(express.json());

const FeeRecordStatus = Object.freeze({
    PAID: 'paid', PENDING: 'pending'
});

const feeRecordCreateSchema = Joi.object({
    batchId: Joi.string().guid().required(),
    studentId: Joi.string().guid().required(),
    dueDate: Joi.date().required(),
    paymentDate: Joi.date().required(),
    amount: Joi.number().required(),
    status: Joi.string().valid(...Object.values(FeeRecordStatus)).required(),
    notes: Joi.string().max(500).optional(),
    attachmentUrl: Joi.string().uri().optional(),
    teacherAcknowledgement: Joi.boolean().optional()
});


const feeRecordUpdateSchema = Joi.object({
    dueDate: Joi.date().optional(),
    paymentDate: Joi.date().optional(),
    status: Joi.string().valid(...Object.values(FeeRecordStatus)).optional(),
    notes: Joi.string().max(500).optional(),
    attachmentUrl: Joi.string().uri().optional(),
    teacherAcknowledgement: Joi.boolean().optional()
}).or('dueDate', 'paymentDate', 'status', 'notes', 'attachmentUrl', 'teacherAcknowledgement');

var feeRecord = '{\n' + '  "id": "d3b07384-d9a0-4c9b-8a0d-6e5b5d6e5b5d",\n' + '  "batchId": "550e8400-e29b-41d4-a716-446655440000",\n' + '  "studentId": "550e8400-e29b-41d4-a716-446655440001",\n' + '  "dueDate": "2024-12-31T23:59:59.999Z",\n' + '  "paymentDate": "2024-12-25T12:34:56.789Z",\n' + '  "amount": 1500.00,\n' + '  "status": "paid",\n' + '  "notes": "Payment received in full.",\n' + '  "attachmentUrl": "http://example.com/receipt.pdf",\n' + '  "teacherAcknowledgement": true\n' + '}';


router.get('/batch/:batchId/student/:studentId', async (req, res) => {
    const { batchId, studentId } = req.params;
    console.log('getting feeRecords for student {} in a batch {}', req.params.studentId, req.params.batchId);
    const feeRecord = await getByBatchIdAndStudentId(batchId, studentId);
    buildSuccessResponse(res, 200, feeRecord );
});

router.get('/:id', async (req, res) => {
    const feeRecord = await getById(req.params.id);
    console.log('feeRecord by id ', feeRecord);
    buildSuccessResponse(res, 200, feeRecord);
});

router.post('/', async (req, res) => {
    console.log(JSON.stringify(req.body))
    const {error} = feeRecordCreateSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('creating feeRecord {}', req.body);
    let feeRecordId = await create(req.body)
    buildSuccessResponse(res, 200, '{"id":" ' + feeRecordId +'"}')
    console.log('created feeRecord {}', feeRecordId);
});


/* API to update the feeRecord */
router.patch('/:id', async (req, res) => {
    const {error} = feeRecordUpdateSchema.validate(req.body);
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
    console.log('deleted feeRecord {}',  req.params.id); 
});


module.exports = router;