const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

async function getUser(userId, userType) {
    // Dynamically select table based on userType
    const tableName = userType === "TEACHER" ? "TeacherTableName" : "StudentTableName";

    const params = {
        TableName: tableName,
        Key: {
            userId,
        },
    };

    const result = await dynamoDB.get(params).promise();
    return result.Item;
}

async function saveResetRequest(data) {
    const params = {
        TableName: "PasswordResetTable",
        Item: data,
    };

    await dynamoDB.put(params).promise();
}

async function getResetRequest(requestId) {
    const params = {
        TableName: "PasswordResetTable",
        Key: { requestId },
    };

    const result = await dynamoDB.get(params).promise();
    return result.Item;
}

async function updatePassword(userId, userType, newPassword) {
    // Dynamically select table based on userType
    const tableName = userType === "TEACHER" ? "TeacherTableName" : "StudentTableName";

    const params = {
        TableName: tableName,
        Key: { userId },
        UpdateExpression: "set password = :password",
        ExpressionAttributeValues: { ":password": newPassword },
    };

    await dynamoDB.update(params).promise();
}

async function deleteResetRequest(requestId) {
    const params = {
        TableName: "PasswordResetTable",
        Key: { requestId },
    };

    await dynamoDB.delete(params).promise();
}

module.exports = {
    getUser,
    saveResetRequest,
    getResetRequest,
    updatePassword,
    deleteResetRequest,
};
