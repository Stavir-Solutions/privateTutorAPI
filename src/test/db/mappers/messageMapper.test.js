const { expect } = require('chai');
const sinon = require('sinon');
const { toMessageEntity, toReplyEntity } = require('../../../main/db/mappers/messageMapper');
const { marshall } = require('@aws-sdk/util-dynamodb');
const UUIDGenerator = require("../../../main/db/UUIDGenerator");
const {toFeeRecordEntity} = require("../../../main/db/mappers/feeRecordMapper");

describe('toMessageEntity,toReplyEntity', () => {
    let uuidStub;

    beforeEach(() => {
        uuidStub = sinon.stub();
        sinon.replace(UUIDGenerator, 'generateUUID', uuidStub);
    });

    afterEach(() => {
        sinon.restore();
    });
    describe('toReplyEntity', () => {
        it('should map reply to reply entity', () => {
            const replyData = {
                content: 'This is a reply',
                sender: 'student1',
                timestamp: '2024-01-01T00:00:00.000Z',
                attachmentUrls: ['http://example.com/reply1.pdf'],
                replies: []
            };
            const result = toReplyEntity(replyData);


            const expected = {
                TableName: 'Messages',
                Item: marshall({replyData,}, { removeUndefinedValues: true })
            };
            expect(result.TableName).to.equal(expected.TableName);
            expect(result.Item).to.not.be.undefined;
        });

    });
});

    describe('toMessageEntity', () => {
        it('should map message to message entity', () => {
            const messageData = {
                subject: 'English Subject',
                content: 'This is a message',
                batchId: 'batch-123',
                studentId: 'student-456',
                sender: 'teacher1',
                receiver: 'student1',
                timestamp: '2024-01-01T00:00:00.000Z',
                attachmentUrls: ['http://example.com/message1.pdf'],
                replies: []
            };

            const result = toMessageEntity(messageData);

            const expected = {
                TableName: 'Messages',
                Item: marshall({id: 'mocked-uuid',...messageData,}, { removeUndefinedValues: true })
            };

            expect(result.TableName).to.equal(expected.TableName);
            expect(result.Item).to.not.be.undefined;
        });

        });


it('should generate a unique ID for the ', () => {
    // Given
    const message = {
        subject: 'english Subject',
        content: 'This is a message',
        batchId: 'batch-123',
        studentId: 'student-456',
        sender: 'teacher1',
        receiver: 'student1',
        timestamp: '2024-01-01T00:00:00.000Z',
        attachmentUrls: ['http://example.com/message1.pdf'],
        replies: []
    };

    // When
    const result = toMessageEntity(message);

    // Then
    expect(result.Item.id).to.not.be.undefined;
});
