const { generateUUID } = require('../UUIDGenerator');
const { marshall } = require('@aws-sdk/util-dynamodb');

function toFeeRecordEntity(feeRecord) {
    return {
        TableName: 'FeeRecords',Item: marshall( {
            id: generateUUID(),
            batchId: feeRecord.batchId, 
            studentId: feeRecord.studentId, 
            dueDate: feeRecord.dueDate, 
            paymentDate: feeRecord.paymentDate, 
            amount: feeRecord.amount, 
            status: feeRecord.status,
            notes: feeRecord.notes,
            attachmentUrls: feeRecord.attachmentUrls, 
           teacherAcknowledgement: feeRecord.teacherAcknowledgement,
         },
           { removeUndefinedValues: true }
        
        )
    
    };
}

module.exports = { toFeeRecordEntity };

