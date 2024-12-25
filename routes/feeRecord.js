const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');

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


router.get('/batch/:batchId/student/:studentId', (req, res) => {
    console.log('getting feeRecords for student {} in a batch {}', req.params.studentId, req.params.batchId);
    buildSuccessResponse(res, 200, '[' + feeRecord + ']');
});

router.get('/:id', (req, res) => {
    buildSuccessResponse(res, 200, feeRecord);
});

router.post('/', (req, res) => {
    console.log(JSON.stringify(req.body))
    const {error} = feeRecordCreateSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('creating feeRecord {}', req.body);
    buildSuccessResponse(res, 200, '{"id":"d3b07384-d9a0-4c9b-8a0d-6e5b5d6e5b5d"}')
    console.log('created feeRecord {}', "d3b07384-d9a0-4c9b-8a0d-6e5b5d6e5b5d");
});


/* API to update the feeRecord */
router.patch('/:id', (req, res) => {
    const {error} = feeRecordUpdateSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('updating feeRecord {}', req.body);
    buildSuccessResponse(res, 200, '{}')
    console.log('updated feeRecord {}', "d3b07384-d9a0-4c9b-8a0d-6e5b5d6e5b5d");
});

router.delete('/:id', (req, res) => {
    console.log('Deleting feeRecord with id {}', req.params.id);
    buildSuccessResponse(res, 200, '{}')
    console.log('deleted feeRecord {}', "d3b07384-d9a0-4c9b-8a0d-6e5b5d6e5b5d");
});


module.exports = router;