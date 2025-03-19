const {toMessageEntity} = require('../db/mappers/messageMapper');
const {toNotificationEntity} = require('../db/mappers/notificationMapper');
const {generateUUID} = require('../../main/db/UUIDGenerator');
const db = require('../db/dynamodb');
const {
    PutItemCommand, UpdateItemCommand, GetItemCommand, ScanCommand, DeleteItemCommand
} = require('@aws-sdk/client-dynamodb');
const {unmarshall, marshall} = require('@aws-sdk/util-dynamodb');
async function sendNotification(messageId, recipientId, recipientType, type, notificationtitle) {
    const notificationId = generateUUID();
    const BASE_URL = process.env.BASE_URL;

    const notification = {
        id: notificationId,
        recipientId,
        recipientType,
        type: type,
        title: notificationtitle,
        objectId: messageId,
        deeplink: `${BASE_URL}/messages/${messageId}`,
        seen: false,
        notificationTime: new Date().toISOString(),
    };
       console.log('Notification:', notification); 

    const notificationEntity = toNotificationEntity(notification);
    console.log('Notification entity:', notificationEntity);
    await db.send(new PutItemCommand(notificationEntity));
    console.log('Notification triggered successfully with ID:', notificationId);
}

const tableName = "Messages";

async function create(message) {
    let messageEntity = toMessageEntity(message);
    console.log('Converted to entity:', messageEntity);

    try {
        await db.send(new PutItemCommand(messageEntity));
        console.log('Message saved successfully.');

        const messageId = unmarshall(messageEntity.Item).id;
        const senderName = messageEntity.Item?.senderName?.S;
        const recipientId = message.receiver;
        const recipientType = message.receiverType;

    const type = "MESSAGE_REPLY";
   
    const notificationTitle =
    recipientType === "STUDENT" ? `There is a new message from ${senderName}`
    : recipientType === "TEACHER" ? `There is a new message from ${senderName}`
    : "NULL";


        await sendNotification(messageId, recipientId, recipientType,type,notificationTitle);

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
   console.log("message.replies",message.replies);
    
    console.log("adding reply:", reply);
    console.log("to replies:", message.replies);
    
    const senderId = reply.sender;
    const senderName = reply.senderName;
    
    const recipientId = message.sender === reply.sender ? message.receiver : message.sender;
    const recipientType = message.senderType === reply.senderType ? message.receiverType : message.senderType;
    
    if (!recipientId) {
        console.error("Error: Cannot determine recipient for notification.");
        throw new Error("Recipient not found in the original message.");
    }
    
    let notificationTitle = "";
    if (recipientType === "STUDENT") {
        console.log("recipient is student",senderName);
        notificationTitle = `${senderName} replied to your message`;
    } else if (recipientType === "TEACHER") {
        console.log("recipient is teacher",senderName);
        notificationTitle = `${senderName} replied to your message`;
    } else {
        notificationTitle = "NULL";
    }
    
    const type = "MESSAGE_REPLY";
    
    const params = {
        TableName: tableName,
        Key: marshall({ id: messageId }),
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
        
        // Automatically trigger notification
        await sendNotification(messageId, recipientId, recipientType, type, notificationTitle);

        return data.Attributes ? unmarshall(data.Attributes) : {};
    } catch (err) {
        console.error('Unable to update message. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}
async function getByStudentId(studentId) {
    const params = {
        TableName: tableName,
        FilterExpression: "(sender = :studentId AND senderType = :student) OR (receiver= :studentId AND receiverType = :student)",
        ExpressionAttributeValues: {
            ":studentId": { S: studentId },
            ":student": { S: "STUDENT" }  
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
