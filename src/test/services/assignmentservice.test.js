const { expect } = require('chai');
const sinon = require('sinon');
const { getByBatchIdAndStudentId } = require('../../main/services/assignmentService');
const { updateAssignment} = require('../../main/services/assignmentService');
const { create} = require('../../main/services/assignmentService');
const { deleteById} = require('../../main/services/assignmentService');
const { getById} = require('../../main/services/assignmentService');
const { getByBatchId} = require('../../main/services/assignmentService');

const db = require('../../main/db/dynamodb');
const { GetItemCommand } = require('@aws-sdk/client-dynamodb');
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

    it('should return the assignment when found', async () => {
          
        
        //given
        const batchId = 'batch-id';
        const assignmentItems = [{ id: batchId, title: 'assignment title' }, { id: batchId, title: 'assignment title'}];
        const marshalledItems = assignmentItems.map(item => marshall(item));
        dbStub.resolves({ Items: marshalledItems });
        //when
        const result = await getByBatchId(batchId);
        //then
        expect(result).to.deep.equal(assignmentItems);
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
describe('updateAssignment', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the updated assignment when found', async () => {
        // given
        const assignmentId = 'assignment-id';
        const assignmentFields = { title: 'Updated assignment title' };
        const assignmentItem = { id: assignmentId, title: 'Updated assignement title' };
        const marshalledItem = marshall(assignmentItem);

        dbStub.resolves({ Attributes: marshalledItem }); 
        // when
        const result = await updateAssignment(assignmentId, assignmentFields);

        // then
        expect(result).to.deep.equal(assignmentItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });
    it('should return an empty object when the item is not found', async () => {
        // Given
        const assignmentId = 'assignment-id';
        const assignmentFields = { title: 'Updated assignment title' };

        dbStub.resolves({ Attributes: null });

        // When
        const result = await updateAssignment(assignmentId, assignmentFields);

        // Then
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });
    it('should throw an error when the db call fails', async () => {
        // Given
        const assignmentId = 'assignment-id';
        const assignmentFields = { title: 'Updatedassignment title' };
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await updateAssignment(assignmentId,assignmentFields);
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

    it('should return the create assignment when found', async () => {
        // Given
    
        const assignmentId = 'assignment-id';
        const assignmentItem = { id: assignmentId, ...assignment };
        const marshalledItem = marshall(assignmentItem);

        dbStub.resolves({ Item: marshalledItem });

        // When
        const result = await create(assignmentId);

        // Then
        expect(result).to.equal(assignmentId);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const assignmentId = 'assignment-id';

        const result = await create(assignmentId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });
    it('should throw an error when the db call fails', async () => {
        // Given
        const assignmentId = 'assignment-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await create(assignmentId);
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

    it('should return the deleted assignment when found', async () => {
        //given
        const assignmentId = 'assignment-id';
        const deleteassignmentItem = {};
        const marshalledItem = marshall(deleteassignmentItem);

        dbStub.resolves({ Item: marshalledItem });

        //when
        const result = await deleteById(assignmentId);


        //then
        expect(result).to.deep.equal(deleteassignmentItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const assignmentId = 'assignment-id';

        dbStub.resolves({});

        const result = await deleteById(assignmentId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const assignmentId = 'assignment-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await deleteById(assignmentId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });
});

describe('getByBatchIdAndStudentId', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the assignment when found', async () => {
        //given
        const studentId = 'student-id';
        const batchId ='batch-id';
        const assignmentItems = [{ batchid: batchId, studentId :studentId,title: 'assignment title' }, { id: batchId, id :studentId,title: 'assignment title' }];
        const marshalledItems = assignmentItems.map(item => marshall(item));
        dbStub.resolves({ Items: marshalledItems });

        //when
        const result = await getByBatchIdAndStudentId(batchId,studentId);


        //then
        expect(result).to.deep.equal(assignmentItems);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const studentId = 'student-id';
        const batchId ='batch-id';

        dbStub.resolves({ Items: [] });

        const result = await getByBatchIdAndStudentId(batchId,studentId);
        expect(result).to.deep.equal([]);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const studentId = 'student-id';
        const batchId ='batch-id';

        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getByBatchIdAndStudentId(batchId,studentId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
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

    it('should return the assignment when found', async () => {
        //given
        const assignmentId = 'assignment-id';
        const assignmentItem = { id: assignmentId, title: 'assignment title' };
        const marshalledItem = marshall(assignmentItem);

        dbStub.resolves({ Item: marshalledItem });

        //when
        const result = await getById(assignmentId);


        //then
        expect(result).to.deep.equal(assignmentItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const assignmentId = 'assignment-id';

        dbStub.resolves({});

        const result = await getById(assignmentId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const assignmentId = 'assignment-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getById(assignmentId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });
});