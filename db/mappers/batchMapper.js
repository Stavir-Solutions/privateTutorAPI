const {generateUUID} = require('../UUIDGenerator');

function toBatchEntity(batch) {
    return {
        TableName: 'Batches', Item: {
            id: generateUUID(),
            teacherId: batch.teacherId,
            name: batch.name,
            course: batch.course,
            subject: batch.subject,
            description: batch.description,
            paymentFrequency: batch.paymentFrequency,
            paymentAmount: batch.paymentAmount,
            paymentDayOfMonth: batch.paymentDayOfMonth
        }
    };
}

module.exports = { toBatchEntity }

