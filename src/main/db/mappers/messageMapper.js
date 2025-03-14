const {generateUUID} = require('../UUIDGenerator');
const {marshall} = require('@aws-sdk/util-dynamodb');


function toReplyEntity(reply) {
    return {
        TableName: 'Messages',
        Item: marshall({
                id: generateUUID(),
                content: reply.content,
                sender: reply.sender,
                senderType: reply.senderType,
                senderName: reply.senderName,
                timestamp: reply.timestamp,
                attachmentUrls: reply.attachmentUrls,
                replies: reply.replies ? reply.replies.map(toReplyEntity) : [],
            }
            , {removeUndefinedValues: true}
        ),

    };

}
function toMessageEntity(message) {
    return {
        TableName: 'Messages', 
        Item: marshall({
            id: generateUUID(),
            subject: message.subject,
            content: message.content,
            batchId: message.batchId,
            studentId: message.studentId,
            sender: message.sender,
            senderType: message.senderType,
            senderName: message.senderName,
            receiver: message.receiver,
            receiverType: message.receiverType,
            receiverName: message.receiverName,
            timestamp: message.timestamp ,
            attachmentUrls: message.attachmentUrls,
            replies: message.replies ? message.replies.map(toReplyEntity) : [],
        },
        { removeUndefinedValues: true }
    ),
    };
}

module.exports = {toMessageEntity,toReplyEntity}
