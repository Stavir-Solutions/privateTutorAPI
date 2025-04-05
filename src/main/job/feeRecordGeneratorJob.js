const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { v4: uuidv4 } = require("uuid");
const { PutItemCommand, ScanCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall, marshall } = require("@aws-sdk/util-dynamodb");
const db = new DynamoDBClient({ region: "us-east-1" });
const tableName = "FeeRecords";
const StatusEnum = {
    PENDING: 'pending', PAID: 'paid', SUCCESS: 'success', ERROR: 'error'
};

const NotificationType = {
    FEE_INVOICE_RELEASED: "FEE_INVOICE_RELEASED",
};

function toNotificationEntity(notification) {
    return {
        TableName: 'Notifications',
        Item: marshall({
            id: notification.id,
            recipientId: notification.recipientId,
            recipientType: notification.recipientType,
            type: notification.type,
            title: notification.title,
            objectId: notification.objectId,
            deeplink: notification.deeplink,
            seen: notification.seen,
            notificationTime: notification.notificationTime
        },
            { removeUndefinedValues: true }

        )
    };
}


async function create(feeRecord) {
    try {
        const checkParams = {
            TableName: tableName,
            FilterExpression: "studentId = :studentId AND #month = :month",
            ExpressionAttributeNames: {
                "#month": "month"
            },
            ExpressionAttributeValues: marshall({
                ":studentId": feeRecord.studentId, ":month": feeRecord.month
            }, { removeUndefinedValues: true })
        };

        const existingRecords = await db.send(new ScanCommand(checkParams));

        if (existingRecords.Items && existingRecords.Items.length > 0) {
            console.log("Duplicate fee record found. Skipping:", feeRecord);
            await sendFeeRecordNotification(feeRecord);
            return { success: false, message: "Duplicate fee record exists. Skipping insertion." };
        }

        const params = {
            TableName: tableName, Item: marshall(feeRecord),
        };

        await db.send(new PutItemCommand(params));
        console.log("Fee record inserted:", feeRecord);
        await sendFeeRecordNotification(feeRecord);
        console.log("Notification sent for fee record:", feeRecord);
        return { status: StatusEnum.SUCCESS, message: "Fee record inserted successfully." };
        //TODO generate notification. call the notification services crate notification.
    } catch (error) {
        console.error("Error inserting fee record:", error);
        return { status: StatusEnum.ERROR, message: error.message };
    }
}


async function getById(batchId) {
    const params = {
        TableName: "Batches", Key: marshall({ id: batchId }),
    };

    try {
        const data = await db.send(new GetItemCommand(params));
        return data.Item ? unmarshall(data.Item) : {};
    } catch (err) {
        console.error('Unable to get batch. Error JSON:', JSON.stringify(err, null, 2));
        throw err;
    }
}


async function sendNotification(objectId, recipientId, recipientType, type, notificationTitle, deepLink) {
    try {
        const notificationId = uuidv4();
        const notification = {
            id: notificationId,
            recipientId,
            recipientType,
            type: type,
            title: notificationTitle,
            objectId: objectId,
            deeplink: deepLink,
            seen: false,
            notificationTime: new Date().toISOString(),
        };
        console.log('Notification:', notification);

        const notificationEntity = toNotificationEntity(notification);
        console.log('Notification entity:', notificationEntity);

        await db.send(new PutItemCommand(notificationEntity));
        console.log('Notification triggered successfully with ID:', notificationId);
    } catch (error) {
        console.error('Error saving notification:', error);
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


async function sendFeeRecordNotification(feeRecord) {
    const { batchId, studentId, amount, dueDate, month } = feeRecord;
    let recipients = [];

    if (batchId) {
        const batch = await getById(batchId);
        const students = await fetchStudents(batch.id);
        recipients = students.map(student => ({ id: student.id, type: "STUDENT" }));
    } else if (studentId) {
        recipients.push({ id: studentId, type: "STUDENT" });
    }

    if (recipients.length === 0) return;

    const formattedDueDate = new Date(dueDate).toISOString().split("T")[0];

    for (const recipient of recipients) {

        await sendNotification(feeRecord.id, recipient.id, recipient.type, NotificationType.FEE_INVOICE_RELEASED,
            `Fee invoice of Rs.${amount} has been generated for the month of ${month}`,
            `smart-teacher.com/fee-invoice/${feeRecord.id}`
        );

    }

}
async function generateFeeRecords() {
    try {
        const today = new Date();
        const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

        const batches = await fetchBatches();
        console.log("Batches found:", batches);

        for (const batch of batches) {
            if (!batch.id || !batch.paymentAmount) {
                console.warn("Skipping batch with missing ID or payment amount", batch);
                continue;
            }

            const students = await fetchStudents(batch.id);
            console.log(`Students found for batch ${batch.id}:`, students);

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
                    status: StatusEnum.PENDING,
                    createdAt: today.toISOString(),
                    teacherAcknowledgement: true,
                    notes: `Your fee invoice for the month of ${currentMonth}`,
                };

                console.log("Creating Fee Record:", feeRecord);
                await create(feeRecord);
            }
        }

        console.log(`Fee records created.`);
        return { status: StatusEnum.SUCCESS };
    } catch (error) {
        console.error("Error:", error);
        return { status: StatusEnum.ERROR, message: error.message };
    }
}

module.exports = { generateFeeRecords, create };
