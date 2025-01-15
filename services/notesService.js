const {toNotesEntity} = require('../db/mappers/notesMapper');
const db = require('../db/dynamodb');
const {
    PutItemCommand,
    UpdateItemCommand,
    GetItemCommand,
    ScanCommand,
    DeleteItemCommand
} = require('@aws-sdk/client-dynamodb');
const {unmarshall, marshall} = require('@aws-sdk/util-dynamodb');


const tableName = "Notes";

async function create(notes) {
    let notesEntity = toNotesEntity(notes);
    console.log('converted to entity ', notesEntity);

    await db.send(new PutItemCommand(notesEntity, function (err, data) {
        if (err) {
            console.error('Unable to add notes. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('PutItem succeeded:', JSON.stringify(data, null, 2));
        }
    }));
    return unmarshall(notesEntity.Item).id;
}


async function updateNotes(notesId, notesFields) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    console.log("Updating notes fields:", notesFields);
    for (const [key, value] of Object.entries(notesFields)) {
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
        Key: {id: {S: notesId}},
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
        console.error('Unable to update notes. Error JSON:', JSON.stringify(err, null, 2));
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
        console.error('Unable to get notes by batch. Error JSON:', JSON.stringify(err, null, 2));
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
        console.error('Unable to get notes by batch. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function deleteById(notesId) {
    const params = {
        TableName: tableName, 
        Key: marshall({id: notesId}),
    };

    try {
        const data = await db.send(new DeleteItemCommand(params));
        console.log('delete result', data);
        return {};
    } catch (err) {
        console.error('Unable to delete notes. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


module.exports = {create,updateNotes, getByStudentId, deleteById,getByBatchId}

