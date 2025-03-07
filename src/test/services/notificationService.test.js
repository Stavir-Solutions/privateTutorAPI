const { expect } = require('chai');
const sinon = require('sinon');
const { getByStudentId } = require('../../main/services/notificationService');
const { markNotificationSeen} = require('../../main/services/notificationService');
const { getByTeacherId} = require('../../main/services/notificationService');

const db = require('../../main/db/dynamodb');
const {UpdateItemCommand} = require('@aws-sdk/client-dynamodb');
const { ScanCommand } = require('@aws-sdk/client-dynamodb');

const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

describe('getByTeacherId', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the notifications when found', async () => {
          
        
        //given
        const teacherId = 'teacher-id';
        const notificationItems = [{ id: teacherId, type : 'notification type' }, { id: teacherId, type: 'notification type'}];
        const marshalledItems = notificationItems.map(item => marshall(item));
        dbStub.resolves({ Items: marshalledItems });
        //when
        const result = await getByTeacherId(teacherId);
        //then
        expect(result).to.deep.equal(notificationItems);
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
describe('getByStudentId', () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');
    });

    afterEach(() => {
        dbStub.restore();
    });

    it('should return the notifications when found', async () => {
          
        
        //given
        const studentId = 'student-id';
        const notificationItems = [{ id: studentId, type : 'notification type' }, { id: studentId, type: 'notification type'}];
        const marshalledItems = notificationItems.map(item => marshall(item));
        dbStub.resolves({ Items: marshalledItems });
        //when
        const result = await getByStudentId(studentId);
        //then
        expect(result).to.deep.equal(notificationItems);
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
describe("markNotificationSeen", () => {
    let dbStub;

    beforeEach(() => {
        dbStub = sinon.stub(db, 'send');

    });

    afterEach(() => {
        dbStub.restore();
    });

    it("should return mark a notification as seen when found", async () => {
        // Given
        const notificationId = "notification-id";
        const notificationFields = {Seentime : new Date().toISOString()};
        const notificationItems = {
                seen: { BOOL: true },
                notificationSeenTime: { S: new Date().toISOString() }

            
        };
        const marshalledItem = marshall(notificationItems);

        dbStub.resolves({Attributes: marshalledItem});

        // When
        const result = await markNotificationSeen(notificationId, notificationFields);

        // Then
        expect(result).to.deep.equal( notificationItems);

        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });

    it("should return an empty object when no attributes are returned", async () => {
        // Given
        const notificationId = "notification-id";
        const notificationFields = {Seentime : new Date().toISOString()};

        dbStub.resolves({}); 

        // When
        const result = await markNotificationSeen(notificationId, notificationFields);

        // Then
        expect(result).to.deep.equal({});
        expect(dbStub.calledOnce).to.be.true;
    });

    it("should throw an error when the DB call fails", async () => {
        const notificationId = "notification-id";
        const notificationFields = {Seentime : new Date().toISOString()};
        const errorMessage = 'DB error';

        dbStub.rejects(new Error(errorMessage));
        try {
            await markNotificationSeen(notificationId,notificationFields);
        } catch (err) {
            expect(err.message).to.equal(errorMessage);
        }
        expect(dbStub.calledOnce).to.be.true;
        expect(dbStub.calledWith(sinon.match.instanceOf(UpdateItemCommand))).to.be.true;
    });
});