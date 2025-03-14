const { expect } = require('chai');
const sinon = require('sinon');
const { toBatchEntity } = require('../../../main/db/mappers/batchMapper');
const { marshall } = require('@aws-sdk/util-dynamodb');
const UUIDGenerator = require('../../../main/db/UUIDGenerator');


describe('toBatchEntity', () => {
    let uuidStub;

    beforeEach(() => {
        uuidStub = sinon.stub();
        sinon.replace(UUIDGenerator, 'generateUUID', uuidStub);
    });

    afterEach(() => {
        sinon.restore();
    });
    it('should map batch object to DynamoDB entity', () => {
        // Given
        const BatchData = {
            "name": "English",
            "course": "English Subject",
            "subject": "English",
            "description": "litsening and speaking.",
            "paymentFrequency": "Monthly",
            "paymentAmount": 400.00,
            "paymentDayOfMonth": 15,
            "teacherId": "1c597a5c-1b96-4d52-a70e-fdb3868f7370"
        };

        // When
        const result = toBatchEntity(BatchData);

        // Then
        const expected = {
            TableName: 'Batches',
            Item: marshall({id: 'mocked-uuid', ...BatchData,}, {removeUndefinedValues: true})
        };

        expect(result.TableName).to.equal(expected.TableName);
        expect(result.Item).to.not.be.undefined;
    });

    it('should generate a unique ID for the batch', () => {
        // Given
        const batch = {
            "name": "English",
            "course": "English Subject",
            "subject": "English",
            "teacherId": "1c597a5c-1b96-4d52-a70e-fdb3868f7370"

        };

        // When
        const result = toBatchEntity(batch);

        // Then
        expect(result.Item.id).to.not.be.undefined;
    });

});