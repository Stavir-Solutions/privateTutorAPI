const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');

const router = express.Router();
const Joi = require('joi');
router.use(express.json());


const batchSchema = Joi.object({
    name: Joi.string().max(50).required(),
    course: Joi.string().max(50).optional(),
    subject: Joi.string().max(50).optional(),
    description: Joi.string().max(1000).optional(),
    paymentFrequency: Joi.string().max(20).required(),
    paymentAmount: Joi.number().required(),
    paymentDayOfMonth: Joi.number().integer().min(1).max(30).required()
});

var batch = '{\n' + '  "id": "123e4567-e89b-12d3-a456-426614174000",\n' + '  "name": "Math 101",\n' + '  "course": "Mathematics",\n' + '  "subject": "Algebra",\n' + '  "description": "An introductory course to Algebra covering basic concepts and problem-solving techniques.",\n' + '  "paymentFrequency": "Monthly",\n' + '  "paymentAmount": 150.00,\n' + '  "paymentDayOfMonth": 15\n' + '}';


router.get('/:id', (req, res) => {
    buildSuccessResponse(res, 200, batch);
});

router.get('/teacher/:teacherId', (req, res) => {
    buildSuccessResponse(res, 200, '[' + batch + ']');
});

router.post('', (req, res) => {
    console.log(JSON.stringify(req.body))
    const {error} = batchSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('creating batch {}', req.body);
    buildSuccessResponse(res, 200, '{"id":"123e4567-e89b-12d3-a456-426614174000"}')
    console.log('created batch {}', "123e4567-e89b-12d3-a456-426614174000");
});


/* API to update the batch */
router.put('/:id', (req, res) => {
    const {error} = batchSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('updating batch {}', req.body);
    buildSuccessResponse(res, 200, '{}')
});

router.delete('/:id', (req, res) => {
    console.log('Deleting batch with id {}', req.params.id);
    buildSuccessResponse(res, 200, '{}')
});


module.exports = router;