const { generateUUID } = require('../UUIDGenerator');
const { marshall } = require('@aws-sdk/util-dynamodb');

function toNotificationEntity(notification) {
    return {
        TableName: 'Notifications', 
        Item: marshall({
            id: generateUUID(), 
            teacherId: notification.teacherId,
            studentId: notification.studentId,
            type: notification.type,
            title: notification.title,
            objectId: notification.objectId,
            deeplink: notification.deeplink ,
            seen: notification.seen,
            notificationSeenTime: new Date().toISOString(),
        },
        { removeUndefinedValues: true }

    )
    };
}

module.exports = { toNotificationEntity };