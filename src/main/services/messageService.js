const {toMessageEntity} = require('../db/mappers/messageMapper');
const db = require('../db/dynamodb');
const {sendNotification} = require('./notificationService');
const {NotificationType} = require('../common/types');
const {
    PutItemCommand, UpdateItemCommand, GetItemCommand, ScanCommand, DeleteItemCommand
} = require('@aws-sdk/client-dynamodb');
const {unmarshall, marshall} = require('@aws-sdk/util-dynamodb');
//TODO rename it to deeplink base url
const DEEPLINK_BASE_URL = process.env.DEEPLINK_BASE_URL;


const tableName = "Messages";

async function create(message) {
    let messageEntity = toMessageEntity(message);
    console.log('Converted to entity:', messageEntity);

    try {
        await db.send(new PutItemCommand(messageEntity));
        const messageId = unmarshall(messageEntity.Item).id;
        console.log('Message saved successfully.');

        const senderName = messageEntity.Item?.senderName?.S;
        await sendNotification(messageId, message.receiver, message.receiverType, NotificationType.MESSAGE, `There is a new message from ${senderName}`, `${DEEPLINK_BASE_URL}/messages/${messageId}`);
        return messageId;
    } catch (error) {
        console.error('Error saving message or notification:', error);
        throw null;
    }
}


async function addReplyToMessage(messageId, reply) {
    console.log(`add reply to message ${messageId}`);
    const message = await getById(messageId);
    if (!message) {
        console.log(`Message with id ${messageId} not found`);
        throw new Error('Message not found');
    }

    if (!message.replies) {
        message.replies = [];
        console.log("no replies found, creating new array");
    }
    message.replies.push(reply);
    console.log("message.replies", message.replies);

    console.log("adding reply:", reply);
    console.log("to replies:", message.replies);


    const params = {
        TableName: tableName,
        Key: marshall({id: messageId}),
        UpdateExpression: 'SET replies = :replies',
        ExpressionAttributeValues: marshall({
            ':replies': message.replies
        }),
        ReturnValues: 'UPDATED_NEW'
    };

    console.log('params:', JSON.stringify(params, null, 2));

    try {
        const data = await db.send(new UpdateItemCommand(params));
        console.log('Update succeeded:', JSON.stringify(data, null, 2));

        await sendMessageReplyNotification(reply, message, messageId);

        return data.Attributes ? unmarshall(data.Attributes) : {};
    } catch (err) {
        console.error('Unable to update message. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function sendMessageReplyNotification(reply, message, messageId) {
    const recipientId = message.sender === reply.sender ? message.receiver : message.sender;
    const recipientType = message.senderType === reply.senderType ? message.receiverType : message.senderType;

    await sendNotification(messageId, recipientId, recipientType, NotificationType.MESSAGE_REPLY, `${reply.senderName} replied to your message`, `${DEEPLINK_BASE_URL}/messages/${messageId}`);
}

async function getByStudentId(studentId) {
    const params = {
        TableName: tableName,
        FilterExpression: "(sender = :studentId AND senderType = :student) OR (receiver= :studentId AND receiverType = :student)",
        ExpressionAttributeValues: {
            ":studentId": {S: studentId}, ":student": {S: "STUDENT"}
        }
    };

    try {
        const data = await db.send(new ScanCommand(params));
        return data.Items.map(item => unmarshall(item));
    } catch (err) {
        console.error('Unable to fetch messages. Error:', err);
        throw err;
    }
}


async function getByBatchId(batchId) {

    const params = {
        TableName: tableName, FilterExpression: "batchId = :batchId", ExpressionAttributeValues: {
            ':batchId': marshall(batchId),

        },
    };

    try {
        const data = await db.send(new ScanCommand(params));
        return data.Items.map(item => unmarshall(item));
    } catch (err) {
        console.error('Unable to get  by batch. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getById(messageId) {
    const params = {
        TableName: tableName, Key: marshall({id: messageId})
    };


    try {
        const data = await db.send(new GetItemCommand(params));
        return data.Item ? unmarshall(data.Item) : {};
    } catch (err) {
        console.error('Unable to get messages. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


async function deleteById(messageId) {
    const params = {
        TableName: tableName, Key: marshall({id: messageId}),
    };

    try {
        const data = await db.send(new DeleteItemCommand(params));
        console.log('delete result', data);
        return {};
    } catch (err) {
        console.error('Unable to delete messages. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


module.exports = {create, getByStudentId, getById, deleteById, addReplyToMessage, getByBatchId}
