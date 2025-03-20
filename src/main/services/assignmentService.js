const { toAssignmentEntity } = require('../db/mappers/assignmentMapper');
const { generateUUID } = require('../../main/db/UUIDGenerator');
const { toNotificationEntity } = require('../db/mappers/notificationMapper');
const { getById: getBatchById } = require('./batchService');
const { getByBatchId: getBatchStudents } = require('./studentService');
const db = require('../db/dynamodb');
const {
    PutItemCommand,
    UpdateItemCommand,
    GetItemCommand,
    ScanCommand,
    DeleteItemCommand
} = require('@aws-sdk/client-dynamodb');
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb');

const BASE_URL = process.env.BASE_URL;

const tableName = "Assignments";

async function sendAssignmentNotification(assignment,assignmentId) {
    const { batchId, studentId, submissionDate } = assignment;

    let recipients = [];
    let batchName = "Unknown Batch";
    console.log("Assignment Details:", assignment);

    if (batchId) {
        const batchDetails = await getBatchById(batchId);
        console.log("Batch Details Retrieved:", batchDetails);
        batchName = batchDetails?.name || "Unknown Batch";
        
        const students = await getBatchStudents(batchId);
        console.log("Batch Students:", students);
        recipients = students.map(student => ({ id: studentId, type: "STUDENT" }));
    } else if (studentId) {
        recipients.push({ id: studentId, type: "STUDENT" });
    }

    if (recipients.length === 0) {
        console.error("No recipients found for the assignment notification.");
        return;
    }

    const formattedSubmissionDate = new Date(submissionDate).toISOString().split("T")[0];
    const notificationTitle = `A new assignment in ${batchName}. Submit it by ${formattedSubmissionDate}`;

    for (const recipient of recipients) {
        const notification = {
            id: generateUUID(),
            recipientId: recipient.id,
            recipientType: recipient.type,
            type: "ASSIGNMENT",
            title: notificationTitle,
            objectId: assignmentId,
            deeplink: `${BASE_URL}/assignments/${assignmentId}`,
            seen: false,
            notificationTime: new Date().toISOString(),
        };

        const notificationEntity = toNotificationEntity(notification);
        await db.send(new PutItemCommand(notificationEntity));
        console.log('Notification triggered successfully with ID:', notification.id);
    }
}

async function create(assignment) {
    const assignmentEntity = toAssignmentEntity(assignment);
    console.log('Converted to entity:', assignmentEntity);
      const assignmentId = unmarshall(assignmentEntity.Item).id;
    try {
        await db.send(new PutItemCommand(assignmentEntity));
        console.log('Assignment added successfully.');
        await sendAssignmentNotification(assignment, assignmentId);
        return assignmentId;
    } catch (err) {
        console.error('Unable to add assignment:', err);
        throw err;
    }
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

    try {
        const data = await db.send(new UpdateItemCommand(params));
        console.log('Update succeeded:', JSON.stringify(data, null, 2));
        const updatedAssignment = data.Attributes ? unmarshall(data.Attributes) : {};
        await sendAssignmentNotification(updatedAssignment);
        return updatedAssignment;
 
    } catch (err) {
        console.error('Unable to update assignment. Error JSON:', JSON.stringify(err, null, 2));
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
        console.error('Unable to get assignments by batch ID and student ID. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getByBatchId(batchId) {
    const params = {
        TableName: tableName, FilterExpression: "batchId = :batchId", ExpressionAttributeValues: {
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

