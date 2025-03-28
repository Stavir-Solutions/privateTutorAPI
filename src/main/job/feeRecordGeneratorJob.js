const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const db = new DynamoDBClient({ region: "us-east-1" });
const { v4: uuidv4 } = require("uuid");
const {
    PutItemCommand,
    ScanCommand
} = require("@aws-sdk/client-dynamodb");
const { unmarshall, marshall } = require("@aws-sdk/util-dynamodb");

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

async function generateFeeRecords() {
    try {
        const today = new Date();
        const currentmonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

        const batchParams = { TableName: "Batches" };
        const batchData = await db.send(new ScanCommand(batchParams));
        const batches = batchData.Items ? batchData.Items.map(item => unmarshall(item)) : [];
        console.log("Batches found:", JSON.stringify(batches, null, 2));

        let feeRecords = [];
        for (const batch of batches) {
            const batchId = batch.id;
            if (!batchId || !batch.paymentAmount) {
                console.warn("Skipping batch with missing batchId or paymentAmount", batch);
                continue;
            }

            const studentParams = {
                TableName: "Students",
                FilterExpression: "contains(batches, :batchId)",
                ExpressionAttributeValues: marshall({ ":batchId": batch.id }, { removeUndefinedValues: true })
            };
            const studentData = await db.send(new ScanCommand(studentParams));
            const students = studentData.Items ? studentData.Items.map(item => unmarshall(item)) : [];
            console.log("Students found:", JSON.stringify(students, null, 2));

            const feeParams = {
                TableName: tableName,
                FilterExpression: "batchId = :batchId AND #month = :month",
                ExpressionAttributeNames: {
                    "#month": "month"
                },
                ExpressionAttributeValues: marshall({
                    ":batchId": batchId,
                    ":month": currentmonth
                }, { removeUndefinedValues: true })
            };
            const feeData = await db.send(new ScanCommand(feeParams));
            const alreadyGeneratedStudentIds = feeData.Items ? feeData.Items.map(item => unmarshall(item).studentId) : [];
            console.log(`Already generated students for batch ${batchId}:`, alreadyGeneratedStudentIds);

            const remainingStudents = students.filter(student => !alreadyGeneratedStudentIds.includes(student.id));
            console.log(`Remaining students for batch ${batchId}:`, remainingStudents);

            for (const student of remainingStudents) {
                const studentId = student.id;
                if (!studentId) {
                    console.warn("Skipping student with missing studentId", student);
                    continue;
                }

                const feeRecord = {
                    id: uuidv4(),
                    batchId: batchId,
                    studentId: studentId,
                    month: currentmonth,
                    dueDate: new Date(today.getFullYear(), today.getMonth(), 28).toISOString(),
                    paymentDate: new Date(today.getFullYear(), today.getMonth(), 10).toISOString(),
                    amount: batch.paymentAmount,
                    status: "pending",
                    createdAt: today.toISOString(),
                    teacherAcknowledgement: true,
                    notes: "Payment pending.",
                    attachmentUrl: "http://example.com/receipt.pdf",
                };

                console.log("Creating Fee Record:", feeRecord);
                await create(feeRecord);
                feeRecords.push(feeRecord);
            }
        }

        console.log(`${feeRecords.length} fee records created.`);
        return { status: "Success", data: feeRecords };

    } catch (error) {
        console.error("Error:", error);
        return { status: "Error", message: error.message };
    }
}

module.exports = { generateFeeRecords, create };
