const { toStudentEntity } = require('../db/mappers/studentMapper');
const db = require('../db/dynamodb');
const {
    PutItemCommand,
    UpdateItemCommand,
    GetItemCommand,
    ScanCommand,
    DeleteItemCommand,
    BatchGetItemCommand
} = require('@aws-sdk/client-dynamodb');
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb');
const {generateUUID}= require('../db/UUIDGenerator');
const DEEPLINK_BASE_URL = process.env.DEEPLINK_BASE_URL;

const tableName = "Students";
const batchesTable = "Batches";
const assigmentsTable = "Assignments";
const feeRecordsTable = "FeeRecords";

async function isStudentuserNameTaken(userName, excludeId = null) {
    const params = {
        TableName: tableName,
        FilterExpression: 'userName = :userName',
        ExpressionAttributeValues: {
            ':userName': { S: userName },
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

async function createStudent(student) {
    if (await isStudentuserNameTaken(student.userName)) {
        const error = new Error("userName already exists");
        error.statusCode = 409;
        throw error;
    }
    let studentEntity = toStudentEntity(student);
    console.log('converted to entity ', studentEntity);

    await db.send(new PutItemCommand(studentEntity, function (err, data) {
        if (err) {
            console.error('Unable to add teacher. Error JSON:', JSON.stringify(err, null, 2));
        } else {
            console.log('PutItem succeeded:', JSON.stringify(data, null, 2));
        }
    }));
    return unmarshall(studentEntity.Item).id;
}


async function updateStudent(studentId, studentFields) {
    if (studentFields.userName && await isStudentuserNameTaken(studentFields.userName, studentId)) {
        const error = new Error("userName already exists");
        error.statusCode = 409;
        throw error;
    }
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    console.log("Updating student fields", studentFields);
    for (const [key, value] of Object.entries(studentFields)) {
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
        Key: marshall({ id: studentId }),
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW',
    };

    console.log('update params ', JSON.stringify(params, null, 2));
    try {
        const data = await db.send(new UpdateItemCommand(params));
        console.log('Update succeeded:', JSON.stringify(data, null, 2));
        return data.Attributes ? unmarshall(data.Attributes) : {};
    } catch (err) {
        console.error('Unable to update student. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getBatchIdNamePairs(batchIds) {
    if (batchIds.length === 0) return [];

    const batchParams = {
        RequestItems: {
            [batchesTable]: {
                Keys: batchIds.map(id => marshall({ id })),
                ProjectionExpression: "#batchId, #batchName",
                ExpressionAttributeNames: { "#batchId": "id", "#batchName": "name" },
            },
        },
    };

    try {
        const batchData = await db.send(new BatchGetItemCommand(batchParams));
        console.log("Batch Response:", JSON.stringify(batchData, null, 2));

        return (batchData.Responses?.[batchesTable] || []).map(item => unmarshall(item));
    } catch (err) {
        console.error("Error fetching batch names:", err);
        return batchIds.map(id => ({ id, name: "Unknown Batch" }));
    }
}

async function getStudentById(studentId) {
    const params = {
        TableName: tableName,
        Key: marshall({ id: studentId }),
    };

    try {
        const data = await db.send(new GetItemCommand(params));
        if (!data.Item) return {};

        const student = unmarshall(data.Item);

        return student;
    } catch (err) {
        console.error("Error fetching student:", err);
        throw err;
    }
}

async function getStudentByIdWithBatchName(studentId) {

    try {
        const student = await getStudentById(studentId);
        const batchIds = student.batches || [];
        student.batches = await getBatchIdNamePairs(batchIds);
        return student;
    } catch (err) {
        console.error("Error fetching student:", err);
        throw err;
    }
}

async function getBatchIdNamePairs(batchIds) {
    if (batchIds.length === 0) return [];

    const batchParams = {
        RequestItems: {
            [batchesTable]: {
                Keys: batchIds.map(id => marshall({ id })),
                ProjectionExpression: "#batchId, #batchName",
                ExpressionAttributeNames: { "#batchId": "id", "#batchName": "name" },
            },
        },
    };

    try {
        const batchData = await db.send(new BatchGetItemCommand(batchParams));
        console.log("Batch Response:", JSON.stringify(batchData, null, 2));

        return (batchData.Responses?.[batchesTable] || []).map(item => unmarshall(item));
    } catch (err) {
        console.error("Error fetching batch names:", err);
        return batchIds.map(id => ({ id, name: "Unknown Batch" }));
    }
}

async function getByBatchId(batchId) {
    console.log("Querying Batch ID:", batchId);

    const params = {
        TableName: tableName,
        FilterExpression: "contains(batches, :batchId)",
        ExpressionAttributeValues: {
            ':batchId': { S: batchId },
        },
    };

    try {
        const data = await db.send(new ScanCommand(params));
        console.log("Raw Data from DynamoDB:", JSON.stringify(data.Items, null, 2));

        if (!data.Items || data.Items.length === 0) return [];

        let students = data.Items.map(item => unmarshall(item));


        let batchIds = new Set();
        students.forEach(student => {
            if (student.batches && Array.isArray(student.batches)) {
                student.batches.forEach(batch => {
                    if (typeof batch === "string") {

                        batchIds.add(batch);
                    } else if (batch?.id) {
                        batchIds.add(batch.id);

                    } else {
                        console.log("Invalid Batch Format:", batch);
                    }
                });
            }
        });

        batchIds = Array.from(batchIds);
        console.log("Extracted Batch IDs:", batchIds);

        const batchIdNamePairs = await getBatchIdNamePairs(batchIds);
        console.log("Batch ID-Name Pairs Retrieved:", batchIdNamePairs);

        students.forEach(student => {
            if (student.batches && Array.isArray(student.batches)) {
                student.batches = student.batches.map(batch => {
                    const batchId = typeof batch === "string" ? batch : batch.id;
                    const batchInfo = batchIdNamePairs.find(b => b.id === batchId);
                    return batchInfo ? batchInfo : { id: batchId, name: "Unknown Batch" };
                });
            }
        });

        console.log("Final Student Data:", JSON.stringify(students, null, 2));
        return students;
    } catch (err) {
        console.error('Unable to get students by batch. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getAll() {
    const params = {
        TableName: tableName,
    };

    try {
        const data = await db.send(new ScanCommand(params));
        console.log("Scan result:", data);

        let students = data.Items.map(items => unmarshall(items));


        let batchIds = new Set();
        students.forEach(student => {
            if (student.batches && Array.isArray(student.batches)) {
                student.batches.forEach(batch => {
                    if (typeof batch === "string") {
                        batchIds.add(batch);
                    } else if (batch?.id) {
                        batchIds.add(batch.id);
                    } else {
                        console.log("Invalid Batch Format:", batch);
                    }
                });
            }
        });


        batchIds = Array.from(batchIds);
        console.log("Extracted Batch IDs:", batchIds);

        const batchIdNamePairs = await getBatchIdNamePairs(batchIds);

        students.forEach(student => {
            if (student.batches && Array.isArray(student.batches)) {
                student.batches = student.batches.map(batch => {
                    const batchId = typeof batch === "string" ? batch : batch.id;
                    const batchInfo = batchIdNamePairs.find(b => b.id === batchId);
                    return batchInfo ? batchInfo : { id: batchId, name: "Unknown Batch" };
                });
            }
        });

        return students;
    } catch (err) {
        console.error("Unable to get students. Error JSON:", JSON.stringify(err, null, 2));
        throw err;
    }
}

async function deleteById(studentId) {
    const params = {
        TableName: tableName, Key: marshall({ id: studentId }),
    };

    try {
        const data = await db.send(new DeleteItemCommand(params));
        console.log('delete result', data);
        return {};
    } catch (err) {
        console.error('Unable to delete student. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}
async function getStudentByUserName(userName, throwIfNotFound = false) {
    const params = {
        TableName: tableName,
        FilterExpression: 'userName = :userName',
        ExpressionAttributeValues: {
            ':userName': { S: userName }
        }
    };

    const result = await db.send(new ScanCommand(params));

    if (result.Items && result.Items.length > 0) {
        return unmarshall(result.Items[0]);
    } else {
        if (throwIfNotFound) {
            throw new Error(`STUDENT not found for userName: ${userName}`);
        } else {
            return null;
        }
    }
}

async function updateStudentPassword(studentId, newPassword) {
    const params = {
        TableName: tableName,
        Key: { id: { S: studentId } },
        UpdateExpression: "SET password = :newPassword",
        ExpressionAttributeValues: {
            ":newPassword": { S: newPassword }
        }
    };

    await db.send(new UpdateItemCommand(params));
    console.log("Student password updated successfully");
}

async function getexpireAssignments(batchId, studentId, days = 10) {
   try {
    console.log('Fetching assignments for:', { batchId, studentId });
    const today = new Date().toISOString().split('T')[0];
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    const params = {
        TableName: assigmentsTable,
        FilterExpression: "batchId = :batchId AND studentId = :studentId AND submissionDate BETWEEN :today AND :futureDate",
        ExpressionAttributeValues: {
            ':batchId': marshall(batchId),
            ':studentId': marshall(studentId),
            ':today': {S: today},
            ':futureDate': {S: futureDateStr}
        },
    };

        
            const result = await db.send(new ScanCommand(params));
            const items = result.Items ? result.Items.map(item => unmarshall(item)) : [];
    
            console.log('Filtered assignments:', items);
            return items;
        } catch (err) {
            console.error('Error fetching filtered assignment from DB:', JSON.stringify(err, null, 2));
            throw err;
        }
    }
    

async function getexpireFeeRecords(batchId, studentId, days = 10) {
    try {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        const futureDateStr = futureDate.toISOString().split('T')[0];

        const params = {
            TableName: feeRecordsTable,
            FilterExpression: '#batchId = :batchId AND #studentId = :studentId AND #status = :pending AND #dueDate <= :future',

            ExpressionAttributeNames: {
                '#batchId': 'batchId',
                '#studentId': 'studentId',
                '#status': 'status',
                '#dueDate': 'dueDate'
            },
            ExpressionAttributeValues: {
                ':batchId': { S: batchId },
                ':studentId': { S: studentId },
                ':pending': { S: 'pending' },
                ':future': { S: futureDateStr }
            }
        };

        const result = await db.send(new ScanCommand(params));
        const items = result.Items ? result.Items.map(item => unmarshall(item)) : [];

        console.log('Filtered fee records:', items);
        return items;
    } catch (err) {
        console.error('Error fetching filtered fee records from DB:', JSON.stringify(err, null, 2));
        throw err;
    }
}


async function getTimelineData(studentId, batchId) {
    try {
        console.log('Fetching assignments for:', { batchId, studentId });
        const assignmentsData = await getexpireAssignments(batchId, studentId);
        console.log('Assignments fetched:', assignmentsData);

        const assignments = assignmentsData.map(data => {
            const dateOnly = new Date(data.submissionDate).toISOString().split('T')[0];
            return {
                id: generateUUID(),
                type: 'assignment',
                LastDate: dateOnly,
                message: `${data.title} is reaching its deadline on ${dateOnly}`,
                deeplink: `${DEEPLINK_BASE_URL}/assignments/${data.id}`,
            };
        });

        const feesData = await getexpireFeeRecords(batchId, studentId);
        console.log('Fees fetched:', feesData);


        const fees = feesData.map(data => {
                const paymentDate = new Date(data.paymentDate).toISOString().split('T')[0];
                const dueDate = new Date(data.dueDate).toISOString().split('T')[0];
                return {
                    id: generateUUID(),
                    type: 'feerecord',
                    LastDate: dueDate,
                    message: `Your fee of ₹${data.amount} is due on ${dueDate} and the payment date was ${paymentDate}.`,
                    deeplink: `${DEEPLINK_BASE_URL}/fees/${data.id}`,
                };
            });

        const timeline = [...assignments, ...fees];
        console.log('Timeline:', timeline);

        return timeline;
    } catch (err) {
        console.error('Error fetching timeline data:', JSON.stringify(err, null, 2));
        throw err;
    }
}


module.exports = {
    createStudent,
    getStudentById,
    getAll,
    deleteById,
    updateStudent,
    getByBatchId,
    getStudentByIdWithBatchName,
    getStudentByUserName,
    updateStudentPassword,
    getTimelineData
}
