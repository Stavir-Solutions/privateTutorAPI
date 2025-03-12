const { expect } = require('chai');
const sinon = require('sinon');
const { toTestEntity } = require('../../../main/db/mappers/testMapper');
const { marshall } = require('@aws-sdk/util-dynamodb');
const UUIDGenerator = require('../../../main/db/UUIDGenerator');

describe('toTestEntity', () => {
    let uuidStub;

    beforeEach(() => {
        uuidStub = sinon.stub();
        sinon.replace(UUIDGenerator, 'generateUUID', uuidStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should map test object to DynamoDB entity', () => {
        // Given
        const testData = {
            "name": "Midterm Exam",
            "subject": "Mathematics",
            "testDate": "2025-02-15T10:00:00.000Z",
            "resultPublishDate": "2025-02-20T10:00:00.000Z",
            "totalMarks": 100,
            "minimumPassMark": 40,
            "numberOfQuestions": 20,
            "batchId": "123e4567-e89b-12d3-a456-426614174000"
        };

        // When
        const result = toTestEntity(testData);

        // Then
        const expected = {
            TableName: 'Tests',
            Item: marshall({id: 'mocked-uuid',...testData,}, { removeUndefinedValues: true })
        };

        expect(result.TableName).to.equal(expected.TableName);
        expect(result.Item).to.not.be.undefined;
    });

    it('should generate a unique ID for the test', () => {
        // Given
        const test = {
            "name": "Midterm Exam",
            "subject": "Mathematics",
            "testDate": "2025-02-15T10:00:00.000Z",
            "resultPublishDate": "2025-02-20T10:00:00.000Z",
            "totalMarks": 100,
            "minimumPassMark": 40,
            "numberOfQuestions": 20,
            "batchId": "123e4567-e89b-12d3-a456-426614174000"
        };

        // When
        const result = toTestEntity(test);

        // Then
        expect(result.Item.id).to.not.be.undefined;
    });
});