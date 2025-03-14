const { expect } = require('chai');
const sinon = require('sinon');
const { toNotesEntity } = require('../../../main/db/mappers/notesMapper');
const { marshall } = require('@aws-sdk/util-dynamodb');
const UUIDGenerator = require('../../../main/db/UUIDGenerator');

describe('toNotesEntity', () => {
    let uuidStub;

    beforeEach(() => {
        uuidStub = sinon.stub();
        sinon.replace(UUIDGenerator, 'generateUUID', uuidStub);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should map notes object to DynamoDB entity', () => {
        // Given
        const notesData = {
            "publishDate": "2024-01-01T00:00:00.000Z",
            "Title":" text note.",
            "listUrls": [
                "http://example.com/resource1.pdf",
                "http://example.com/resource2.pdf"
            ],
            "content": "This is the content of the text note, providing detailed information.",
            "studentId":"ea695efc-f944-4abb-9c0c-aab7ea3fc7af",
            "batchId": "1b6b2a0f-7774-472f-a978-0c72c6379ea2"
        };

        // When
        const result = toNotesEntity(notesData);

        // Then
        const expected = {
            TableName: 'Notes',
            Item: marshall({id: 'mocked-uuid',...notesData,}, { removeUndefinedValues: true })
        };

        expect(result.TableName).to.equal(expected.TableName);
        expect(result.Item).to.not.be.undefined;
    });

    it('should generate a unique ID for the assignment', () => {
        // Given
        const notes = {
            "publishDate": "2024-01-01T00:00:00.000Z",
            "Title":" text note.",
            "listUrls": [
                "http://example.com/resource1.pdf",
                "http://example.com/resource2.pdf"
            ],
            "studentId":"ea695efc-f944-4abb-9c0c-aab7ea3fc7af",
            "batchId": "1b6b2a0f-7774-472f-a978-0c72c6379ea2"
        };

        // When
        const result = toNotesEntity(notes);

        // Then
        expect(result.Item.id).to.not.be.undefined;
    });
});