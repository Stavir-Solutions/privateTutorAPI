const express = require('express');
const {buildSuccessResponse, buildErrorMessage} = require('./responseUtils');
const Joi = require('joi');
const {
    create,
    getByStudentId,
    getById,
    deleteById,
    addReplyToMessage,
    getByBatchId
} = require('../services/messageService');
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.use(express.json());
router.use(authMiddleware);

const messageSchema = Joi.object({
    subject: Joi.string().max(100).required(),
    content: Joi.string().required(),
    sender: Joi.string().email().required(),
    receiver: Joi.string().email().required(),
    batchId: Joi.string().required(),
    studentId: Joi.string().optional(),
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
}).unknown(false);

const messageUpdateSchema = Joi.object({
    content: Joi.string().optional(),
    attachmentUrls: Joi.array().items(Joi.string().uri()).optional(),
    replies: Joi.array().items(Joi.object({
        content: Joi.string().optional(),
        sender: Joi.string().email().optional(),
        timestamp: Joi.date().optional(),
        attachmentUrls: Joi.array().items(Joi.string().uri()).optional()
    })).optional()
}).or('content', 'attachmentUrls', 'replies').unknown(false);


const replyUpdateSchema = Joi.object({
    content: Joi.string().optional(),
    sender: Joi.string().email().optional(),
    timestamp: Joi.date().optional(),
    attachmentUrls: Joi.array().items(Joi.string().uri()).optional()
}).unknown(false);

let message = '[\n' + '  {\n' + '    id: \'9b2e4d16-8e4b-4a2b-9b2e-4d168e4b4a2b\',\n' + '    subject: \'Follow Up\',\n' + '    content: \'Just checking in to see how you are doing.\',\n' + '    sender: \'admin@example.com\',\n' + '    studentId: \'a423e456-7e89-12d3-a456-42661417434f\',\n' + '  batchId: \'a8f0c784-687f-4fa3-bd72-2fbdbe89c7d0",\',\n' + '    receiver: \'user@example.com\',\n' + '    timestamp: \'2024-12-24T12: 34: 56.789Z,\n' + '    attachmentUrls: [\n' + '      \'http: //example.com/attachment1.txt\',\n' + '      \'http: //example.com/attachment2.pdf\'\n' + '    ],\n' + '    replies: [\n' + '      {\n' + '        content: \'I am doing well, thank you!\',\n' + '        sender: \'user@example.com\',\n' + '        timestamp: \'2024-12-25T12: 34: 56.789Z,\n' + '        attachmentUrls: [\n' + '        ]\n' + '      },\n' + '      {\n' + '        content: \'Good to hear that see you in class soon!\',\n' + '        sender: \'user@example.com\',\n' + '        timestamp: \'2024-12-25T14: 34: 56.789Z,\n' + '        attachmentUrls: [\n' + '          \'http: //example.com/attachment5.png\',\n' + '        ]\n' + '      }\n' + '    ]\n' + '  }\n' + ']'


router.get('/batch/:batchId', async (req, res) => {
    const message = await getByBatchId(req.params.batchId);
    console.log('get message by batch ', req.params.batchId)
    buildSuccessResponse(res, 200, message);
});


router.get('/student/:studentId', async (req, res) => {
    const message = await getByStudentId(req.params.studentId);
    console.log('get message by student', req.params.studentId)
    buildSuccessResponse(res, 200, message);
});


router.get('/:id', async (req, res) => {
    const message = await getById(req.params.id);
    console.log('message by id ', message);
    buildSuccessResponse(res, 200, message);
});

router.post('/', async (req, res) => {
    console.log(JSON.stringify(req.body))
    const {error} = messageSchema.validate(req.body);
    if (error) {
        console.log('error: {}', error);
        return buildErrorMessage(res, 400, error.details[0].message);
    }
    console.log('creating message {}', req.body);
    let messageId = await create(req.body)
    buildSuccessResponse(res, 200, '{"id":"' + messageId + '"}');
    console.log('message created {}', messageId);

});

router.patch('/:id/reply', async (req, res) => {
    const { error } = replyUpdateSchema.validate(req.body);
    if (error) {
        return buildErrorMessage(res, 400, error.details[0].message);
    }

    console.log('replying to message {}', req.params.id);

    await addReplyToMessage(req.params.id, req.body);

    buildSuccessResponse(res, 200, { message: "Reply updated successfully" });

    console.log('replied to message {}', req.params.id);
});


router.delete('/:id', (req, res) => {
    console.log('deleting message {}', req.params.id);
    let response = deleteById(req.params.id);
    buildSuccessResponse(res, 200, response);
    console.log('deleted message {} ', req.params.id);
});

module.exports = router;
