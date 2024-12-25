const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');
const Joi = require('joi');

const router = express.Router();
router.use(express.json());

const messageSchema = Joi.object({
    subject: Joi.string().max(100).required(),
    content: Joi.string().required(),
    sender: Joi.string().email().required(),
    receiver: Joi.string().email().required(),
    timestamp: Joi.date().optional(),
    attachmentUrls: Joi.array().items(Joi.string().uri()).optional(),
    replies: Joi.array().items(Joi.object({
        content: Joi.string().required(),
        sender: Joi.string().email().required(),
        timestamp: Joi.date().required(),
        attachmentUrls: Joi.array().items(Joi.string().uri()).optional()
    })).optional()
});

const replySchema = Joi.object({
    content: Joi.string().required(),
    sender: Joi.string().email().required(),
    timestamp: Joi.date().required(),
    attachmentUrls: Joi.array().items(Joi.string().uri()).optional()
});

let message = '[\n' + '  {\n' + '    id: \'9b2e4d16-8e4b-4a2b-9b2e-4d168e4b4a2b\',\n' + '    subject: \'Follow Up\',\n' + '    content: \'Just checking in to see how you are doing.\',\n' + '    sender: \'admin@example.com\',\n' + '    receiver: \'user@example.com\',\n' + '    timestamp: \'2024-12-24T12: 34: 56.789Z,\n' + '    attachmentUrls: [\n' + '      \'http: //example.com/attachment1.txt\',\n' + '      \'http: //example.com/attachment2.pdf\'\n' + '    ],\n' + '    replies: [\n' + '      {\n' + '        content: \'I am doing well, thank you!\',\n' + '        sender: \'user@example.com\',\n' + '        timestamp: \'2024-12-25T12: 34: 56.789Z,\n' + '        attachmentUrls: [\n' + '        ]\n' + '      },\n' + '      {\n' + '        content: \'Good to hear that see you in class soon!\',\n' + '        sender: \'user@example.com\',\n' + '        timestamp: \'2024-12-25T14: 34: 56.789Z,\n' + '        attachmentUrls: [\n' + '          \'http: //example.com/attachment5.png\',\n' + '        ]\n' + '      }\n' + '    ]\n' + '  }\n' + ']'


router.get('/batch/:batchId', (req, res) => {
    console.log('getting messages for batch {}', req.params.batchId);
    buildSuccessResponse(res, 200, '[' + message + ']');
});

router.get('/batch/:batchId/student/:studentId', (req, res) => {
    console.log('getting messages for student {} in a batch {}', req.params.studentId, req.params.batchId);
    buildSuccessResponse(res, 200, '[' + message + ']');
});

router.get('/:id', (req, res) => {
    if (!message) {
        return buildErrorMessage(res, 404, 'Message not found');
    }
    buildSuccessResponse(res, 200, message);
});

router.post('/', (req, res) => {
    const {error} = messageSchema.validate(req.body);
    if (error) {
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('creating message {}', req.body);
    buildSuccessResponse(res, 201, '{"id":"9b2e4d16-8e4b-4a2b-9b2e-4d168e4b4a2b"}');
    console.log('message created {}', '9b2e4d16-8e4b-4a2b-9b2e-4d168e4b4a2b');

});

router.patch('/:id/reply', (req, res) => {
    const {error} = replySchema.validate(req.body);
    if (error) {
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('replying to message {}', req.params.id);
    buildSuccessResponse(res, 200, '{}');
    console.log('replied to message {}', req.params.id);
});

router.delete('/:id', (req, res) => {
    console.log('deleting message {}', req.params.id);
    buildSuccessResponse(res, 200, {});
    console.log('message {} deleted', req.params.id);
});

module.exports = router;