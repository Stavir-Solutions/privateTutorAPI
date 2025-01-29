const {toTestResultEntity} = require('../db/mappers/testResultMapper');
const db = require('../db/dynamodb');
const {
    PutItemCommand,
    UpdateItemCommand,
    ScanCommand,
    DeleteItemCommand,
    GetItemCommand
} = require('@aws-sdk/client-dynamodb');
const {unmarshall, marshall} = require('@aws-sdk/util-dynamodb');


const tableName = "TestResults";

async function create(testResult) {
    let testResultEntity = toTestResultEntity(testResult);
    console.log('converted to entity ', testResultEntity);

    await db.send(new PutItemCommand(testResultEntity, function (err, data) {
        if (err) {
            console.error('Unable to add test. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('PutItem succeeded:', JSON.stringify(data, null, 2));
        }
    }));
    return unmarshall(testResultEntity.Item).id;
}


async function updateTestResult(testResultId, testResultFields) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    console.log("Updating test fields:", testResultFields);
    for (const [key, value] of Object.entries(testResultFields)) {
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
        Key: {id: {S: testResultId}},
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
        console.error('Unable to update testResult. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}



async function getAllByStudentId(studentId) {
    const params = {
        TableName: tableName, FilterExpression: "studentId = :studentId", ExpressionAttributeValues: {
            ':studentId': marshall(studentId),

        },
    };

    try {
        const data = await db.send(new ScanCommand(params));
        return data.Items.map(item => unmarshall(item));
    } catch (err) {
        console.error('Unable to get testResult by student. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getAllByTestId(testId) {
    const params = {
        TableName: tableName, FilterExpression: "testId = :testId", ExpressionAttributeValues: {
            ':testId': marshall(testId),

        },
    };

    try {
        const data = await db.send(new ScanCommand(params));
        return data.Items.map(item => unmarshall(item));
    } catch (err) {
        console.error('Unable to get testResult by test. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


async function getById(testResultId) {
    const params = {
        TableName: tableName,
            Key: marshall({ id: testResultId })
        
    };

    try {
        const data = await db.send(new GetItemCommand(params));
        return data.Item ? unmarshall(data.Item) : {};
    } catch (err) {
        console.error('Unable to get test by id. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function deleteById(testResultId) {
    const params = {
        TableName: tableName, 
        Key: marshall({id: testResultId}),
    };

    try {
        const data = await db.send(new DeleteItemCommand(params));
        console.log('delete result', data);
        return {};
    } catch (err) {
        console.error('Unable to delete testResult. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


module.exports =  {create,updateTestResult, getById, deleteById,getAllByStudentId,getAllByTestId}

