const {generateUUID} = require('../UUIDGenerator');
const {marshall} = require('@aws-sdk/util-dynamodb');

function toTestResultEntity(testResult) {
    return {
        TableName: 'TestResults', Item: marshall({
            id: generateUUID(),
            testId: testResult.testId,
            marks: testResult.marks,
            attestedByParent: testResult.attestedByParent,
            studentId: testResult.studentId
        
        },
        { removeUndefinedValues: true }
    )
    };
}

module.exports = {toTestResultEntity}

