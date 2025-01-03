const {toTeacherEntity} = require('../db/mappers/teacherMapper');
const db = require('../db/dynamodb');

const tableName = "Teachers";

async function create(teacher) {
    let teacherEntity = toTeacherEntity(teacher);
    console.log('converted to entity ', teacherEntity);
    await db.put(teacherEntity, function (err, data) {
        if (err) {
            console.error('Unable to add teacher. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('PutItem succeeded:', JSON.stringify(data, null, 2));
        }
    });
    return teacherEntity.Item.id;
}

async function update(teacherId, teacherFields) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    console.log("Updating teacher fields", teacherFields);
    for (const [key, value] of Object.entries(teacherFields)) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
    }

    const params = {
        TableName: tableName,
        Key: {id: teacherId},
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
        console.error('Unable to update teacher. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getById(teacherId) {
    const params = {
        TableName: tableName, Key: {
            id: teacherId,
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

async function getAll() {
    const params = {
        TableName: tableName,
    };

    try {
        const data = await db.scan(params).promise();
        console.log('scan result', data);
        return data.Items;
    } catch (err) {
        console.error('Unable to get teacher. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function deleteById(teacherId) {
    const params = {
        TableName: tableName, Key: {
            id: teacherId,
        },
    };

    try {
        const data = await db.delete(params).promise();
        console.log('delete result', data);
        return {};
    } catch (err) {
        console.error('Unable to delete teacher. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


module.exports = {create, getById, getAll, deleteById, update}

