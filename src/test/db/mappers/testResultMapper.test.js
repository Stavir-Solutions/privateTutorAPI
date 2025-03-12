const { expect } = require('chai');
const sinon = require('sinon');
const { toTestResultEntity } = require('../../../main/db/mappers/testResultMapper');
const { marshall } = require('@aws-sdk/util-dynamodb');
const UUIDGenerator = require('../../../main/db/UUIDGenerator');

describe('toTestResultEntity', () => {
    let uuidStub;

    beforeEach(() => {
        uuidStub = sinon.stub();
        sinon.replace(UUIDGenerator, 'generateUUID', uuidStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should map testResult object to DynamoDB entity', () => {
        // Given
        const testResultData = {
            "testId": "123e48867-e89b-12d3-a456-426614174000",
            "studentId": "123e4567-e89b-12d3-a456-4266141stu567",
            "marks": 85,
            "attestedByParent": true
        };

        // When
        const result = toTestResultEntity(testResultData);

        // Then
        const expected = {
            TableName: 'TestResults',
            Item: marshall({id: 'mocked-uuid',...testResultData,}, { removeUndefinedValues: true })
        };

        expect(result.TableName).to.equal(expected.TableName);
        expect(result.Item).to.not.be.undefined;
    });

    it('should generate a unique ID for the testResult', () => {
        // Given
        const testResult = {
            "testId": "123e48867-e89b-12d3-a456-426614174000",
            "studentId": "123e4567-e89b-12d3-a456-4266141stu567",
            "marks": 85,
            "attestedByParent": true
        };

        // When
        const result = toTestResultEntity(testResult);

        // Then
        expect(result.Item.id).to.not.be.undefined;
    });
});