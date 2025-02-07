const { expect } = require('chai');
const sinon = require('sinon');
const { getById } = require('../../main/services/testService');
const { updateTest} = require('../../main/services/testService');
const { create} = require('../../main/services/testService');
const { deletetestById} = require('../../main/services/testService');
const { getallByBatch} = require('../../main/services/testService');
const { generateUUID } = require('../../main/db/UUIDGenerator');
const db = require('../../main/db/dynamodb');
const { GetItemCommand } = require('@aws-sdk/client-dynamodb');
const {UpdateItemCommand} = require('@aws-sdk/client-dynamodb');
const {PutItemCommand} = require('@aws-sdk/client-dynamodb');
const {DeleteItemCommand} = require('@aws-sdk/client-dynamodb');
const { ScanCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
exports.generateUUID = () => 'mocked-uuid';



describe('getById', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the test when found', async () => {
        //given
        const testId = 'test-id';
        const testItem = { id: testId, name: 'Test Name' };
        const marshalledItem = marshall(testItem);

        dbStub.resolves({ Item: marshalledItem });

        //when
        const result = await getById(testId);


        //then
        expect(result).to.deep.equal(testItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const testId = 'test-id';

        dbStub.resolves({});

        const result = await getById(testId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const testId = 'test-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getById(testId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });
});
describe('updateTest', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the updated test when found', async () => {
        // Given
        const testId = 'test-id';
        const testFields = { name: 'Updated Name' };
        const testItem = { id: testId, name: 'Updated Name' };
        const marshalledItem = marshall(testItem);

        dbStub.resolves({ Attributes: marshalledItem }); 
        // When
        const result = await updateTest(testId, testFields);

        // Then
        expect(result).to.deep.equal(testItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        // Given
        const testId = 'test-id';
        const testFields = { name: 'Updated Name' };
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await updateTest(testId, testFields);
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
    let generateUUIDStub;
    const testId = 'test-id';

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
        
        generateUUIDStub = sinon.stub( 'generateUUID').returns(testId);
    });

    afterEach(() => {
        // Restore the stubs
        if (dbStub && dbStub.restore) dbStub.restore();
        if (generateUUIDStub && generateUUIDStub.restore) generateUUIDStub.restore();
        
        sinon.restore();
    });

    it('should return the created test ID when successful', async () => {
        // Given
        const test = {
            name: 'Test Name',
            subject: 'Mathematics',
            testDate: '2024-01-20',
            resultPublishDate: '2024-01-25',
            totalMarks: 100,
            minimumPassMark: 35,
            numberOfQuestions: 50,
            batchId: 'batch-123'
        };

        dbStub.resolves({
            $metadata: { httpStatusCode: 200 }
        });

        // When
        const result = await create(test);

        // Then
        expect(result).to.equal(testId);
        expect(dbStub.calledOnce).to.be.true;
        const putItemCommand = dbStub.firstCall.args[0];
        expect(putItemCommand).to.be.instanceOf(PutItemCommand);
        expect(putItemCommand.input.TableName).to.equal('Tests');
    });

    it('should handle empty response from DynamoDB', async () => {
        // Given
        const test = {
            name: 'Test Name',
            subject: 'Mathematics',
            testDate: '2024-01-20',
            resultPublishDate: '2024-01-25',
            totalMarks: 100,
            minimumPassMark: 35,
            numberOfQuestions: 50,
            batchId: 'batch-123'
        };

        dbStub.resolves({
            $metadata: { httpStatusCode: 200 }
        });

        // When
        const result = await create(test);

        // Then
        expect(result).to.equal(testId);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        // Given
        const test = {
            name: 'Test Name',
            subject: 'Mathematics'
        };
        const errorMessage = 'DB error';
        dbStub.rejects(new Error(errorMessage));

        // When/Then
        try {
            await create(test);
            expect.fail('Should have thrown an error');
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });
});
describe('deletetestById', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the deleted test when found', async () => {
        //given
        const testId = 'test-id';
        const deleteItem = {};
        const marshalledItem = marshall(deleteItem);

        dbStub.resolves({ Item: marshalledItem });

        //when
        const result = await deletetestById(testId);


        //then
        expect(result).to.deep.equal(deleteItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const testId = 'test-id';

        dbStub.resolves({});

        const result = await deletetestById(testId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const testId = 'test-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await deletetestById(testId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });
});


describe('getallByBatch', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return all tests for a given batchId', async () => {
        // Given
        const batchId = 'batch-id';
        const testItems =  [{ id: batchId, name: 'Test Name'},
            { id: batchId, name: 'Test Name'}
        ];
        const marshalledItems = testItems.map(item => marshall(item));
        dbStub.resolves({ Items: marshalledItems });
        // When
        const result = await getallByBatch(batchId);

        // Then
        expect(result).to.deep.equal(testItems);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should return an empty array if no tests are found', async () => {
        // Given
        const batchId = 'batch-id';

        dbStub.resolves({ Items: [] });

        // When
        const result = await getallByBatch(batchId);

        // Then
        expect(result).to.deep.equal([]);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should throw an error when the database call fails', async () => {
        // Given
        const batchId = 'batch-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await getallByBatch(batchId);
        } catch (err) {
            // Then
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });
});
