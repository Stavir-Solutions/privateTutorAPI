const { expect } = require('chai');
const sinon = require('sinon');
const { update} = require('../../main/services/batchService');
const { create} = require('../../main/services/batchService');
const { deleteById} = require('../../main/services/batchService');
const { getById} = require('../../main/services/batchService');
const { getByTeacherId} = require('../../main/services/batchService');
const { getByStudentId} = require('../../main/services/batchService');
const studentService = require('../../main/services/studentService');
const db = require('../../main/db/dynamodb');
const { GetItemCommand } = require('@aws-sdk/client-dynamodb');
const {UpdateItemCommand} = require('@aws-sdk/client-dynamodb');
const {PutItemCommand} = require('@aws-sdk/client-dynamodb');
const {DeleteItemCommand} = require('@aws-sdk/client-dynamodb');
const { ScanCommand } = require('@aws-sdk/client-dynamodb');
const {BatchGetItemCommand} = require('@aws-sdk/client-dynamodb');

const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

describe('getByTeacherId', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the batch when found', async () => {
          
        
        //given
        const teacherId = 'teacher-id';
        const batchItems = [{ id: teacherId, name: 'batch name' }, { id: teacherId, name: 'batch name'}];
        const marshalledItems = batchItems.map(item => marshall(item));
        dbStub.resolves({ Items: marshalledItems });
        //when
        const result = await getByTeacherId(teacherId);
        //then
        expect(result).to.deep.equal(batchItems);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const teacherId = 'teacher-id';

        dbStub.resolves({ Items: [] });

        const result = await getByTeacherId(teacherId);
        expect(result).to.deep.equal([]);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const teacherId = 'teacher-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getByTeacherId(teacherId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });
});
describe('update', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the updated batch when found', async () => {
        // given
        const batchId = 'batch-id';
        const batchFields = { name: 'Updated batch name' };
        const batchItem = { id: batchId, name: 'Updated batch name' };
        const marshalledItem = marshall(batchItem);

        dbStub.resolves({ Attributes: marshalledItem }); 
        // when
        const result = await update(batchId, batchFields);

        // then
        expect(result).to.deep.equal(batchItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });
    it('should return an empty object when the item is not found', async () => {
        // Given
        const batchId = 'batch-id';
        const batchFields = { name: 'Updated batch name' };

        dbStub.resolves({ Attributes: null });

        // When
        const result = await update(batchId, batchFields);

        // Then
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });
    it('should throw an error when the db call fails', async () => {
        // Given
        const batchId = 'batch-id';
        const batchFields = { name: 'Updatedbatch name' };
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await update(batchId,batchFields);
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

    it('should return the create batch when found', async () => {
        // Given
        const batch = {  "name": "English",
            "course": "English Subject",
            "subject": "English",
            "description": "litsening and speaking.",
            "paymentFrequency": "Monthly",
            "paymentAmount": 400.00,
            "paymentDayOfMonth": 15,
            "teacherId": "1c597a5c-1b96-4d52-a70e-fdb3868f7370"
        };
        const batchId = 'batch-id';
        const batchItem = { id: batchId, ...batch };
        const marshalledItem = marshall(batchItem);

        dbStub.resolves({ Item: marshalledItem });

        // When
        const result = await create(batchId);

        // Then
        expect(result).to.not.be.undefined;
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        // Given
        const batchId = 'batch-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await create(batchId);
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

    it('should return the deleted batch when found', async () => {
        //given
        const batchId = 'batch-id';
        const deletebatchItem = {};
        const marshalledItem = marshall(deletebatchItem);

        dbStub.resolves({ Item: marshalledItem });

        //when
        const result = await deleteById(batchId);


        //then
        expect(result).to.deep.equal(deletebatchItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const batchId = 'batch-id';

        dbStub.resolves({});

        const result = await deleteById(batchId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const batchId = 'batch-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await deleteById(batchId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });
});

describe('getById', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the batch when found', async () => {
        //given
        const batchId = 'batch-id';
        const batchItem = {id: batchId, name: 'batch name'};
        const marshalledItem = marshall(batchItem);

        dbStub.resolves({Item: marshalledItem});

        //when
        const result = await getById(batchId);


        //then
        expect(result).to.deep.equal(batchItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const batchId = 'batch-id';

        dbStub.resolves({});

        const result = await getById(batchId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const batchId = 'batch-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getById(batchId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });
});
describe('getByStudentId', () => {
    let dbStub;
    let studentServiceStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
        studentServiceStub = sinon.stub(studentService, 'getStudentByIdWithBatchName');
    });

    afterEach(() => {
        dbStub.restore();
        studentServiceStub.restore();
    });

    it('should return an error if the student is not found', async () => {
        const studentId = 'student-id';
        studentServiceStub.resolves(null);

        const result = await getByStudentId(studentId);

        expect(result).to.deep.equal({success: false, message: 'Student not found',});
        expect(studentServiceStub.calledOnce).to.be.true;
        expect(dbStub.notCalled).to.be.true;
    });

    it('should return no batches if the student has no associated batches', async () => {
        // Arrange
        const studentId = 'student-id';
        studentServiceStub.resolves({ batches: [] });

        // Act
        const result = await getByStudentId(studentId);

        // Assert
        expect(result).to.deep.equal({
            success: true,
            student: { batches: [] },
            batches: [],
            message: 'No batches found',
        });
        expect(studentServiceStub.calledOnce).to.be.true;
        expect(dbStub.notCalled).to.be.true;
    });

    it('should fetch and return batch details when student has batches', async () => {
        // Arrange
        const studentId = 'student-id';
        const studentData = {
            batches: [{ id: 'batch1' }, { id: 'batch2' }],
        };

        studentServiceStub.resolves(studentData);

        const batchData = {
            Responses: {
                Batches: [
                    { id: { S: 'batch1' }, name: { S: 'Batch 1' } },
                    { id: { S: 'batch2' }, name: { S: 'Batch 2' } },
                ],
            },
        };

        dbStub.resolves(batchData);

        // Act
        const result = await getByStudentId(studentId);

        // Assert
        expect(result).to.deep.equal({
            batches: [
                { id: 'batch1', name: 'Batch 1' },
                { id: 'batch2', name: 'Batch 2' },
            ],
        });
        expect(studentServiceStub.calledOnce).to.be.true;
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(BatchGetItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const studentId = 'student-id';
        studentServiceStub.resolves({
            batches: [{ id: 'batch1' }],
        });
        const errorMessage = 'DB error';
        dbStub.rejects(new Error(errorMessage));

        const result = await getByStudentId(studentId);

        expect(result).to.deep.equal({
            error: errorMessage,
        });
        expect(studentServiceStub.calledOnce).to.be.false;
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(BatchGetItemCommand))).to.be.true;
    });
});
