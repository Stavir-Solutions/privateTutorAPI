const { toNotesEntity } = require('../db/mappers/notesMapper');
const db = require('../db/dynamodb');
const {
    PutItemCommand,
    UpdateItemCommand,
    GetItemCommand,
    ScanCommand,
    DeleteItemCommand
} = require('@aws-sdk/client-dynamodb');
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb');
const { NotificationType } = require('../common/types');
const { sendNotification } = require("./notificationService");
const { getById: getBatchById } = require('./batchService');
const {getByBatchId:getBatchStudents} = require('./studentService');


const DEEPLINK_BASE_URL = process.env.DEEPLINK_BASE_URL;

const tableName = "Notes";

async function sendNotesNotification(notes, notesId) {
    const { batchId, studentId } = notes;

    let recipients = [];
    let batchName = "Unknown Batch";
    console.log("Notes Details:", notes);

    if (batchId) {
        const batchDetails = await getBatchById(batchId);
        console.log("Batch Details Retrieved:", batchDetails);
        batchName = batchDetails?.name || "Unknown Batch";
        
        const students = await getBatchStudents(batchId);
        console.log("Batch Students:", students);
        recipients = students.map(student => ({id: student.id, type: "STUDENT"}));

    }else if (studentId) {
        recipients.push({ id: studentId, type: "STUDENT" });
    }

    if (recipients.length === 0) {
        console.error("No recipients found for the notes notification.");
        return;
    }
    for (const recipient of recipients) {
        await sendNotification(notesId, recipient.id, recipient.type, NotificationType.NOTES, `A new notes is added to ${batchName}`, `${DEEPLINK_BASE_URL}/notes/${notesId}`);
    }
}

async function create(notes) {
    const notesEntity = toNotesEntity(notes);
    console.log('Converted to entity:', notesEntity);
    const notesId = unmarshall(notesEntity.Item).id;
    try {
        await db.send(new PutItemCommand(notesEntity));
        console.log('notes added successfully.');
        await sendNotesNotification(notes, notesId);
        return notesId;
    } catch (err) {
        console.error('Unable to add notes:', err);
        throw err;
    }
}

async function updateNotes(notesId, notesFields) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    console.log("Updating notes fields:", notesFields);
    for (const [key, value] of Object.entries(notesFields)) {
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
        Key: { id: { S: notesId } },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW',
    };

    try {
        const data = await db.send(new UpdateItemCommand(params));
        console.log('Update succeeded:', JSON.stringify(data, null, 2));
        const updatedNotes = data.Attributes ? unmarshall(data.Attributes) : {};
        await sendNotesNotification(updatedNotes);
        return updatedNotes;
    } catch (err) {
        console.error('Unable to update notes. Error JSON:', JSON.stringify(err, null, 2));
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
        console.error('Unable to get notes by batch. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


async function getByStudentId(studentId) {
    const params = {
        TableName: tableName, FilterExpression: "studentId = :studentId", ExpressionAttributeValues: {
            ':studentId': marshall(studentId),

        },
    };

    try {
        const data = await db.send(new ScanCommand(params));
        return data.Items.map(item => unmarshall(item));
    } catch (err) {
        console.error('Unable to get notes by batch. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getById(notesId) {
    const params = {
        TableName: tableName,
        Key: marshall({ id: notesId }),
    };

    try {
        const data = await db.send(new GetItemCommand(params));
        console.log('get by id result', data);
        return data.Item ? unmarshall(data.Item) : {};
    } catch (err) {
        console.error('Unable to get notes. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function deleteById(notesId) {
    const params = {
        TableName: tableName,
        Key: marshall({ id: notesId }),
    };

    try {
        const data = await db.send(new DeleteItemCommand(params));
        console.log('delete result', data);
        return {};
    } catch (err) {
        console.error('Unable to delete notes. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


module.exports = { create, updateNotes,getById, getByStudentId, deleteById, getByBatchId }