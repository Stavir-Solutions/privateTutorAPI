const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');
const {create, getById, deleteById, update, getByTeacherId} = require('../services/batchService');
const {updateStudent, getStudentById} = require('../services/studentService');

const router = express.Router();
const Joi = require('joi');
router.use(express.json());


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
    console.log('Adding student', req.params.studentId, 'to batch', req.params.batchId);
    
    // Fetch the student by ID
    let student = await getStudentById(req.params.studentId);
    console.log('Student:', student);
    
    // Check if the student exists
    if (!student) {
        return res.status(404).send('Student not found');
    }

    console.log('Batches before:', student.batches);
    
    // Initialize batches as a Set to avoid duplicates
    let batches = new Set(student.batches || []);
    
    // Check if the student is already in the batch
    if (batches.has(req.params.batchId)) {
        return res.status(400).send('Student is already in this batch');
    }

    // Add the batch ID to the Set
    batches.add(req.params.batchId);
    console.log('Batches after:', Array.from(batches)); // Convert Set to Array for logging

    // Update the student with the new batches
    let updateResult = await updateStudent(req.params.studentId, { "batches": Array.from(batches) });
    
    // Send a success response
    buildSuccessResponse(res, 200, updateResult);
    console.log("Added Student " + req.params.studentId + " to Batch " + req.params.batchId);
});

router.delete('/:id', async (req, res) => {
    let response = await deleteById(req.params.id);
    buildSuccessResponse(res, 200, response)
    console.log('deleted batch {}', req.params.id);
});

module.exports = router;