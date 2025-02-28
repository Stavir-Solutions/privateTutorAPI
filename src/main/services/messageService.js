const {toMessageEntity} = require('../db/mappers/messageMapper');
const db = require('../db/dynamodb');
const {
    PutItemCommand, UpdateItemCommand, GetItemCommand, ScanCommand, DeleteItemCommand
} = require('@aws-sdk/client-dynamodb');
const {unmarshall, marshall} = require('@aws-sdk/util-dynamodb');


const tableName = "Messages";

async function create(message) {
    let messageEntity = toMessageEntity(message);
    console.log('converted to entity ', messageEntity);

    await db.send(new PutItemCommand(messageEntity, function (err, data) {
        if (err) {
            console.error('Unable to add messages. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('PutItem succeeded:', JSON.stringify(data, null, 2));
        }
    }));
    return unmarshall(messageEntity.Item).id;
}

async function addReplyToMessage(messageId, reply) {
    console.log('add reply to message {}', messageId);
    const message = await getById(messageId);
    if (!message) {
        console.log('Message with id {} not found', messageId);
        throw new Error('Message not found');
    }
    console.log("message:", message);

    if (!message.replies) {
        message.replies = [];
        console.log("no replies found, creating new array");
    }
    message.replies.push(reply);

    console.log("adding reply:", reply);
    console.log("to replies:", message.replies);

    console.log("each element in replies");

    let marshalledReplies = [];
    for (reply of message.replies) {
        console.log("reply:", reply);
        let marshalledReply = marshall(reply, {convertEmptyValues: true});
        marshalledReplies.push(marshalledReply);
        console.log("marshalledReply:", marshalledReply);
    }

    const params = {
        TableName: tableName, Key: marshall({id: messageId}), UpdateExpression: 'SET #replies = :replies',
        ExpressionAttributeNames: {
            '#replies': 'replies',
        }, ExpressionAttributeValues: {
            ':replies': message.replies ? {"L":marshall(message.replies)} : {L: []}
        }, ReturnValues: 'UPDATED_NEW'
    }

    console.log('params:', JSON.stringify(params, null, 2));

    // send the update request to dynamodb
    try {
        const data = await db.send(new UpdateItemCommand(params));
        console.log('Update succeeded:', JSON.stringify(data, null, 2));
        return data.Attributes ? unmarshall(data.Attributes) : {};
    } catch (err) {
        console.error('Unable to update message. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }

}

async function getByStudentId(studentId) {
    const params = {
        TableName: tableName, FilterExpression: "studentId = :studentId", ExpressionAttributeValues: {
            ':studentId': marshall(studentId),
        },
    };

    try {
        const data = await db.send(new ScanCommand(params));
        return data.Items.map(item => unmarshall(item));
    } catch (err) {
        console.error('Unable to get by student. Error JSON:', JSON.stringify(err, null, 2));
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

