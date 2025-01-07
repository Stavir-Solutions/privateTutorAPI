const {DynamoDBClient} = require('@aws-sdk/client-dynamodb');

const dynamoConfig = {
    region: process.env.region, credentials: {
        accessKeyId: process.env.accessKeyId, secretAccessKey: process.env.secretAccessKey,
    }, endpoint: process.env.dbendpoint
};

const db = new DynamoDBClient(dynamoConfig);

module.exports = db;