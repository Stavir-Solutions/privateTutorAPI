const {generateUUID} = require('../UUIDGenerator');
const {marshall} = require('@aws-sdk/util-dynamodb');


function toBatchEntity(batch) {
    return {
        TableName: 'Batches', Item: marshall({
            id: generateUUID(),
            teacherId: batch.teacherId,
            name: batch.name,
            course: batch.course,
            subject: batch.subject,
            description: batch.description,
            paymentFrequency: batch.paymentFrequency,
            paymentAmount: batch.paymentAmount,
            paymentDayOfMonth: batch.paymentDayOfMonth
        })
    };
}

module.exports = {toBatchEntity}

