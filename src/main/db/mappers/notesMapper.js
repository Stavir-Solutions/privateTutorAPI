const {generateUUID} = require('../UUIDGenerator');
const {marshall} = require('@aws-sdk/util-dynamodb');

function toNotesEntity(notes) {
    return {
        TableName: 'Notes', Item: marshall({
            id: generateUUID(),
            publishDate: notes.publishDate,
            Title: notes.Title,
            listUrls: notes.listUrls,
            studentId: notes.studentId,
            batchId: notes.batchId,
            content: notes.content,
            
        },
        { removeUndefinedValues: true }
    )
    };
}

module.exports = {toNotesEntity}

