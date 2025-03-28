const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require("uuid");
const { PutItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall, marshall } = require("@aws-sdk/util-dynamodb");

const db = new DynamoDBClient({ region: "us-east-1" });
const tableName = "FeeRecords";
async function create(feeRecord) {
    try {
        const checkParams = {
            TableName: tableName,
            FilterExpression: "studentId = :studentId AND #month = :month",
            ExpressionAttributeNames: {
                "#month": "month"
            },
            ExpressionAttributeValues: marshall({
                ":studentId": feeRecord.studentId,
                ":month": feeRecord.month
            }, { removeUndefinedValues: true })
        };

        const existingRecords = await db.send(new ScanCommand(checkParams));

        if (existingRecords.Items && existingRecords.Items.length > 0) {
            console.log("Duplicate fee record found. Skipping:", feeRecord);
            return { success: false, message: "Duplicate fee record exists. Skipping insertion." };
        }

        const params = {
            TableName: tableName,
            Item: marshall(feeRecord),
        };

        await db.send(new PutItemCommand(params));
        console.log("Fee record inserted:", feeRecord);
        return { status: "success", message: "Fee record inserted successfully." };
    } catch (error) {
        console.error("Error inserting fee record:", error);
        return { status: "error", message: error.message };

    }

}
async function fetchBatches() {
    const batchParams = { TableName: "Batches" };
    const batchData = await db.send(new ScanCommand(batchParams));
    return batchData.Items ? batchData.Items.map(item => unmarshall(item)) : [];
}

async function fetchStudents(batchId) {
    const studentParams = {
        TableName: "Students",
        FilterExpression: "contains(batches, :batchId)",
        ExpressionAttributeValues: marshall({ ":batchId": batchId }, { removeUndefinedValues: true }),
    };

    const studentData = await db.send(new ScanCommand(studentParams));
    return studentData.Items ? studentData.Items.map(item => unmarshall(item)) : [];
}

async function fetchGeneratedStudentIds(batchId, month) {
    const feeParams = {
        TableName: tableName,
        FilterExpression: "batchId = :batchId AND #month = :month",
        ExpressionAttributeNames: { "#month": "month" },
        ExpressionAttributeValues: marshall({ ":batchId": batchId, ":month": month }, { removeUndefinedValues: true }),
    };

    const feeData = await db.send(new ScanCommand(feeParams));
    return feeData.Items ? feeData.Items.map(item => unmarshall(item).studentId) : [];
}

async function generateFeeRecords() {
    try {
        const today = new Date();
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

        const batches = await fetchBatches();
        console.log("Batches found:", batches);

        let feeRecords = [];
        for (const batch of batches) {
            if (!batch.id || !batch.paymentAmount) {
                console.warn("Skipping batch with missing ID or payment amount", batch);
                continue;
            }

            const students = await fetchStudents(batch.id);
            console.log(`Students for batch ${batch.id}:`, students);

            const alreadyGeneratedStudentIds = await fetchGeneratedStudentIds(batch.id, currentMonth);
            console.log(`Already generated student IDs for batch ${batch.id}:`, alreadyGeneratedStudentIds);

            const remainingStudents = students.filter(student => !alreadyGeneratedStudentIds.includes(student.id));
            console.log(`Remaining students for batch ${batch.id}:`, remainingStudents);

            for (const student of remainingStudents) {
                if (!student.id) {
                    console.warn("Skipping student with missing ID", student);
                    continue;
                }

                const feeRecord = {
                    id: uuidv4(),
                    batchId: batch.id,
                    studentId: student.id,
                    month: currentMonth,
                    dueDate: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString(),
                    paymentDate: new Date(today.getFullYear(), today.getMonth() + 1, 5).toISOString(),
                    amount: batch.paymentAmount,
                    status: "pending",
                    createdAt: today.toISOString(),
                    teacherAcknowledgement: true,
                    notes: `Your fee invoice for the month of ${currentMonth}`,
                };

                console.log("Creating Fee Record:", feeRecord);
                await create(feeRecord);
                feeRecords.push(feeRecord);
            }
        }

        console.log(`${feeRecords.length} fee records created.`);
        return { status: "success" };
    } catch (error) {
        console.error("Error:", error);
        return { status: "error", message: error.message };
    }
}

module.exports = { generateFeeRecords, create };
