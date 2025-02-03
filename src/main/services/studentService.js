const {toStudentEntity} = require('../db/mappers/studentMapper');
const db = require('../db/dynamodb');
const {
    PutItemCommand,
    UpdateItemCommand,
    GetItemCommand,
    ScanCommand,
    DeleteItemCommand
} = require('@aws-sdk/client-dynamodb');
const {unmarshall, marshall} = require('@aws-sdk/util-dynamodb');


const tableName = "Students";

async function create(student) {
    let studentEntity = toStudentEntity(student);
    console.log('converted to entity ', studentEntity);

    await db.send(new PutItemCommand(studentEntity, function (err, data) {
        if (err) {
            console.error('Unable to add teacher. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('PutItem succeeded:', JSON.stringify(data, null, 2));
        }
    }));
    return unmarshall(studentEntity.Item).id;
}


async function updateStudent(studentId, studentFields) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    console.log("Updating student fields", studentFields);
    for (const [key, value] of Object.entries(studentFields)) {
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
        Key: marshall({id: studentId}),
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW',
    };

    console.log('update params ', params);
    try {
        const data = await db.send(new UpdateItemCommand(params));
        console.log('Update succeeded:', JSON.stringify(data, null, 2));
        return unmarshall(data.Attributes);
    } catch (err) {
        console.error('Unable to update student. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getStudentById(studentId) {
    const params = {
        TableName: tableName, Key: marshall({id: studentId}),
    };

    try {
        const data = await db.send(new GetItemCommand(params));
        return data.Item ? unmarshall(data.Item) : {};
    } catch (err) {
        console.error('Unable to get student. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getByBatchId(batchId) {
    const params = {
        TableName: tableName, FilterExpression: "batchId = :batchId", ExpressionAttributeValues: {
            ':batchId': {S: batchId},
        },
    };

    try {
        const data = await db.send(new ScanCommand(params));
        return data.Items.map(item => unmarshall(item));
    } catch (err) {
        console.error('Unable to get student by batch. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getAll() {
    const params = {
        TableName: tableName,
    };

    try {
        const data = await db.send(new ScanCommand(params));
        console.log('scan result', data);
        return data.Items.map(item => unmarshall(item));
    } catch (err) {
        console.error('Unable to get students. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function deleteById(studentId) {
    const params = {
        TableName: tableName, Key: marshall({id: studentId}),
    };

    try {
        const data = await db.send(new DeleteItemCommand(params));
        console.log('delete result', data);
        return {};
    } catch (err) {
        console.error('Unable to delete student. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


module.exports = {create, getStudentById, getAll, deleteById, updateStudent, getByBatchId}

