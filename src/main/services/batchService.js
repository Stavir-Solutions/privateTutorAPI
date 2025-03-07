const {toBatchEntity} = require('../db/mappers/batchMapper');
const db = require('../db/dynamodb');
const {
    PutItemCommand, UpdateItemCommand, GetItemCommand, ScanCommand, DeleteItemCommand
} = require('@aws-sdk/client-dynamodb');
const {marshall, unmarshall} = require('@aws-sdk/util-dynamodb');

const tableName = "Batches";

async function create(batch) {
    let batchEntity = toBatchEntity(batch);
    console.log('converted to entity ', batchEntity);
    await db.send(new PutItemCommand(batchEntity, function (err, data) {
        if (err) {
            console.error('Unable to add batch. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('PutItem succeeded:', JSON.stringify(data, null, 2));
        }
    }));
    return unmarshall(batchEntity.Item).id;
}

async function update(batchId, batchFields) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    console.log("Updating batch fields", batchFields);
    for (const [key, value] of Object.entries(batchFields)) {
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
        Key: marshall({id: batchId}),
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW',
    };

    try {
        const data = await db.send(new UpdateItemCommand(params));
        console.log('Update succeeded:', JSON.stringify(data, null, 2));
        return data.Attributes ? unmarshall(data.Attributes) : {};
    } catch (err) {
        console.error('Unable to update batch. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getById(batchId) {
    const params = {
        TableName: tableName, Key: marshall({id: batchId}),
    };

    try {
        const data = await db.send(new GetItemCommand(params));
        return data.Item ? unmarshall(data.Item) : {};
    } catch (err) {
        console.error('Unable to get batch. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getByTeacherId(teacherId) {
    const params = {
        TableName: tableName, FilterExpression: "teacherId = :teacherId", ExpressionAttributeValues: {
            ':teacherId': {S: teacherId},
        },
    };

    try {
        const data = await db.send(new ScanCommand(params));
        return data.Items.map(item => unmarshall(item));
    } catch (err) {
        console.error('Unable to get batch by teacher. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function deleteById(batchId) {
    const params = {
        TableName: tableName, Key: marshall({id: batchId}),
    };

    try {
        const data = await db.send(new DeleteItemCommand(params));
        console.log('delete result', data);
        return {};
    } catch (err) {
        console.error('Unable to delete batch. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

module.exports = {create, getById, deleteById, update, getByTeacherId}

