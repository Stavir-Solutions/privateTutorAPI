const {toStudentEntity} = require('../db/mappers/studentMapper');
const db = require('../db/dynamodb');

const tableName = "Students";

async function create(student) {
    let studentEntity = toStudentEntity(student);
    console.log('converted to entity ', studentEntity);
    await db.put(studentEntity, function (err, data) {
        if (err) {
            console.error('Unable to add teacher. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('PutItem succeeded:', JSON.stringify(data, null, 2));
        }
    });
    return studentEntity.Item.id;
}

async function update(studentId, studentFields) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    console.log("Updating student fields", studentFields);
    for (const [key, value] of Object.entries(studentFields)) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
    }

    const params = {
        TableName: tableName,
        Key: {id: studentId},
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW'
    };

    try {
        const data = await db.update(params).promise();
        console.log('Update succeeded:', JSON.stringify(data, null, 2));
        return data.Attributes;
    } catch (err) {
        console.error('Unable to update student. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getById(studentId) {
    const params = {
        TableName: tableName, Key: {
            id: studentId,
        },
    };

    try {
        const data = await db.get(params).promise();
        return data.Item;
    } catch (err) {
        console.error('Unable to get teacher. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getByBatchId(batchId) {
    var params = {
        TableName : tableName,
        FilterExpression: "contains (batches, :batchId)",
        ExpressionAttributeValues : {
            ':batchId' : batchId
        }
    };

    try {
        const data = await db.scan(params).promise();
        return data.Items;
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
        const data = await db.scan(params).promise();
        console.log('scan result', data);
        return data.Items;
    } catch (err) {
        console.error('Unable to get student. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function deleteById(studentId) {
    const params = {
        TableName: tableName, Key: {
            id: studentId,
        },
    };

    try {
        const data = await db.delete(params).promise();
        console.log('delete result', data);
        return {};
    } catch (err) {
        console.error('Unable to delete student. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


module.exports = {create, getById, getAll, deleteById, update, getByBatchId}

