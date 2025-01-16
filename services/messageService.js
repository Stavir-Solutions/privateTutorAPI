const {toMessageEntity} = require('../db/mappers/messageMapper');
const db = require('../db/dynamodb');
const {
    PutItemCommand,
    UpdateItemCommand,
    GetItemCommand,
    ScanCommand,
    DeleteItemCommand
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


async function updateMessage(messageId, messageFields) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};
    

    console.log("Updating messages fields:", messageFields);
    for (const [key, value] of Object.entries(messageFields)) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        if (Array.isArray(value)) {
            expressionAttributeValues[`:${key}`] = { L: value.map(item => marshall(item, { convertEmptyValues: true })) };
        } else {
            expressionAttributeValues[`:${key}`] = marshall(value, { convertEmptyValues: true });
        }
    }

    const params = {
        TableName: tableName,
        Key: {id: {S: messageId}},
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW',
    };

    try {
        const data = await db.send(new UpdateItemCommand(params));
        console.log('Update succeeded:', JSON.stringify(data, null, 2));
        return unmarshall(data.Attributes);
    } catch (err) {
        console.error('Unable to update message. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


async function getByBatchIdAndStudentId(batchId, studentId) {
    const params = {
        TableName: tableName,
        FilterExpression: "batchId = :batchId AND studentId = :studentId",
        ExpressionAttributeValues: {
            ':batchId': marshall(batchId),
            ':studentId': marshall(studentId),
        },
    };

    try {
        const data = await db.send(new ScanCommand(params));
        return data.Items ? data.Items.map(item => unmarshall(item)) : [];
    } catch (err) {
        console.error('Unable to get messages by batch ID and student ID. Error JSON:', JSON.stringify(err, null, 2));
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
        TableName: tableName,
        Key: marshall({ id: messageId })
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


module.exports = {create, getByBatchIdAndStudentId , getById, deleteById, updateMessage, getByBatchId}

