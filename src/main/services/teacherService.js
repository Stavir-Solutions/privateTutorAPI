const {toTeacherEntity} = require('../db/mappers/teacherMapper');
const db = require('../db/dynamodb');
const {
    PutItemCommand, UpdateItemCommand, GetItemCommand, ScanCommand, DeleteItemCommand
} = require('@aws-sdk/client-dynamodb');
const {unmarshall, marshall} = require('@aws-sdk/util-dynamodb');


const tableName = "Teachers";

async function isTeacheruserNameTaken(userName, excludeId = null) {
    const params = {
        TableName: tableName,
        FilterExpression: 'userName = :userName',
        ExpressionAttributeValues: {
            ':userName': {S: userName},
        },
    };

    const result = await db.send(new ScanCommand(params));
    if (result.Items && result.Items.length > 0) {
        const item = unmarshall(result.Items[0]);
        if (!excludeId || item.id !== excludeId) {
            return true;
        }
    }
    return false;
}

async function create(teacher) {
    if (await isTeacheruserNameTaken(teacher.userName)) {
        const error = new Error("userName already exists");
        error.statusCode = 409;
        throw error;
    }
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
}async function update(teacherId, teacherFields) {
    const getParams = {
        TableName: tableName,
        Key: marshall({ id: teacherId }),
        ProjectionExpression: 'userName',
    };

    // Step 1: Fetch current userName
    const currentData = await db.send(new GetItemCommand(getParams));
    const currentUserName = currentData.Item ? unmarshall(currentData.Item).userName : null;

    // Step 2: Validate new userName only if it's edited AND different
    const isUserNameInPayload = Object.prototype.hasOwnProperty.call(teacherFields, 'userName');
    const newUserName = teacherFields.userName;

    if (isUserNameInPayload && newUserName !== currentUserName) {
        const isTaken = await isTeacheruserNameTaken(newUserName, teacherId);
        if (isTaken) {
            const error = new Error('userName already exists');
            error.statusCode = 409;
            throw error; // ❌ Throw error, do not update anything
        }
    }

    // Step 3: Build update expression for all fields
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    for (const [key, value] of Object.entries(teacherFields)) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = marshall(value, { convertEmptyValues: true });
    }

    if (updateExpression.length === 0) {
        return { message: 'No fields were updated. Payload was empty.' };
    }

    const updateParams = {
        TableName: tableName,
        Key: marshall({ id: teacherId }),
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW',
    };

    try {
        const data = await db.send(new UpdateItemCommand(updateParams));
        console.log('Update succeeded:', JSON.stringify(data, null, 2));
        return data.Attributes ? unmarshall(data.Attributes) : {};
    } catch (err) {
        console.error('Unable to update teacher. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


async function getTeacherById(teacherId) {
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

async function getTeacherByUserName(userName, throwIfNotFound = false) {
    const params = {
        TableName: tableName,
        FilterExpression: 'userName = :userName',
        ExpressionAttributeValues: {
            ':userName': {S: userName}
        }
    };

    const result = await db.send(new ScanCommand(params));

    if (result.Items && result.Items.length > 0) {
        return unmarshall(result.Items[0]);
    } else {
        if (throwIfNotFound) {
            throw new Error(`TEACHER not found for userName: ${userName}`);
        } else {
            return null;
        }
    }
}


async function updateTeacherPassword(teacherId, newPassword) {
    const params = {
        TableName: tableName,
        Key: {id: {S: teacherId}},
        UpdateExpression: "SET password = :newPassword",
        ExpressionAttributeValues: {
            ":newPassword": {S: newPassword}
        }
    };

    await db.send(new UpdateItemCommand(params));
    console.log("Teacher password updated successfully");
}


module.exports = {
    create,
    getTeacherById,
    getAll,
    deleteById,
    update,
    getTeacherByUserName,
    updateTeacherPassword,
    isTeacheruserNameTaken,
};

