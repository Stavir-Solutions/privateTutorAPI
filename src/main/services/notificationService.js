const {toNotificationEntity} = require('../db/mappers/notificationMapper');
const db = require('../db/dynamodb');
const {
    ScanCommand,
    UpdateItemCommand,
    PutItemCommand
} = require('@aws-sdk/client-dynamodb');
const {unmarshall, marshall} = require('@aws-sdk/util-dynamodb');


const tableName = "Notifications";


async function getByTeacherId(teacherId) {
    const params = {
        TableName: tableName,
        FilterExpression:"recipientId = :recipientId AND recipientType = :recipientType AND seen = :seen",
        ExpressionAttributeValues: {
            ':recipientId': marshall(teacherId),
            ':recipientType': marshall('TEACHER'),
            ':seen': marshall(false)
        },
    };

    try {
        const data = await db.send(new  ScanCommand(params));
        return data.Items ? data.Items.map(item => unmarshall(item)) : [];
    } catch (err) {
        console.error('Unable to get notifications by teacher ID . Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}
async function markNotificationSeen(id) {
    const params = {
        TableName: tableName, 
        Key: marshall({ id }, { removeUndefinedValues: true }), 
        UpdateExpression: "SET seen = :seen, notificationSeenTime = :seenTime",
        ExpressionAttributeValues: marshall(
            {
                ":seen": true,
                ":seenTime": new Date().toISOString(),
            },
            { removeUndefinedValues: true } 
        ),
        ReturnValues: "UPDATED_NEW"
    };

    try {
        const data = await db.send(new UpdateItemCommand(params));
        return data.Attributes ? unmarshall(data.Attributes) : {}; 
    } catch (err) {
        console.error("Unable to mark notification as seen. Error:", JSON.stringify(err, null, 2));
        throw err;
    }
}
async function getByStudentId(studentId) {
    const params = {
        TableName: tableName,
        FilterExpression: "recipientId = :recipientId AND recipientType = :recipientType AND seen = :seen",
        ExpressionAttributeValues: {
            ":recipientId": marshall(studentId),
            ":recipientType": marshall("STUDENT"),
            ":seen": marshall(false),
        },
    };
    try {
        const data = await db.send(new ScanCommand(params));
        return data.Items ? data.Items.map(item => unmarshall(item)) : [];
    } catch (err) {
        console.error('Unable to get notifications by student ID . Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}
module.exports = {getByTeacherId ,markNotificationSeen, getByStudentId}

