const {ScanCommand} = require('@aws-sdk/client-dynamodb');
const db = require('../db/dynamodb');
const {unmarshall, marshall} = require('@aws-sdk/util-dynamodb');

const getUserByUserName = async (name, type) => {
    const fieldName = "userName";

    let tableName;
    if (type === "TEACHER") {
        tableName = "Teachers";
    } else if (type === "STUDENT") {
        tableName = "Students";
    } else {
        throw new Error(`Invalid user type: ${type}`);
    }

    const params = {
        TableName: tableName,
        FilterExpression: "#userField = :nameValue",
        ExpressionAttributeNames: {
            "#userField": fieldName
        },
        ExpressionAttributeValues: {
            ":nameValue": {S: name}
        }
    };

    const result = await db.send(new ScanCommand(params));

    return result.Items && result.Items.length > 0 ? unmarshall(result.Items[0]) : null;
};


module.exports = {
    getUserByUserName
};

