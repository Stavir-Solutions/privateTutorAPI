const { generateUUID } = require('../UUIDGenerator');
const { marshall } = require('@aws-sdk/util-dynamodb');

function toNotificationEntity(notification) {
    return {
        TableName: 'Notifications', 
        Item: marshall({
            id: generateUUID(), 
            recipientId: notification.recipientId,
            recipientType: notification.recipientType,
            type: notification.type,
            title: notification.title,
            objectId: notification.objectId,
            deeplink: notification.deeplink ,
            seen: notification.seen,
            notificationTime:notification.notificationTime
        },
        { removeUndefinedValues: true }

    )
    };
}

module.exports = { toNotificationEntity };
