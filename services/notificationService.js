
const {toNotificationEntity} = require('../db/mappers/notificationMapper');
const db = require('../db/dynamodb');
const {
    ScanCommand,
} = require('@aws-sdk/client-dynamodb');
const {unmarshall, marshall} = require('@aws-sdk/util-dynamodb');


const tableName = "Notifications";


async function getByTeacherId(teacherId) {
    const params = {
        TableName: tableName,
        FilterExpression: "teacherId = :teacherId ",
        ExpressionAttributeValues: {
            ':teacherId': marshall(teacherId),
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

async function MarkTeacherNotificationSeen(id) {
    const params = {
        TableName: tableName,
        FilterExpression: "id = :id ",
        ExpressionAttributeValues: {
            ':id': marshall(id),
        },
    };

    try {
        const data = await db.send(new ScanCommand(params));
        return data.Items ? data.Items.map(item => unmarshall(item)) : [];
    } catch (err) {
        console.error('Unable to get mark  teachers by notifications Id as seen . Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}



async function getByStudentId(studentId) {
    const params = {
        TableName: tableName,
        FilterExpression: "studentId = :studentId ",
        ExpressionAttributeValues: {
            ':studentId': marshall(studentId),
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


async function MarkStudentNotificationSeen(id) {
    const params = {
        TableName: tableName,
        FilterExpression: "id = :id ",
        ExpressionAttributeValues: {
            ':id': marshall(id),
          
        },
    };

    try {
        const data = await db.send(new ScanCommand(params));
        return data.Items ? data.Items.map(item => unmarshall(item)) : [];
    } catch (err) {
        console.error('Unable to get mark  Students by notifications Id as seen . Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}
module.exports = {getByTeacherId ,MarkTeacherNotificationSeen,MarkStudentNotificationSeen, getByStudentId}

