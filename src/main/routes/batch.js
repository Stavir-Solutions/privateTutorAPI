const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');
const {create, getById, deleteById, update, getByTeacherId} = require('../services/batchService');
const {updateStudent, getStudentById} = require('../services/studentService');

const router = express.Router();
const Joi = require('joi');
const authMiddleware = require("../middleware/authMiddleware");
router.use(express.json());
router.use(authMiddleware);


const batchSchema = Joi.object({
    name: Joi.string().max(50).required(),
    teacherId: Joi.string().required(),
    course: Joi.string().max(50).optional(),
    subject: Joi.string().max(50).optional(),
    description: Joi.string().max(1000).optional(),
    paymentFrequency: Joi.string().max(20).required(),
    paymentAmount: Joi.number().required(),
    paymentDayOfMonth: Joi.number().integer().min(1).max(30).required()
}).unknown(false);

const updateBatchSchema = Joi.object({
    name: Joi.string().max(50).optional(),
    teacherId: Joi.string().forbidden(),
    course: Joi.string().max(50).optional(),
    subject: Joi.string().max(50).optional(),
    description: Joi.string().max(1000).optional(),
    paymentFrequency: Joi.string().max(20).optional(),
    paymentAmount: Joi.number().optional(),
    paymentDayOfMonth: Joi.number().integer().min(1).max(30).optional()
}).or('name', 'course', 'subject', 'description', 'paymentFrequency', 'paymentAmount', 'paymentDayOfMonth')
    .unknown(false);

var batch = '{\n' + '  "id": "123e4567-e89b-12d3-a456-426614174000",\n' + '  "name": "Math 101",\n' + '  "course": "Mathematics",\n' + '  "subject": "Algebra",\n' + '  "description": "An introductory course to Algebra covering basic concepts and problem-solving techniques.",\n' + '  "paymentFrequency": "Monthly",\n' + '  "paymentAmount": 150.00,\n' + '  "paymentDayOfMonth": 15\n' + '}';


router.get('/:id', async (req, res) => {
    let batch = await getById(req.params.id);
    console.log('batch ', batch);
    buildSuccessResponse(res, 200, batch);
});

router.get('/teacher/:teacherId', async (req, res) => {
    let batches = await getByTeacherId(req.params.teacherId);
    console.log('batches ', batches);
    buildSuccessResponse(res, 200, batches);
});

router.post('', async (req, res) => {
    console.log(JSON.stringify(req.body))
    const {error} = batchSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('creating batch {}', req.body);
    let batchId = await create(req.body)
    buildSuccessResponse(res, 200, '{"id":"' + batchId + '"}')
    console.log('created batch ', batchId);
});


router.put('/:id', async (req, res) => {
    const {error} = updateBatchSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    let updateResult = await update(req.params.id, req.body);
    buildSuccessResponse(res, 200, updateResult);
    console.log('updated batch ', req.params.id);
});
router.patch('/:batchId/student/:studentId', async (req, res) => {

    const { batchId, studentId } = req.params;

    console.log('add student', studentId, 'to batch', batchId);

    if (!batchId || batchId.trim() === '' || batchId === ':batchId') {
        return res.status(400).json({ message: 'batchId is required' });
    }

    let student = await getStudentById(studentId);
    console.log('Student:', student);

    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }

    console.log('batches before:', student.batches);

    let batches = new Set(student.batches || []);

    if (batches.has(batchId)) {
        return res.status(400).json({ message: 'Student is already in this batch' });
    }

    batches.add(batchId);
    console.log('Batches after:', Array.from(batches));

    let updateResult = await updateStudent(studentId, { batches: Array.from(batches) });
    buildSuccessResponse(res, 200, updateResult);
    console.log(`Added Student ${studentId} to Batch ${batchId}`);

});

router.delete('/:id', async (req, res) => {
    let response = await deleteById(req.params.id);
    buildSuccessResponse(res, 200, response)
    console.log('deleted batch {}', req.params.id);
});

module.exports = router;