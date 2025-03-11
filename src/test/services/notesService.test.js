const { expect } = require('chai');
const sinon = require('sinon');
const { getByBatchId } = require('../../main/services/notesService');
const { updateNotes} = require('../../main/services/notesService');
const { create} = require('../../main/services/notesService');
const { deleteById} = require('../../main/services/notesService');
const { getByStudentId} = require('../../main/services/notesService');
const db = require('../../main/db/dynamodb');
const {UpdateItemCommand} = require('@aws-sdk/client-dynamodb');
const {PutItemCommand} = require('@aws-sdk/client-dynamodb');
const {DeleteItemCommand} = require('@aws-sdk/client-dynamodb');
const { ScanCommand } = require('@aws-sdk/client-dynamodb');

const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

describe('getByBatchId', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the notes when found', async () => {
          
        
        //given
        const batchId = 'batch-id';
        const notesItems = [{ id: batchId, name: 'notes Name' }, { id: batchId, name: 'notes Name'}];
        const marshalledItems = notesItems.map(item => marshall(item));
        dbStub.resolves({ Items: marshalledItems });
        //when
        const result = await getByBatchId(batchId);
        //then
        expect(result).to.deep.equal(notesItems);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const batchId = 'batch-id';

        dbStub.resolves({ Items: [] });

        const result = await getByBatchId(batchId);
        expect(result).to.deep.equal([]);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const batchId = 'batch-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getByBatchId(batchId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });
});
describe('updateNotes', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the updated notes when found', async () => {
        // given
        const notesId = 'notes-id';
        const notesFields = { name: 'Updated notes Name' };
        const notesItem = { id: notesId, name: 'Updated notes Name' };
        const marshalledItem = marshall(notesItem);

        dbStub.resolves({ Attributes: marshalledItem }); 
        // when
        const result = await updateNotes(notesId, notesFields);

        // then
        expect(result).to.deep.equal(notesItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });
    it('should return an empty object when the item is not found', async () => {
        // Given
        const notesId = 'notes-id';
        const notesFields = { name: 'Updated notes Name' };

        dbStub.resolves({ Attributes: null });

        // When
        const result = await updateNotes(notesId, notesFields);

        // Then
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        // Given
        const notesId = 'notes-id';
        const notesFields = { name: 'Updatednotes Name' };
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await updateNotes(notesId,notesFields);
        } catch (err) {
            // Then
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });

});

describe('create', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the create notes when found', async () => {
        // Given
        const notes={
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
        const notesId = 'notes-id';
        const notesItem = { id: notesId, ...notes };
        const marshalledItem = marshall(notesItem);

        dbStub.resolves({ Item: marshalledItem });

        // When
        const result = await create(notesId);

        // Then
        expect(result).to.not.be.undefined;
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        // Given
        const notesId = 'notes-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await create(notesId);
        } catch (err) {
            // Then
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });

});
describe('deleteById', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the deleted notes when found', async () => {
        //given
        const notesId = 'notes-id';
        const deletenotesItem = {};
        const marshalledItem = marshall(deletenotesItem);

        dbStub.resolves({ Item: marshalledItem });

        //when
        const result = await deleteById(notesId);


        //then
        expect(result).to.deep.equal(deletenotesItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const notesId = 'notes-id';

        dbStub.resolves({});

        const result = await deleteById(notesId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const notesId = 'notes-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await deleteById(notesId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });
});

describe('getByStudentId', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the notes when found', async () => {
        //given
        const studentId = 'student-id';
        const notesItems = [{ id: studentId, name: 'notes Name' }, { id: studentId, name: 'notes Name'}];
        const marshalledItems = notesItems.map(item => marshall(item));
        dbStub.resolves({ Items: marshalledItems });

        //when
        const result = await getByStudentId(studentId);


        //then
        expect(result).to.deep.equal(notesItems);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const studentId = 'student-id';

        dbStub.resolves({ Items: [] });

        const result = await getByStudentId(studentId);
        expect(result).to.deep.equal([]);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const studentId = 'student-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getByStudentId(studentId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });
});