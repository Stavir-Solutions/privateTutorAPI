const {toFeeRecordEntity} = require('../db/mappers/feeRecordMapper');
const db = require('../db/dynamodb');
const {
    PutItemCommand,
    UpdateItemCommand,
    GetItemCommand,
    ScanCommand,
    DeleteItemCommand
} = require('@aws-sdk/client-dynamodb');
const {unmarshall, marshall} = require('@aws-sdk/util-dynamodb');

const tableName = "FeeRecords";

async function create(feeRecord) {
    let FeeRecordEntity = toFeeRecordEntity(feeRecord);
    console.log('converted to entity ',FeeRecordEntity);

    await db.send(new PutItemCommand(FeeRecordEntity, function (err, data) {
        if (err) {
            console.error('Unable to add feeRecord. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('PutItem succeeded:', JSON.stringify(data, null, 2));
        }
    }));
    return unmarshall(FeeRecordEntity.Item).id;
}


async function updateFeeRecord(feeRecordId, feeRecordFields) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    console.log("Updating feeRecord fields:", feeRecordFields);
    for (const [key, value] of Object.entries(feeRecordFields)) {
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
        Key: {id: {S: feeRecordId}},
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
        console.error('Unable to update feeRecord. Error JSON:', JSON.stringify(err, null, 2));
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
        console.error('Unable to get feeRecords by batch ID and student ID. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}async function getbyBatchId(batchId) {

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

async function getById(feeRecordId) {
    const params = {
        TableName: tableName,
        Key: marshall({ id: feeRecordId })
    };

   
    try {
        const data = await db.send(new GetItemCommand(params));
        return data.Item ? unmarshall(data.Item) : {};
    } catch (err) {
        console.error('Unable to get feeRecord. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


async function deleteById(feeRecordId) {
    const params = {
        TableName: tableName, Key: marshall({id: feeRecordId}),
    };

    try {
        const data = await db.send(new DeleteItemCommand(params));
        console.log('delete result', data);
        return {};
    } catch (err) {
        console.error('Unable to delete feeRecord. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }}

async function getexpireFeeRecords(batchId, studentId, days = 10) {
    try {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        const futureDateStr = futureDate.toISOString().split('T')[0];

        const params = {
            TableName: 'FeeRecords',
            FilterExpression: '#batchId = :batchId AND #studentId = :studentId AND #status = :pending AND #dueDate <= :future',

            ExpressionAttributeNames: {
                '#batchId': 'batchId',
                '#studentId': 'studentId',
                '#status': 'status',
                '#dueDate': 'dueDate'
            },
            ExpressionAttributeValues: {
                ':batchId': { S: batchId },
                ':studentId': { S: studentId },
                ':pending': { S: 'pending' },
                ':future': { S: futureDateStr }
            }
        };

        const result = await db.send(new ScanCommand(params));
        const items = result.Items ? result.Items.map(item => unmarshall(item)) : [];

        console.log('Filtered fee records:', items);
        return items;
    } catch (err) {
        console.error('Error fetching filtered fee records from DB:', JSON.stringify(err, null, 2));
        throw err;
    }
}


module.exports = {create, getByBatchIdAndStudentId ,getbyBatchId, getById, deleteById, updateFeeRecord, getexpireFeeRecords}

