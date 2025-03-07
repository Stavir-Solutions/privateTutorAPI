const { expect } = require('chai');
const sinon = require('sinon');
const {update} = require('../../main/services/teacherService');
const { getTeacherById} = require('../../main/services/teacherService');
const { create} = require('../../main/services/teacherService');
const { deleteById} = require('../../main/services/teacherService');
const { getAll} = require('../../main/services/teacherService');
const db = require('../../main/db/dynamodb');
const {UpdateItemCommand} = require('@aws-sdk/client-dynamodb');
const {PutItemCommand} = require('@aws-sdk/client-dynamodb');
const {DeleteItemCommand} = require('@aws-sdk/client-dynamodb');
const { ScanCommand } = require('@aws-sdk/client-dynamodb');
const { GetItemCommand } = require('@aws-sdk/client-dynamodb');

const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

describe('updateteacher', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the updated teacher when found', async () => {
        // given
        const teacherId = 'teacher-id';
        const teacherFields = { status: 'Updated teacher status' };
        const teacherItem = { id: teacherId, status: 'Updated teacher status' };
        const marshalledItem = marshall(teacherItem);

        dbStub.resolves({ Attributes: marshalledItem }); 
        // when
        const result = await update(teacherId, teacherFields);

        // then
        expect(result).to.deep.equal(teacherItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });
    it('should return an empty object when the item is not found', async () => {
        // Given
        const teacherId = 'teacher-id';
        const teacherFields = { status: 'Updated teacher status' };

        dbStub.resolves({ Attributes: null });

        // When
        const result = await update(teacherId, teacherFields);

        // Then
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });
    it('should throw an error when the db call fails', async () => {
        // Given
        const teacherId = 'teacher-id';
        const teacherFields = { status: 'Updatedteacher status' };
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await update(teacherId,teacherFields);
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

    it('should return the create teacher when found', async () => {
        // Given
    
        const teacherId = 'teacher-id';
        const teacherItem = { id: teacherId, ...teacher };
        const marshalledItem = marshall(teacherItem);

        dbStub.resolves({ Item: marshalledItem });

        // When
        const result = await create(teacherId);

        // Then
        expect(result).to.equal(teacherId);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const teacherId = 'teacher-id';

        const result = await create(teacherId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(PutItemCommand))).to.be.true;
    });
    it('should throw an error when the db call fails', async () => {
        // Given
        const teacherId = 'teacher-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        // When
        try {
            await create(teacherId);
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

    it('should return the deleted teacher when found', async () => {
        //given
        const teacherId = 'teacher-id';
        const deleteteacherItem = {};
        const marshalledItem = marshall(deleteteacherItem);

        dbStub.resolves({ Item: marshalledItem });

        //when
        const result = await deleteById(teacherId);


        //then
        expect(result).to.deep.equal(deleteteacherItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const teacherId = 'teacher-id';

        dbStub.resolves({});

        const result = await deleteById(teacherId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(DeleteItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const teacherId = 'teacher-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await deleteById(teacherId);
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

    it('should return the teacher when found', async () => {
        //given
        const teacherItems = [{ id: "teacher-id", batches: 'batch ' }, { id:"teacher-id", batches: 'batch'}];
        const marshalledItems = teacherItems.map(item => marshall(item));
        dbStub.resolves({ Items: marshalledItems });

        //when
        const result = await getAll();


        //then
        expect(result).to.deep.equal(teacherItems);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const teacherItems = [{ id: "teacher-id", batches: 'batch ' }, { id:"teacher-id", batches: 'batch'}];

        dbStub.resolves({ Items: [] });

        const result = await getAll();
        expect(result).to.deep.equal([]);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const teacherItems = [{ id: "teacher-id", batches: 'batch ' }, { id:"teacher-id", batches: 'batch'}];
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getAll(teacherItems);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(ScanCommand))).to.be.true;
    });
});

describe('getTeacherById', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the teacher when found', async () => {
        //given
        const teacherId = 'teacher-id';
        const teacherItem = { id: teacherId, batches: 'batches' };
        const marshalledItem = marshall(teacherItem);

        dbStub.resolves({ Item: marshalledItem });

        //when
        const result = await getTeacherById(teacherId);


        //then
        expect(result).to.deep.equal(teacherItem);
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should return an empty object when the item is not found', async () => {
        const teacherId = 'teacher-id';

        dbStub.resolves({});

        const result = await getTeacherById(teacherId);
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });

    it('should throw an error when the db call fails', async () => {
        const teacherId = 'teacher-id';
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));

        try {
            await getTeacherById(teacherId);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(GetItemCommand))).to.be.true;
    });
});