const {toAssignmentEntity} = require('../db/mappers/assignmentMapper');
const db = require('../db/dynamodb');
const {
    PutItemCommand,
    UpdateItemCommand,
    GetItemCommand,
    ScanCommand,
    DeleteItemCommand
} = require('@aws-sdk/client-dynamodb');
const {unmarshall, marshall} = require('@aws-sdk/util-dynamodb');


const tableName = "Assignments";

async function create(assignment) {
    let assignmentEntity = toAssignmentEntity(assignment);
    console.log('converted to entity ', assignmentEntity);

    await db.send(new PutItemCommand(assignmentEntity, function (err, data) {
        if (err) {
            console.error('Unable to add assignments. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('PutItem succeeded:', JSON.stringify(data, null, 2));
        }
    }));
    return unmarshall(assignmentEntity.Item).id;
}


async function updateAssignment(assignmentId, assignmentFields) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    console.log("Updating assignment fields:", assignmentFields);
    for (const [key, value] of Object.entries(assignmentFields)) {
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
        Key: {id: {S: assignmentId}},
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
        console.error('Unable to update assignment. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


async function getByBatchIdAndStudentId(batchId, studentId) {
    const params = {
        TableName: tableName,
        FilterExpression: "contains (batches, :batchId) AND studentId = :studentId", ExpressionAttributeValues: {
            ':batchId': marshall(batchId),
            ':studentId': marshall(studentId),
        },
    };

    try {
        const data = await db.send(new GetItemCommand(params));
        return data.Item ? unmarshall(data.Item) : {};
    } catch (err) {
        console.error('Unable to get assignments by batch ID and student ID. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getByBatchId(batchId) {
    const params = {
        TableName: tableName, FilterExpression: "contains (batches, :batchId)", ExpressionAttributeValues: {
            ':batchId': marshall(batchId),
        },
    };

    try {
        const data = await db.send(new ScanCommand(params));
        return data.Items.map(item => unmarshall(item));
    } catch (err) {
        console.error('Unable to get assignments by batch. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getById(assignmentId) {
    const params = {
        TableName: tableName,
        Key: marshall({ id: assignmentId })
    };

   
    try {
        const data = await db.send(new GetItemCommand(params));
        return data.Item ? unmarshall(data.Item) : {};
    } catch (err) {
        console.error('Unable to get assignment. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


async function deleteById(assignmentId) {
    const params = {
        TableName: tableName, Key: marshall({id: assignmentId}),
    };

    try {
        const data = await db.send(new DeleteItemCommand(params));
        console.log('delete result', data);
        return {};
    } catch (err) {
        console.error('Unable to delete assignments. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


module.exports = {create, getByBatchIdAndStudentId , getById, deleteById, updateAssignment, getByBatchId}

