const {generateUUID} = require('../UUIDGenerator');
const {marshall} = require('@aws-sdk/util-dynamodb');

function toTestEntity(test) {
    return {
        TableName: 'Tests', Item: marshall({
            id: generateUUID(),
            name: test.name,
            subject: test.subject,
            testDate: test.testDate,
            resultPublishDate: test.resultPublishDate,
            totalMarks: test.totalMarks,
            minimumPassMark: test.minimumPassMark,
            numberOfQuestions:test.numberOfQuestions,
            batchId: test.batchId
        
        },
        { removeUndefinedValues: true }
    )
    };
}

module.exports = {toTestEntity}

