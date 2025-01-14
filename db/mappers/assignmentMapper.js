const {generateUUID} = require('../UUIDGenerator');
const {marshall} = require('@aws-sdk/util-dynamodb');


function toAssignmentEntity(assignment) {
    return {
        TableName: 'Assignments', Item: marshall({
            id: generateUUID(),
            publishDate: assignment.publishDate,
            submissionDate: assignment.submissionDate,
            batchId: assignment.batchId,
            studentId: assignment.studentId,
            title: assignment.title,
            details: assignment.details,
            attachmentUrls: assignment.attachmentUrls,
        })
    };
}

module.exports = {toAssignmentEntity}

