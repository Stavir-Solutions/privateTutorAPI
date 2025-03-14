const { expect } = require('chai');
const sinon = require('sinon');
const { toNotificationEntity } = require('../../../main/db/mappers/notificationMapper');
const { marshall } = require('@aws-sdk/util-dynamodb');
const UUIDGenerator = require('../../../main/db/UUIDGenerator');

describe('toNotificationEntity', () => {
    let uuidStub;

    beforeEach(() => {
        uuidStub = sinon.stub();
        sinon.replace(UUIDGenerator, 'generateUUID', uuidStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should map notification object to DynamoDB entity', () => {
        // Given
        const notificationData = {
            teacherId: 'ea695efc-f944-4abb-9c0c-aab7ea3fc7aa',
            studentId: 'ea695efc-f944-4abb-9c0c-aab7ea3fc7af',
            type: 'assignment',
            title: 'New Assignment Posted',
            objectId: 'assignment-id-789',
            deeplink: 'http://example.com/assignments/assignment-id-789',
            seen: false,
            notificationTime: '2024-01-01T00:00:00.000Z'
        };
        // When
        const result = toNotificationEntity(notificationData);

        // Then
        const expected = {
            TableName: 'Notifications',
            Item: marshall({id: 'mocked-uuid',...notificationData,}, { removeUndefinedValues: true })
        };

        expect(result.TableName).to.equal(expected.TableName);
        expect(result.Item).to.not.be.undefined;
    });

    it('should generate a unique ID for the assignment', () => {
        // Given
        const notification = {
            teacherId: 'ea695efc-f944-4abb-9c0c-aab7ea3fc7aa',
            studentId: 'ea695efc-f944-4abb-9c0c-aab7ea3fc7af',
            type: 'assignment',
            objectId: 'assignment-id-789',
            seen: false,
        };

        // When
        const result = toNotificationEntity(notification);

        // Then
        expect(result.Item.id).to.not.be.undefined;
    });
});