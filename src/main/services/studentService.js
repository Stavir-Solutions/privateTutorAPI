const {toStudentEntity} = require('../db/mappers/studentMapper');
const db = require('../db/dynamodb');
const {
    PutItemCommand,
    UpdateItemCommand,
    GetItemCommand,
    ScanCommand,
    DeleteItemCommand,
    BatchGetItemCommand
} = require('@aws-sdk/client-dynamodb');
const {unmarshall, marshall} = require('@aws-sdk/util-dynamodb');


const tableName = "Students";
const batchesTable = "Batches";

async function createStudent(student) {
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
        Key: marshall({id: studentId}),
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW',
    };

    console.log('update params ', JSON.stringify(params, null, 2));
    try {
        const data = await db.send(new UpdateItemCommand(params));
        console.log('Update succeeded:', JSON.stringify(data, null, 2));
        return data.Attributes ? unmarshall(data.Attributes):{};
    } catch (err) {
        console.error('Unable to update student. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function getStudentById(studentId) {
    const params = {
        TableName: tableName, Key: marshall({id: studentId}),
    };

    try {
        const data = await db.send(new GetItemCommand(params));
        return data.Item ? unmarshall(data.Item) : {};
    } catch (err) {
        console.error('Unable to get student. Error JSON:', JSON.stringify(err, null, 2));
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

        // ✅ Extract all unique batch IDs from students' batches field
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
        console.log('scan result', data);
        return data.Items.map(item => unmarshall(item));
    } catch (err) {
        console.error('Unable to get students. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}

async function deleteById(studentId) {
    const params = {
        TableName: tableName, Key: marshall({id: studentId}),
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


module.exports = {createStudent, getStudentById, getAll, deleteById, updateStudent, getByBatchId}