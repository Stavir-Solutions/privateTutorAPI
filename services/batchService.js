const {toBatchEntity} = require('../db/mappers/batchMapper');
const db = require('../db/dynamodb');

const tableName = "Batches";

async function create(batch) {
    let batchEntity = toBatchEntity(batch);
    console.log('converted to entity ', batchEntity);
    await db.put(batchEntity, function (err, data) {
        if (err) {
            console.error('Unable to add batch. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('PutItem succeeded:', JSON.stringify(data, null, 2));
        }
    });
    return batchEntity.Item.id;
}

async function update(batchId, batchFields) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    console.log("Updating teacher fields", batchFields);
    for (const [key, value] of Object.entries(batchFields)) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
    }

    const params = {
        TableName: tableName,
        Key: {id: batchId},
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
        console.error('Unable to update Batch. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getById(batchId) {
    const params = {
        TableName: tableName, Key: {
            id: batchId,
        },
    };

    try {
        const data = await db.get(params).promise();
        return data.Item;
    } catch (err) {
        console.error('Unable to get batch. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getByTeacherId(teacherId) {
    var params = {
        TableName : tableName,
        FilterExpression: "teacherId = :teacherId",
        ExpressionAttributeValues : {
            ':teacherId' : teacherId
        }
    };

    try {
        const data = await db.scan(params).promise();
        return data.Items;
    } catch (err) {
        console.error('Unable to get batch. Error JSON:', JSON.stringify(err, null, 2));
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
        console.error('Unable to get Batches. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function deleteById(batchId) {
    const params = {
        TableName: tableName, Key: {
            id: batchId,
        },
    };

    try {
        const data = await db.delete(params).promise();
        console.log('delete result', data);
        return {};
    } catch (err) {
        console.error('Unable to delete Batch. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


module.exports = {create, getById, getAll, deleteById, update, getByTeacherId}

