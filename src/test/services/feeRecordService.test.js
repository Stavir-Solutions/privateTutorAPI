const { expect } = require('chai');
const sinon = require('sinon');
const { getByBatchIdAndStudentId } = require('../../main/services/feeRecordService');
const { updateFeeRecord} = require('../../main/services/feeRecordService');
const { create} = require('../../main/services/feeRecordService');
const { deleteById} = require('../../main/services/feeRecordService');
const { getById} = require('../../main/services/feeRecordService');
const { getbyBatchId} = require('../../main/services/feeRecordService');

const db = require('../../main/db/dynamodb');
const { GetItemCommand } = require('@aws-sdk/client-dynamodb');
const {UpdateItemCommand} = require('@aws-sdk/client-dynamodb');
const {PutItemCommand} = require('@aws-sdk/client-dynamodb');
const {DeleteItemCommand} = require('@aws-sdk/client-dynamodb');
const { ScanCommand } = require('@aws-sdk/client-dynamodb');

const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

describe('getbyBatchId', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the feeRecord when found', async () => {
          
        
        //given
        const batchId = 'batch-id';
        const feeRecordItems = [{ id: batchId, status: 'feeRecord status' }, { id: batchId, status: 'feeRecord status'}];
        const marshalledItems = feeRecordItems.map(item => marshall(item));
        dbStub.resolves({ Items: marshalledItems });
        //when
        const result = await getbyBatchId(batchId);
        //then
        expect(result).to.deep.equal(feeRecordItems);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const batchId = 'batch-id';

        dbStub.resolves({ Items: [] });

        const result = await getbyBatchId(batchId);
        expect(result).to.deep.equal([]);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const batchId = 'batch-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getbyBatchId(batchId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });
});
describe('updateFeeRecord', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the updated feeRecord when found', async () => {
        // given
        const feeRecordId = 'feeRecord-id';
        const feeRecordFields = { status: 'Updated feeRecord status' };
        const feeRecordItem = { id: feeRecordId, status: 'Updated feeRecord status' };
        const marshalledItem = marshall(feeRecordItem);

        dbStub.resolves({ Attributes: marshalledItem }); 
        // when
        const result = await updateFeeRecord(feeRecordId, feeRecordFields);

        // then
        expect(result).to.deep.equal(feeRecordItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });
    it('should return an empty object when the item is not found', async () => {
        // Given
        const feeRecordId = 'feeRecord-id';
        const feeRecordFields = { status: 'Updated feeRecord status' };

        dbStub.resolves({ Attributes: null });

        // When
        const result = await updateFeeRecord(feeRecordId, feeRecordFields);

        // Then
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });
    it('should throw an error when the db call fails', async () => {
        // Given
        const feeRecordId = 'feeRecord-id';
        const feeRecordFields = { status: 'UpdatedfeeRecord status' };
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await updateFeeRecord(feeRecordId,feeRecordFields);
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

    it('should return the create feeRecord when found', async () => {
        // Given
    
        const feeRecordId = 'feeRecord-id';
        const feeRecordItem = { id: feeRecordId, ...feeRecord };
        const marshalledItem = marshall(feeRecordItem);

        dbStub.resolves({ Item: marshalledItem });

        // When
        const result = await create(feeRecordId);

        // Then
        expect(result).to.equal(feeRecordId);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const feeRecordId = 'feeRecord-id';

        const result = await create(feeRecordId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });
    it('should throw an error when the db call fails', async () => {
        // Given
        const feeRecordId = 'feeRecord-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await create(feeRecordId);
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

    it('should return the deleted feeRecord when found', async () => {
        //given
        const feeRecordId = 'feeRecord-id';
        const deletefeeRecordItem = {};
        const marshalledItem = marshall(deletefeeRecordItem);

        dbStub.resolves({ Item: marshalledItem });

        //when
        const result = await deleteById(feeRecordId);


        //then
        expect(result).to.deep.equal(deletefeeRecordItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const feeRecordId = 'feeRecord-id';

        dbStub.resolves({});

        const result = await deleteById(feeRecordId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const feeRecordId = 'feeRecord-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await deleteById(feeRecordId);
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

    it('should return the feeRecord when found', async () => {
        //given
        const studentId = 'student-id';
        const batchId ='batch-id';
        const feeRecordItems = [{ batchid: batchId, studentId :studentId,status: 'feeRecord status' }, { id: batchId, id :studentId,status: 'feeRecord status' }];
        const marshalledItems = feeRecordItems.map(item => marshall(item));
        dbStub.resolves({ Items: marshalledItems });

        //when
        const result = await getByBatchIdAndStudentId(batchId,studentId);


        //then
        expect(result).to.deep.equal(feeRecordItems);
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

    it('should return the feeRecord when found', async () => {
        //given
        const feeRecordId = 'feeRecord-id';
        const feeRecordItem = { id: feeRecordId, status: 'feeRecord status' };
        const marshalledItem = marshall(feeRecordItem);

        dbStub.resolves({ Item: marshalledItem });

        //when
        const result = await getById(feeRecordId);


        //then
        expect(result).to.deep.equal(feeRecordItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const feeRecordId = 'feeRecord-id';

        dbStub.resolves({});

        const result = await getById(feeRecordId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const feeRecordId = 'feeRecord-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getById(feeRecordId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });
});