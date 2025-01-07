const {toTeacherEntity} = require('../db/mappers/teacherMapper');
const db = require('../db/dynamodb');
const {
    PutItemCommand, UpdateItemCommand, GetItemCommand, ScanCommand, DeleteItemCommand
} = require('@aws-sdk/client-dynamodb');
const {unmarshall, marshall} = require('@aws-sdk/util-dynamodb');


const tableName = "Teachers";

async function create(teacher) {
    let teacherEntity = toTeacherEntity(teacher);
    console.log('converted to entity ', teacherEntity);
    await db.send(new PutItemCommand(teacherEntity, function (err, data) {
        if (err) {
            console.error('Unable to add teacher. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('PutItem succeeded:', JSON.stringify(data, null, 2));
        }
    }));
    return unmarshall(teacherEntity.Item).id;
}

async function update(teacherId, teacherFields) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    console.log("Updating teacher fields", teacherFields);
    for (const [key, value] of Object.entries(teacherFields)) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = marshall(value);
    }

    const params = {
        TableName: tableName,
        Key: {id: {S: teacherId}},
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW'
    };

    console.log('update params ', params)
    try {
        const data = await db.send(new UpdateItemCommand(params));
        console.log('Update succeeded:', JSON.stringify(data, null, 2));
        return unmarshall(data.Attributes);
    } catch (err) {
        console.error('Unable to update teacher. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getById(teacherId) {
    const params = {
        TableName: tableName, Key: {
            id: {S: teacherId}
        },
    };

    try {
        console.log("get by id ", teacherId);
        const data = await db.send(new GetItemCommand(params));
        console.log(data)
        return data.Item ? unmarshall(data.Item) : {};
    } catch (err) {
        console.error('Unable to get teacher. Error JSON:', JSON.stringify(err, null, 2));
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
        console.error('Unable to get teacher. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function deleteById(teacherId) {
    const params = {
        TableName: tableName, Key: {id: {S: teacherId}},
    };

    try {
        console.log("delete by id ", teacherId);
        const data = await db.send(new DeleteItemCommand(params));
        // console.log('delete result', data);
        return {};
    } catch (err) {
        console.error('Unable to delete teacher. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


module.exports = {create, getById, getAll, deleteById, update}

