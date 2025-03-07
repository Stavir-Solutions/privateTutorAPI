const { expect } = require('chai');
const sinon = require('sinon');
const { getById } = require('../../main/services/testResultService');
const { updateTestResult} = require('../../main/services/testResultService');
const { create} = require('../../main/services/testResultService');
const { deleteById} = require('../../main/services/testResultService');
const { getAllByStudentId} = require('../../main/services/testResultService');
const { getAllByTestId} = require('../../main/services/testResultService');
const db = require('../../main/db/dynamodb');
const { GetItemCommand } = require('@aws-sdk/client-dynamodb');
const {UpdateItemCommand} = require('@aws-sdk/client-dynamodb');
const {PutItemCommand} = require('@aws-sdk/client-dynamodb');
const {DeleteItemCommand} = require('@aws-sdk/client-dynamodb');
const { ScanCommand } = require('@aws-sdk/client-dynamodb');

const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');


describe('getById', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the testResult when found', async () => {
        //given
        const testResultId = 'testResult-id';
        const testResultItem = { id: testResultId, name: 'TestResults Name' };
        const marshalledItem = marshall(testResultItem);

        dbStub.resolves({ Item: marshalledItem });

        //when
        const result = await getById(testResultId);


        //then
        expect(result).to.deep.equal(testResultItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const testResultId = 'testResult-id';

        dbStub.resolves({});

        const result = await getById(testResultId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const testResultId = 'testResult-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getById(testResultId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });
});
describe('updateTestResult', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the updated test when found', async () => {
        // given
        const testResultId = 'testResult-id';
        const testResultFields = { name: 'Updated Result Name' };
        const testResultItem = { id: testResultId, name: 'Updated Result Name' };
        const marshalledItem = marshall(testResultItem);

        dbStub.resolves({ Attributes: marshalledItem }); 
        // when
        const result = await updateTestResult(testResultId, testResultFields);

        // then
        expect(result).to.deep.equal(testResultItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });
    it('should return an empty object when the item is not found', async () => {
        // Given
        const testResultId = 'testResult-id';
        const testResultFields = { name: 'Updated testResult Name' };

        dbStub.resolves({ Attributes: null });

        // When
        const result = await updateTestResult(testResultId, testResultFields);

        // Then
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });
    it('should throw an error when the db call fails', async () => {
        // Given
        const testResultId = 'testResult-id';
        const testResultFields = { name: 'Updated Name' };
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await updateTestResult(testResultId, testResultFields);
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
        uuidStub.restore();
    });

    it('should return the create testResult when found', async () => {
        // Given
    
        const testResultId = 'testResult-id';
        const testItem = { id: testResultId, ...testResult };
        const marshalledItem = marshall(testItem);

        dbStub.resolves({ Item: marshalledItem });

        // When
        const result = await create(testResultId);

        // Then
        expect(result).to.equal(testResultId);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const testResultId = 'testResult-id';

        const result = await create(testResultId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });
    it('should throw an error when the db call fails', async () => {
        // Given
        const testResultId = 'testResult-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await create(testResultId);
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

    it('should return the deleted testResult when found', async () => {
        //given
        const testResultId = 'testResult-id';
        const deleteResultItem = {};
        const marshalledItem = marshall(deleteResultItem);

        dbStub.resolves({ Item: marshalledItem });

        //when
        const result = await deleteById(testResultId);


        //then
        expect(result).to.deep.equal(deleteResultItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const testResultId = 'testResult-id';

        dbStub.resolves({});

        const result = await deleteById(testResultId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const testResultId = 'testResult-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await deleteById(testResultId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });
});


describe('getAllByStudentId', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return all testResults for a given StudentId', async () => {
        // Given
        const StudentId = 'Student-id';
        const testResultItems =  [{ id: StudentId, name: 'TestResult Name'},
            { id: StudentId, name: 'TestResult Name'}
        ];
        const marshalledItems = testResultItems.map(item => marshall(item));
        dbStub.resolves({ Items: marshalledItems });
        // When
        const result = await getAllByStudentId(StudentId);

        // Then
        expect(result).to.deep.equal(testResultItems);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should return an empty array if no testResults are found', async () => {
        // Given
        const studentId = 'student-id';

        dbStub.resolves({ Items: [] });

        // When
        const result = await getAllByStudentId(studentId);

        // Then
        expect(result).to.deep.equal([]);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should throw an error when the database call fails', async () => {
        // Given
        const StudentId = 'student-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await getAllByStudentId(StudentId);
        } catch (err) {
            // Then
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });
});

describe('getAllByTestId', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return all testResults for a given TestId', async () => {
        // Given
        const testId = 'test-id';
        const testResultItems =  [{ id: testId, name: 'TestResult Name'},
            { id: testId, name: 'TestResultName'}
        ];
        const marshalledItems = testResultItems.map(item => marshall(item));
        dbStub.resolves({ Items: marshalledItems });
        // When
        const result = await getAllByTestId(testId);

        // Then
        expect(result).to.deep.equal(testResultItems);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should return an empty array if no tests are found', async () => {
        // Given
        const testId = 'test-id';

        dbStub.resolves({ Items: [] });

        // When
        const result = await getAllByTestId(testId);

        // Then
        expect(result).to.deep.equal([]);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should throw an error when the database call fails', async () => {
        // Given
        const testId = 'test-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await getAllByTestId(testId);
        } catch (err) {
            // Then
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });
});

