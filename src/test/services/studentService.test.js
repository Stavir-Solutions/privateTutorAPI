const { expect } = require('chai');
const sinon = require('sinon');
const { getByBatchId } = require('../../main/services/studentService');
const {updateStudent} = require('../../main/services/studentService');
const { getStudentById} = require('../../main/services/studentService');
const { createStudent} = require('../../main/services/studentService');
const { deleteById} = require('../../main/services/studentService');
const { getAll} = require('../../main/services/studentService');
const db = require('../../main/db/dynamodb');
const {UpdateItemCommand} = require('@aws-sdk/client-dynamodb');
const {PutItemCommand} = require('@aws-sdk/client-dynamodb');
const {DeleteItemCommand} = require('@aws-sdk/client-dynamodb');
const { ScanCommand } = require('@aws-sdk/client-dynamodb');
const { GetItemCommand } = require('@aws-sdk/client-dynamodb');

const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

describe('getByBatchId', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the student when found', async () => {
          
        
        //given
        const batchId = 'batch-id';
        const studentItems = [{ id: batchId, batches: ' batches' }, { id: batchId, batches: 'batches' }];
        const marshalledItems = studentItems.map(item => marshall(item));
        dbStub.resolves({ Items: marshalledItems });
        //when
        const result = await getByBatchId(batchId);
        //then
        expect(result).to.deep.equal(studentItems);
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
describe('updateStudent', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the updated student when found', async () => {
        // given
        const studentId = 'student-id';
        const studentFields = { status: 'Updated student status' };
        const studentItem = { id: studentId, status: 'Updated student status' };
        const marshalledItem = marshall(studentItem);

        dbStub.resolves({ Attributes: marshalledItem }); 
        // when
        const result = await updateStudent(studentId, studentFields);

        // then
        expect(result).to.deep.equal(studentItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });
    it('should return an empty object when the item is not found', async () => {
        // Given
        const studentId = 'student-id';
        const studentFields = { status: 'Updated student status' };

        dbStub.resolves({ Attributes: null });

        // When
        const result = await updateStudent(studentId, studentFields);

        // Then
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });
    it('should throw an error when the db call fails', async () => {
        // Given
        const studentId = 'student-id';
        const studentFields = { status: 'Updatedstudent status' };
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await updateStudent(studentId,studentFields);
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

    it('should return the create student when found', async () => {
        // Given
    
        const studentId = 'student-id';
        const studentItem = { id: studentId, ...student };
        const marshalledItem = marshall(studentItem);

        dbStub.resolves({ Item: marshalledItem });

        // When
        const result = await create(studentId);

        // Then
        expect(result).to.equal(studentId);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const studentId = 'student-id';

        const result = await create(studentId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });
    it('should throw an error when the db call fails', async () => {
        // Given
        const studentId = 'student-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await create(studentId);
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

    it('should return the deleted student when found', async () => {
        //given
        const studentId = 'student-id';
        const deletestudentItem = {};
        const marshalledItem = marshall(deletestudentItem);

        dbStub.resolves({ Item: marshalledItem });

        //when
        const result = await deleteById(studentId);


        //then
        expect(result).to.deep.equal(deletestudentItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const studentId = 'student-id';

        dbStub.resolves({});

        const result = await deleteById(studentId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const studentId = 'student-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await deleteById(studentId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });
});

describe('getAll', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the student when found', async () => {
        //given
        const studentItems = [{ id: "student-id", batches: 'batch ' }, { id:"student-id", batches: 'batch'}];
        const marshalledItems = studentItems.map(item => marshall(item));
        dbStub.resolves({ Items: marshalledItems });

        //when
        const result = await getAll();


        //then
        expect(result).to.deep.equal(studentItems);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const studentItems = [{ id: "student-id", batches: 'batch ' }, { id:"student-id", batches: 'batch'}];

        dbStub.resolves({ Items: [] });

        const result = await getAll();
        expect(result).to.deep.equal([]);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const studentItems = [{ id: "student-id", batches: 'batch ' }, { id:"student-id", batches: 'batch'}];
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getAll(studentItems);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });
});

describe('getStudentById', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the student when found', async () => {
        //given
        const studentId = 'student-id';
        const studentItem = { id: studentId, batches: 'batches' };
        const marshalledItem = marshall(studentItem);

        dbStub.resolves({ Item: marshalledItem });

        //when
        const result = await getStudentById(studentId);


        //then
        expect(result).to.deep.equal(studentItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const studentId = 'student-id';

        dbStub.resolves({});

        const result = await getStudentById(studentId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const studentId = 'student-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getStudentById(studentId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });
});