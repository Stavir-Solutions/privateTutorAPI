const {toTestEntity} = require('../db/mappers/testMapper');
const db = require('../db/dynamodb');
const {
    PutItemCommand,
    UpdateItemCommand,
    ScanCommand,
    DeleteItemCommand,
    GetItemCommand
} = require('@aws-sdk/client-dynamodb');
const {unmarshall, marshall} = require('@aws-sdk/util-dynamodb');


const tableName = "Tests";

async function create(test) {
    let testEntity = toTestEntity(test);
    console.log('converted to entity ', testEntity);

    let result = await db.send(new PutItemCommand(testEntity ));
    console.log("Test created with id:", result);
    return unmarshall(result.Item).id;
}


async function updateTest(testId, testFields) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    console.log("Updating test fields:", testFields);
    for (const [key, value] of Object.entries(testFields)) {
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
        Key: {id: {S: testId}},
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
        console.error('Unable to update test. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}



async function getallByBatch(batchId) {
    const params = {
        TableName: tableName, FilterExpression: "batchId = :batchId", ExpressionAttributeValues: {
            ':batchId': marshall(batchId),

        },
    };

    try {
        const data = await db.send(new ScanCommand(params));
        return data.Items.map(item => unmarshall(item));
    } catch (err) {
        console.error('Unable to get test by batch. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


async function getById(testId) {
    const params = {
        TableName: tableName,
            Key: marshall({ id: testId })
        
    };

    try {
        const data = await db.send(new GetItemCommand(params));
        return data.Item ? unmarshall(data.Item) : {};
    } catch (err) {
        console.error('Unable to get test by id. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function deletetestById(testId) {
    const params = {
        TableName: tableName, 
        Key: marshall({id: testId}),
    };

    try {
        const data = await db.send(new DeleteItemCommand(params));
        console.log('delete result', data);
        return {};
    } catch (err) {
        console.error('Unable to delete test. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


module.exports =  {create,updateTest, getById, deletetestById,getallByBatch}

