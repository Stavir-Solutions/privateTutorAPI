const { expect } = require('chai');
const sinon = require('sinon');
const { toAssignmentEntity } = require('../../../main/db/mappers/assignmentMapper'); 
const { marshall } = require('@aws-sdk/util-dynamodb');
const UUIDGenerator = require('../../../main/db/UUIDGenerator');

describe('toAssignmentEntity', () => {
    let uuidStub;

    beforeEach(() => {
        uuidStub = sinon.stub();
        sinon.replace(UUIDGenerator, 'generateUUID', uuidStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should map assignment object to DynamoDB entity', () => {
        // Given
        const assignmentData = {
            publishDate: '2025-03-11T00:00:00.000Z',
            submissionDate: '2025-03-20T23:59:59.999Z',
            batchId: 'batch-123',
            studentId: 'student-456',
            title: 'Math Assignment',
            details: 'Solve the algebra problems.',
            attachmentUrls: ['http://example.com/file1.pdf'],
        };

        // When
        const result = toAssignmentEntity(assignmentData);

        // Then
        const expected = {
            TableName: 'Assignments',
            Item: marshall({id: 'mocked-uuid',...assignmentData,}, { removeUndefinedValues: true })
        };

        expect(result.TableName).to.equal(expected.TableName);
        expect(result.Item).to.not.be.undefined;
    });

    it('should generate a unique ID for the assignment', () => {
        // Given
        const assignment = {
            publishDate: '2025-03-11T00:00:00.000Z',
            submissionDate: '2025-03-20T23:59:59.999Z',
            batchId: 'batch-123',
            title: 'Science Assignment',
        };

        // When
        const result = toAssignmentEntity(assignment);

        // Then
        expect(result.Item.id).to.not.be.undefined;
    });
});