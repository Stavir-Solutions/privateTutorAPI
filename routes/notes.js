const express = require('express');
const { buildSuccessResponse, buildErrorMessage } = require('./responseUtils');
const Joi = require('joi');

const router = express.Router();
router.use(express.json());

const notesSchema = Joi.object({
    publishDate: Joi.date().required(),
    description: Joi.string().max(500).required(),
    listUrls: Joi.array().items(Joi.string().uri()).optional(),
});

var notes = '{' + ' "id": "550e8400-e29b-41d4-a716-446655440000", \n' + ' "publishDate": "2024-01-01T00:00:00.000Z",\n ' + '  "description": "This is a sample note description.",\n' + '  "listUrls": [\n' + ' "http://example.com/resource1.pdf",\n' + '  "http://example.com/resource2.pdf"\n' + ' ]\n' +
    '}';

router.get('/batch/:batchId', (req, res) => {
    buildSuccessResponse(res, 200, [notes]);
});

router.get('/student/:id', (req, res) => {
    buildSuccessResponse(res, 200, [notes]);
});



router.post('/', (req, res) => {
    console.log(JSON.stringify(req.body));
    const { error } = notesSchema.validate(req.body);
    if (error) {
        console.log('Validation error:', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('Creating notes {}', req.body);
    buildSuccessResponse(res, 200, '{"id":"550e8400-e29b-41d4-a716-446655440000"}');
    console.log('Created notes{} with ID:', "550e8400-e29b-41d4-a716-446655440000");
});

uter.put('/:id', (req, res) => {
    const {error} = teacherSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('updating teacher {}', req.body);
    buildSuccessResponse(res, 200, '{}')
    console.log('updated teacher {}', "550e8400-e29b-41d4-a716-446655440000");
});
router.delete('/:id', (req, res) => {
    console.log('Deleting teacher with id {}', req.params.id);
    buildSuccessResponse(res, 200, {});
    console.log('deleted feeRecord {}', "550e8400-e29b-41d4-a716-446655440000");

});

module.exports = router;