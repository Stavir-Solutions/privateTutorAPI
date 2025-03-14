const { expect } = require('chai');
const sinon = require('sinon');
const { toFeeRecordEntity } = require('../../../main/db/mappers/feeRecordMapper');
const { marshall } = require('@aws-sdk/util-dynamodb');
const UUIDGenerator = require('../../../main/db/UUIDGenerator');

describe('toFeeRecordEntity', () => {
    let uuidStub;

    beforeEach(() => {
        uuidStub = sinon.stub();
        sinon.replace(UUIDGenerator, 'generateUUID', uuidStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should map feeRecord object to DynamoDB entity', () => {
        // Given
        const feeRecordData = {
            "batchId": "1b6b2a0f-7774-472f-a978-0c72c6379ea2",
            "studentId": "ea695efc-f944-4abb-9c0c-aab7ea3fc7af",
            "dueDate": "2025-12-31T23:59:59.999Z",
            "paymentDate": "2025-12-10T12:34:56.789Z",
            "amount": 400.00,
            "status": "paid",
            "notes": "Payment received in full.",
            "attachmentUrl": "http://example.com/receipt.pdf",
            "teacherAcknowledgement": true
        };

        // When
        const result = toFeeRecordEntity(feeRecordData);

        // Then
        const expected = {
            TableName: 'FeeRecords',
            Item: marshall({id: 'mocked-uuid',...feeRecordData,}, { removeUndefinedValues: true })
        };

        expect(result.TableName).to.equal(expected.TableName);
        expect(result.Item).to.not.be.undefined;
    });

    it('should generate a unique ID for the assignment', () => {
        // Given
            const feeRecord = {
                "batchId": "1b6b2a0f-7774-472f-a978-0c72c6379ea2",
                "studentId": "ea695efc-f944-4abb-9c0c-aab7ea3fc7af",
                "dueDate": "2025-12-31T23:59:59.999Z",
                "paymentDate": "2025-12-10T12:34:56.789Z",
                "amount": 400.00,
                "status": "paid",
        };

        // When
        const result = toFeeRecordEntity(feeRecord);

        // Then
        expect(result.Item.id).to.not.be.undefined;
    });
});